import { Router, type Response } from 'express';
import { updateProfileSchema } from '@geomhls/shared';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { env } from '../config/env.js';
import { getIo } from '../socket/index.js';

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

/* ── Search users by username ── */
router.get('/search', async (req: AuthRequest, res: Response) => {
  const q = String(req.query.q || '').toLowerCase().trim().replace(/^@/, '');
  if (!q || q.length < 2) return res.json({ users: [] });

  const users = await User.find({
    username: { $regex: `^${q}`, $options: 'i' },
    _id: { $ne: req.userId },
  })
    .select('username name avatar status isOnline')
    .limit(10)
    .lean();

  res.json({ users: users.map(serializeFriend) });
});

/* ── Get my friends ── */
router.get('/friends', async (req: AuthRequest, res: Response) => {
  const me = await User.findById(req.userId).populate('friends', 'username name avatar status isOnline').lean();
  if (!me) return res.status(404).json({ error: 'User not found' });
  res.json({ friends: ((me as any).friends || []).map(serializeFriend) });
});

/* ── Get pending friend requests (incoming) ── */
router.get('/friend-requests', async (req: AuthRequest, res: Response) => {
  const me = await User.findById(req.userId)
    .populate('friendRequests', 'username name avatar status isOnline')
    .lean();
  if (!me) return res.status(404).json({ error: 'User not found' });
  res.json({ requests: ((me as any).friendRequests || []).map(serializeFriend) });
});

/* ── Send friend request ── */
router.post('/friends/:userId', async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  if (userId === req.userId) return res.status(400).json({ error: 'Cannot add yourself' });

  const [me, target] = await Promise.all([
    User.findById(req.userId),
    User.findById(userId),
  ]);
  if (!me || !target) return res.status(404).json({ error: 'User not found' });

  const alreadyFriends = (me as any).friends.some((f: any) => String(f) === userId);
  if (alreadyFriends) return res.status(400).json({ error: 'Already friends' });

  const alreadySent = (target as any).friendRequests.some((f: any) => String(f) === req.userId);
  if (alreadySent) return res.status(400).json({ error: 'Request already sent' });

  // If target already sent ME a request → auto-accept both
  const theyRequested = (me as any).friendRequests.some((f: any) => String(f) === userId);
  if (theyRequested) {
    await Promise.all([
      User.updateOne({ _id: req.userId }, {
        $pull: { friendRequests: userId },
        $addToSet: { friends: userId },
      }),
      User.updateOne({ _id: userId }, {
        $addToSet: { friends: req.userId },
      }),
    ]);
    try {
      getIo().to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, {
        by: serializeFriend(me),
      });
    } catch {}
    return res.json({ ok: true, accepted: true, friend: serializeFriend(target) });
  }

  await User.updateOne(
    { _id: userId, friendRequests: { $ne: req.userId } },
    { $push: { friendRequests: req.userId } },
  );

  try {
    getIo().to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST, {
      from: serializeFriend(me),
    });
  } catch {}

  res.json({ ok: true, accepted: false });
});

/* ── Accept friend request ── */
router.post('/friend-requests/:userId/accept', async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const me = await User.findById(req.userId);
  if (!me) return res.status(404).json({ error: 'User not found' });

  const hasRequest = (me as any).friendRequests.some((f: any) => String(f) === userId);
  if (!hasRequest) return res.status(400).json({ error: 'No request from this user' });

  const friend = await User.findById(userId);
  if (!friend) return res.status(404).json({ error: 'User not found' });

  await Promise.all([
    User.updateOne({ _id: req.userId }, {
      $pull: { friendRequests: userId },
      $addToSet: { friends: userId },
    }),
    User.updateOne({ _id: userId }, {
      $addToSet: { friends: req.userId },
    }),
  ]);

  try {
    getIo().to(`user:${userId}`).emit(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, {
      by: serializeFriend(me),
    });
  } catch {}

  res.json({ ok: true, friend: serializeFriend(friend) });
});

/* ── Decline friend request ── */
router.delete('/friend-requests/:userId', async (req: AuthRequest, res: Response) => {
  await User.updateOne({ _id: req.userId }, { $pull: { friendRequests: req.params.userId } });
  res.json({ ok: true });
});

/* ── Remove friend ── */
router.delete('/friends/:userId', async (req: AuthRequest, res: Response) => {
  await User.updateOne({ _id: req.userId }, { $pull: { friends: req.params.userId } });
  res.json({ ok: true });
});

/* ── VAPID public key (client needs this to subscribe) ── */
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: env.VAPID_PUBLIC_KEY || null });
});

function serializeFriend(user: any) {
  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    avatar: user.avatar ?? null,
    status: user.status ?? '',
    isOnline: user.isOnline ?? false,
  };
}

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
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    status: user.status,
    settings: user.settings,
    location: user.location,
  };
}

export default router;
