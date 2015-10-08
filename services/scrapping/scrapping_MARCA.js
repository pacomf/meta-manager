var request = require("request");
var cheerio = require("cheerio");
var iconv = require('iconv-lite');

exports.scrappingPlayerDataFromWebMarca = function (player, url){
	var requestOptions  = {encoding: null, method: "GET", uri: url};
	request(requestOptions, function (error, response, body) {
		if (!error) {
			// Encode of MARCA.com
			var utf8String = iconv.decode(new Buffer(body), "ISO-8859-15");
			var $ = cheerio.load(utf8String);

			var parentNode = $('div[class=ficha-jugador]');

			player.picture = parentNode.find($('img[class=foto-jugador]')).attr('src');
			player.fullName = parentNode.find($('dl dd').get(0)).text();
			player.birthday = dateWebMarcaFormatToDateStr(parentNode.find($('dl dd').get(1)).text());
			player.role = parentNode.find($('dl dd').get(6)).text();

			player.save();

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