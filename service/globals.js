const LevelDB = require('./level_db.js');

var GLOBALS = {
  'StarRegistry' : 'starRegistry',
  'ValidationWindow' : 300, // 300 sec = 5 min
  'MaxStoryLength' : 250,
  'UsersDB' : new LevelDB('../db/user_db'),
  'NotaryDB' : new LevelDB('../db/notary-db')
}

module.exports = GLOBALS;
