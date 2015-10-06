var dbPlayer = require('../models/player.model');
var dbNews = require('../models/news.model');
var dbMedia = require('../models/media.model');
var async = require('async');

exports.analyzeText = function(idMedia, dataFilter, link, title, date, type, done){

  var cleanText = dataFilter;
  if (type === 'RSS')
    cleanText = dataFilter.replace(/<\/?[^>]+(>|$)/g, "");

  dbPlayer.find({}, function (err, players){
      console
      async.eachSeries(players, function(player, callback){
         var keys = player.keySearch;
         var find = 0;
         for (var i = keys.length - 1; i >= 0; i--) {
            var reSearch = new RegExp(keys[i], "i");
            if (cleanText.search(reSearch) !== -1){
              find = 1;
              break;
            }
         };
         if (find === 1){
            dbMedia.findById(idMedia, function (err, media){
                if ((media === null) || (media === undefined)){
                  console.log("Error in "+type+" Analyze, Media Exist: "+idMedia);
                  callback();
                } else {
                  dbNews.findOne({url: link}, function (err, mNews){
                    if ((mNews === null) || (mNews === undefined)){
                      var newNews = dbNews();
                      newNews.player = player;
                      newNews.media = media;
                      newNews.title = title;
                      newNews.url = link;
                      newNews.created_at = date;
                      newNews.save(
                        function(err, product, numberAffected){
                          callback();
                        }
                      );
                    } else {
                      callback();
                    }
                  });
                }
            });
         } else {
            callback();
         }
      }, function(err){
        if (err)
          console.log("Error in Text Analyze: "+type);
        done();
      });
      
  });
}