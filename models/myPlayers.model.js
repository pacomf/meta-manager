'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var MyPlayers = new Schema({
  user: { type : Schema.Types.ObjectId, ref : 'User' },
  myEleven: [{ type : Schema.Types.ObjectId, ref : 'Player' }],
  sighting: [{ type : Schema.Types.ObjectId, ref : 'Player' }],
  teamName: String,
  season: Number
});

MyPlayers.plugin(Tree);
module.exports = mongoose.model('MyPlayers', MyPlayers);