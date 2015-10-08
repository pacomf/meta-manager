var dbMedia = require('../models/media.model');
var dbLeague = require('../models/league.model');
var dbTeam = require('../models/team.model');
var dbPlayer = require('../models/player.model');
var async = require('async');
var jsonfile = require('jsonfile');
var util = require('util');

var scrapping = require('./scrapping/scrapping.js');

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

exports.addLeague = function (name, country, division, aTeams, jsonPlayers, year, web){
	dbLeague.findOne({division: division, country: country}, function (err, mLeague){
		if ((mLeague === null) || (mLeague === undefined)){
			var newLeague = new dbLeague();
			newLeague.name = name;
			newLeague.country = country;
			newLeague.division = division;
			newLeague.save(
				function(err, league, numberAffected){
					console.log('New League Added');
					addTeams(league._id, aTeams, jsonPlayers, year, web);
				}
			); 
		} else {
			mLeague.name = name;
			mLeague.save(
				function(err, league, numberAffected){
				 	console.log('Modify League Done');
					addTeams(league._id, aTeams, jsonPlayers, year, web);
				}
			); 
		}
	});
}

function addTeams (idLeague, aTeams, jsonPlayers, year, web){

	async.eachSeries(aTeams, function(team, callback){
		dbLeague.findById(idLeague, function (err, mLeague){
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
						newTeam.league = mLeague;
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
		if (!err){
			console.log('Teams Added');
			addPlayers(jsonPlayers, idLeague, year, web);
		} else
			console.log("Error in Teams Addition");
	});
}

function addPlayers (fileJSON, idLeague, year, web){
	jsonfile.readFile(fileJSON, { encoding: 'utf8' }, function(err, obj) {
		dbLeague.findById(idLeague, function (err, mLeague){
			if ((mLeague === null) || (mLeague === undefined)){
				console.log("ERROR: Not Exist League: "+idLeague);
				return;
			} else {
				dbTeam.find({league: mLeague}, function (err, teams){
					if ((teams === null) || (teams === undefined)){
						console.log("ERROR: Not Exist Teams for League: "+idLeague);
						return;
					} else {
						async.eachSeries(teams, function(team, callbackTeam){
							async.eachSeries(obj[team.shortName], function(iPlayer, callbackPlayer){
								dbPlayer.findOne({season: { $elemMatch: { team: team, number: iPlayer.dorsal, year: year}}}, function (err, player){
									if ((player === null) || (player === undefined)){
										player = new dbPlayer();
										var season = {};
										season.team = team;
										season.number = iPlayer.dorsal;
										season.year = year;
										player.season.push(season);
									}
									player.name = iPlayer.jugador.text;
									scrapping.scrappingPlayerDataFromWeb(player, iPlayer.jugador.href, web, callbackPlayer);
								});
							}, function (err){
								if (!err)
									callbackTeam();
								else
									console.log("Error 1 in Players Addition");
							});
						}, function (err){
							if (!err)
								console.log('Players Added. All data import!');
							else
								console.log("Error 2 in Players Addition");
						});
					}
				});
				
			}
		});
  		
	});
}