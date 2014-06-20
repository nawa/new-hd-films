var nconf = require('nconf');
var path = require('path');

var ENV = process.env.NODE_ENV;

nconf.argv()
    .env()
    .file({file: path.join(__dirname, 'config.json')});

var envDependentConfig = nconf.get(ENV);
//load secret data from environment variables
envDependentConfig.kinopoiskUser = nconf.get('kinopoiskUser');
envDependentConfig.kinopoiskPassword = nconf.get('kinopoiskPassword');
envDependentConfig.mongoUser = nconf.get('mongoUser');
envDependentConfig.mongoPassword = nconf.get('mongoPassword');
module.exports = envDependentConfig;