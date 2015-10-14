'use strict';

var dbMyPlayers = require('../models/myPlayers.model');

var config  = require('../configuration.js');

exports.index = function(req, res){
	dbMyPlayers.find({user: req.user, season: config.get('season')}, function(err, myTeams){
		if(err) { 
			return res.send(500, err); 
		} else {
			if (myTeams.length === 0){
				res.redirect('/team/add');
			} else if (myTeams.length === 1){
				res.redirect('/myTeam/'+myTeams[0]._id);
			} else {
				// TODO: CUANDO EL USUARIO TENGA VARIOS EQUIPOS
			}
		}
	});
}