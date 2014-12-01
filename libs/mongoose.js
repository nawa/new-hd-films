'use strict';

var mongoose = require('mongoose');
var config = require('../config');
var log = require('./log')(module);

mongoose.connect(config.mongoose.uri, config.mongoose.options);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  log.info('Mongoose default connection open to ' + config.mongoose.uri);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  log.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  log.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    log.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = mongoose;

/**
 * Transforms mongoose document to route response. Remove all fields start with '_'
 * @param doc
 * @param ret
 */
module.exports.dtoTransform = function (doc, ret) {
  Object.keys(ret)
    .filter(function (key) {
      return key[0] === '_';
    })
    .forEach(function (key) {
      delete ret[key];
    });

  return ret;
};