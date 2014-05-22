var Response        = require('../utils/response')
  , lodash          = require('lodash')

module.exports = function(db, passport) {
	 var usersController = {
		session : function(req, res, next) {
            passport.authenticate('local', function(err, user, info){
                if (err) { return next(err); }
                if (!user) {
                	if(req.xhr) {
                    	return Response.error(res, null, info);
                	} else {
                    	return res.render('auth/login', { title: 'Scheduler - login',  error: info.message});
                	}
                }
                req.logIn(user, function(err) {
                    if (err) { return next(err);}
                    if(req.xhr) {
                    	return Response.success(res, user);
                	} else {
                    	var nextURL = '/home';
                    	if (req.params.next) {
                    		nextURL = req.params.next;
                    	}
                    	return res.redirect(nextURL);
                	}
                });
            })(req, res, next);
        },
        signup : function (req, res, next) {
        	var param = req.body;
        	if ( param.password != param.confirm_password) {
        		return res.render('auth/signup', lodash.extend({ title: 'Scheduler - signup',  error: 'These passwords don\'t match. Please input again? '},param));
        	}
        	db.Users.create({ created_at: new Date(), given_name: param.given_name, family_name: param.family_name, email: param.email }).success(function(user) {
				
				user.createPassword(db, param.password, function(isCreated) {
					if (isCreated) {
						usersController.session(req, res, next);
					} else {
						user.destroy().success(function(){
							return res.render('auth/signup', lodash.extend({ title: 'Scheduler - signup', error: 'Can not create password.'},param));
						}).error(function(err){
							return res.render('auth/signup', lodash.extend({ title: 'Scheduler - signup', error: err},param));
						});
					}
				});

			}).error(function(err) {
				return res.render('auth/signup', lodash.extend({ title: 'Scheduler - signup',  error: err},param));
			})
        }
	}
	return usersController;
}