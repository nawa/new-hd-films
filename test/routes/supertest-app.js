'use strict';

var request = require('supertest');
var requireHelper = require('../helpers/require_helper');

module.exports = request(requireHelper.requireCoverage(__dirname, '../../app'));