'use strict';

var mongoose = require('../../libs/mongoose');
var Schema = mongoose.Schema;

var FilmSchema = new Schema({
  cinemaHdId: String,
  kinopoiskId: String,
  img: String, //from cinema-hd
  title: String,
  alternativeTitle: String,
  description: String,
  rating: Number,
  votes: Number,
  year: Number
});

FilmSchema.set('toJSON', {transform: mongoose.dtoTransform});

exports.Film = mongoose.model('Film', FilmSchema);
exports.Film.prototype.fillFilmFromKinopoisk = function (kinopoiskFilm) {
  this.kinopoiskId = kinopoiskFilm.id;
  this.title = kinopoiskFilm.title;
  this.year = kinopoiskFilm.year;
  this.rating = kinopoiskFilm.rating;
  this.votes = kinopoiskFilm.votes;
  this.alternativeTitle = kinopoiskFilm.alternativeTitle;
  this.description = kinopoiskFilm.description;
};
