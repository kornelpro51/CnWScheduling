var Sequelize = require("sequelize");

module.exports = function(sequelize, Sequelize) {
	return sequelize.define('ApptGroup', {
			appt_group_id: {type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true},
			created_at: Sequelize.DATE,
			created_by: Sequelize.INTEGER.UNSIGNED
		},
		{
			tableName: 'appt_group',
			timestamps: false
		}
	);
}
