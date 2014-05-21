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
  , favicon         = require('serve-favicon');
module.exports = function( config, app, passport ) {
    // all environments
    app.set('port', config.port || process.env.PORT || 3000)
    app.set('showStackError', true)
    
    app.set('views', config.root + '/app/views')


    app.engine('html', consolidate['swig']);

    app.set('view engine', 'html')
    
    //Should be placed before express.static
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    app.use(morgan('dev'))
    app.use(methodOverride())

    app.all('*', function(req, res,next){
        //if(!req.get('Origin')) return next();
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        next();
    });

    app.use(app.customRouter);

    app.use(favicon(config.root + '/public/favicon.ico'));
    app.use(express.static(path.join(config.root, 'public')))

    //morgan({ format: 'dev', immediate: true })

    //Enable jsonp
    app.enable("jsonp callback");

    // development only
    if ('development' === app.get('env')) {
        app.use(errorHandler())
    }

    //cookieParser should be above session
    //app.use(express.cookieParser());

    //bodyParser should be above methodOverride
    app.use(bodyParser({
        uploadDir: config.root + '/uploads',
        keepExtensions: true
    }));
    //app.use(express.limit('5mb'));
    
    //app.use(express.methodOverride());

    //express/mongo session storage
    //app.use(express.session({secret: 'mybeeble-3hXa6JpcA -?exc]_64_4.Y%*:Zj@_$;lY/jLOy?'/*, cookie: { expires: new Date(Date.now() + 60 * 10000), maxAge: 60 * 10000}*/}));

    //connect flash for flash messages
    //app.use(flash());

    //dynamic helpers
    app.use(helpers(config.app.name));

    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

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
        console.log(res.status(404));
        return next();
        //res.status(404).render('404', {
        //    url: req.originalUrl,
        //    error: 'Not found'
        //});
    });

    // replaces all html files with jade templates, because jade is cool
    app.get('/js/modules/*.html', function (req, res) {
        var path = __dirname + '/..' + clientLocation + req.url.replace('.html', '.jade');
        jade.renderFile(
            path,
            function (err, html) {
                res.send(html);
            }
        );
    });/**/
}