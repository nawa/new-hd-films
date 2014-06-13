var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    log = require('./log')(module),
    Film = require('../model/film').Film,
    config = require('../config');
const CINEMA_HD_URL = 'http://cinema-hd.ru/board/';
const KINOPOISK_FILM_URL = 'http://www.kinopoisk.ru/film/';

var getFilmsFromPage = function (page, callback) {
    //log.error(CINEMA_HD_URL + '0-' + page);
    request(CINEMA_HD_URL + '0-' + page, function (err, response, body) {
        if (err) throw err;
        if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var films = $('div[id^="entryID"]').toArray();
            async.map(films, function(filmElement, mapCallback){
                filmElement = $(filmElement);
                var film = new Film();
                var kinopoiskId = parseKinopoiskIdFromFilmElement(filmElement);
                if(kinopoiskId){
                    (function(kinopoiskId, filmElement){
                        fillFilmFromKinopoiskId(film, kinopoiskId, function(){
                            //get image from cinema-hd
                            if(film.rating){
                                film.img = filmElement.find(".eMessage img").attr('src');
                            }
                            mapCallback(null, film);
                        });
                    })(kinopoiskId, filmElement);
                }else{
                    //log.info('Rating for entry ' + filmElement.attr('id') + ' not found');
                    mapCallback(null, film);
                }
            }, function(err, result){
                if(err){
                    callback(err);
                }else{
                    callback(null, result.filter(function(item){
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

var fillFilmFromKinopoiskId = function(film, kinopoiskId, callback){
    var requestOptions = {
        url: KINOPOISK_FILM_URL + kinopoiskId,
        headers: {
            'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
        },
        encoding: 'windows-1251'
    };
    request.get(requestOptions, function (err, response, body) {
        if(err){
            log.error('Error while "' + KINOPOISK_FILM_URL + kinopoiskId + '" processing. ' + err);
        }else{
            film.kinopoisk_id = kinopoiskId;
            var $ = cheerio.load(body);
            var ratingS = $('span.rating_ball').text();
            var votesS = $('span.ratingCount').text();
            if(ratingS.length > 0 && votesS.length > 0){
                var rating = parseFloat(ratingS);
                var votes = parseFloat(votesS);
                if(rating >= config.minRating && votes >= config.minVotes){
                    film.rating = rating;
                    film.votes = votes;
                    film.title = $('#headerFilm .moviename-big').text();
                    film.alternativeTitle = $('#headerFilm span[itemprop="alternativeHeadline"]').text();
                    film.description = $('.brand_words[itemprop="description"]').text();
                }
            }
        }
        callback();
    });
};

module.exports.getFilmsFromPage = getFilmsFromPage;