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
    votes: Number
});

exports.Film = mongoose.model('film', filmSchema);