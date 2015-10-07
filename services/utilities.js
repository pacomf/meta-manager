var request = require("request"),
	cheerio = require("cheerio");


exports.scrappingPlayerDataFromWeb = function (player, url, web){
	if (web === "MARCA"){
		scrappingPlayerDataFromWebMarca(player, url);
	}
}

function scrappingPlayerDataFromWebMarca (player, url){
	request(url, function (error, response, body) {
		if (!error) {
			var $ = cheerio.load(body, {decodeEntities: false});

			var parentNode = $('div[class=ficha-jugador]');

			player.picture = parentNode.find($('img[class=foto-jugador]')).attr('src');
			//TODO, Mirar por qué no coge caracteres RAROS ¿UTF8?, LO DE ABAJO NO FUNCIONA
			player.fullName = parentNode.find($('dl dd').get(0)).text().toString("utf8");
			console.log("F: "+player.fullName);
			player.birthday = dateWebMarcaFormatToDateStr(parentNode.find($('dl dd').get(1)).text());
			player.role = parentNode.find($('dl dd').get(6)).text();


			player.save();
			console.log("Fin");

			//console.log(ret.picture);

		} else {
			console.log("Error: "+error+", Scrapping Web: " + url);
		}
	});
}

// Web Marca Format: DD de MonthInSpanish de YYYY
function dateWebMarcaFormatToDateStr (dateFormatMarca){
	var dateArr = dateFormatMarca.split(' de ');
	var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	var month = months.indexOf(dateArr[1])+1;
	var dateStr = dateArr[2]+"-"+month+"-"+dateArr[0];
	return dateStr;
}

