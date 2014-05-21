var Response        = require('../utils/response');

module.exports = function(db, passport) {
	return {
		session : function(req, res, next) {
            passport.authenticate('local', function(err, user, info){
                if (err) { return next(err); }
                if (!user) {
                    //return res.redirect('/login');
                    return Response.error(res, null, info);
                }
                req.logIn(user, function(err) {
                    if (err) { return next(err);}
                    //return res.redirect('/users/'+user.username)
                    return Response.success(res, user);
                });
            })(req, res, next);
        }
	};
}