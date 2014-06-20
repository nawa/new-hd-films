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
if(nconf.get('MONGOLAB_URI')){
    envDependentConfig.mongoose.uri = nconf.get('MONGOLAB_URI');
}

module.exports = envDependentConfig;