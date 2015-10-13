'use strict';

var dbMyPlayers = require('../models/myPlayers.model');
var async = require('async');

exports.index = function(req, res){
  dbMyPlayers.findOne({user: req.user}).populate('myEleven.player').populate('myScouting.player').exec(function(err, myPlayers){
      if(err) { 
      	return res.send(500, err); 
      }
      var pEleven = [];
      async.eachSeries(myPlayers.myEleven, function(mPlayer, callback){
      	var info = {};
      	info.name = mPlayer.player.name;
      	info.picture = mPlayer.player.picture;
      	if (mPlayer.visible === true){
      		info.id = mPlayer.player._id;
      	}
      	pEleven.push(info);
      	callback();
      }, function (err){
		if (err)
			return res.send(500, err);
		else {
			var pScouting = [];
			async.eachSeries(myPlayers.myScouting, function(mPlayer, callback){
				var info = {};
		      	info.name = mPlayer.player.name;
		      	info.picture = mPlayer.player.picture;
		      	if (mPlayer.visible === true){
		      		info.id = mPlayer.player._id;
		      	}
				pScouting.push(info);
				callback();
			}, function (err){
				if (err)
					return res.send(500, err);
				else {
					res.render('home', { user: req.user, myPlayers: pEleven, myScouting: pScouting });
				}
			});
		}
	  });
      
    });
}
