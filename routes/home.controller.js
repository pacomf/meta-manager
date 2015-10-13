'use strict';

var dbMyPlayers = require('../models/myPlayers.model');
var async = require('async');

exports.index = function(req, res){
	dbMyPlayers.findOne({user: req.user}).populate('myEleven.player').populate('myScouting.player').exec(function(err, myPlayers){
		if(err) { 
			return res.send(500, err); 
		}
		res.render('home', { user: req.user, myPlayers: myPlayers });
	});
}
