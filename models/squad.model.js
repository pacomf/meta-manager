'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Squad = new Schema({
  team: { type : Schema.Types.ObjectId, ref : 'Team' },
  players: [
    { type : Schema.Types.ObjectId, ref : 'Player' }
  ],
  season: Number
});

Squad.plugin(Tree);
module.exports = mongoose.model('Squad', Squad);