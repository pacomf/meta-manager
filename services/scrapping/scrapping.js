var scrapping_MARCA = require('./scrapping_MARCA.js');

exports.scrappingPlayerDataFromWeb = function (player, url, web){
	if (web === "MARCA"){
		scrapping_MARCA.scrappingPlayerDataFromWebMarca(player, url);
	}
}

