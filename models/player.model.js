'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Player = new Schema({
  name: String,
  birthdate: Date,
  fullName: String,
  countryBirth: String,
  nationality: {
    primary: String,
    secondary: String,
    community: Boolean
  },
  demarcation: String,
  keySearch: [String],
  socialNetworks: [{
    name: String,
    site: String
  }],
  picture: String
});

Player.plugin(Tree);
module.exports = mongoose.model('Player', Player);