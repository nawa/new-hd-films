'use strict';

var CronJob = require('cron').CronJob;
var cinemaHd = require('./cinema-hd');
var config = require('../config');
var async = require('async');
var log = require('./log')(module);
var SyncInfo = require('../api/model/sync-info').SyncInfo;
var kinopoisk = require('kinopoisk-ru');

//every day
new CronJob('0 0 0 * * *', function () {
  log.info('Cron is running' + new Date());
  updateData();
}, null, true);

var updateData = function (callback) {
  callback = callback || function () {
  };
  SyncInfo.findOne({}, function (err, syncInfo) {
    if (err) {
      log.error(err);
      return callback(err);
    }
    var lastSyncEntry;
    if (syncInfo) {
      lastSyncEntry = syncInfo.lastEntry;
    }
    var startPage = 1;
    kinopoisk.login(config.kinopoiskUser, config.kinopoiskPassword, function (err, loginData) {
      var kinopoiskLoginData = [];
      if (err) {
        log.error('Kinopoisk error: ' + err.message + '. Synchronization will be run without credentials');
      } else {
        kinopoiskLoginData = loginData;
      }

      cinemaHd.getFirstEntryInfo(startPage, function (err, firstEntryId) {
        if (err) {
          log.error('Getting first entry info throws error: ' + err.message);
          return callback(err);
        }
        var series = [];

        var closure = function (page) {
          //processInterrupted = true - next entries already synchronized earlier
          series.push(function (processInterrupted, seriesCallResult, callback) {
            //first call
            if (typeof processInterrupted === 'function') {
              callback = processInterrupted;
              processInterrupted = false;
              seriesCallResult = [];
            }
            if (!processInterrupted) {
              cinemaHd.getFilmsFromPage(page, lastSyncEntry, kinopoiskLoginData,
                function (err, pageContainsAlreadySynchronizedEntry, result) {
                  if (err) {
                    return callback(err);
                  }
                  for (var i = 0; i < result.length; i++) {
                    seriesCallResult.push(result[i]);
                  }
                  log.info(page / config.cinemahdFirstCount * 100 + '%');
                  callback(null, pageContainsAlreadySynchronizedEntry, seriesCallResult);
                });
            } else {
              callback(null, processInterrupted, seriesCallResult);
            }
          });
        };

        for (var page = startPage; page <= config.cinemahdFirstCount; page++) {
          //closure was moved outside the loop to avoid bug 'Don't make functions within a loop.'
          closure(page);
        }
        async.waterfall(series, function (err, processInterrupted, seriesCallResult) {
          if (err) {
            log.error(err);
            return callback(err);
          }
          var finished = function (callback) {
            if (!syncInfo) {
              syncInfo = new SyncInfo();
            }
            syncInfo.lastEntry = firstEntryId;
            syncInfo.save(function (err) {
              if (err) {
                log.error(err);
                return callback(err);
              }
              log.info('Synchronization finished');
              callback(null);
            });
          };
          if (seriesCallResult.length > 0) {
            var closure = function (film, i) {
              film.save(function (err) {
                if (err) {
                  return callback(err);
                }
                log.info('Film with id ' + film.kinopoiskId + ' successfully saved to db');
                if (i === seriesCallResult.length - 1) {
                  return finished(callback);
                }
              });
            };

            for (var i = 0; i < seriesCallResult.length; i++) {
              var film = seriesCallResult[i];
              //closure was moved outside the loop to avoid bug 'Don't make functions within a loop.'
              closure(film, i);
            }
          } else {
            finished(callback);
          }
        });
      });
    });
  });
};

module.exports.updateData = updateData;