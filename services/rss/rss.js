var analyzeText = require('../analyzeText.js');

var dbMedia = require('../../models/media.model');

exports.readAndProcessRss = function (idRss, urlRss, done){

  var now = new Date();

  //console.log("["+now+"]. Analizando RSS "+urlRss);

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

  feedparser.on('end', function() {
    done();
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
          thresholdDate.setDate(thresholdDate.getDate() - 2);
          if (date > thresholdDate) {
            dbMedia.findById(idRss, function (err, media){
              if (media){
                if ((!media.lastNew) || (date > media.lastNew)) {
                  var dataFilter = title;
                  if ((description !== undefined) && (description !== null)){
                    dataFilter = dataFilter+"\n"+description;
                  }
                  media.lastNew = new Date();
                  media.save();
                  analyzeText.analyzeText(idRss, dataFilter, link, title, date, 'RSS');
                }
              }
            });
          }
      }
    }
  });

}

