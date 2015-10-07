var dbMedia = require('../models/media.model');
var dbLeague = require('../models/league.model');
var dbTeam = require('../models/team.model');
var dbPlayer = require('../models/player.model');
var async = require('async');

exports.addSources = function (){
	var aSources = [];

	aSources.push({name: 'marca', url: 'http://marca.feedsportal.com/rss/futbol_1adivision.xml', type: 'RSS'});
	aSources.push({name: 'as', url: 'http://futbol.as.com/rss/futbol/primera.xml', type: 'RSS'});
	aSources.push({name: 'Pakote', url: '526390388', type: 'Twitter'});

	async.eachSeries(aSources, function(source, callback){
		dbMedia.findOne({url: source.url}, function (err, mSource){
			if ((mSource === null) || (mSource === undefined)){
				var newMedia = new dbMedia();
				newMedia.name = source.name;
				newMedia.url = source.url;
				newMedia.type = source.type;
				newMedia.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			} else {
				mSource.name = source.name;
				mSource.type = source.type;
				mSource.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			}
		});
	}, function (err){
		if (!err)
			console.log('Sources Added');
		else
			console.log("Error in Sources Addition");
	});
	
}

// IMPORT MANUAL. BE CAREFUL!

exports.addCompetitions = function (){
	var aCompetitions = [];

	aCompetitions.push({name: 'Liga BBVA', country: 'Spain', division: '1'});

	async.eachSeries(aCompetitions, function(competition, callback){
		dbLeague.findOne({division: competition.division, country: competition.country}, function (err, mCompetition){
			if ((mCompetition === null) || (mCompetition === undefined)){
				var newLeague = new dbLeague();
				newLeague.name = competition.name;
				newLeague.country = competition.country;
				newLeague.division = competition.division;
				newLeague.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			} else {
				mCompetition.name = source.name;
				mCompetition.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			}
		});
	}, function (err){
		if (!err)
			console.log('Leagues Added');
		else
			console.log("Error in Leagues Addition");
	});
}

exports.addTeams = function (idCompetition){
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

	async.eachSeries(aTeams, function(team, callback){
		dbLeague.findById(idCompetition, function (err, mLeague){
			if ((mLeague === null) || (mLeague === undefined)){
				console.log("League not Find to Insert Team");
				callback();
			} else {
				dbTeam.findOne({shortName: team.shortName, league: mLeague}, function (err, mTeam){
					if ((mTeam === null) || (mTeam === undefined)){
						var newTeam = new dbTeam();
						newTeam.name = team.name;
						newTeam.shortName = team.shortName;
						newTeam.fullName = team.fullName;
						newTeam.save(
							function(err, product, numberAffected){
							 	callback();
							}
						); 
					} else {
						mTeam.name = team.name;
						mTeam.fullName = team.fullName;
						mTeam.save(
							function(err, product, numberAffected){
							 	callback();
							}
						); 
					}
				});
			}
		});
	}, function (err){
		if (!err)
			console.log('Teams Added');
		else
			console.log("Error in Teams Addition");
	});
}