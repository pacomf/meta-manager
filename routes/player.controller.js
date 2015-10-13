'use strict';

var dbPlayer = require('../models/player.model');
var dbMyPlayers = require('../models/myPlayers.model');
var dbPlayerScore = require('../models/playerScore.model');
var async = require('async');

var config  = require('../configuration.js');

exports.index = function(req, res){

	dbPlayer.findById(req.params.id, function (err, player){
		if (req.params.typePlayer === 'e'){
			dbMyPlayers.findOne({user: req.user, myEleven: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				if ((myPlayer !== undefined) && (myPlayer !== null)){
					dbPlayerScore.find({player: player, season: config.get('season')}).sort({matchDay : -1}).exec(function (err, playerScores){
						var scoreTotal = {};
						var scoreLastDay = {};
						if (playerScores.length > 0){
							scoreTotal = playerScores[playerScores.length-1];
							scoreLastDay = playerScores[0];
						}
						res.render('player', { user: req.user, player: player, scoreTotal: scoreTotal, scoreLastDay: scoreLastDay});
					});
				} else {
					// TODO: Render ESPECIAL para decir que no tienes PERMISOS (¿Poder COMPRAR permisos?)
					res.send(500, 'INVALID PERMISSIONS');
				}
				
			});
		} else if (req.params.typePlayer === 's'){
			dbMyPlayers.findOne({user: req.user, myScouting: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				if ((myPlayer !== undefined) && (myPlayer !== null)){
					dbPlayerScore.find({player: player, season: config.get('season')}).sort({matchDay : -1}).exec(function (err, playerScores){
						var scoreTotal = {};
						var scoreLastDay = {};
						if (playerScores.length > 0){
							scoreTotal = playerScores[playerScores.length-1];
							scoreLastDay = playerScores[0];
						}
						res.render('player', { user: req.user, player: player, scoreTotal: scoreTotal, scoreLastDay: scoreLastDay});
					});
				} else {
					// TODO: Render ESPECIAL para decir que no tienes PERMISOS (¿Poder COMPRAR permisos?)
					res.send(500, 'INVALID PERMISSIONS');
				}
				
			});
		} else {
			res.send(500, 'Wrong Request');
		}
	});
}