var auth = require('./middlewares/authorization');
var express = require('express');

module.exports = function (app, passport, db) {
	"use strict";
	
	var webroute = require('../routes/index');

	app.get('/', webroute.index);
	app.get('/home', webroute.index);
	app.get('/scheduler', webroute.scheduler);
	app.get('/signup', webroute.signup);
	app.get('/login', webroute.login);
	app.get('/contact', webroute.contact);

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	
	var users = require('../app/controllers/users')(db, passport);
	var appointment = require('../app/controllers/appointment')(db);

	app.post('/login', users.session);
	app.post('/signup', users.signup);

	app.get('/api/v1/appointment/users', auth.requiresLogin, appointment.userList);
	app.post('/api/v1/appointment/users', auth.requiresLogin, appointment.createNewUsers);
	app.get('/api/v1/appointment/appt_types', auth.requiresLogin, appointment.apptTypeList);
	
	app.get('/api/v1/appointment/appts', auth.requiresLogin, appointment.apptGroupList);
	// Create a appointment Group
	app.post('/api/v1/appointment/appts', auth.requiresLogin, appointment.createAppointmentGroup);
	app.get('/api/v1/appointment/appts/:apptsId', auth.requiresLogin, appointment.getAppointmentGroup);
	app.delete('/api/v1/appointment/appts/:apptsId', auth.requiresLogin, appointment.deleteAppointmentGroup);
	// Modify appointment group's users
	app.put('/api/v1/appointment/appts/:apptsId/users', auth.requiresLogin, appointment.modifyApptGroupUsers);

	// Append Appointment to a group
	app.post('/api/v1/appointment/appts/:apptsId', auth.requiresLogin, appointment.createAppointment);
	app.get('/api/v1/appointment/appts/:apptsId/appt/:apptId', auth.requiresLogin, appointment.getAppointment);
	app.put('/api/v1/appointment/appts/:apptsId/appt/:apptId', auth.requiresLogin, appointment.modifyAppointment);
	app.delete('/api/v1/appointment/appts/:apptsId/appt/:apptId', auth.requiresLogin, appointment.deleteAppointment);
	
	app.param('apptId', appointment.apptId)
	app.param('apptsId', appointment.apptsId)
}