'use strict';

var expect = require('chai').expect;
var requireHelper = require('./helpers/require_helper');
var mocks = require('./helpers/mocks');
var SyncInfo = requireHelper.requireCoverage(__dirname, '../api/model/sync-info').SyncInfo;
var Film = requireHelper.requireCoverage(__dirname, '../api/model/film').Film;
var async = require('async');
var config = requireHelper.requireCoverage(__dirname, '../config');
var util = require('./helpers/util');


describe('data-collector module', function () {
  var dataCollector;
  var kinopoiskStub;

  before(function (done) {
    dataCollector = requireHelper.requireCoverage(__dirname, '../libs/data-collector');
    kinopoiskStub = mocks.kinopoiskStubInit();
    util.cleanDatabase(done);
  });

  after(function (done) {
    mocks.kinopoiskStubRestore(kinopoiskStub);
    util.cleanDatabase(done);
  });

  describe('#updateData', function () {

    function checkFilmsCount(query, expectedCount, callback) {
      Film.count(query, function (err, count) {
        expect(err).to.be.null;
        expect(count).to.be.eq(expectedCount);
        callback(null);
      });
    }

    function checkAllPages(callback) {
      (function () {
        async.series([
          function (callback) {
            SyncInfo.findOne({}, function (err, syncInfo) {
              expect(err).to.be.null;
              expect(syncInfo).to.have.property('lastEntry');
              expect(syncInfo).to.have.property('lastDate');
              expect(syncInfo.lastEntry).to.be.eq('entryID19157');
              expect(syncInfo.lastDate).to.be.eq('2014-11-08');
              callback(null);
            });
          },
          checkFilmsCount.bind(this, {}, 3),
          checkFilmsCount.bind(this, {
            kinopoiskId: '772385',
            cinemaHdDate: '2014-11-03',
            cinemaHdId: 'entryID19142'
          }, 1),
          checkFilmsCount.bind(this, {
            kinopoiskId: '585350',
            cinemaHdDate: '2014-11-03',
            cinemaHdId: 'entryID19140'
          }, 1),
          checkFilmsCount.bind(this, {
            kinopoiskId: '572035',
            cinemaHdDate: '2014-11-02',
            cinemaHdId: 'entryID19138'
          }, 1)
        ], callback);
      }());
    }

    function updateAndCheckAllPages(done) {
      //nock.times() freezes :(
      var nock1 = mocks.cinemaHdNock(1);
      var nock12 = mocks.cinemaHdNock(1);
      var nock2 = mocks.cinemaHdNock(2);
      var nock3 = mocks.cinemaHdNock(3);
      dataCollector.updateData(function (err) {
        expect(err).to.be.null;
        nock1.done();
        nock12.done();
        nock2.done();
        nock3.done();
        checkAllPages(done);
      });
    }

    var cinemahdFirstCount;
    var kinopoiskUser;

    beforeEach(function (done) {
      cinemahdFirstCount = config.cinemahdFirstCount;
      kinopoiskUser = config.kinopoiskUser;
      mocks.cleanAllNocks();
      util.cleanDatabase(done);
    });

    afterEach(function (done) {
      config.cinemahdFirstCount = cinemahdFirstCount;
      config.kinopoiskUser = kinopoiskUser;
      mocks.cleanAllNocks();
      util.cleanDatabase(done);
    });

    it('without sync info in db. should returns stored films and last sync info',
      updateAndCheckAllPages);

    it('with very old sync info should returns stored films and last sync info', function (done) {
      var syncInfo = new SyncInfo({lastEntry: 'entryID1', lastDate: '2011-01-01'});
      syncInfo.save(function () {
        updateAndCheckAllPages(done);
      });
    });

    it('with very even sync info should returns stored films and last sync info', function (done) {
      var syncInfo = new SyncInfo({lastEntry: 'entryID999999', lastDate: '2020-01-01'});
      syncInfo.save(function () {
        updateAndCheckAllPages(done);
      });
    });

    it('load 3-2-1 page on different updates and get result like in one update', function (done) {
      async.series([
        function (callback) {
          //load 1 page like 3
          var nock1 = mocks.cinemaHdNock(1, 3);
          var nock12 = mocks.cinemaHdNock(1, 3);
          config.cinemahdFirstCount = 1;
          dataCollector.updateData(function (err) {
            expect(err).to.be.null;
            nock1.done();
            nock12.done();
            callback(null);
          });
        },
        function (callback) {
          //load 1 page like 2
          var nock1 = mocks.cinemaHdNock(1, 2);
          var nock12 = mocks.cinemaHdNock(1, 2);
          var nock2 = mocks.cinemaHdNock(2, 3);
          config.cinemahdFirstCount = 2;
          dataCollector.updateData(function (err) {
            expect(err).to.be.null;
            nock1.done();
            nock12.done();
            nock2.done();
            callback(null);
          });
        },
        function (callback) {
          var nock1 = mocks.cinemaHdNock(1);
          var nock12 = mocks.cinemaHdNock(1);
          var nock2 = mocks.cinemaHdNock(2);
          var nock3 = mocks.cinemaHdNock(3);
          config.cinemahdFirstCount = 3;
          dataCollector.updateData(function (err) {
            expect(err).to.be.null;
            nock1.done();
            nock12.done();
            nock2.done();
            expect(nock3.isDone()).to.be.false;
            callback(null);
          });
        }], checkAllPages.bind(this, done));
    });

    it('failed kinopoisk login should not interrupt update process', function (done) {
      config.kinopoiskUser = 'errorUser';
      updateAndCheckAllPages(done);
    });

    it('failed cinemaHd#getFirstEntryInfo should interrupt update', function (done) {
      mocks.cinemaHdNock(2);
      dataCollector.updateData(function (err) {
        expect(err).to.be.not.null;
        done();
      });
    });

    it('failed cinemaHd#getFilmsFromPage should interrupt update', function (done) {
      mocks.cinemaHdNock(1);
      dataCollector.updateData(function (err) {
        expect(err).to.be.not.null;
        done();
      });
    });


  });
});