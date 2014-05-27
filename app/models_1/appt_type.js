var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('ApptType', {
			appt_type_id: {type: Sequelize.INTEGER.UNSIGNED, primaryKey: true},
			title: Sequelize.STRING(255),
			description: Sequelize.STRING,
			duration: Sequelize.INTEGER.UNSIGNED
		},
		{
			tableName: 'appt_type',
			timestamps: false
		}
	);
}
