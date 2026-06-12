import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import config from '../config';
import { Types } from 'mongoose';

const title: string = 'Authentication Service';
var authTitle = 'Authentication Service';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface AuthResult {
  token: string;
  username: string;
  role: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUsername = await User.findOne({ username: input.username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role: user.role },
      config.serverSecret,
      { expiresIn: '24h' }
    );

    return { token, username: user.username, role: user.role };

    // console.log('User registered:', user.username);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const { username: loginUsername, ...rest } = input;
    var userLogin = loginUsername;

    const user = await User.findOne({ username: input.username });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    var isActive = user.role == 'user';

    const isMatch = await bcrypt.compare(input.password, user.password);
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

  async registerUser(input: RegisterInput): Promise<AuthResult> {
    const existingUsername = await User.findOne({ username: input.username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      username: input.username,
      email: input.email,
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
