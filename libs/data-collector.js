var cronJob = require('cron').CronJob;
var cinema_hd = require('./cinema-hd');
var config = require('../config');
var async = require('async');
var log = require('./log')(module);
var mongoose = require('./mongoose');
var Film = require('../model/film').Film;
var SyncInfo = require('../model/film').SyncInfo;

//every day
new cronJob('0 0 0 * * *', function(){
    console.log("Cron is running" + new Date());
    updateData();
}, null, true);

var updateData = function () {
    //TODO change to check with mongo
    if (true) {
        //TODO remove that
        Film.remove().exec();
        /*SyncInfo.findOne({}, function(err, thor) {
            if (err) return console.error(err);
            console.dir(thor);
        });*/
        //-------------
        var series = [];
        for (var page = 1; page <= config.cinemahdFirstCount; page++) {
            (function (page) {
                series.push(function (callback) {
                    cinema_hd.getFilmsFromPage(page, function (err, result) {
                        for (var i = 0; i < result.length; i++) {
                            var film = result[i];
                            (function (film) {
                                film.save(function (err, saved) {
                                    if (err) throw err;//handle error
                                    log.info('Film with id ' + film.kinopoisk_id + ' successfully saved to db');
                                });
                            }(film));
                        }
                        log.info(page / config.cinemahdFirstCount * 100 + '%');
                        callback(null);
                    });
                });
            })(page);
        }
        async.series(series, function (err, result) {
            log.info('Synchronization finished');
        });
    }
};

module.exports.updateData = updateData;