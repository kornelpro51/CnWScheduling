var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('ApptGroupMembers', {
			appt_group_id: {type: Sequelize.INTEGER.UNSIGNED},
			user_id: Sequelize.INTEGER.UNSIGNED
		},
		{
			tableName: 'appt_group_members',
			timestamps: false
		}
	);
}
