var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  /*
  , sequelize = new Sequelize('sequelize_test', 'root', null, {
      dialect: "sqlite", // or 'sqlite', 'postgres', 'mariadb'
      storage: "/tmp/my.db",
    })
  */
  



module.exports = function(config) {
  
  var sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
        dialect: "mysql",
        host: config.db.host,
        port: config.db.port
      }),
      db        = {}

  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return ((file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) == '.js'))
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(__dirname, file))
      db[model.name] = model
    })

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].options.hasOwnProperty('associate')) {
      db[modelName].options.associate(db)
    }
  })

  return lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
  }, db)
}


