var express         = require('express')
  , passport        = require('passport')
  , http            = require('http')

var app = express()

var config          = require('./config/config')
  , configExpress   = require('./config/express')
  , configRoutes    = require('./config/routes')
  , configPassport  = require('./config/passport')

var db              = require('./app/models')(config)

  configPassport( passport, db )

  configExpress( config, app, passport)

  configRoutes(app, passport, db );    


  db
    .sequelize
    .sync()
    .complete(function(err) {
      if (err) {
        throw err
        console.log();
      } else {
        http.createServer(app).listen(app.get('port'), function() {
          console.log('Express server listening on port ' + app.get('port'))
        })
      }
    })
