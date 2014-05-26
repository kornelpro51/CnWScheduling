var Response        = require('../utils/response');

module.exports = function(db) {
	return {
		userList : function (req, res) {
        	db.Users.findAll({attributes: ['user_id', 'given_name', 'family_name', 'email']}).success(function(users) {
				Response.success(res, users);
			}).error(function(err) {
				Response.error(res, err, "Can not get users list.");
			})
        },
        apptTypeList : function (req, res) {
        	db.ApptType.findAll().success(function(users) {
				Response.success(res, users);
			}).error(function(err) {
				Response.error(res, err, "Can not get appointment type list.");
			})
        },
        apptGroupList : function (req, res) {
        	db.ApptGroup.findAll().success(function(groups) {
				Response.success(res, groups);
			}).error(function(err) {
				Response.error(res, err, "Can not get appointment groups.");
			});
        },

        //-------------------------------------------------------------

        createAppointment: function (req, res) {
        	db.ApptGroup.create({created_at: new Date(), created_by: req.user.user_id}).success(function (apptGroup) {
        		Response.success(res, apptGroup)
        	}).error(function (err) {
        		Response.error(res, err, "Did not create an appointment group.")
        	});
        },
        modifyAppointment: function (req, res) {
        	req.ApptGroup.save().success(function() {
        		Response.success();
        	}).error(function (err) {
        		Response.error(res, err, "Did not update this appointment.");
        	});
        },
        getAppointment: function (req, res) {
        	db.ApptGroup.create({created_at: new Date(), created_by: req.user.user_id}).success(function (apptGroup) {
        		Response.success(res, apptGroup);
        	}).error(function (err) {
        		Response.error(res, err, "Did not create an appointment group.")
        	});
        },

        //---------------------------------------------------------------

        apptId: function (req, res, next, id) {
        	db.ApptGroup.find().success(function ( apptGroup ) {
        		req.apptGroup = apptGroup;
        		next();
        	}).error( function (err) {
        		next(err);
        	})
        }
	};
}