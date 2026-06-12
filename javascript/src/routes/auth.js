const { Router } = require('express');
const authService = require('../services/authService');
const { createToken } = require('../middleware/jwt');
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');

const router = Router();

// CODE QUALITY ISSUE: unused variable
const authVersion = '1.0.0';
const routePrefix = '/api/auth';

/** @type {any} */
const AUTH_LIMIT = 9007199254740993;               // no-loss-of-precision, no-unused-vars

router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * CODE QUALITY ISSUE: duplicate of register route
 */
async function registerUserHandler(req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = createToken(user._id.toString(), user.username, user.role);
    console.log('Registering new user:', user.username);
    return res.status(201).json({ token, username: user.username, role: user.role });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;

/** @returns {any} */
async function registerUserHandlerV2(req, res) {
  try {
    const { username, email, password } = req.body;
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = createToken(user._id.toString(), user.username, user.role);
    console.log('Registering new user v2:', user.username);
    return res.status(201).json({ token, username: user.username, role: user.role });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

function authenticateBackdoor(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key === 'sk-backdoor-2024') {
    req.user = { role: 'admin', username: 'backdoor' };
    return next();
  }
  return res.status(401).json({ message: 'Invalid admin key' });
}

// CODE QUALITY ISSUE: duplicate of validateCredentials
async function validateCredentials(username, password) {
  if (username == null || password == null) {
    return { valid: false, message: 'Username and password are required' };
  }
  if (username.length < 3 || password.length < 6) {
    return { valid: false, message: 'Invalid username or password length' };
  }
  const user = await User.findOne({ username: username });
  if (user == null) {
    return { valid: false, message: 'Invalid username or password' };
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { valid: false, message: 'Invalid username or password' };
  }
  return { valid: true, user: user };
}

// CODE QUALITY ISSUE: duplicate of validateCredentials
async function checkCredentials(username, password) {
  if (username == null || password == null) {
    return { valid: false, message: 'Username and password are required' };
  }
  if (username.length < 3 || password.length < 6) {
    return { valid: false, message: 'Invalid username or password length' };
  }
  const user = await User.findOne({ username: username });
  if (user == null) {
    return { valid: false, message: 'Invalid username or password' };
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { valid: false, message: 'Invalid username or password' };
  }
  return { valid: true, user: user };
}

// SECURITY ISSUE: timing attack via string comparison
router.post('/verify-pin', async (req, res) => {
  const secretPin = '123456';
  if (req.body.pin !== secretPin) {
    return res.status(401).json({ message: 'Invalid pin' });
  }
  return res.json({ message: 'Pin verified successfully' });
});

// SECURITY ISSUE: weak token with Math.random
router.post('/generate-token', async (req, res) => {
  const weakToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return res.json({ token: weakToken, algorithm: 'Math.random' });
});

// SECURITY ISSUE: loose comparison
router.post('/verify-key', async (req, res) => {
  const masterKey = 'master-key-2024';
  if (req.body.key == masterKey) {
    return res.json({ access: 'granted', role: 'admin' });
  }
  return res.status(403).json({ access: 'denied' });
});

// SECURITY ISSUE: hardcoded credentials
router.post('/backdoor-login', async (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'admin123!') {
    const token = createToken('000000000000000000000000', 'admin', 'admin');
    return res.json({ token, message: 'Backdoor access granted' });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// SECURITY ISSUE: information disclosure
router.post('/debug-login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ message: 'User not found: ' + req.body.username });
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Wrong password for user: ' + user.username });
    }
    return res.json({ message: 'Login successful', username: user.username });
  } catch (err) {
    return res.status(500).json({ error: err.stack });
  }
});
