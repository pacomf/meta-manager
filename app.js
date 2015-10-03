var config  = require('./configuration.js')
var express = require('express');
var http    = require('http');
var path    = require('path');
var i18n    = require("i18n");
var app     = express();

// Configure multi-language
i18n.configure({
    locales: config.get('langSet'),
    directory: __dirname + config.get('langDir')
});

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
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Import routes file
require(config.get('routes'))(app);

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Run
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port') + " :: " + app.get('address'));
});
