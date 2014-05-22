var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('AuthPassword', {
			user_id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true},
			created_at: Sequelize.DATE,
			passhash: Sequelize.STRING
		},
		{
			tableName: 'auth_password',
			timestamps: false
		}
	);
}
