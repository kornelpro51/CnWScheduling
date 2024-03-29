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
            console.log(" *** apptGroupList *** ",req.query);
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

        createAppointmentGroup: function (req, res) {
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
        createAppointment: function (req, res) {
            var body = req.body;
            var apptGroupId = req.params.apptsId;
            
            var newAppointment = {
                appt_group_id: apptGroupId,
                user_id: body.user_id,
                title: body.title,
                description: body.description,
                notes: body.notes,
                created_at: new Date(),
                starts_at: body.starts_at,
                ends_at: body.ends_at
            };
            db.Appt.create(newAppointment).success(function(appt){
                Response.success(res, appt);
            }).error(function(err) {
                Response.error(res, err, "Did not create an appointments.")
            });
        },
        createNewUsers: function (req, res) {
            var body = req.body;
            var newMembers = [];
            console.log(' -- createNewUsers -- ', body);
            for (var i = 0; i < body.length; i++) {
                if (body[i].user_id == null || typeof body[i].user_id == 'undefined') {
                    newMembers.push({
                        email: body[i].email,
                        family_name: body[i].family_name,
                        given_name: body[i].given_name,
                        created_at: new Date(),
                        type: req.user.user_id
                    });
                } else {
                    
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
                            Response.error(res, err, "Did not create users for an appointment group.");
                        });
                    }).error(function(err) {
                        Response.error(res, err, "Did not create users for an appointment group.");
                    });
                }).error(function (err) {
                    Response.error(res, err, "Did not create users for an appointment group.");
                });
            } else {
                Response.success(res, []);
            }
        },
        getAppointmentGroup: function (req, res) {
        	db.ApptGroup.find({ include: [
                    { model: db.ApptGroupMembers, as: 'attendees' }, 
                    { model: db.Appt, as: 'appointmentEvents' }
                ], where: {appt_group_id : req.params.apptsId} }).success(function(group) {
                Response.success(res, group);
            }).error(function(err) {
                Response.error(res, err, "Can not get appointment groups.");
            });
        },
        getAppointment: function (req, res) {
            Response.success(res, res.appointment);
        },
        modifyAppointment: function (req, res) {
            var body = req.body;
            req.appointment.title = body.title;
            req.appointment.description = body.description;
            req.appointment.notes = body.notes;
            req.appointment.starts_at = body.starts_at;
            req.appointment.ends_at = body.ends_at;

            req.appointment.save().success(function(appt) {
                Response.success(res, appt);
            }).error(function (err) {
                Response.error(res, err, "Did not update this appointment.");
            });
        },
        deleteAppointmentGroup: function(req, res) {
            var apptGroupId = req.params.apptsId;
            db.Appt.destroy({appt_group_id : apptGroupId}).success(function(members){
                db.ApptGroupMembers.destroy({appt_group_id : apptGroupId}).success(function(appts) {
                    req.apptGroup.destroy().success(function() {
                        Response.success(res, 'delete success');
                    }).error(function(err) {
                        Response.error(res, err, "Did not delete this appointment group.");
                    });
                }).error(function(err) {
                    Response.error(res, err, "Did not delete this appointment group.");
                });
            }).error(function(err) {
                Response.error(res, err, "Did not delete this appointment group.");
            });
        },
        deleteAppointment: function(req, res) {
            req.appointment.destroy().success(function() {
                Response.success(res, 'The appointment is destroyed successfully.');
            }).error(function(err) {
                Response.error(res, err, 'The appointment is not destroyed. please refer server side log.')
            });
        },
        modifyApptGroupUsers: function(req, res) {
            var body = req.body;
            var apptGroupId = req.params.apptsId;
            var newMembers = [];
            for (var i = 0; i < body.length; i++) {
                if (body[i].user_id != null && typeof body[i].user_id != 'undefined') {
                    newMembers.push({
                        appt_group_id: apptGroupId,
                        user_id: body[i].user_id
                    });
                }
            }
            db.ApptGroupMembers.destroy({appt_group_id: apptGroupId}).success(function(result) {
                db.ApptGroupMembers.bulkCreate(newMembers).success(function(members){
                    Response.success(res, 'Appointment Group members updated successfully.');
                }).error(function(err) {
                    Response.error(res, err, "Did not create an appointment members.")
                });
            }).error(function(err) {
                 Response.error(res, err, "Did not create an appointment members.")
            })
        },
        
        //---------------------------------------------------------------

        apptsId: function (req, res, next, id) {
        	db.ApptGroup.find({where:{appt_group_id : req.params.apptsId}}).success(function ( apptGroup ) {
        		req.apptGroup = apptGroup;
        		next();
        	}).error( function (err) {
        		next(err);
        	})
        },
        apptId: function (req, res, next, id) {
            db.Appt.find({where:{appt_id : req.params.apptId}}).success(function ( appt ) {
                req.appointment = appt;
                next();
            }).error( function (err) {
                next(err);
            })
        }
	};
}