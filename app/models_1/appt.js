var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('Appt', {
			appt_id: {type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true},
			appt_group_id: Sequelize.INTEGER.UNSIGNED,
			title: Sequelize.STRING(255),
			description: Sequelize.STRING,
			notes: Sequelize.STRING,
			created_at: Sequelize.DATE,
			starts_at: Sequelize.DATE,
			ends_at: Sequelize.DATE
		},
		{
			tableName: 'appt',
			timestamps: false
		}
	);
}
