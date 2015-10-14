'use strict';

var dbMyPlayers = require('../models/myPlayers.model');
var dbPlayer = require('../models/player.model');
var dbUser = require('../models/user.model');

var config  = require('../configuration.js');

var async = require('async');

exports.index = function(req, res){
	dbMyPlayers.findOne({_id: req.params.id, user:req.user}).populate('myEleven.player').populate('myScouting.player').exec(function(err, myTeam){
		if(err) { 
			return res.send(500, err); 
		}
		res.render('my_team', { user: req.user, myPlayers: myTeam, idMyTeam: req.params.id});
	});
}

exports.add = function(req, res){
	dbMyPlayers.find({user: req.user}, function(err, myTeams){
		if (req.user.maximumTeams > myTeams.length) {
			var newTeam = dbMyPlayers();
			newTeam.user = req.user;
			newTeam.teamName = req.body.name;
			newTeam.season = config.get('season');
			newTeam.save();
			res.redirect('/myTeam/'+newTeam._id);
		} else {
			res.send(500, 'You have Maximum Teams for your Account. Upgrade Your Account.');
		}
		
	});
}

exports.newTeam = function(req, res){
	res.render('team_new', { user: req.user});
}

exports.addPlayer = function(req, res){

	dbPlayer.findById(req.params.idPlayer, function (err, player){
		if ((player !== null) && (player !== undefined)){
			dbMyPlayers.findOne({_id: req.params.idMyTeam, user: req.user}).populate('myEleven.player').populate('myScouting.player').exec(function(err, myTeam){
				if ((myTeam !== null) && (myTeam !== undefined)){
					if (req.params.typePlayer === 'e'){
						if (myTeam.monitoringAllowed.myEleven > myTeam.myEleven.length)
							findAndInsertPlayer(res, myTeam, player, myTeam.myEleven, req.params.typePlayer);
						else
							res.send(500, 'You have MAXIMUM PLAYERS Allowed. Update your Account.');
					} else if (req.params.typePlayer === 's'){
						if (myTeam.monitoringAllowed.myScouting > myTeam.myScouting.length)
							findAndInsertPlayer(res, myTeam, player, myTeam.myScouting, req.params.typePlayer);
						else
							res.send(500, 'You have MAXIMUM SCOUTING Allowed. Update your Account.');
					} else {
						res.send(500, 'Wrong Request 2');
					}
				} else {
					res.send(500, 'Wrong Request 1');
				}
			});
		} else {
			res.send(500, 'Wrong Request 0');
		}
	});
}

function findAndInsertPlayer(res, myTeam, playerNew, players, typePlayer){
	async.eachSeries(players, function(player, callback){
		if (player.player._id.equals(playerNew._id)){
			callback({find: 1})
		} else {
			callback();
		}
	}, function (result){
		if (!result){
			var dataPlayer = {};
			dataPlayer.player = playerNew;
			dataPlayer.visible = true;
			if (typePlayer === 'e'){ 
				myTeam.myEleven.push(dataPlayer);
				myTeam.save();
				res.redirect('/myTeam/'+myTeam._id);
			} else if (typePlayer === 's'){
				myTeam.myScouting.push(dataPlayer);
				myTeam.save();
				res.redirect('/myTeam/'+myTeam._id);
			}
		} else
			res.send(500, 'Existing Player in your Team');
	});
}
