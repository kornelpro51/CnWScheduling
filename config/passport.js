'use strict';

var LocalStrategy = require('passport-local').Strategy,
    config = require('./config');


module.exports = function( passport, db ) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.user_id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
    	db.Users.find(id).success(function() {
    		done(err, user);
    	}).failure(function() {
    		done(err, user);
    	})
    });

    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'userid',
            passwordField: 'password'
        },
        function(userid, password, done) {
            db.Users.find({
                user_id: userid
            }).success(function(user) {
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                return done(null, user);
            }).error(function(error) {
				return done(error);
			})
        })
    );
};
