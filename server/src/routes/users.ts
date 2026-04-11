import { Router, type Response } from 'express';
import { updateProfileSchema } from '@geomhls/shared';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { env } from '../config/env.js';

const router = Router();

router.use(requireAuth);

router.patch('/me', validateBody(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: sanitize(req.body) },
    { new: true },
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: serializeUser(user) });
});

router.patch('/me/settings', async (req: AuthRequest, res: Response) => {
  const allowed = ['theme', 'language', 'shareLocation', 'notifications', 'freezeLocation'] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) update[`settings.${key}`] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: serializeUser(user) });
});

/* ── Push subscription ── */
router.post('/me/push-subscription', async (req: AuthRequest, res: Response) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }
  await User.updateOne(
    { _id: req.userId, 'pushSubscriptions.endpoint': { $ne: endpoint } },
    { $push: { pushSubscriptions: { endpoint, keys } } },
  );
  res.json({ ok: true });
});

router.delete('/me/push-subscription', async (req: AuthRequest, res: Response) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
  await User.updateOne({ _id: req.userId }, { $pull: { pushSubscriptions: { endpoint } } });
  res.json({ ok: true });
});

/* ── VAPID public key (client needs this to subscribe) ── */
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: env.VAPID_PUBLIC_KEY || null });
});

function sanitize(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (typeof body.name === 'string') out.name = body.name;
  if (typeof body.status === 'string') out.status = body.status;
  if (typeof body.avatar === 'string') out.avatar = body.avatar;
  return out;
}

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

export default router;
