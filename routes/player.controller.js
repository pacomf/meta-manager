'use strict';

var dbPlayer = require('../models/player.model');
var dbTeam = require('../models/team.model');
var dbMyPlayers = require('../models/myPlayers.model');
var dbPlayerScore = require('../models/playerScore.model');
var dbNews = require('../models/news.model');
var async = require('async');

var config  = require('../configuration.js');

exports.index = function(req, res){

	dbPlayer.findById(req.params.id, function (err, player){
		if (req.params.typePlayer === 'e'){
			dbMyPlayers.findOne({user: req.user, myEleven: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				getDataAndRenderPlayer(myPlayer, player, req, res);
			});
		} else if (req.params.typePlayer === 's'){
			dbMyPlayers.findOne({user: req.user, myScouting: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				getDataAndRenderPlayer(myPlayer, player, req, res);
			});
		} else {
			res.send(500, 'Wrong Request');
		}
	});
}

function getDataAndRenderPlayer(myPlayer, player, req, res){
	if ((myPlayer !== undefined) && (myPlayer !== null)){
		dbPlayerScore.find({player: player, season: config.get('season')}).sort({matchDay : -1}).exec(function (err, playerScores){
			var scoreTotal = {};
			var scoreLastDay = {};
			if (playerScores.length > 0){
				scoreTotal = playerScores[playerScores.length-1];
				scoreLastDay = playerScores[0];
			}
			getNewsAndRenderPlayer(player, scoreTotal, scoreLastDay, req, res);
		});
	} else {
		// TODO: Render ESPECIAL para decir que no tienes PERMISOS (¿Poder COMPRAR permisos?)
		res.send(500, 'INVALID PERMISSIONS');
	}
}

function getNewsAndRenderPlayer(player, scoreTotal, scoreLastDay, req, res){
	dbNews.find({player: player}).populate('media').exec(function (err, news){
		res.render('player', { user: req.user, player: player, scoreTotal: scoreTotal, scoreLastDay: scoreLastDay, news: news});
	});
}

exports.listByTeam = function(req, res){

	dbMyPlayers.findOne({_id: req.params.idMyTeam, user: req.user}, function(err, myTeam){
		if ((myTeam !== undefined) && (myTeam !== null)){
			dbTeam.findById(req.params.id, function (err, team){ 
				var totalPlayers = myTeam.myEleven;
				totalPlayers = totalPlayers.concat(myTeam.myScouting);
				var myIdPlayers = [];
				async.eachSeries(totalPlayers, function(mPlayer, callback){
					myIdPlayers.push(mPlayer.player);
					callback();
				}, function (err){
					if (err){
						res.send(500, 'Error: '+err);
					} else {
						// Search Players not belong to MyEleven and MyScouting
						dbPlayer.find({_id: { $nin: myIdPlayers}, season: { $elemMatch: { team: team, year: config.get('season')}}}, function (err, players){
							res.render('player_list', {user: req.user, players:players, team: team, typePlayer: req.params.typePlayer, idMyTeam: req.params.idMyTeam});
						});
					}
				});
				
			});
		} else {
			res.send(500, 'My Team Not Found');
		}
	});
}