'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Media = new Schema({
  name: String,
  url: String,
  lastNew: Date,
  type: {type: String, enum: ['Twitter','RSS']}
});

module.exports = mongoose.model('Media', Media);