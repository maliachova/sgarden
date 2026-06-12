import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { createToken } from '../middleware/jwt';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const router = Router();

const authVersion: string = '1.0.0';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

async function registerUserHandler(req: Request, res: Response) {
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
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

export default router;
