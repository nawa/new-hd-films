'use strict';

var request = require('request'),
  cheerio = require('cheerio'),
  async = require('async'),
  log = require('./log')(module),
  Film = require('../api/model/film').Film,
  config = require('../config'),
  kinopoisk = require('kinopoisk-ru');
var CINEMA_HD_URL = 'http://cinema-hd.ru/board/';

var getFilmsFromPage = function (page, lastSyncDate, lastSyncEntry, kinopoiskLoginData, callback) {
  request(CINEMA_HD_URL + '0-' + page, function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode !== 200) {
      return callback(new Error(CINEMA_HD_URL + '0-' + page + ' has returned code ' + response.statusCode));
    }
    var $ = cheerio.load(body);
    var films = $('div[id^="entryID"]').toArray();
    async.map(films, function (filmElement, mapCallback) {
      var f = function () {
        filmElement = $(filmElement);
        var film = new Film();
        var kinopoiskId = parseKinopoiskIdFromFilmElement(filmElement);
        var entryInfo = parseEntryInfo(filmElement);
        if (!entryInfo.entryDate) {
          log.warn('Page contains entry without date. id = ' + entryInfo.entryId);
          return mapCallback(null);
        }
        film.cinemaHdId = entryInfo.entryId;
        film.cinemaHdDate = entryInfo.entryDate;
        if (entryInfo.entryId === lastSyncEntry && entryInfo.entryDate === lastSyncDate) {
          log.info('Already synchronized entry id = ' + entryInfo.entryId);
          mapCallback(null, {
            lastEntryMarker: true,
            cinemaHdId: entryInfo.entryId
          });
        } else {
          if (kinopoiskId) {
            (function (kinopoiskId, filmElement) {
              var options = {
                title: true,
                year: true,
                rating: true,
                votes: true,
                alternativeTitle: true,
                description: true,
                type: true,
                loginData: kinopoiskLoginData
              };
              kinopoisk.getById(kinopoiskId, options, function (err, kinopoiskFilm) {
                if (err) {
                  log.warn(err.message);
                } else {
                  if (kinopoiskFilm.rating >= config.minRating &&
                    kinopoiskFilm.votes >= config.minVotes &&
                    kinopoiskFilm.year >= config.minYear &&
                    kinopoiskFilm.type === 'film') {
                    film.fillFilmFromKinopoisk(kinopoiskFilm);
                    film.img = filmElement.find('.eMessage img').attr('src');
                  }
                }
                mapCallback(null, film);
              });
            })(kinopoiskId, filmElement);
          } else {
            mapCallback(null, film);
          }
        }
      };
      //var delay = Math.floor(Math.random() * (5000)) + 100;
      //console.info('delay = ' + delay);
      //setTimeout(f, delay);
      f();
    }, function (_, result) {
      var resultContainsLastEntry = false;
      var lastEntryId;
      result.forEach(function (item) {
        if (item && item.lastEntryMarker) {
          resultContainsLastEntry = true;
          lastEntryId = item.cinemaHdId;
        }
      });
      callback(null, resultContainsLastEntry, result.filter(function (item) {
        if (!item) {
          return false;
        }
        //"entryID123" < "entryID234"
        if (resultContainsLastEntry && item.cinemaHdId >= lastEntryId) {
          return false;
        }
        return !!item.rating;
      }));
    });
  });
};

var getFirstEntryInfo = function (startPage, callback) {
  request(CINEMA_HD_URL + '0-' + startPage, function (err, response, body) {
    if (err) {
      return callback(err);
    } else if (response.statusCode !== 200) {
      return callback(new Error('cinemahd returns error code = ' + response.statusCode));
    } else {
      var $ = cheerio.load(body);
      var firstEntry = $('div[id^="entryID"]')[0];
      var entryInfo = parseEntryInfo($(firstEntry));
      callback(null, entryInfo.entryId, entryInfo.entryDate);
    }
  });
};

var parseEntryInfo = function (entry) {
  var date = entry.find('.item-footer ul li').last().find('span').last().text();
  return {entryId: entry.attr('id'), entryDate: date};
};

var parseKinopoiskIdFromFilmElement = function (filmElement) {
  //http://rating.kinopoisk.ru/471505.gif
  //or
  //http://www.kinopoisk.ru/rating/744074.gif
  var kinopoiskRatingImg = filmElement.find('img[src^="http://rating.kinopoisk.ru"]');
  var src;
  if (kinopoiskRatingImg.length > 0) {
    src = kinopoiskRatingImg.attr('src');
    return src.substr(27, src.length - 31);
  } else {
    kinopoiskRatingImg = filmElement.find('img[src^="http://www.kinopoisk.ru/rating"]');
    if (kinopoiskRatingImg.length > 0) {
      src = kinopoiskRatingImg.attr('src');
      return src.substr(31, src.length - 35);
    }
  }

};

module.exports.getFilmsFromPage = getFilmsFromPage;
module.exports.getFirstEntryInfo = getFirstEntryInfo;