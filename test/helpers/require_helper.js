'use strict';

var path = require('path');

module.exports.requireCoverage = function (dirname, module) {
  var resolvedModule = path.join(dirname, module);
  if (process.env.APP_DIR_FOR_CODE_COVERAGE) {
    var pathToCoverageFolder = path.join(__dirname, process.env.APP_DIR_FOR_CODE_COVERAGE);
    var root = path.join(__dirname, '../../');
    var relativeFromRootToModule = path.relative(root, resolvedModule);
    resolvedModule = path.resolve(pathToCoverageFolder, relativeFromRootToModule);
  }
  return require(resolvedModule);
};

module.exports.requireUncached = function (dirname, module) {
  var resolvedModule = path.join(dirname, module);
  delete require.cache[require.resolve(resolvedModule)];
  return require(resolvedModule);
};