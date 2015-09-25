module.exports = function (app) {

  // Require index.js and index routes
  var index = require("./index");
  app.get("/",index.home);
};
