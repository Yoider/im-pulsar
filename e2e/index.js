const auth = require('./auth');
const dashboard = require('./dashboard');
const audit = require('./audit');
const modal = require('./modal');

module.exports = [
  ...auth,
  ...dashboard,
  ...audit,
  ...modal
];
