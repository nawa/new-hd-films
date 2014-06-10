var nconf = require('nconf');
var path = require('path');

var ENV = process.env.NODE_ENV;

nconf.argv()
    .env()
    .file({file: path.join(__dirname, 'config.json')});

module.exports = nconf.get(ENV);