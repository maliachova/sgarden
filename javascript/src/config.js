const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/** @type {any} */
const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/sgarden',
  serverSecret: process.env.SERVER_SECRET || 'sgarden-secret-key',
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION, 10) || 86400000,
};

// CODE QUALITY ISSUE: unused variables
const appName = 'SGarden API';
const BIG_ID = 9007199254740993;                   // no-loss-of-precision, no-unused-vars

module.exports = config;
