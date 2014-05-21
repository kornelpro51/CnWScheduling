var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('Users', {
		user_id: Sequelize.INTEGER.UNSIGNED,
		created_at: Sequelize.DATE,
		given_name: Sequelize.STRING,
		family_name: Sequelize.STRING,
		email: Sequelize.STRING,
		type: Sequelize.INTEGER(5)
	},
	{ tableName: 'Users' }
	);
}
