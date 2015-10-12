var request = require("request");
var cheerio = require("cheerio");
var iconv = require('iconv-lite');
var dbPlayer = require('../../models/player.model');
var dbTeam = require('../../models/team.model');
var dbScorePlayer = require('../../models/playerScore.model');
var utilities = require('../utilities.js');

var async = require('async');

exports.scrappingPlayerDataFromWebMarca = function (player, url, callback){
	var requestOptions  = {encoding: null, method: "GET", uri: url};
	request(requestOptions, function (error, response, body) {
		if (!error) {
			// Encode of MARCA.com
			var encodeString = iconv.decode(new Buffer(body), "ISO-8859-15");
			var $ = cheerio.load(encodeString);

			var parentNode = $('div[class=ficha-jugador]');

			player.picture = parentNode.find($('img[class=foto-jugador]')).attr('src');
			player.fullName = parentNode.find($('dl dd').get(0)).text();
			player.birthday = dateWebMarcaFormatToDateStr(parentNode.find($('dl dd').get(1)).text());
			player.role.name = parentNode.find($('dl dd').get(6)).text();
			player.role.position = getPositionType(parentNode.find($('dl dd').get(6)).text());
			player.save();

		} else {
			console.log("Error: "+error+", Scrapping Web: " + url);
		}
		callback();
	});
}

function getPositionType(position){
	var reSearchGoalKeeper = new RegExp("Portero", "i");
	var reSearchDefenders = new RegExp("Defensa|Lateral", "i");
	var reSearchMidfielders = new RegExp("Medio|Extremo|Interior", "i");
	var reSearchAttackers = new RegExp("Delantero|Mediapunta", "i");
    if (position.search(reSearchGoalKeeper) !== -1){
    	return 0;
    }
    if (position.search(reSearchDefenders) !== -1){
  		return 1;
    }
    if (position.search(reSearchMidfielders) !== -1){
    	return 2;
    }
    if (position.search(reSearchAttackers) !== -1){
    	return 3;
    }
    return -1;
}

// Web Marca Format: DD de MonthInSpanish de YYYY
function dateWebMarcaFormatToDateStr (dateFormatMarca){
	var dateArr = dateFormatMarca.split(' de ');
	var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	var month = months.indexOf(dateArr[1])+1;
	var dateStr = dateArr[2]+"-"+month+"-"+dateArr[0];
	return dateStr;
}

exports.scrappingPlayersStateFromWebMarca = function (web, url){
	var requestOptions  = {encoding: null, method: "GET", uri: url};
	request(requestOptions, function (error, response, body) {
		if (!error) {
			// Encode of MARCA.com
			var encodeString = iconv.decode(new Buffer(body), "ISO-8859-15");
			var $ = cheerio.load(encodeString);

			// To Injury Players

			var parentNodeInjury = $('p[class="cintillo bajas"]').parent();
			
    		async.eachSeries(parentNodeInjury.find($('table tr')), function(scr, callback){
    			var href = $(scr).find($('td[class="jugador"] a')).attr('href');
    			var state = $(scr).find($('td[class="motivo"]')).text();
    			if (href !== undefined){
	    			request(href, function (error, response) {
	    				if (error){
	    					console.log("Error to Scrapping State Player Injury: "+href);
	    					callback();
	    				} else {
		  					var hrefLast = response.request.uri.href;
			    			dbPlayer.findOne({data: { $elemMatch: { web: web, url: hrefLast}}}, function (err, player){
			    				if ((player === null) || (player === undefined)){
			    					console.log("Error to Scrapping State Player Injury: "+href+" in "+web);
			    				} else {
			    					player.state.available = 2;
			    					player.state.state = state;
			    					player.save();
			    				}
			    				callback();
			    			});
			    		}
					});
				} else {
					callback();
				}
    		}, function (err){
				if (!err){
					console.log('Update State of Players [Injury]: '+new Date());
				}
				else
					console.log("Error to Scrapping State Players Injury");
			});

			// To Doubtful Players

    		var parentNodeDoubtful = $('p[class="cintillo dudas"]').parent();

    		async.eachSeries(parentNodeDoubtful.find($('table tr')), function(scr, callback){
    			var href = $(scr).find($('td[class="jugador"] a')).attr('href');
    			var state = $(scr).find($('td[class="motivo"]')).text();
    			if (href !== undefined){
	    			request(href, function (error, response) {
	    				if (error){
	    					console.log("Error to Scrapping State Player Doubtful: "+href);
	    					callback();
	    				} else {
		  					var hrefLast = response.request.uri.href;
			    			dbPlayer.findOne({data: { $elemMatch: { web: web, url: hrefLast}}}, function (err, player){
			    				if ((player === null) || (player === undefined)){
			    					console.log("Error to Scrapping State Player Doubtful: "+href+" in "+web);
			    				} else {
			    					player.state.available = 1;
	    							player.state.state = state;
	    							player.save();
			    				}
			    				callback();
			    			});
			    		}
					});
				} else {
					callback();
				}
    		}, function (err){
				if (!err){
					console.log('Update State of Players [Doubtful]: '+new Date());
				}
				else
					console.log("Error to Scrapping State Players Doubtful");
			});

		} else {
			console.log("Error: "+error+", Scrapping Web: " + url);
		}
	});
}

exports.scrappingByPlayerScoreFromWebMarcaLigaFantastica = function (year){

	var urlScoreMarcaLF = "https://ligafantastica.marca.es/static/estadisticas/";

	var jTeams = {DEP: 'RCDC', RSO: 'RSF', ESP: 'RCDE', GET: 'GFC', ATM: 'CAM', LPA: 'UDLP', RAY: 'RVM', VAL: 'VCF',
	              MGA: 'MCF', SEV: 'SFC', ATH: 'ACB', BAR: 'FCB', SPO: 'RSG', RMA: 'RMCF', LEV: 'LUD', CEL: 'RCCV',
	              BET: 'RBB', VIL: 'VICF', GRA: 'GCF', EIB: 'SDE'};

	var requestOptions  = {encoding: null, method: "GET", uri: urlScoreMarcaLF};
	request(requestOptions, function (error, response, body) {
		if (!error) {
			// Encode of ligafantastica.MARCA.com
			var encodeString = iconv.decode(new Buffer(body), "ISO-8859-1");
			var $ = cheerio.load(encodeString);
			
			var matchDay = $('select[name=jor] option:last-child').text().replace("Jornada", "").trim();

			updateScorePlayersByPosition(jTeams, 'js_Porteros', matchDay, year, $);
			updateScorePlayersByPosition(jTeams, 'js_Defensas', matchDay, year, $);
			updateScorePlayersByPosition(jTeams, 'js_Medios', matchDay, year, $);
			updateScorePlayersByPosition(jTeams, 'js_Delanteros', matchDay, year, $);

		} else {
			console.log("Error 0: "+error+", Scrapping Score By Players from LF MARCA");
		}
	});
}

function updateScorePlayersByPosition(jTeams, position, matchDay, year, $){

	var parentNode = $('#'+position);

	async.eachSeries(parentNode.find($('tbody tr')), function(tr, callbackPlayer){
		var children = $(tr).children();
		var name = utilities.removeDiacritics($(children[1]).text().replace("*", "")).trim();
		var shortNameTeam = $(children[3]).text();
		var scoreMatch = $(children[4]).text();
		var scoreTotal = $(children[5]).text();
		if (scoreTotal === '-'){
			callbackPlayer();
		} else {
			searchPlayerByTeamAndUpdateScores(jTeams[shortNameTeam], matchDay, year, name, scoreMatch, scoreTotal, callbackPlayer);
		}
	}, function (err){
		if (err){
			console.log("Error Updating Score Players from MARCALF: "+position);
		} else {
			console.log('Updated Score Players from MARCA LIGA FANTASTICA: '+position);
		}
	});

}

function searchPlayerByTeamAndUpdateScores (shortNameTeam, matchDay, year, name, scoreMatch, scoreTotal, callback){
	dbTeam.findOne({shortName: shortNameTeam}, function (err, mTeam){

		dbPlayer.find({season: { $elemMatch: {team: mTeam}}}, function (err, players){

			async.eachSeries(players, function(player, callbackP){
				var nameFind = utilities.removeDiacritics(player.name+" "+player.fullName);
				var names = name.replace(".", " ").split(" ");

				async.eachSeries(names, function(mName, callbackName){
					var reSearch = new RegExp(mName.trim(), "i");
						if (nameFind.search(reSearch) === -1){
							callbackName({find: 0});
						} else {
							callbackName();
						}
				}, function (result){
					if (!result){ // Player Found
						updateTotalScore(player, matchDay, year, scoreMatch, scoreTotal, callbackP);
					} else {
						callbackP();
					}
				});
			}, function (result){
				if (!result){
					// TODO: ¿Que hacer con estos jugadores NO ENCONTRADOS?
					// El problema es que NETLIGA tiene el nombre MAL o son jugadores
					// que no aparecen en MARCA
					console.log("NOOOO: "+shortNameTeam+"|"+name);
				}
				callback();
			});
		});
	});
}

// Update TOTAL SCORE from MARCALF
function updateTotalScore (player, matchDay, year, scoreMatch, scoreTotal, callback){
	dbScorePlayer.findOne({player: player, matchDay: 0}, function (err, sPlayer){
		if ((sPlayer === null) || (sPlayer === undefined)){
			var newScorePlayer = new dbScorePlayer();
			newScorePlayer.player = player;
			newScorePlayer.season = year;
			newScorePlayer.matchDay = 0;
			var scoreData = {};
			scoreData.media = 'MARCALF';
			scoreData.value = scoreTotal;
			newScorePlayer.score.push(scoreData);
			newScorePlayer.save();
			updateMatchDayScore(player, matchDay, year, scoreMatch, callback);
		} else {
			async.eachSeries(sPlayer.score, function(pScore, callbackPScore){
				if (pScore.media === 'MARCALF'){
					pScore.value = scoreTotal;
					callbackPScore({find: 1});
				} else {
					callbackPScore();
				}
			}, function (result){
				if (result){
					sPlayer.save();
					updateMatchDayScore(player, matchDay, year, scoreMatch, callback);
				} else{
					var scoreData = {};
					scoreData.media = 'MARCALF';
					scoreData.value = scoreTotal;
					sPlayer.score.push(scoreData);
					sPlayer.save();
					updateMatchDayScore(player, matchDay, year, scoreMatch, callback);
				}
    		});
		}
	});
}


// Update MatchDay Score from MARCALF
function updateMatchDayScore(player, matchDay, year, scoreMatch, callback){
	dbScorePlayer.findOne({player: player, matchDay: matchDay}, function (err, sPlayer){
		if ((sPlayer === null) || (sPlayer === undefined)){
			var newScorePlayer = new dbScorePlayer();
			newScorePlayer.player = player;
			newScorePlayer.season = year;
			newScorePlayer.matchDay = matchDay;
			var scoreData = {};
			scoreData.media = 'MARCALF';
			scoreData.value = scoreMatch;
			newScorePlayer.score.push(scoreData);
			newScorePlayer.save();
			callback({find: 1});
		} else {
			async.eachSeries(sPlayer.score, function(pScore, callbackPScore){
				if (pScore.media === 'MARCALF'){
					pScore.value = scoreMatch;
					callbackPScore({find: 1});
				} else {
					callbackPScore();
				}
			}, function (result){
				if (result){
					sPlayer.save();
					callback({find: 1});
				} else{
					var scoreData = {};
					scoreData.media = 'MARCALF';
					scoreData.value = scoreMatch;
					sPlayer.score.push(scoreData);
					sPlayer.save();
					callback({find: 1});
				}
    		});
		}
	});
}