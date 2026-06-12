const mongoose = require('mongoose');
const config = require('./config');

/** @param {any} dbUrl */
/** @type {any} */
var connected = false;                             // no-unused-vars

async function connectDatabase(dbUrl) {            // no-unused-vars (dbUrl)
  await mongoose.connect(config.databaseUrl);
  console.log('Connected to MongoDB');
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

module.exports = { connectDatabase, disconnectDatabase };
