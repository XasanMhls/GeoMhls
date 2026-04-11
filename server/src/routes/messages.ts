import { Router, type Response } from 'express';
import { LIMITS } from '@geomhls/shared';
import { Message } from '../models/Message.js';
import { Group } from '../models/Group.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/latest/all', async (req: AuthRequest, res: Response) => {
  const groups = await Group.find({ 'members.user': req.userId }).select('_id');
  const groupIds = groups.map((g) => g._id);

  const pipeline = await Message.aggregate([
    { $match: { group: { $in: groupIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$group', lastMessage: { $first: '$$ROOT' } } },
  ]);

  const populated = await Message.populate(pipeline.map((p) => p.lastMessage), {
    path: 'sender',
    select: 'name avatar',
  });

  const result: Record<string, any> = {};
  for (const msg of populated) {
    result[String(msg.group)] = msg;
  }

  res.json({ lastMessages: result });
});

router.get('/:groupId', async (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;

  const isMember = await Group.exists({ _id: groupId, 'members.user': req.userId });
  if (!isMember) return res.status(403).json({ error: 'Not a member' });

  const before = req.query.before ? new Date(String(req.query.before)) : new Date();

  const messages = await Message.find({ group: groupId, createdAt: { $lt: before } })
    .sort({ createdAt: -1 })
    .limit(LIMITS.MESSAGES_PER_PAGE)
    .populate('sender', 'name avatar');

  res.json({ messages: messages.reverse() });
});

export default router;
