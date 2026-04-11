import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema } from '@geomhls/shared';
import { User } from '../models/User.js';
import { validateBody } from '../middleware/validate.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  requireAuth,
  type AuthRequest,
} from '../middleware/auth.js';
import { env, googleOAuthEnabled } from '../config/env.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const REFRESH_COOKIE = 'gh_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function serializeUser(user: any) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    status: user.status,
    settings: user.settings,
    location: user.location,
  };
}

router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), name, passwordHash });

  const accessToken = signAccessToken(String(user._id));
  const refreshToken = signRefreshToken(String(user._id));

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ user: serializeUser(user), accessToken });
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(String(user._id));
  const refreshToken = signRefreshToken(String(user._id));

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ user: serializeUser(user), accessToken });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = signAccessToken(String(user._id));
    res.json({ user: serializeUser(user), accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: serializeUser(user) });
});

if (googleOAuthEnabled) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.CLIENT_URL}/login` }),
    (req: Request, res: Response) => {
      const user = req.user as any;
      const accessToken = signAccessToken(String(user._id));
      const refreshToken = signRefreshToken(String(user._id));
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.redirect(`${env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    },
  );
} else {
  router.get('/google', (_req, res) => {
    res.status(503).json({ error: 'Google OAuth not configured' });
  });
}

export default router;
