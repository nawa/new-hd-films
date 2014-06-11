var express = require('express');
var connect = require('connect');
var path = require('path');
var config = require('./config');
var routes = require('./routes/index');
var serviceRoutes = require('./routes/service');
var logger = require("./libs/log")(module);

var app = express();
connect.errorHandler.title = config.title;
var errorHandler = connect.errorHandler();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(connect.favicon());

if (app.get('env') === 'development') {
    app.use(connect.logger('dev'));
}else{
    app.use(connect.logger('default'));
}

app.use(connect.json());
app.use(connect.urlencoded());
app.use(connect.cookieParser());

//TODO use minified for production
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'thirdparty')));

app.use('/', routes);
app.use('/service', serviceRoutes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        errorHandler(err, req, res, next);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    var stack = err.stack;
    //remove stack from client
    err.stack = '';
    errorHandler(err, req, res, next);
    //print missed error stack
    if ('test' != app.get('env')){
        logger.error(stack);
    }
});

module.exports = app;