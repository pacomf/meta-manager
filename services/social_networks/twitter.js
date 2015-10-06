var Twit = require('twit')

exports.T = new Twit({
  consumer_key: 'OyPB6zI44RsENJOPUSkAH3bhv',
  consumer_secret: '4i0PXyxQ9Sz6wH4bTFkIi3m7zP9mOfAZcLkBY1N7m9YL5ODP41',
  access_token: '526390388-fh0Lk29xN5KddYpqbcYgpqYKMHSEiESvCVsbset6',
  access_token_secret: '2C5AiMt1PcDJkrrYMsHQy0S2aCBrINhMJxGUrQjIerler'
});

var analyzeText = require('../analyzeText.js');

exports.readAndProcessTwitter = function (idTwitter, urlTweet, textTweet, dateTweet){
	analyzeText.analyzeText(idTwitter, textTweet, urlTweet, textTweet, dateTweet, 'Twitter', function(){});
}