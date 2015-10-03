'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var User = new Schema({
  name: String,
  socialNetworks: [{
    name: String,
    id: String
  }]
});

User.plugin(Tree);
module.exports = mongoose.model('User', User);