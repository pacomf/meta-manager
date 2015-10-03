'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var News = new Schema({
  player: { type : Schema.Types.ObjectId, ref : 'Player' },
  media: { type : Schema.Types.ObjectId, ref : 'Media' },
  url: String,
  title: String,
  sentiment: String,
  created_at: Date
});

News.plugin(Tree);
module.exports = mongoose.model('News', News);