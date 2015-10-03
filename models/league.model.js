'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var League = new Schema({
  name: String,
  country: String,
  division: String
});

module.exports = mongoose.model('League', League);