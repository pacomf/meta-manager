module.exports = function (app) {

  // Require index.js and index routes
  var index = require("./index");
  app.get("/",index.home);

  // Require Group Controller and define routes for it
  var groupPath = "/group";
  var groupController = require('./group.controller');
  app.get(groupPath,groupController.index);
  app.get(groupPath + '/:id',groupController.show);
  app.post(groupPath,groupController.create);
  app.put(groupPath + '/:id',groupController.update);
  app.patch(groupPath + '/:id',groupController.update);
  app.delete(groupPath + '/:id',groupController.destroy);

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
