var request = require("request");
var cheerio = require("cheerio");
var iconv = require('iconv-lite');
var dbPlayer = require('../../models/player.model');
var dbTeam = require('../../models/team.model');

var utilities = require('../utilities.js');

var async = require('async');

exports.scrappingPlayerUrlFromWebNetliga = function (){

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
											// que no aparecen en MARCA
											/*
											Real Sociedad:RSF|ENEKO CAPILLA
											Las Palmas:UDLP|CARLOS GUTIERREZ
											Rayo:RVM|PABLO CLAVERIA
											Rayo:RVM|ISI
											Valencia:VCF|TROPI
											Valencia:VCF|RODRIGO DEPAUL
											Málaga:MCF|JUANCARLOS
											Sevilla:SFC|STEVEN N`ZONZI
											Sevilla:SFC|KROHN DELHI
											Sevilla:SFC|INMOBILE
											Sevilla:SFC|IVI
											Bilbao:ACB|RAMALHO
											Bilbao:ACB|SABORIT
											Bilbao:ACB|GURPEGUI
											Bilbao:ACB|UNAI
											Barcelona:FCB|ALEIX VIDAL
											Barcelona:FCB|ARDA TURAN
											Sporting:RSG|PICHU CUELLAR
											Sporting:RSG|JULIO
											Sporting:RSG|MENDI
											Real Madrid:RMCF|ODEGAARD
											Levante:LUD|JOSEMARI
											Celta:RCCV|AUGUSTO FDEZ
											Celta:RCCV|BORJA
											Betis:RBB|JORDI FIGUERAS
											Betis:RBB|N`DIAYE
											Betis:RBB|FOUED KADIR
											Betis:RBB|MATILLA
											Villareal:VICF|MARIO BARBOSA
											Villareal:VICF|AITOR FERNANDEZ
											Villareal:VICF|FELIPE ALFONSO
											Villareal:VICF|ALFONSO PEDRAZA
											Villareal:VICF|FRAN SOL
											Granada:GCF|KELEVA
											Granada:GCF|MASAVU KING
											Granada:GCF|SULAYMAN
											Granada:GCF|ISSAC SUCCESS
											Eibar:SDE|THAYLOR
											*/
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
			console.log('Url Players from NetLiga Added');
		} else
			console.log("Error in Url Players from NetLiga Addition");
	});

	

}