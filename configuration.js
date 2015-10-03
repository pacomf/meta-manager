var Mongoose = require( 'mongoose' );
var yaml     = require("js-yaml");
var fs       = require("fs");
var config   = yaml.load(fs.readFileSync("./configuration-data.yml"));
var db       = Mongoose.connect('mongodb://'+config.dbAddress+'/'+config.dbName);

exports.get = function(id){
  return config[id];
}
