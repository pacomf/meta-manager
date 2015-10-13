'use strict';

var dbPlayer = require('../models/player.model');
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