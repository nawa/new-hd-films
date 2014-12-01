'use strict';

var expect = require('chai').expect;
//var async = require('async');
var requireHelper = require('../helpers/require_helper');
var mocks = require('../helpers/mocks');
var dataCollectorStub = mocks.dataCollectorStubInit();
var app = require('./supertest-app');
var Film = requireHelper.requireCoverage(__dirname, '../../api/model/film').Film;
var mongoose = require('mongoose');
var util = require('../helpers/util');
var fixtures = require('./fixtures');

describe('all routes', function () {

  before(function (done) {
    var prepare = function () {
      util.cleanDatabase(function () {
        var stubFilms = require('./fixtures/stub-films.json');
        stubFilms = stubFilms.map(function (item) {
          item.rating = parseFloat(item.rating);
          item.votes = parseInt(item.votes);
          item.year = parseInt(item.year);
          return item;
        });

        Film.collection.insert(stubFilms, done);
      });
    };
    if (mongoose.connection.readyState === mongoose.STATES.connecting) {
      mongoose.connection.on('connected', function () {
        prepare();
      });
    } else {
      prepare();
    }
  });

  after(function (done) {
    util.cleanDatabase(done);
    mocks.dataCollectorStubRestore(dataCollectorStub);
  });

  describe('index page \'/\'', function () {
    it('should return html content data and 200 status', function (done) {
      app.get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done);
    });
  });

  describe('service route', function () {
    it('should return data from 1 to 5 with default sort and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5NoSort);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by year, without dir and 200 status',
      function (done) {
        app.post('/service/data')
          .send({start: 0, length: 5, order: [{column: '2'}]})
          .expect('Content-Type', 'application/json')
          .expect(200)
          .expect(function (res) {
            expect(res.body.recordsFiltered).to.eq(50);
            expect(res.body.recordsTotal).to.eq(50);
            expect(res.body.data).to.deep.eq(fixtures.from1To5SortByYearDesc);
          })
          .end(done);
      });

    it('should return data from 1 to 5 with sort by year desc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '2', dir: 'desc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByYearDesc);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by year asc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '2', dir: 'asc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByYearAsc);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by rating, without dir and 200 status',
      function (done) {
        app.post('/service/data')
          .send({start: 0, length: 5, order: [{column: '3'}]})
          .expect('Content-Type', 'application/json')
          .expect(200)
          .expect(function (res) {
            expect(res.body.recordsFiltered).to.eq(50);
            expect(res.body.recordsTotal).to.eq(50);
            expect(res.body.data).to.deep.eq(fixtures.from1To5SortByRatingDesc);
          })
          .end(done);
      });

    it('should return data from 1 to 5 with sort by rating desc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '3', dir: 'desc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByRatingDesc);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by rating asc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '3', dir: 'asc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByRatingAsc);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by votes, without dir and 200 status',
      function (done) {
        app.post('/service/data')
          .send({start: 0, length: 5, order: [{column: '4'}]})
          .expect('Content-Type', 'application/json')
          .expect(200)
          .expect(function (res) {
            expect(res.body.recordsFiltered).to.eq(50);
            expect(res.body.recordsTotal).to.eq(50);
            expect(res.body.data).to.deep.eq(fixtures.from1To5SortByVotesDesc);
          })
          .end(done);
      });

    it('should return data from 1 to 5 with sort by votes desc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '4', dir: 'desc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByVotesDesc);
        })
        .end(done);
    });

    it('should return data from 1 to 5 with sort by votes asc and 200 status', function (done) {
      app.post('/service/data')
        .send({start: 0, length: 5, order: [{column: '4', dir: 'asc'}]})
        .expect('Content-Type', 'application/json')
        .expect(200)
        .expect(function (res) {
          expect(res.body.recordsFiltered).to.eq(50);
          expect(res.body.recordsTotal).to.eq(50);
          expect(res.body.data).to.deep.eq(fixtures.from1To5SortByVotesAsc);
        })
        .end(done);
    });
  });
});
