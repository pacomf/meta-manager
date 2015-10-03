'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var PlayerScore = new Schema({
  player: { type : Schema.Types.ObjectId, ref : 'Player' },
  score: [{
    media: String,
    value: Number
  }]
});

PlayerScore.plugin(Tree);
module.exports = mongoose.model('PlayerScore', PlayerScore);