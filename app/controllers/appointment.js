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
        	db.ApptGroup.findAll({ include: [
	        		{ model: db.ApptGroupMembers, as: 'attendees' }, 
	        		{ model: db.Appt, as: 'appointmentEvents' }
        		] }).success(function(groups) {

				Response.success(res, groups);

			}).error(function(err) {
				Response.error(res, err, "Can not get appointment groups.");
			});
        },

        //-------------------------------------------------------------

        createAppointment: function (req, res) {
        	var body = req.body;
        	db.ApptGroup.create({created_at: new Date(), created_by: req.user.user_id}).success(function (apptGroup) {
        		console.log(apptGroup);
        		var newMembers = [];
        		for (var i = 0; i < body.attendees.length; i++) {
        			newMembers.push({
        				appt_group_id: apptGroup.get('appt_group_id'),
        				user_id: body.attendees[i].user_id
        			});
        		}
        		console.log(" -- createAppointmentMembers -- ", newMembers);
        		db.ApptGroupMembers.bulkCreate(newMembers).success(function(members){
        			var newAppointments = [];
	        		for (var i = 0; i < body.appointmentEvents.length; i++) {
	        			newAppointments.push({
	        				appt_group_id: apptGroup.get('appt_group_id'),
	        				user_id: body.appointmentEvents[i].user_id,
	        				title: body.appointmentEvents[i].title,
	        				description: body.appointmentEvents[i].content,
	        				notes: '',
	        				created_at: new Date(),
	        				starts_at: body.appointmentEvents[i].starts_at,
	        				ends_at: body.appointmentEvents[i].ends_at
	        			});
	        		}
	        		console.log(" -- createAppointmentEvents -- ", newAppointments);
        			db.Appt.bulkCreate(newAppointments).success(function(appts){
        				Response.success(res, apptGroup);
        			}).error(function(err) {
        				Response.error(res, err, "Did not create an appointments.")
        			})
        		}).error(function(err) {
    				Response.error(res, err, "Did not create an appointment members.")
    			})
        	}).error(function (err) {
        		Response.error(res, err, "Did not create an appointment group.")
        	});
			console.log(" -- createAppointment -- ", req.body);
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