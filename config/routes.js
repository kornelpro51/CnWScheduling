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

	app.get('/api/v1/appointment/users', appointment.userList)
	app.post('/api/v1/appointment/users', appointment.createNewUsers)
	app.get('/api/v1/appointment/appt_types', appointment.apptTypeList)
	app.get('/api/v1/appointment/appts', appointment.apptGroupList)

	app.post('/api/v1/appointment/appts', appointment.createAppointment)
	app.get('/api/v1/appointment/appts/:apptId', appointment.getAppointment)
	app.put('/api/v1/appointment/appts/:apptId', appointment.modifyAppointment)

	app.param('apptId', appointment.apptId)

}