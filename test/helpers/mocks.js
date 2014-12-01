'use strict';

var sinon = require('sinon');
var fs = require('fs');
var path = require('path');
var nock = require('nock');
var kinopoisk = require('kinopoisk-ru');
var requireHelper = require('../helpers/require_helper');
var dataCollector = requireHelper.requireCoverage(__dirname, '../../libs/data-collector');

/****kinopoisk-ru stub****/
function kinopoiskStubInit() {
  var kinopoiskStub = {};
  kinopoiskStub.getById = sinon.stub(kinopoisk, 'getById');
  var kinopoiskResponsesFolder = path.join(__dirname, '../resources/pages/kinopoisk');
  fs.readdirSync(kinopoiskResponsesFolder).forEach(function (file) {
    var content = fs.readFileSync(path.join(kinopoiskResponsesFolder, file), 'utf-8');
    var responses = JSON.parse(content);
    for (var cur in responses) {
      if (responses.hasOwnProperty(cur)) {
        kinopoiskStub.getById
          .withArgs(cur)
          .yields(null, responses[cur]);
      }
    }
  });
  kinopoiskStub.getById.withArgs('errorId')
    .yields(new Error('error id handled'));
  /*kinopoiskStub.withArgs('fatalErrorId')
   .throws();*/

  kinopoiskStub.login = sinon.stub(kinopoisk, 'login');
  kinopoiskStub.login
    .yields(null, []);

  kinopoiskStub.login
    .withArgs('errorUser', undefined)
    .yields(new Error('errorUser'));
  return kinopoiskStub;
}

function kinopoiskStubRestore(kinopoiskStub) {
  kinopoiskStub.getById.restore();
  kinopoiskStub.login.restore();
}
/**************************/

/****requests to cinema-hd mocks****/
function cinemaHdNock(pageNumber, mockHtmlFileName) {
  var fileName = pageNumber + '.html';
  if (mockHtmlFileName) {
    fileName = mockHtmlFileName + '.html';
  }
  var pagesFolder = path.join(__dirname, '../resources/pages/cinema-hd/board');
  return cinemaHdNockWithoutReply(pageNumber)
    .replyWithFile(200, path.join(pagesFolder, fileName));
}

function cinemaHdNockWithoutReply(pageNumber) {
  return nock('http://cinema-hd.ru')
    .get('/board/0-' + pageNumber);
}
/***********************************/

/****data-collector module stub****/
/**
 * disable updateData in dataCollector
 * @returns {*}
 */
function dataCollectorStubInit() {
  var dataCollectorStub = {};
  dataCollectorStub.updateData = sinon.stub(dataCollector, 'updateData',
    function () {
      //do nothing
    });
  return dataCollectorStub;
}

function dataCollectorStubRestore(dataCollectorStub) {
  dataCollectorStub.updateData.restore();
}
/**************************/

module.exports.cinemaHdNock = cinemaHdNock;
module.exports.cinemaHdNockWithoutReply = cinemaHdNockWithoutReply;
module.exports.cleanAllNocks = nock.cleanAll;
module.exports.kinopoiskStubInit = kinopoiskStubInit;
module.exports.kinopoiskStubRestore = kinopoiskStubRestore;
module.exports.dataCollectorStubInit = dataCollectorStubInit;
module.exports.dataCollectorStubRestore = dataCollectorStubRestore;