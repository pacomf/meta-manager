 var config = require('./configuration-data.js');

exports.getDatabaseUser = function(){
  return config.data.database.user;
}

exports.getDatabasePassword = function(){
  return config.data.database.password;
}

exports.getAddress = function(){
  return config.data.address;
}

exports.getPort = function(){
  return config.data.port;
}

exports.getViewsDirectory = function(){
  return config.data.views.directory;
}

exports.getViewsEngine = function(){
  return config.data.views.engine;
}

exports.getLanguageDirectory = function(){
  return config.data.language.directory;
}

exports.getLanguageSet = function(){
  return config.data.language.set;
}

exports.getRoutesFile = function(){
  return config.data.routes.file;
}

/*
  You need make a file and complete this structure.

  If you want add more configuration lines, you can add this information into data
  structure and create the getters in this file.

  Example File: configuration-data.js

    // Configuration data
    var data = {
      address: 'localhost',
      port: 8080,
      views:{
        directory: "/views",
        engine: "jade"
      },
      language: {
        directory: "/locales",
        set: ["es","en"]
      },
      database: {
        user: "",
        password: ""
      },
      routes: {
        file: "./routes/routes"
      }
    }

    // Required line
    exports.data = data;;

*/