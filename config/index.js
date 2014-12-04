var nconf = require('nconf');
var path = require('path');

var ENV = process.env.NODE_ENV;
var configFile = 'config.json';
if (ENV === 'testLocal') {
  configFile = 'config-secure.json';
}
nconf.argv()
  .env()
  .file({file: path.join(__dirname, configFile)});

var envDependentConfig = nconf.get(ENV);
//load secret data from environment variables
if(nconf.get('kinopoiskUser')){
  envDependentConfig.kinopoiskUser = nconf.get('kinopoiskUser');
}
if(nconf.get('kinopoiskPassword')){
  envDependentConfig.kinopoiskPassword = nconf.get('kinopoiskPassword');
}
if (nconf.get('MONGOLAB_URI')) {
  envDependentConfig.mongoose.uri = nconf.get('MONGOLAB_URI');
} else if (nconf.get('MONGOHQ_URL')) {
  envDependentConfig.mongoose.uri = nconf.get('MONGOHQ_URL');
}


module.exports = envDependentConfig;