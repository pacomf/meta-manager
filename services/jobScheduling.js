
var Agenda = require('agenda');
var RssController = require('./rss/rss.js');
var Config = require('../configuration.js');
var dbMedia = require('../models/media.model');
var TwitterController = require('./social_networks/twitter.js');

exports.scheduleRss = function (){

	var agenda = new Agenda();
	agenda.database('localhost:27017/'+Config.get('dbNameJobs'), Config.get('dbNameJobs'));
	agenda._db._emitter._maxListeners = 0;

	// TODO, QUITAR
	agenda.purge(function(err, numRemoved) {});

	if (Config.mockMode === 1){
		console.log("Mock Mode ENABLE: Jobs Disable");
		return;
	}

	agenda.define('analyzeRss', function(job, done) {
  		var data = job.attrs.data;
  		RssController.readAndProcessRss(data.idRss, data.urlRss, done);
	});

	var job;

	dbMedia.find({type: 'RSS'}, function (err, rssSources){
		for (var i = rssSources.length - 1; i >= 0; i--) {
			job = agenda.create('analyzeRss', {idRss: rssSources[i]._id, urlRss:rssSources[i].url});
			job.repeatEvery(Config.get('timeRss')+' minutes').save();
		};
		agenda.start();
  		console.log("Jobs RSS run!");
	});

}

exports.scheduleTwitter = function (){
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
				dbMedia.findOne({url: idUser, type: 'Twitter'}, function (err, mMedia){
					if ((mMedia === null) || (mMedia === undefined)){
						console.log("Error in Find Media Twitter for idUser: "+idUser);
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

