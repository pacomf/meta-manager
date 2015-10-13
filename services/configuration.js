'use strict';

var importData = require('./importData.js');

var dbPlayer = require('../models/player.model.js');
var dbMyPlayers = require('../models/myPlayers.model.js');
var dbUser = require('../models/user.model.js');

var jsonfile = require('jsonfile');

var config  = require('../configuration.js');

exports.init = function(app){

	//initLeagueBBVA();
	//mockMyTeam()
}

function initLeagueBBVA(){
	var aTeams = [];

	aTeams.push({name: 'Deportivo', fullName: 'RC Deportivo La Coruña', shortName: 'RCDC'});
	aTeams.push({name: 'Real Sociedad', fullName: 'Real Sociedad de Fútbol', shortName: 'RSF'});
	aTeams.push({name: 'Espanyol', fullName: 'RCD Espanyol', shortName: 'RCDE'});
	aTeams.push({name: 'Getafe', fullName: 'Getafe CF', shortName: 'GFC'});
	aTeams.push({name: 'Atlético', fullName: 'Club Atlético de Madrid', shortName: 'CAM'});
	aTeams.push({name: 'Las Palmas', fullName: 'UD Las Palmas', shortName: 'UDLP'});
	aTeams.push({name: 'Rayo', fullName: 'Rayo Vallecano de Madrid', shortName: 'RVM'});
	aTeams.push({name: 'Valencia', fullName: 'Valencia CF', shortName: 'VCF'});
	aTeams.push({name: 'Málaga', fullName: 'Málaga CF', shortName: 'MCF'});
	aTeams.push({name: 'Sevilla', fullName: 'Sevilla FC', shortName: 'SFC'});
	aTeams.push({name: 'Bilbao', fullName: 'Athletic Club de Bilbao', shortName: 'ACB'});
	aTeams.push({name: 'Barcelona', fullName: 'FC Barcelona', shortName: 'FCB'});
	aTeams.push({name: 'Sporting', fullName: 'Real Sporting Gijón', shortName: 'RSG'});
	aTeams.push({name: 'Real Madrid', fullName: 'Real Madrid CF', shortName: 'RMCF'});
	aTeams.push({name: 'Levante', fullName: 'Levante UD', shortName: 'LUD'});
	aTeams.push({name: 'Celta', fullName: 'RC Celta de Vigo', shortName: 'RCCV'});
	aTeams.push({name: 'Betis', fullName: 'Real Betis Balompié', shortName: 'RBB'});
	aTeams.push({name: 'Villareal', fullName: 'Villarreal CF', shortName: 'VICF'});
	aTeams.push({name: 'Granada', fullName: 'Granada CF', shortName: 'GCF'});
	aTeams.push({name: 'Eibar', fullName: 'SD Eibar', shortName: 'SDE'});

	var nameLeague = 'Liga BBVA';
	var countryLeague = 'Spain';
	var divisionLeague = '1';
	var year = config.get('season');
	var web = "MARCA";

	console.log("Importing Liga BBVA Data...");

	importData.addLeague(nameLeague, countryLeague, divisionLeague, aTeams, './services/assets/playersBBVALite.json', year, web);
}

// MOCK DATA, DELETE IN RELEASE VERSION

function mockMyTeam(){
	dbUser.findOne({}, function (err, user){
		dbMyPlayers.findOne({user: user}, function(err, mMyPlayers){
			if ((mMyPlayers === null) || (mMyPlayers === undefined)){
				var newMyPlayers = new dbMyPlayers();
				newMyPlayers.user = user;
				dbPlayer.find().limit(16).exec(function(err, mPlayers){
					for (var i = mPlayers.length - 1; i >= 0; i--) {
						var player = {}
						player.player = mPlayers[i];
						if (i > 4){
							player.visible = true;
							newMyPlayers.myEleven.push(player);
						} else {
							player.visible = false;
							newMyPlayers.myScouting.push(player);
						}
						if (i === 0){
							newMyPlayers.save();
							console.log("My New Mock Team is Loaded");
						}
					};
				});
			} else {
				console.log("My Mock Team is Loaded");
			}
		});
	});
}

