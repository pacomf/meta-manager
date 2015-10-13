'use strict';

var dbPlayer = require('../models/player.model');
var dbMyPlayers = require('../models/myPlayers.model');
var async = require('async');

exports.index = function(req, res){

	if (req.params.typePlayer === 'e'){
		dbPlayer.findById(req.params.id, function (err, player){
			dbMyPlayers.findOne({user: req.user, myEleven: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				if ((myPlayer !== undefined) && (myPlayer !== null)){
					res.render('player', { user: req.user, player: player});
				} else {
					// TODO: Render ESPECIAL para decir que no tienes PERMISOS (¿Poder COMPRAR permisos?)
					res.send(500, 'INVALID PERMISSIONS');
				}
				
			});
			
		});
	} else if (req.params.typePlayer === 's'){
		dbPlayer.findById(req.params.id, function (err, player){
			dbMyPlayers.findOne({user: req.user, myScouting: { $elemMatch: { player: player, visible: true}}}, function(err, myPlayer){
				if ((myPlayer !== undefined) && (myPlayer !== null)){
					res.render('player', { user: req.user, player: player});
				} else {
					// TODO: Render ESPECIAL para decir que no tienes PERMISOS (¿Poder COMPRAR permisos?)
					res.send(500, 'INVALID PERMISSIONS');
				}
				
			});
			
		});
	} else {
		res.send(500, 'Wrong Request');
	}
}