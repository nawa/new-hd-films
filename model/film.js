var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var filmSchema = new Schema({
    cinema_hd_id:  String,
    kinopoisk_id: String,
    img: String, //from cinema-hd
    title: String,
    alternativeTitle: String,
    description: String,
    rating: Number,
    votes: Number,
    year: Number
});

exports.Film = mongoose.model('film', filmSchema);
exports.Film.prototype.fillFilmFromKinopoisk = function(kinopoiskFilm){
    this.kinopoisk_id = kinopoiskFilm.id,
    this.title = kinopoiskFilm.title;
    this.year = kinopoiskFilm.year;
    this.rating = kinopoiskFilm.rating;
    this.votes = kinopoiskFilm.votes;
    this.alternativeTitle = kinopoiskFilm.alternativeTitle;
    this.description = kinopoiskFilm.description;
};