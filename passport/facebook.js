var FacebookStrategy = require('passport-facebook').Strategy;
var dbUser = require('../models/user.model');
var Config  = require('../configuration.js');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : Config.get('facebook_app_id'),
        clientSecret    : Config.get('facebook_app_secret'),
        callbackURL     : "http://"+Config.get('address')+":"+Config.get('port')+"/login/facebook/callback"
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

    	//console.log('profile', profile);

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        dbUser.findOne({socialNetworks: { $elemMatch: { name: "Facebook", id: profile.id}}}, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser = new dbUser();

					// set all of the facebook information in our user model
					var fbData = {}
					fbData.name = "Facebook";
					fbData.id = profile.id;
	                newUser.name = profile.displayName;   
	                newUser.socialNetworks.push(fbData);   

					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

	        });
        });

    }));

};