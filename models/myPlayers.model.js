'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var MyPlayers = new Schema({
  user: { type : Schema.Types.ObjectId, ref : 'User' },
  myEleven: [{ 
    player: {type : Schema.Types.ObjectId, ref : 'Player'},
    visible: Boolean
  }],
  formation: {
  	defenders: Number,
  	midfielders: Number,
  	attackers: Number
  },
  myScouting: [{ 
    player: {type : Schema.Types.ObjectId, ref : 'Player'},
    visible: Boolean
  }],
  teamName: String,
  season: Number,
});

MyPlayers.plugin(Tree);
module.exports = mongoose.model('MyPlayers', MyPlayers);