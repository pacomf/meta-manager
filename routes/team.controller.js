'use strict';

var dbTeam = require('../models/team.model');

exports.list = function(req, res){
	dbTeam.find({}, function(err, teams){
		res.render('team_list', {user: req.user, teams: teams, typePlayer: req.params.typePlayer, idMyTeam: req.params.idMyTeam});
	});
}