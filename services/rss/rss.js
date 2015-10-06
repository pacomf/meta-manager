
var configServices = require('../configuration.js');

var dbPlayer = require('../../models/player.model');
var dbNews = require('../../models/news.model');
var dbMedia = require('../../models/media.model');
var async = require('async');

exports.readAndProcessRss = function (idRss, urlRss, done){

  if (configServices.mockMode === 1){
    console.log("Mock Mode ENABLE: Read RSS Disable for "+urlRss);
    return;
  }

  var now = new Date();

  console.log("["+now+"]. Analizando RSS "+urlRss);

  var FeedParser = require('feedparser')
  , request = require('request');

  var req = request(urlRss);
  var feedparser = new FeedParser();

  req.on('error', function (error) {
    // handle any request errors
  });
  req.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });


  feedparser.on('error', function(error) {
    // always handle errors
  });

  feedparser.on('readable', function() {
    // This is where the action is!

    var stream = this
      , item;

    while (item = stream.read()) {
      if ((item !== null) && (item !== undefined)){
          var description = item.description;
          var link = item.link;
          var date = new Date(item.date);
          var thresholdDate = new Date();
          var title = item.title;
          thresholdDate.setDate(thresholdDate.getDate() - 5);
          if (date > thresholdDate) {
            var dataFilter = title;
            if ((description !== undefined) && (description !== null)){
              dataFilter = dataFilter+"\n"+description;
            }
            parseDataRss(idRss, dataFilter, link, title, date, done);
          } else {
            done();
          }
      } else {
        done();
      }
    }
  });

}

function parseDataRss(idRss, dataFilter, link, title, date, done){

  var cleanText = dataFilter.replace(/<\/?[^>]+(>|$)/g, "");

  dbPlayer.find({}, function (err, players){
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
            dbMedia.findById(idRss, function (err, media){
                if ((media === null) || (media === undefined)){
                  console.log("Error in Rss Analyze, Find Media: "+idRss);
                  callback();
                } else {
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
                }
            });
         }
      }, function(err){
        if (err)
          console.log("Error in Rss Analyze");
        done();
      });
      
  });
}