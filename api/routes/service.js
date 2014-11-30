'use strict';

var express = require('express');
var router = express.Router();
var Film = require('../model/film').Film;

router.post('/data', function (req, res, next) {
  var start = parseInt(req.body.start);
  var length = parseInt(req.body.length);
  receiveData(start, length, req.body.order, function (err, results) {
    if (err) {
      return next(err);
    }
    results.draw = req.body.draw;
    res.json(results);
  });
});

var receiveData = function (start, length, order, callback) {
  var query = {};
  var mongoSort = [];
  if (order) {
    for (var i = 0; i < order.length; i++) {
      switch (order[i].column) {
        case '2':
          mongoSort.push(['year', order[i].dir === 'asc' ? 1 : -1]);
          break;
        case '3':
          mongoSort.push(['rating', order[i].dir === 'asc' ? 1 : -1]);
          break;
        case '4':
          mongoSort.push(['votes', order[i].dir === 'asc' ? 1 : -1]);
          break;
        default :
          break;
      }
    }
  }
  mongoSort.push(['cinemaHdId', -1]);

  Film.count(query, function (err, count) {
    if (err) {
      return callback(err);
    }
    Film.find(query)
      .skip(start)
      .limit(length)
      .sort(mongoSort)
      .exec(function (err, docs) {
        if (err) {
          callback(err);
        } else {
          callback(null, {
            'recordsTotal': count,
            'recordsFiltered': count,
            'data': docs
          });
        }
      });
  });
};

module.exports = router;