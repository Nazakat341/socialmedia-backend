/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

const User = require('../api/user/user.model');
/*  Create Admin  */
User.findOne({ role: 'admin' }).exec(async (error, adminFound) => {
  if (!adminFound) {
    let adminObj = new User({
      name: 'Admin',
      role: 'admin',
      emailVerified: true,
      password: 'Alpha1234.',
      username: "admin1234",
      email: 'nifty@yopmail.com'
    });
    adminObj.save((err, saved) => {
      if (saved) console.log('Admin Created');
    });
  }
})
