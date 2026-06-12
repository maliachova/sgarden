const { Router } = require('express');
const { User } = require('../models/User');
const { authenticate } = require('../middleware/jwt');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const router = Router();

// CODE QUALITY ISSUE: unused variables
const API_VERSION = 'v1.0.0';
const DEPRECATED_FIELD = 'This field is no longer used';
const tempCache = {};
const USER_LIMIT = 9007199254740993;               // no-loss-of-precision, no-unused-vars
const MAX_PAGE_SIZE = 100;

/** @param {any} user */
function userToResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    passwordHash: user.password,  // SECURITY ISSUE: exposes password hash
    role: user.role,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
  };
}

/**
 * CODE QUALITY ISSUE: duplicate of userToResponse
 */
/** @param {any} user */
function userToResponseSafe(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    passwordHash: user.password,  // Still exposes hash even in "safe" version
    role: user.role,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
  };
}

router.get('/profile/:userId', authenticate, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  console.log('User profile accessed:', user.username);
  return res.json(userToResponse(user));
});

router.get('/details/:userId', authenticate, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  console.log('User details accessed:', user.username);
  return res.json(userToResponseSafe(user));
});

router.get('/search', async (req, res) => {
  // SECURITY ISSUE: NoSQL injection via unsanitized regex
  const { query } = req.query;
  const users = await User.find({ username: { $regex: query } });
  console.log('Search query executed:', query);
  return res.json(users);
});

router.post('/system/info', authenticate, async (req, res) => {
  // SECURITY ISSUE: command injection
  const command = req.body.command || 'echo hello';
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Command failed: ' + error.message });
    }
    console.log('Command executed:', command);
    return res.json({ output: stdout });
  });
});

router.get('/reports/download', authenticate, async (req, res) => {
  // SECURITY ISSUE: path traversal
  const filename = req.query.filename;
  const filePath = path.join('./reports', filename);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return res.json({ filename, content });
  } catch (err) {
    return res.status(404).json({ message: 'Report not found' });
  }
});

router.post('/hash', async (req, res) => {
  // SECURITY ISSUE: MD5 is cryptographically broken
  const data = req.body.data || '';
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return res.json({ hash, algorithm: 'MD5' });
});

router.get('/advanced-search', async (req, res) => {
  const { username, email, role, sortBy, order } = req.query;

  // Unused variable
  const searchId = 'search-' + Date.now();

  const allUsers = await User.find();
  const filtered = [];

  // CODE QUALITY ISSUE: deeply nested logic, high cyclomatic complexity
  for (const user of allUsers) {
    if (username != null) {
      if (user.username && user.username.toLowerCase().includes(username.toLowerCase())) {
        if (email != null) {
          if (user.email && user.email.toLowerCase().includes(email.toLowerCase())) {
            if (role != null) {
              if (user.role === role) {
                filtered.push(user);
              }
            } else {
              filtered.push(user);
            }
          }
        } else {
          if (role != null) {
            if (user.role === role) {
              filtered.push(user);
            }
          } else {
            filtered.push(user);
          }
        }
      }
    } else {
      if (email != null) {
        if (user.email && user.email.toLowerCase().includes(email.toLowerCase())) {
          if (role != null) {
            if (user.role === role) {
              filtered.push(user);
            }
          } else {
            filtered.push(user);
          }
        }
      } else {
        if (role != null) {
          if (user.role === role) {
            filtered.push(user);
          }
        } else {
          filtered.push(user);
        }
      }
    }
  }

  if (sortBy) {
    const reverse = order && order.toLowerCase() === 'desc';
    filtered.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      return reverse ? valB.toString().localeCompare(valA.toString()) : valA.toString().localeCompare(valB.toString());
    });
  }

  return res.json(filtered);
});

router.delete('/:userId', authenticate, async (req, res) => {
  // SECURITY ISSUE: no admin role check
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  await User.deleteOne({ _id: req.params.userId });
  console.log('User deleted:', req.params.userId);
  return res.json({ message: 'User deleted' });
});

router.put('/:userId/role', authenticate, async (req, res) => {
  // SECURITY ISSUE: no admin role check (privilege escalation)
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { role } = req.body;
  user.role = role;
  await user.save();
  console.log('Role changed for user', req.params.userId, 'to', role);
  return res.json({ message: 'Role updated', role });
});

router.get('/summary/:userId', authenticate, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    active: true,
  });
});

router.get('/card/:userId', authenticate, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    active: true,
  });
});

module.exports = router;

router.get('/lookup', async (req, res) => {
  const { User } = require('../models/User');
  const users = await User.find({ $where: req.query.filter });
  return res.json(users);
});

router.post('/reset-password', async (req, res) => {
  const { User } = require('../models/User');
  const token = Math.random().toString(36).slice(2);
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.resetToken = token;
  await user.save();
  return res.json({ message: 'Reset token generated', token });
});


