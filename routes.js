'use strict';
/**
*   Main application routes
**/

module.exports = (app) => {
  app.use('/api/user', require('./api/user'))
};