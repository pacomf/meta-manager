var scrapping_MARCA = require('./scrapping_MARCA.js');
var scrapping_NETLIGA = require('./scrapping_NETLIGA.js');

exports.scrappingPlayerDataFromWeb = function (player, url, web, callback){
	if (web === "MARCA"){
		scrapping_MARCA.scrappingPlayerDataFromWebMarca(player, url, callback);
	}
}

exports.scrappingPlayerURLFromWeb = function(web){
	if (web === "NETLIGA"){
		scrapping_NETLIGA.scrappingPlayerUrlFromWebNetliga();
	}
}

exports.scrappingScorePlayerFromWeb = function(web, year){
	if (web === "NETLIGA"){
		scrapping_NETLIGA.scrappingTotalPlayerScoreFromWebNetliga(year);
	}
}

exports.scrappingPlayersStateFromWeb = function (web){
	if (web === "MARCA"){
		var url = "http://www.marca.com/deporte/futbol/primera-division/lesionados-y-sancionados/";
		scrapping_MARCA.scrappingPlayersStateFromWebMarca(web, url);
	}
}

