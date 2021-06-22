'use strict';
var basicAuth = require('express-basic-auth');

const USERS = process.env.USERS || 'admin:admin';

module.exports = {
  basic: basicAuth({
    users: parseCommaSeparatedUserPasses(USERS)
  })
}


/**
 * Takes user1:pass1, user2:pass2, returns {'user1':'pass1', 'user2': 'pass2'}
 */
function parseCommaSeparatedUserPasses(keyValues) {
  const objectify = a => a.reduce( (o,[k,v]) => (o[k]=v,o), {} );
  return objectify(keyValues.split(',').map(entry => entry.split(':')));
}