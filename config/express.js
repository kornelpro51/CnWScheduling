var express = require('express')
//  , errorHandler    = require('errorhandler')
//  , methodOverride  = require('method-override')
// , morgan          = require('morgan')
  , http = require('http')
  , path = require('path')
// , getRawBody      = require('raw-body')
  , flash = require('connect-flash')
  , helpers = require('view-helpers')
  , consolidate = require('consolidate')
//  , favicon         = require('serve-favicon')
//  , cookieParser    = require('cookie-parser')
//  , session         = require('express-session')
  , middleware = require('./middlewares/authorization')
  , MySQLStore = require('./session/express-session-mysql')(express)

module.exports = function(config, app, passport) {

  app.set('port', config.port || 3000);
  app.set('showStackError', true);

  //Should be placed before express.static
  app.use(express.compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  //Setting the fav icon and static folder
  app.use(express.favicon(config.root + '/public/favicon.ico'));

  app.use(express.static(path.join(config.root, 'public')))

  //Don't use logger for test env
  app.use(express.logger('dev'));

  //Set views path, template engine and default layout
  app.set('views', config.root + '/app/views')
  app.engine('html', consolidate['swig']);
  app.set('view engine', 'html')

  //Enable jsonp
  app.enable("jsonp callback");

  app.configure(function() {

    //cookieParser should be above session
    app.use(express.cookieParser());

    //bodyParser should be above methodOverride
    app.use(express.bodyParser());
    //app.use(express.bodyParser({
    //    uploadDir: config.root + '/uploads',
    //    keepExtensions: true
    //}));
    app.use(express.limit('5mb'));
    //app.use(express.multipart());

    app.use(express.methodOverride());

    //express/mongo session storage
    app.use(express.session({
      secret: 'mybeeble-3hXa6JpcA -?exc]_64_4.Y%*:Zj@_$;lY/jLOy?',
      store: new MySQLStore(config.db.database, config.db.user, config.db.password, {
        dialect: "mysql",
        host: config.db.host,
        port: config.db.port,
        defaultExpiration: 1000*60*60*24*365 // 1 year
      })
    }));

    //connect flash for flash messages
    app.use(flash());

    //dynamic helpers
    app.use(helpers(config.app.name));

    //app.use(oauth.handler());
    //app.use(oauth.errorHandler());

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(oauth.doAuth);

    app.use(middleware.user.authVariable);

    //routes should be at the last
    app.use(app.router);

    //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
      //Treat as 404
      if(~err.message.indexOf('not found')) return next();

      //Log it
      console.error(err.stack);

      //Error page
      res.status(500).render('500', {
        error: err.stack
      });
    });

    //Assume 404 since no middleware responded
    app.use(function(req, res, next) {
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });

    app.all('*', function(req, res, next) {
      //if(!req.get('Origin')) return next();
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
      next();
    });
  });
}