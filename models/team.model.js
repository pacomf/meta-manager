'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Tree     = require('mongoose-tree');

var Team = new Schema({
  name: String,
  fullName: String,
  shortName: String,
  webSite:String,
  socialNetworks: [{
    name: String,
    site: String
  }],
  league: { type : Schema.Types.ObjectId, ref : 'League' }
});

Team.plugin(Tree);
Team.index({_id: 1, league: 1},{unique: true});
module.exports = mongoose.model('Team', Team);