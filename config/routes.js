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
	
	
	var users = require('../app/controllers/users')(db, passport);
	var scheduler = require('../app/controllers/scheduler')(db);

	app.post('/login', users.session);
	app.post('/signup', users.signup);
}