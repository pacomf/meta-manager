var scrapping_MARCA = require('./scrapping_MARCA.js');

exports.scrappingPlayerDataFromWeb = function (player, url, web, callback){
	if (web === "MARCA"){
		scrapping_MARCA.scrappingPlayerDataFromWebMarca(player, url, callback);
	}
}

exports.scrappingPlayersStateFromWeb = function (web){
	if (web === "MARCA"){
		var url = "http://www.marca.com/deporte/futbol/primera-division/lesionados-y-sancionados/";
		scrapping_MARCA.scrappingPlayersStateFromWebMarca(web, url);
	}
}

