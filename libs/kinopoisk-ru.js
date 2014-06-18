var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    Iconv = require('iconv').Iconv('windows-1251', 'utf8');

const FILM_URL = 'sdshttp://www.kinopoisk.ru/film/';
const SEARCH_URL = 'http://www.kinopoisk.ru/s/type/film/list/1/find/';
const DEFAULT_GET_OPTIONS = {
    title: true,
    rating: true,
    votes: true,
    alternativeTitle: true,
    description: true,
    actors: true,
    year: true,
    country: true,
    director: true,
    scenario: true,
    producer: true,
    operator: true,
    composer: true,
    cutting: true,
    genre: true,
    budget: true,
    boxoffice: true,
    time: true
};

const DEFAULT_SEARCH_OPTIONS = {
    max: 5,
    parse: true,
    parsingOptions: DEFAULT_GET_OPTIONS
};

var getById = function (id, options, callback) {
    var options = options || DEFAULT_GET_OPTIONS;
    var requestOptions = {
        url: FILM_URL + id,
        headers: {
            'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
        },
        encoding: 'binary'
    };
    request.get(requestOptions, function (err, response, body) {
        if (err) {
            callback(new Error('Error while "' + FILM_URL + id + '" processing. ' + err.message));
        } else {
            body = Iconv.convert(new Buffer(body, 'binary')).toString();
            var $ = cheerio.load(body);
            var title = $('#headerFilm .moviename-big').text();
            if (!title) {
                callback(new Error('Film with id ' + id + ' not found'));
            }
            var result = {
                id: id
            };
            if (options.title) result.title =                           title;
            if (options.rating) result.rating =                         parseFloat($('span.rating_ball').text());
            if (options.votes) result.votes =                           parseFloat($('span.ratingCount').text());
            if (options.alternativeTitle) result.alternativeTitle =     $('#headerFilm span[itemprop="alternativeHeadline"]').text();
            if (options.description) result.description =               $('.brand_words[itemprop="description"]').text();
            if (options.actors) result.actors =                         getActors($);
            if (options.year) result.year =                             parseInt(getInfo($, 'год'));
            if (options.country) result.country =                       getMultiInfo($, 'страна');
            if (options.director) result.director =                     getMultiInfo($, 'режиссер');
            if (options.scenario) result.scenario =                     getMultiInfo($, 'сценарий');
            if (options.producer) result.producer =                     getMultiInfo($, 'продюсер');
            if (options.operator) result.operator =                     getMultiInfo($, 'оператор');
            if (options.composer) result.composer =                     getMultiInfo($, 'композитор');
            if (options.cutting) result.cutting =                       getMultiInfo($, 'монтаж');
            if (options.genre) result.genre =                           getMultiInfo($, 'жанр');
            if (options.budget) result.budget =                         getInfo($, 'бюджет');
            if (options.boxoffice) result.boxoffice =                   getInfo($, 'сборы в мире');
            if (options.time) result.time =                             $('.time').text();

            callback(null, result);
        }
    });
}

var search = function (query, options, callback) {
    var options = options || DEFAULT_SEARCH_OPTIONS;
    var requestOptions = {
        url: SEARCH_URL + encodeURIComponent(query),
        headers: {
            'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.114 Safari/537.36'
        },
        encoding: 'binary'
    };
    request.get(requestOptions, function (err, response, body) {
        if (err) {
            callback(new Error('Error while "' + (SEARCH_URL + encodeURIComponent(query)) + '" processing. ' + err.message));
        }else{
            body = Iconv.convert(new Buffer(body, 'binary')).toString();
            var $ = cheerio.load(body);
            var films = $('.search_results .info a[href^="/level"]')
                .toArray().splice(0, options.max)
                .map(function(item){
                    var href = item.attribs['href'];
                    var id = /\/film\/(.+)\/sr\//.exec(href)[1];
                    var title = item.children[0].data;
                    return {
                        id: id,
                        title: title
                    };
                });
            if(options.parse){
                async.map(films, function(film, mapCallback){
                    getById(film.id, options.parsingOptions, function(err, result){
                        mapCallback(err, result);
                    })
                }, function(err, result){
                    if (err) {
                        callback(new Error('Error while parsing processing. ' + err.message));
                    }else{
                        callback(null, result);
                    }
                });
            }else{
                callback(null, films);
            }
        }
    });
}

function getMultiInfo($, fieldName) {
    return $('#infoTable td:contains("' + fieldName + '") ~ td').text().split(', ')
        .map(function (item) {
            return item.replace(/\r\n|\n|\r|слова$|сборы$/gm, "").trim();
        }).filter(function (item) {
            return item != '...' && item != '-';
        });
}

function getInfo($, fieldName) {
    return $('#infoTable td:contains("' + fieldName + '") ~ td a').first().text();
}

function getActors($) {
    return  $('#actorList ul').first().find('li[itemprop="actors"] a').toArray()
        .map(function (item) {
            if (item.children.length > 0) {
                return item.children[0].data;
            }
            return "";
        }).filter(function (item) {
            return item != '...';
        });
}

module.exports.getById = getById;
module.exports.search = search;