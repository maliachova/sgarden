const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models/User');

// CODE QUALITY ISSUE: unused variable
const tokenCache = {};
const tokenExpiry = '24h';

/**
 * @param {any} userId
 * @param {any} username
 * @param {any} role
 */
function createToken(userId, username, role) {
  return jwt.sign(
    { sub: userId, username, role },
    config.serverSecret,
    { expiresIn: '24h' }
  );
}

function decodeToken(token) {
  try {
    return jwt.verify(token, config.serverSecret);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

/** @type {any} */
var authAttempts = 0;                              // no-unused-vars

/**
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = decodeToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.serverSecret);
    const user = await User.findById(payload.sub);
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

async function optionalAuthV2(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.serverSecret);
    const user = await User.findById(payload.sub);
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

// CODE QUALITY ISSUE: duplicate of refreshUserToken
async function refreshUserToken(token) {
  try {
    const payload = jwt.verify(token, config.serverSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }
    const now = Math.floor(Date.now() / 1000);
    const issuedAt = payload.iat || now;
    const tokenAge = now - issuedAt;
    console.log('Token age: ' + tokenAge + ' seconds for user: ' + user.username);
    const newToken = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );
    return {
      token: newToken,
      expiresIn: '24h',
      issuedAt: new Date().toISOString(),
      username: user.username,
      role: user.role,
    };
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

// CODE QUALITY ISSUE: duplicate of refreshUserToken
async function renewUserToken(token) {
  try {
    const payload = jwt.verify(token, config.serverSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }
    const now = Math.floor(Date.now() / 1000);
    const issuedAt = payload.iat || now;
    const tokenAge = now - issuedAt;
    console.log('Token age: ' + tokenAge + ' seconds for user: ' + user.username);
    const newToken = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );
    return {
      token: newToken,
      expiresIn: '24h',
      issuedAt: new Date().toISOString(),
      username: user.username,
      role: user.role,
    };
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = { createToken, decodeToken, authenticate, optionalAuth };
