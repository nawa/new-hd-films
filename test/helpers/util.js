'use strict';

var mongoose = require('mongoose');

var cleanDatabase = function (callback) {
  if (mongoose.connection) {
    var db = mongoose.connection.db;
    db.collections(function (_, collections) {
      if(_){
        throw _;
      }
      var count = collections ? collections.length : 0;
      if (count < 1) {
        return callback();
      }
      collections.forEach(function (collection) {
        collection.drop(function () {
          if (--count <= 0 && callback) {
            callback();
          }
        });
      });
    });
  } else {
    callback();
  }
};

module.exports.cleanDatabase = cleanDatabase;