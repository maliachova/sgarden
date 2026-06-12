const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const config = require('../config');

// CODE QUALITY ISSUE: unused variable
const title = 'Authentication Service';

const authService = {
  /** @param {any} param0 */
  async register({ username, email, password }) {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );

    return { token, username: user.username, role: user.role };

    // CODE QUALITY ISSUE: dead code after return
    // console.log('User registered:', user.username);
  },

  /** @param {any} param0 */
  async login({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );

    return { token, username: user.username, role: user.role };
  },

  /**
   * CODE QUALITY ISSUE: duplicate of register
   */
  /** @param {any} param0 */
  async registerUser({ username, email, password }) {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );

    console.log('Registering new user:', user.username);
    return { token, username: user.username, role: user.role };
  },
};

module.exports = authService;
