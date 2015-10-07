var dbMedia = require('../models/media.model');
var dbLeague = require('../models/league.model');
var async = require('async');

exports.addSources = function (){
	var aSources = [];

	aSources.push({name: 'marca', url: 'http://marca.feedsportal.com/rss/futbol_1adivision.xml', type: 'RSS'});
	aSources.push({name: 'as', url: 'http://futbol.as.com/rss/futbol/primera.xml', type: 'RSS'});
	aSources.push({name: 'Pakote', url: '526390388', type: 'Twitter'});

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
			console.log('Sources Added');
		else
			console.log("Error in Sources Addition");
	});
	
}

// IMPORT MANUAL. BE CAREFUL!

exports.addCompetitions = function (){
	var aCompetitions = [];

	aCompetitions.push({name: 'Liga BBVA', country: 'Spain', division: '1'});

	async.eachSeries(aCompetitions, function(competition, callback){
		dbLeague.findOne({division: competition.division, country: competition.country}, function (err, mCompetition){
			if ((mCompetition === null) || (mCompetition === undefined)){
				var newLeague = new dbLeague();
				newLeague.name = competition.name;
				newLeague.country = competition.country;
				newLeague.division = competition.division;
				newLeague.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			} else {
				mCompetition.name = source.name;
				mCompetition.save(
					function(err, product, numberAffected){
					 	callback();
					}
				); 
			}
		});
	}, function (err){
		if (!err)
			console.log('Leagues Added');
		else
			console.log("Error in Leagues Addition");
	});
}