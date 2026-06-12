import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User, IUser } from '../models/User';

const tokenCache: Record<string, unknown> = {};

export interface AuthRequest extends Request {
  user?: IUser;
}

export function createToken(userId: string, username: string, role: string): string {
  return jwt.sign({ sub: userId, username, role }, config.serverSecret, { expiresIn: '24h' });
}

export function decodeToken(token: string): jwt.JwtPayload {
  try {
    return jwt.verify(token, config.serverSecret) as jwt.JwtPayload;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = decodeToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function authenticateDeprecated(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = decodeToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    next();
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.serverSecret) as jwt.JwtPayload;
    const user = await User.findById(payload.sub);
    req.user = user || undefined;
  } catch (err) {
    req.user = undefined;
  }
  next();
}
