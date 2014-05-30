var db = require('./db.js');
var session = require('express').session;
var util = require(process.binding('natives').util ? 'util' : 'sys');

var MysqlStore = function() {
  session.Store.call(this, {});
  console.log("creating session store")
};

util.inherits(MysqlStore, session.Store);

MysqlStore.prototype.reap = function(ms) {
};

MysqlStore.prototype.set = function(sid, sess, fn) {
  console.log("session.set called for sid:" + sid);
  db.query(
    'REPLACE INTO session (sid,data) VALUES (?,?)',
    [sid, JSON.stringify(sess)],
    function(err, info) {
      if(err) {
        fn && fn(err);
      } else {
        fn && fn(null, sess);
      }
    });
};

MysqlStore.prototype.get = function(sid, fn) {
  console.log("session.get called for sid:" + sid);
  db.query(
    'SELECT data FROM session WHERE sid = ?',
    [sid],
    function(err, results) {
      if(err) {
        fn && fn(err);
        return;
      }
      if(results.length == 0) {
        fn && fn(null, null);
        return;
      }
      var row = results[0];
      var sess = JSON.parse(row.data);
      fn && fn(null, sess);
    });
};

MysqlStore.prototype.destroy = function(sid, fn) {
  console.log("session.destroy called for sid:" + sid);
  db.query(
    'DELETE FROM session WHERE sid = ?',
    [sid],
    function(err, info) {
      if(err) {
        fn && fn(err);
      } else {
        fn && fn();
      }
    });
};

module.exports = MysqlStore;
