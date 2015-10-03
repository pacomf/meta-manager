'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Group = new Schema({
  team: { type : Schema.Types.ObjectId, ref : 'Team' },
  players: [
    { type : Schema.Types.ObjectId, ref : 'Player' }
  ],
  season: Number
});

Group.plugin(Tree);
module.exports = mongoose.model('Group', Group);