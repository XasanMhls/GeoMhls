import { Router, type Response } from 'express';
import { LocationHistory } from '../models/LocationHistory.js';
import { Group } from '../models/Group.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/history/:userId?limit=100&before=<ISO date>
 * Returns location trail for a user. Caller must share a group with the target user.
 */
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const before = req.query.before ? new Date(String(req.query.before)) : new Date();

  // Authorization: caller must share at least one group with the target user
  if (userId !== req.userId) {
    const sharedGroup = await Group.findOne({
      'members.user': { $all: [req.userId, userId] },
    }).lean();
    if (!sharedGroup) return res.status(403).json({ error: 'No shared group with this user' });
  }

  const history = await LocationHistory.find({
    userId,
    recordedAt: { $lt: before },
  })
    .sort({ recordedAt: -1 })
    .limit(limit)
    .lean();

  res.json({ history });
});

export default router;
