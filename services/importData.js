var dbMedia = require('../models/media.model');
var dbLeague = require('../models/league.model');
var dbTeam = require('../models/team.model');
var dbPlayer = require('../models/player.model');

var async = require('async');
var jsonfile = require('jsonfile');
var util = require('util');

var jobScheduling = require('./jobScheduling.js');

var importData = require('./importData.js');

var scrapping = require('./scrapping/scrapping.js');

exports.addSources = function (aSources){

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
		if (!err){
			console.log('Sources Added. All data import!');

			// Run Jobs!
			jobScheduling.scheduleJobs();
		}
		else
			console.log("Error in Sources Addition");
	});
	
}

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
										player.state.available = 0;
										player.state.state = "";
									}
									var foundWeb = 0;
									for (var i = player.data.length - 1; i >= 0; i--) {
										if (player.data[i].web === web){
											player.data[i].url = iPlayer.jugador.href;
											foundWeb = 1;
											break;
										}
									}
									if (foundWeb === 0){
										var dataWeb = {};
										dataWeb.web = web;
										dataWeb.url = iPlayer.jugador.href;
										player.data.push(dataWeb);
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
							if (!err){
								console.log('Players Added');
								importData.initSources();
								scrapping.scrappingPlayerURLFromWeb("NETLIGA");
							} else
								console.log("Error 2 in Players Addition");
						});
					}
				});
				
			}
		});
  		
	});
}

exports.initSources = function(){
	var fileRss = './services/assets/rss.json';
	var fileTwitter = './services/assets/twitter.json';

	jsonfile.readFile(fileRss, { encoding: 'utf8' }, function(err, objRss) {
		var aSources = [];

		for (var i = objRss.length - 1; i >= 0; i--) {
			aSources.push({name: objRss[i].nombre, url: objRss[i].rss, type: 'RSS'});
		};

		jsonfile.readFile(fileTwitter, { encoding: 'utf8' }, function(err, objTwitter) {

			for (var i = objTwitter.length - 1; i >= 0; i--) {
				aSources.push({name: objTwitter[i].twitter, url: objTwitter[i].id, type: 'Twitter'});
			};

			importData.addSources(aSources);
			
		});
	});
}