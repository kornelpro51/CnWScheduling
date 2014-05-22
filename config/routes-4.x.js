var auth = require('./middlewares/authorization');
var express = require('express');

module.exports = function (passport, db) {
	"use strict";
	var router = express.Router(/*{caseSensitive: true, strict: true}*/);

	var webroute = require('../routes/index');

	router.get('/', webroute.index);
	router.get('/home', webroute.index);
	router.get('/scheduler', webroute.scheduler);
	router.get('/signup', webroute.signup);
	router.get('/login', webroute.login);
	router.get('/contact', webroute.contact);
	
	
	var users = require('../app/controllers/users')(db, passport);
	var scheduler = require('../app/controllers/scheduler')(db);

	router.post('/login', users.session);
	router.post('/signup', users.signup);

	return router;
}