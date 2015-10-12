var config  = require('./configuration.js');
var express = require('express');
var http    = require('http');
var path    = require('path');
var i18n    = require("i18n");
var app     = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Configure multi-language
i18n.configure({
    locales: config.get('langSet'),
    directory: __dirname + config.get('langDir')
});

var passport = require('passport');

// Environments
app.configure(function(){
  app.set('address', config.get('address'));
  app.set('port', process.env.PORT || config.get('port'));
  app.set('views', __dirname + config.get('viewsDir'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(i18n.init);
  app.use(express.methodOverride());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());
  
  app.use(express.static(path.join(__dirname, 'public')));

  var expressSession = require('express-session');
  // TODO - Why Do we need this key ?
  app.use(expressSession({secret: 'mySecretKey'}));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);

});

var initPassport = require('./passport/init');
  initPassport(passport);

// Import routes file
require(config.get('routes'))(app, passport);

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Initialize Services like RSS, Twitter, etc.
var configServices = require('./services/configuration.js');
configServices.init();

// Run
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port') + " :: " + app.get('address'));
});
