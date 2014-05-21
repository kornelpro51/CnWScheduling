
exports.index = function(req, res) {
	if (!req.user) {
		res.render('index', { title: 'Scheduler - Login' });
	} else {
		res.render('dashboard', { title: 'Scheduler - Dashboard' });
	}
}

exports.signup = function(req, res) {
	res.render('auth/signup', { title: 'Scheduler - Dashboard' });
}

exports.scheduler = function(req, res) {
	if (!req.user) {
		res.redirect('/');
	} else {
		res.render('scheduler', { title: 'Scheduler - workdspace' });
	}
}