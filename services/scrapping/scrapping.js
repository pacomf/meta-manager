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

// Scrapping Total Score (ALL MATCHES)
exports.scrappingTotalScorePlayersFromWeb = function(web, year){
	if (web === "NETLIGA"){
		scrapping_NETLIGA.scrappingTotalPlayerScoreFromWebNetliga(year);
	} else if (web === 'MARCA'){ // Scrapping Total Score and Last Match
		scrapping_MARCA.scrappingByPlayerScoreFromWebMarcaLigaFantastica(year);
	}
}

// Scrapping Score Last Match
exports.scrappingScoreByPlayerFromWeb = function(web, year){
	if (web === "NETLIGA"){
		scrapping_NETLIGA.scrappingByPlayerScoreFromWebNetliga(year);
	}
}

exports.scrappingPlayersStateFromWeb = function (web){
	if (web === "MARCA"){
		var url = "http://www.marca.com/deporte/futbol/primera-division/lesionados-y-sancionados/";
		scrapping_MARCA.scrappingPlayersStateFromWebMarca(web, url);
	}
}

