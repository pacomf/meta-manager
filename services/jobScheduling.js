
var Agenda = require('agenda');
var RssController = require('./rss/rss.js');
var Config = require('../configuration.js');
var dbMedia = require('../models/media.model');
var async = require('async');

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
  		console.log("Jobs creados!");
	});

}

exports.addSources = function (){
	var aSources = [];

	aSources.push({name: 'marca', url: 'http://marca.feedsportal.com/rss/futbol_1adivision.xml', type: 'RSS'});
	aSources.push({name: 'as', url: 'http://futbol.as.com/rss/futbol/primera.xml', type: 'RSS'});
	async.eachSeries(aSources, function(source, callback){
		dbMedia.findOne({url: source.url}, function (err, mSource){
			if ((mSource === null) || (mSource === undefined)){
				var newMedia = new dbMedia();
				newMedia.name = source.name;
				newMedia.url = source.url;
				newMedia.type = source.type;
				newMedia.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			} else {
				mSource.name = source.name;
				mSource.type = source.type;
				mSource.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			}
		});
	}, function (err){
		if (!err)
			console.log('Rss Added');
		else
			console.log("Error in Rss Addition");
	});
	
}