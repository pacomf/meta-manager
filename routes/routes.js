module.exports = function (app, passport) {

  var Agenda = require('agenda');
  var AgendaUI = require('agenda-ui');
  var Config = require('../configuration.js');

  var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
      return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
  }

  /* GET login page. */
  app.get('/', function(req, res) {
      // Display the Login page
    res.render('index', {});
  });

  /* Handle Login POST */
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true  
  }));

  /* GET Home Page */
  app.get('/home', isAuthenticated, function(req, res){
    res.render('home', { user: req.user });
  });

  /* Handle Logout */
  app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // route for facebook authentication and login
  // different scopes while logging in
  app.get('/login/facebook', 
    passport.authenticate('facebook', { scope : 'email' }
  ));

  // handle the callback after facebook has authenticated the user
  app.get('/login/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/home',
      failureRedirect : '/'
    })
  );




  // Jobs
  var agenda = new Agenda();
  agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
  app.use('/agenda-ui', AgendaUI(agenda, {poll: 100000}));

  // Require League Controller and define routes for it
  var leaguePath = "/league";
  var leagueController = require('./league.controller');

  app.get(leaguePath,leagueController.index);
  app.get(leaguePath + '/:id',leagueController.show);
  app.post(leaguePath,leagueController.create);
  app.put(leaguePath + '/:id',leagueController.update);
  app.patch(leaguePath + '/:id',leagueController.update);
  app.delete(leaguePath + '/:id',leagueController.destroy);
};
