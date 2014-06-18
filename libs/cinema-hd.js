var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    log = require('./log')(module),
    Film = require('../model/film').Film,
    config = require('../config'),
    kinopoisk = require('./kinopoisk-ru');
const CINEMA_HD_URL = 'http://cinema-hd.ru/board/';

var getFilmsFromPage = function (page, lastSyncDate, lastSyncEntry, callback) {
    request(CINEMA_HD_URL + '0-' + page, function (err, response, body) {
        if (err) callback(err);
        if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var films = $('div[id^="entryID"]').toArray();
            async.map(films, function(filmElement, mapCallback){
                filmElement = $(filmElement);
                var film = new Film();
                var kinopoiskId = parseKinopoiskIdFromFilmElement(filmElement);
                var entryInfo = parseEntryInfo(filmElement);
                if(entryInfo.entryId == lastSyncEntry && entryInfo.entryDate == lastSyncDate){
                    var err = new Error(entryInfo.entryId + ' already synchronized');
                    err.interruptError = true;
                    log.info('Already synchronized entry id = ' + entryInfo.entryId);
                    mapCallback(err, null);
                }
                if(kinopoiskId){
                    (function(kinopoiskId, filmElement){
                        var options = {
                            title: true,
                            year: true,
                            rating: true,
                            votes: true,
                            alternativeTitle: true,
                            description: true
                        };
                        kinopoisk.getById(kinopoiskId, options, function(err, kinopoiskFilm){
                            if(err){
                                log.warn(err.message);
                            }else{
                                if(kinopoiskFilm.rating >= config.minRating
                                    && kinopoiskFilm.votes >= config.minVotes
                                    && kinopoiskFilm.year >= config.minYear){
                                    film.fillFilmFromKinopoisk(kinopoiskFilm);
                                    film.img = filmElement.find(".eMessage img").attr('src');
                                }
                            }
                            mapCallback(null, film);
                        });
                    })(kinopoiskId, filmElement);
                }else{
                    mapCallback(null, film);
                }
            }, function(err, result){
                if(err){
                    if(err.interruptError){
                        callback(null, true, result.filter(function(item){
                            if(!item){
                                return false;
                            }
                            if(item.rating){
                                return true;
                            }else{
                                return false;
                            }
                        }));
                    }else{
                        callback(err);
                    }
                }else{
                    callback(null, false, result.filter(function(item){
                        if(item.rating){
                            return true;
                        }else{
                            return false;
                        }
                    }));
                }
            });
        }
    });
};

var getFirstEntryInfo = function (startPage, callback) {
    request(CINEMA_HD_URL + '0-' + startPage, function (err, response, body) {
        if (err) throw callback(err);
        if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var firstEntry = $('div[id^="entryID"]')[0];
            var entryInfo = parseEntryInfo($(firstEntry));
            callback(entryInfo.entryId, entryInfo.entryDate)
        }
    });
};

var parseEntryInfo = function (entry) {
    /*<table class='eBlock'>
        <table>
            <tr>
                <div>
                    <span><span><span><span>DATE</span></span></span></span>
                </div>
            </tr>
        </table>
    </table>*/
    var date = entry.find('table.eBlock table:not(.eBlock) tr').last().find('div').last().find('span span span span').last().text();
    return {entryId : entry.attr('id'), entryDate: date};
};

var parseKinopoiskIdFromFilmElement = function(filmElement){
    //http://rating.kinopoisk.ru/471505.gif
    //or
    //http://www.kinopoisk.ru/rating/744074.gif
    var kinopoiskRatingImg = filmElement.find('img[src^="http://rating.kinopoisk.ru"]');
    if(kinopoiskRatingImg.length > 0){
        var src = kinopoiskRatingImg.attr('src');
        return src.substr(27, src.length - 31);
    }else{
        kinopoiskRatingImg = filmElement.find('img[src^="http://www.kinopoisk.ru/rating"]');
        if(kinopoiskRatingImg.length > 0){
            var src = kinopoiskRatingImg.attr('src');
            return src.substr(31, src.length - 35);
        }
    }

};

module.exports.getFilmsFromPage = getFilmsFromPage;
module.exports.getFirstEntryInfo = getFirstEntryInfo;