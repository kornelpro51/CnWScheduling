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
    	db.Users.find({
                where :{
                    user_id: id
                }
            }).success(function(user) {
    		done(null, user);
    	}).failure(function(err) {
    		done(err, null);
    	})
    });

    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {

            db.Users.find({ 
                where :{
                    email: email
                }
            }).success(function(user) {
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                user.authenticate(db, password, function(isAuth) {
                    if (isAuth) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Invalid password'
                        });
                    }
                })
            }).error(function(error) {
				return done(error);
			})
        })
    );
};
