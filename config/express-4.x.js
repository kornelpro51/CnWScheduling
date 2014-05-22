var morgan           = require('morgan')
  , express          = require('express')
  , compression      = require('compression')
  , bodyParser      = require('body-parser')
  , errorHandler    = require('errorhandler')
  , methodOverride  = require('method-override')
  , morgan          = require('morgan')
  , http            = require('http')
  , path            = require('path')
 // , getRawBody      = require('raw-body')
  , flash           = require('connect-flash')
  , helpers         = require('view-helpers')
  , consolidate     = require('consolidate')
  , favicon         = require('serve-favicon')
  , cookieParser    = require('cookie-parser')
  , session         = require('express-session')
module.exports = function( config, app, passport ) {
    // all environments
    app.set('port', config.port || process.env.PORT || 3000)
    app.set('showStackError', true)
    
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
    
    app.use(favicon(config.root + '/public/favicon.ico'));
    app.use(express.static(path.join(config.root, 'public')))


    //morgan({ format: 'dev', immediate: true })
    app.use(morgan('dev'))

    
    app.set('views', config.root + '/app/views')
    app.engine('html', consolidate['swig']);
    app.set('view engine', 'html')


    //Enable jsonp
    app.enable("jsonp callback");

    //cookieParser should be above session

    app.all('*', function(req, res, next){
        //if(!req.get('Origin')) return next();
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        next();
    });
    app.use(cookieParser());
    app.use(bodyParser());
    app.use(methodOverride());
    app.use(session({ secret: 'CnWScheduling-3hXa6JpcA -?exc]_64_4.Y%*:Zj@_$;lY/jLOy', name: 'sid', cookie: { secure: true }}));

    app.use(helpers(config.app.name));
    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());


    app.use(app.customRouter);

    //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        //Treat as 404
        if (~err.message.indexOf('not found')) return next();

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
}