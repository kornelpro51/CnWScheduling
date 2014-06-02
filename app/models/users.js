var Sequelize = require("sequelize");
var crypto = require("crypto");
var sha256 = crypto.createHash("sha256");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('Users', {
			user_id: {type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true},
			created_at: Sequelize.DATE,
			given_name: Sequelize.STRING,
			family_name: Sequelize.STRING,
			email: Sequelize.STRING,
			type: Sequelize.INTEGER(5)
		},
		{
			tableName: 'users',
			timestamps: false,
			instanceMethods: {
				authenticate: function(db, password, cb) {
					db.AuthPassword.find({where: {user_id: this.user_id}}).success(function( pwd ) {
						var hash = crypto.createHash('sha256').update(password).digest('hex');
						//console.log(pwd.passhash);
						//console.log(hash);
						if (pwd == null || pwd.passhash != hash) {
							cb(false);
						} else {
							cb(true);
						}
					}).error(function(err){
						cb(false);
					})
				},
				createPassword: function(db, password, cb) {
					var hash = crypto.createHash('sha256').update(password).digest('hex');
					db.AuthPassword.create({user_id: this.user_id, created_at: new Date(), passhash: hash}).success(function( pwd ) {
						cb(true);
					}).error(function(err){
						cb(false, err);
					})
				}
			}
		}
	);
}
