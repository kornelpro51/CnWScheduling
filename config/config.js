var path = require('path'),
	rootPath = path.normalize(__dirname + '/..');

module.exports = {
	app: {
		name         : "Scheduler",
		viewPath     : 'app/views'
	},
	db : {
		host         : '192.168.0.219',
		user         : 'root',
		password     : 'root',
		database     : 'scheduler',
		port         : "3306",
		wait_timeout : 1000
	},
	root : rootPath,
	port : 3000,
}