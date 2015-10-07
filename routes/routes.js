module.exports = function (app) {

  // Require index.js and index routes
  var index = require("./index");
  var Agenda = require('agenda');
  var AgendaUI = require('agenda-ui');
  var Config = require('../configuration.js');

  app.get("/",index.home);

  // Jobs
  var agenda = new Agenda();
  agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
  app.use('/agenda-ui', AgendaUI(agenda, {poll: 100000}));

  // Require Squad Controller and define routes for it
  var squadPath = "/squad";
  var squadController = require('./squad.controller');
  app.get(squadPath,squadController.index);
  app.get(squadPath + '/:id',squadController.show);
  app.post(squadPath,squadController.create);
  app.put(squadPath + '/:id',squadController.update);
  app.patch(squadPath + '/:id',squadController.update);
  app.delete(squadPath + '/:id',squadController.destroy);

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
