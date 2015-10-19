var request = require("request");
var cheerio = require("cheerio");
var iconv = require('iconv-lite');
var dbPlayer = require('../../models/player.model');
var dbPlayerScore = require('../../models/playerScore.model');
var dbTeam = require('../../models/team.model');

var utilities = require('../utilities.js');

var jsonfile = require('jsonfile');

var async = require('async');

var aTeams = [];

aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=42&id_jornada=0', shortName: 'RCDC'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=21&id_jornada=0', shortName: 'RSF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=11&id_jornada=0', shortName: 'RCDE'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=9&id_jornada=0', shortName: 'GFC'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=3&id_jornada=0', shortName: 'CAM'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=10&id_jornada=0', shortName: 'UDLP'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=25&id_jornada=0', shortName: 'RVM'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=6&id_jornada=0', shortName: 'VCF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=18&id_jornada=0', shortName: 'MCF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=4&id_jornada=0', shortName: 'SFC'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=8&id_jornada=0', shortName: 'ACB'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=2&id_jornada=0', shortName: 'FCB'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=7&id_jornada=0', shortName: 'RSG'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=1&id_jornada=0', shortName: 'RMCF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=22&id_jornada=0', shortName: 'LUD'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=38&id_jornada=0', shortName: 'RCCV'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=5&id_jornada=0', shortName: 'RBB'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=20&id_jornada=0', shortName: 'VICF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=36&id_jornada=0', shortName: 'GCF'});
aTeams.push({url: 'http://www.netliga.com/NetLiga/equipos_oficial.jsp?id_equipo=41&id_jornada=0', shortName: 'SDE'});

exports.scrappingPlayerUrlFromWebNetliga = function (){

	var aPositions = ["Portero", "Defensa", "Centrocampista", "Delantero"];

	var urlRootNetliga = "http://www.netliga.com/NetLiga/";

	async.eachSeries(aTeams, function(team, callbackTeam){

		var requestOptions  = {encoding: null, method: "GET", uri: team.url};
		request(requestOptions, function (error, response, body) {
			if (!error) {
				// Encode of NETLIGA.com
				var encodeString = iconv.decode(new Buffer(body), "ISO-8859-1");
				var $ = cheerio.load(encodeString);

				dbTeam.findOne({shortName: team.shortName}, function (err, mTeam){

					dbPlayer.find({season: { $elemMatch: {team: mTeam}}}, function (err, players){

						var parentNode = $('table[class="tabla_t1 clear"]');
						async.eachSeries(parentNode.find($('tr')), function(tr, callbackPlayer){
							if (!$(tr).hasClass("cabFila")){
								var children = $(tr).children();
								var position = aPositions.indexOf($(children[3]).text());
								if (position >= 0){
									var href = urlRootNetliga+$(tr).find($('a')).attr('href');
									var name = utilities.removeDiacritics($(tr).find($('a')).text().trim());
									if (name.split(/[\.]/gi).length > 1){
										name = name.split(/[\.]/gi)[1].trim();
									}
									if (name.split(/[\-]/gi).length > 1){
										name = name.replace(/[\-]/gi, " ").trim();
									} 
									async.eachSeries(players, function(player, callbackP){
										var nameFind = utilities.removeDiacritics(player.name+" "+player.fullName);
										if (nameFind.split(/[\.]/gi).length > 1){
											nameFind = nameFind.split(/[\.]/gi)[1].trim();
										}
										if (nameFind.split(/[\-]/gi).length > 1){
											nameFind = nameFind.replace(/[\-]/gi, " ").trim();
										} 

										var names = name.split(" ");

										async.eachSeries(names, function(mName, callbackName){
											var reSearch = new RegExp(mName, "i");
	              							if (nameFind.search(reSearch) === -1){
	              								callbackName({find: 0});
	              							} else {
	              								callbackName();
	              							}
										}, function (result){
											if (!result){
												async.eachSeries(player.data, function(mData, callbackPd){
		              								if (mData.web === 'NETLIGA'){
		              									mData.url = href;
		              									callbackPd({find: 1});
		              								} else {
		              									callbackPd();
		              								}
		              							}, function (result){
		              								if (!result){
			              								var data = {};
			              								data.web = "NETLIGA";
			              								data.url = href;
			              								player.data.push(data);
		              								}
		              								player.save();
		              								callbackP({find: 1});
		              							});
											} else {
	              								callbackP();
	              							}
	              						});
									}, function (result){
										if (!result){
											// TODO: ¿Que hacer con estos jugadores NO ENCONTRADOS?
											// El problema es que NETLIGA tiene el nombre MAL o son jugadores
											// que no aparecen en MARCA (de momento lo carga a mano más abajo, desde un JSON)
											//console.log(mTeam.name+":"+mTeam.shortName+"|"+name);
										}
	              						callbackPlayer();
	              					});
								} else {
									callbackPlayer(); 
								}
							} else {
			 					callbackPlayer(); 			
			 				}
			    		}, function (err){
			    			callbackTeam();
			    		});
			    	});
				});

			} else {
				console.log("Error: "+error+", Scrapping Url Players from Web Netliga");
				callbackTeam();
			}
		});
		
	}, function (err){
		if (!err){
			//console.log('Url Players from NetLiga Added');
			// TODO: Cambiar esto a una forma más ortodoxa
			importURLFromJSON("NETLIGA", 2016)
		} else
			console.log("Error in Url Players from NetLiga Addition");
	});
}

function importURLFromJSON(web, year){
	var fileJSON = './services/assets/netligaPlayersFailBBVA.json';

	jsonfile.readFile(fileJSON, { encoding: 'utf8' }, function(err, json) {
		async.eachSeries(json, function(obj, callback){
			var team = obj.team;
			var number = obj.number;
			var url = obj.netliga;
			dbTeam.findOne({shortName: team}, function (err, mTeam){
				dbPlayer.findOne({season: { $elemMatch: { team: mTeam, number: number, year: year}}}, function (err, player){
					if ((player !== null) && (player !== undefined)){
						var foundWeb = 0;
						for (var i = player.data.length - 1; i >= 0; i--) {
							if (player.data[i].web === web){
								player.data[i].url = url;
								foundWeb = 1;
								break;
							}
						}
						if (foundWeb === 0){
							var dataWeb = {};
							dataWeb.web = web;
							dataWeb.url = url;
							player.data.push(dataWeb);
						}
						player.save();
						callback();
					} else {
						console.log("Error MANUAL IMPORT Netliga: "+team+":"+number);
						callback();
					}
				});
			});
		}, function (err){
			if (!err){
				console.log('Manual Url Players from NetLiga Added');
			} else
				console.log("Error in Manual Url Players from NetLiga Addition");
		});
	});
}

exports.scrappingTotalPlayerScoreFromWebNetliga = function (year){

	var urlRootNetliga = "http://www.netliga.com/NetLiga/";

	async.eachSeries(aTeams, function(team, callbackTeam){

		var requestOptions  = {encoding: null, method: "GET", uri: team.url};
		request(requestOptions, function (error, response, body) {
			if (!error) {
				// Encode of NETLIGA.com
				var encodeString = iconv.decode(new Buffer(body), "ISO-8859-1");
				var $ = cheerio.load(encodeString);

				dbTeam.findOne({shortName: team.shortName}, function (err, mTeam){
					var parentNode = $('table[class="tabla_t1 clear"]');
					async.eachSeries(parentNode.find($('tr')), function(tr, callbackPlayer){
						if (!$(tr).hasClass("cabFila")){
							var children = $(tr).children();
							var score = $(children[4]).text();
							var href = urlRootNetliga+$(tr).find($('a')).attr('href');
							dbPlayer.findOne({data: { $elemMatch: {url: href}}}, function (err, player){
								if ((player !== undefined) && (player !== null)){
									dbPlayerScore.findOne({player: player, matchDay: 0}, function (err, playerScore){
										if ((playerScore !== undefined) && (playerScore !== null)){
											async.eachSeries(playerScore.score, function(pScore, callbackPScore){
												if (pScore.media === 'NETLIGA'){
													pScore.value = score;
													callbackPScore({find: 1});
												} else {
													callbackPScore();
												}
											}, function (result){
												if (result){
													playerScore.save();
													callbackPlayer();
												} else{
													var scoreData = {};
													scoreData.media = 'NETLIGA';
													scoreData.value = score;
													playerScore.score.push(scoreData);
													playerScore.save();
													callbackPlayer();
												}
								    		});
										} else {
											var newPlayerScore = new dbPlayerScore();
											newPlayerScore.player = player;
											newPlayerScore.season = year;
											newPlayerScore.matchDay = 0;
											var scoreData = {};
											scoreData.media = 'NETLIGA';
											scoreData.value = score;
											newPlayerScore.score.push(scoreData);
											newPlayerScore.save();
											callbackPlayer();
										}
									});
									
								} else {
									callbackPlayer();
								}

							}); 
						} else {
		 					callbackPlayer(); 			
		 				}
		    		}, function (err){
		    			callbackTeam();
		    		});
				});

			} else {
				console.log("Error: "+error+", Scrapping Score Players from Web Netliga");
				callbackTeam();
			}
		});
		
	}, function (err){
		if (!err){
			console.log('Updated Score Players from NetLiga');
		} else
			console.log("Error Updating Score Players from NetLiga");
	});

}


exports.scrappingByPlayerScoreFromWebNetliga = function (year){

	var urlRootNetliga = "http://www.netliga.com/NetLiga/";
	var urlScoreNetliga = "http://www.netliga.com/NetLiga/puntos_netliga.jsp";

	var requestOptions  = {encoding: null, method: "GET", uri: urlScoreNetliga};
	request(requestOptions, function (error, response, body) {
		if (!error) {
			// Encode of NETLIGA.com
			var encodeString = iconv.decode(new Buffer(body), "ISO-8859-1");
			var $ = cheerio.load(encodeString);

			var parentNode = $('table[class="tabla_t1 clear"]');
			var matchDay = $('#id_jornada').find(":selected").text().replace("Jornada", "").trim();
			async.eachSeries(parentNode.find($('tr')), function(tr, callbackPlayer){
				if (!$(tr).hasClass("cabFila")){
					var children = $(tr).children();
					var score = $(children[2]).text();
					var href = urlRootNetliga+($(tr).find($('a')).attr('onclick').replace("window.open('", "").replace("')", ""));

					dbPlayer.findOne({data: { $elemMatch: {url: href}}}, function (err, player){
						if ((player !== undefined) && (player !== null)){
							dbPlayerScore.findOne({player: player, matchDay: matchDay}, function (err, playerScore){
								if ((playerScore !== undefined) && (playerScore !== null)){
									async.eachSeries(playerScore.score, function(pScore, callbackPScore){
										if (pScore.media === 'NETLIGA'){
											pScore.value = score;
											callbackPScore({find: 1});
										} else {
											callbackPScore();
										}
									}, function (result){
										if (result){
											playerScore.save();
											callbackPlayer();
										} else{
											var scoreData = {};
											scoreData.media = 'NETLIGA';
											scoreData.value = score;
											playerScore.score.push(scoreData);
											playerScore.save();
											callbackPlayer();
										}
						    		});
								} else {
									var newPlayerScore = new dbPlayerScore();
									newPlayerScore.player = player;
									newPlayerScore.season = year;
									newPlayerScore.matchDay = matchDay;
									var scoreData = {};
									scoreData.media = 'NETLIGA';
									scoreData.value = score;
									newPlayerScore.score.push(scoreData);
									newPlayerScore.save();
									callbackPlayer();
								}
							});
							
						} else {
							callbackPlayer();
						}

					});
				} else {
 					callbackPlayer(); 			
 				}
    		}, function (err){
    			if (err){
    				console.log("Error 1: "+err+", Scrapping Score By Players from Web Netliga. ");
    			} else {
    				console.log("Updated Score by Players from Netliga");
    			}
    		});

		} else {
			console.log("Error 0: "+error+", Scrapping Score By Players from Web Netliga");
		}
	});

}