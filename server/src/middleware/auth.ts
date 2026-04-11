import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
}

export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
