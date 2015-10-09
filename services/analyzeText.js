var dbPlayer = require('../models/player.model');
var dbNews = require('../models/news.model');
var dbMedia = require('../models/media.model');
var async = require('async');

exports.analyzeText = function(idMedia, dataFilter, link, title, date, type, done){

  var cleanText = dataFilter;
  if (type === 'RSS')
    cleanText = dataFilter.replace(/<\/?[^>]+(>|$)/g, "");

  dbPlayer.find({}, function (err, players){

      async.eachSeries(players, function(player, callback){
         var keys = player.keySearch;
         var find = 0;
         for (var i = keys.length - 1; i >= 0; i--) {
            var subKeys = keys[i].split("&&"); // Para las claves complejas (key1&&key2).
            for (var j = subKeys.length - 1; j >= 0; j--) {
              var reSearch = new RegExp(subKeys[j], "i");
              if (cleanText.search(reSearch) === -1){
                break;
              } else {
                if (j === 0){
                  find = 1;
                }
              }
            }
            if (find === 1){
              break;
            }
         }
         if (find === 1){
            dbMedia.findById(idMedia, function (err, media){
                if ((media === null) || (media === undefined)){
                  console.log("Error in "+type+" Analyze, Media Exist: "+idMedia);
                  callback();
                } else {
                  // TODO: Se comprueba aqui si ya existe... pero antes NO, e igual en los RT seria aconsejable hacerlo mucho antes para evitar todos los procesos anteriores a llegar aqui
                  dbNews.findOne({url: link, player: player}, function (err, mNews){
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