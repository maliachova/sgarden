const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./database');
const seedData = require('./seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const config = require('./config');

// CODE QUALITY ISSUE: unused variables
const APP_NAME = 'SGarden Inventory API';
const DEBUG_MODE = true;
const unusedConfig = { key: 'value', secret: 'not-so-secret' };
const MAX_SAFE = 9007199254740993;                 // no-loss-of-precision, no-unused-vars

/** @type {any} */
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: err.message });
});

async function start() {
  try {
    await connectDatabase();
    await seedData();
    app.listen(config.port, () => {
      console.log(`SGarden API started on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
