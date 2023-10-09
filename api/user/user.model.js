'use strict';

let crypto = require('crypto');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  dob: Date,
  firstName: String,
  lastName: String,
  name: {type: String, minlength : 8 , maxlength : 25},
  username: { type: String  },
  profilePicture: String,
  description: String,
  cover: String,
  gender: String,
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  publicAddress: { type: String, lowercase: true },
  isOnline: {type: Boolean, default: false},
  nonce: { type: Number },
  city: String,
  country: String,
  phone: { type: String },
  code: { type: Number, default: () => Math.floor(1000 + Math.random() * 9000) },
  salt: String,
  hashedPassword: String,
  email: { type: String, lowercase: true },
  role: { type: String, default: 'user' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});


/**
 * Virtuals
*/
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

/**
 * Pre-save hook
**/
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) return next();

    // if (!validatePresenceOf(this.hashedPassword))
    //   next(new Error('Invalid password'));
    // else 
    next();
  });

/**
* Methods
**/
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}  
   * @api public
  **/
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
  **/
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    let salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 100000, 128, 'sha512').toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);