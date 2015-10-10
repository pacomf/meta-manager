'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Player = new Schema({
  name: String,
  birthdate: Date,
  fullName: String,
  countryBirth: String,
  state: {
    available: Number, // 0: Yes, 1: Maybe, 2: No
    state: String,
  },  
  nationality: {
    primary: String,
    secondary: String,
    community: Boolean
  },
  role: String,
  keySearch: [String],
  socialNetworks: [{
    name: String,
    site: String
  }],
  picture: String,
  data: [{
    web: String,
    url: String
  }],
  season: [{
    team: { type : Schema.Types.ObjectId, ref : 'Team' },
    number: Number,
    year: Number
  }]
});

Player.plugin(Tree);
module.exports = mongoose.model('Player', Player);