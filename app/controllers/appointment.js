var Response        = require('../utils/response');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '192.168.0.219',
  user     : 'root',
  password : 'root',
  database : 'scheduler'
});

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

                db.Users.findAll({attributes: ['user_id', 'given_name', 'family_name', 'email']}).success(function(users) {

                    Response.success(res, {groups: groups, users: users});
                    
                }).error(function(err) {
                    Response.error(res, err, "Can not get users list.");
                });
			}).error(function(err) {
				Response.error(res, err, "Can not get appointment groups.");
			});
        },

        //-------------------------------------------------------------

        createAppointment: function (req, res) {
        	var body = req.body;
        	db.ApptGroup.create({created_at: new Date(), created_by: req.user.user_id}).success(function (apptGroup) {
        		var newMembers = [];
        		for (var i = 0; i < body.attendees.length; i++) {
                    if (body.attendees[i].is_new) {
                        
                    } else {
                        newMembers.push({
                            appt_group_id: apptGroup.get('appt_group_id'),
                            user_id: body.attendees[i].user_id
                        });
                    }
        		}
        		db.ApptGroupMembers.bulkCreate(newMembers).success(function(members){
        			var newAppointments = [];
	        		for (var i = 0; i < body.appointmentEvents.length; i++) {
	        			newAppointments.push({
	        				appt_group_id: apptGroup.get('appt_group_id'),
	        				user_id: body.appointmentEvents[i].user_id,
	        				title: body.appointmentEvents[i].title,
	        				description: body.appointmentEvents[i].description,
	        				notes: body.appointmentEvents[i].notes,
	        				created_at: new Date(),
	        				starts_at: body.appointmentEvents[i].starts_at,
	        				ends_at: body.appointmentEvents[i].ends_at
	        			});
	        		}
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
        createNewUsers: function (req, res) {
            
            var body = req.body;
            var newMembers = [];
            console.log(' -- createNewUsers -- ', body);
            for (var i = 0; i < body.length; i++) {
                if (typeof body[i].id == 'object') {
                    
                } else {
                    newMembers.push({
                        email: body[i].email,
                        family_name: body[i].lastName,
                        given_name: body[i].firstName,
                        created_at: new Date(),
                        type: req.user.user_id
                    });
                }
            }
            console.log(' -- createNewUsers -- ', newMembers);
            if ( newMembers.length > 0) {
                db.Users.bulkCreate(newMembers).success(function (users) {
                    db.Users.findAll({where: {type: req.user.user_id}}).success(function (users) {
                        db.Users.update({type: 0}, {type: req.user.user_id}).success(function(result) {
                            console.log(" -- createNewUsers -- ", users);
                            Response.success(res, users);
                        }).error(function(err) {
                            Response.error(res, err, "Did not create an appointment group.");
                        });
                    }).error(function(err) {
                        Response.error(res, err, "Did not create an appointment group.");
                    });
                }).error(function (err) {
                    Response.error(res, err, "Did not create an appointment group.");
                });
            } else {
                Response.success(res, []);
            }
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