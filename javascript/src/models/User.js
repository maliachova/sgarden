const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, default: 'user' },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true , toJSON: { virtuals: true }});

// CODE QUALITY ISSUE: duplicate model
const userSchemaV2 = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, default: 'user' },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true ,  toJSON: { virtuals: true } });

const User = mongoose.model('User', userSchema);
const UserV2 = mongoose.model('UserV2', userSchemaV2);
const UserV3 = mongoose.model('UserV3', userSchemaV2);   // no-unused-vars

module.exports = { User, UserV2 };
