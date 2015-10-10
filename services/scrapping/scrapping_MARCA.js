var request = require("request");
var cheerio = require("cheerio");
var iconv = require('iconv-lite');
var dbPlayer = require('../../models/player.model');

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