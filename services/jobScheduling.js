
var Agenda = require('agenda');
var RssController = require('./rss/rss.js');
var Config = require('../configuration.js');
var dbMedia = require('../models/media.model');
var dbPlayer = require('../models/player.model');
var TwitterController = require('./social_networks/twitter.js');

var Scrapping = require('./scrapping/scrapping.js');

exports.scheduleJobs = function(){
	this.scheduleRss();
	this.scheduleTwitter();
	this.scheduleStatePlayers();
	this.scheduleTotalScorePlayers();
	this.scheduleScoreByPlayer();
}

exports.scheduleRss = function (){

	if (Config.get('mockMode') === 1){
		console.log("Mock Mode ENABLE: RSS Disable");
		return;
	}

	var agenda = new Agenda();
	agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
	agenda._db._emitter._maxListeners = 0;

	// TODO, QUITAR
	agenda.purge(function(err, numRemoved) {});

	agenda.define('analyzeRss', function(job, done) {
  		var data = job.attrs.data;
  		RssController.readAndProcessRss(data.idRss, data.urlRss, done);
	});

	var job;

	dbMedia.find({type: 'RSS'}, function (err, rssSources){
		for (var i = rssSources.length - 1; i >= 0; i--) {
			job = agenda.create('analyzeRss', {idRss: rssSources[i]._id, urlRss:rssSources[i].url});
			job.repeatEvery(Config.get('timeRss')).save();
		};
		agenda.start();
  		console.log("Jobs RSS run!");
	});

}

exports.scheduleTwitter = function (){

	if (Config.get('mockMode') === 1){
		console.log("Mock Mode ENABLE: Twitter Disable");
		return;
	}

	dbMedia.find({type: 'Twitter'}, function (err, twitterSources){
		var users = [];
		for (var i = twitterSources.length - 1; i >= 0; i--) {
			users.push(twitterSources[i].url);
		};

		if (users.length > 0){
			var stream = TwitterController.T.stream('statuses/filter', { follow: users });

			stream.on('tweet', function (tweet) {
				var textTweet = tweet.text;
				var dateTweet = new Date(tweet.created_at);
				var urlTweet = 'https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str;
				var idUser = tweet.user.id_str;
				// Se busca solo por Tweets generados por los Users (Follow)
				// Si es un RT de alguien sobre ese User, no lo procesara porque no encontrara en BBDD al usuario,
				// ya que en los RT, el usuario que hace el RT es el que llega, no el que escribio el Tweet.
				dbMedia.findOne({url: idUser, type: 'Twitter'}, function (err, mMedia){
					if ((mMedia === null) || (mMedia === undefined)){
						// Entrara por aquí siempre que llegue un RT de alguien sobre un Follow del Sistema
						//console.log("Error in Find Media Twitter for idUser: "+idUser);
						return;
					} else {
						TwitterController.readAndProcessTwitter(mMedia._id, urlTweet, textTweet, dateTweet);
					}
				});
			});
			console.log("Twitter Stream run!");
  		} else {
  			console.log("Error: Not exist Twitter Sources");
  		}
	});
}

exports.scheduleStatePlayers = function (){

	if (Config.get('mockMode') === 1){
		console.log("Mock Mode ENABLE: Update State Players Disable");
		return;
	}

	var agenda = new Agenda();
	agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
	agenda._db._emitter._maxListeners = 0;

	agenda.define('analyzeStatePlayers', function(job, done) {
		var data = job.attrs.data;
		// TODO: Ojo cuidado con esto, que cada vez que actualizo el estado de los jugadores, los seteo todos a AVAILABLE
		// Durante unos segundos pueden aparecer en el sistema jugadores AVAILABLES cuando NO LO SON
		dbPlayer.update({}, {$set: {"state.available": 0, "state.state": ""}}, {multi: true} , function(err,numAffected) { 
			if (!err)
				Scrapping.scrappingPlayersStateFromWeb(data.web);
			else
				console.log("Error to UPDATE ALL Players State to Available");
			done();
		});
  		
	});

	// Scrapping Web MARCA for State of Players
	var job = agenda.create('analyzeStatePlayers', {web: "MARCA"});
	job.repeatEvery(Config.get('timeStatePlayers')).save();

	agenda.start();
  	console.log("Job State Players run!");

}

exports.scheduleTotalScorePlayers = function (){

	if (Config.get('mockMode') === 1){
		console.log("Mock Mode ENABLE: Update Total Score Players Disable");
		return;
	}

	var agenda = new Agenda();
	agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
	agenda._db._emitter._maxListeners = 0;

	agenda.define('analyzeScorePlayers', function(job, done) {
		var data = job.attrs.data;
		Scrapping.scrappingTotalScorePlayersFromWeb(data.web, data.year);
	});

	// Scrapping Web Netliga for Total Score of Players in Netliga
	var job = agenda.create('analyzeScorePlayers', {web: "NETLIGA", year: 2016});
	job.repeatEvery(Config.get('timeScorePlayers')).save();

	// Scrapping Web MARCA for Total Score of Players in LIGA FANTASTICA, and Each Player Last Match
	var job2 = agenda.create('analyzeScorePlayers', {web: "MARCA", year: 2016});
	job2.repeatEvery(Config.get('timeScorePlayers')).save();

	agenda.start();
  	console.log("Job Total Score Players run!");

}

exports.scheduleScoreByPlayer = function (){

	if (Config.get('mockMode') === 1){
		console.log("Mock Mode ENABLE: Update Score By Player Disable");
		return;
	}

	var agenda = new Agenda();
	agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
	agenda._db._emitter._maxListeners = 0;

	agenda.define('analyzeScoreByPlayer', function(job, done) {
		var data = job.attrs.data;
		Scrapping.scrappingScoreByPlayerFromWeb(data.web, data.year);
	});

	// Scrapping Web Netliga for Score of Each Player in Netliga
	var job = agenda.create('analyzeScoreByPlayer', {web: "NETLIGA", year: 2016});
	job.repeatEvery(Config.get('timeScorePlayers')).save();

	agenda.start();
  	console.log("Job Score By Players run!");

}

