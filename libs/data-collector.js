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
      log.error('Find syncinfo error. ' + err.message);
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
        var getFilmsFromPageSeries = [];

        var closure = function (page) {
          //processInterrupted = true - next entries already synchronized earlier
          getFilmsFromPageSeries.push(function (processInterrupted, callback) {
            //first series call. If processInterrupted is function that means it is callback
            if (typeof processInterrupted === 'function') {
              callback = processInterrupted;
              processInterrupted = false;
            }
            if (!processInterrupted) {
              cinemaHd.getFilmsFromPage(page, lastSyncEntry, kinopoiskLoginData,
                function (err, pageContainsAlreadySynchronizedEntry, result) {
                  if (err) {
                    return callback(err);
                  }
                  async.each(result, function (film, callback) {
                    film.save(function (err) {
                      if (err) {
                        return callback(err);
                      }
                      log.info('Film with id ' + film.kinopoiskId + ' successfully saved to db');
                      callback(null);
                    });
                  }, function (err) {
                    if (err) {
                      return callback(err);
                    }
                    log.info(page / config.cinemahdFirstCount * 100 + '%');
                    callback(null, pageContainsAlreadySynchronizedEntry);
                  });
                });
            } else {
              callback(null, processInterrupted);
            }
          });
        };

        for (var page = startPage; page <= config.cinemahdFirstCount; page++) {
          //closure was moved outside the loop to avoid bug 'Don't make functions within a loop.'
          closure(page);
        }
        async.waterfall(getFilmsFromPageSeries, function (err) {
          if (err) {
            log.error('getFilmsFromPageSeries execution error. ' + err.message);
            return callback(err);
          }
          if (!syncInfo) {
            syncInfo = new SyncInfo();
          }
          syncInfo.lastEntry = firstEntryId;
          syncInfo.save(function (err) {
            if (err) {
              log.error('Save syncinfo error. ' + err.message);
              return callback(err);
            }
            log.info('Synchronization finished');
            callback(null);
          });
        });
      });
    });
  });
};

module.exports.updateData = updateData;