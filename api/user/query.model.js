'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let QuerySchema = new Schema({
    name: { String  },
    emailAddress: { String },
    message: { String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Query', QuerySchema);
