import { Router, type Response } from 'express';
import { LIMITS } from '@geomhls/shared';
import { DirectConversation, sortedPair } from '../models/DirectConversation.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/* ── List all DM conversations for current user ── */
router.get('/conversations', async (req: AuthRequest, res: Response) => {
  const myId = req.userId!;

  const convos = await DirectConversation.find({
    $or: [{ user1: myId }, { user2: myId }],
  }).lean();

  if (convos.length === 0) return res.json({ conversations: [] });

  // Collect friend IDs
  const friendIds = convos.map((c) =>
    String(c.user1) === myId ? String(c.user2) : String(c.user1),
  );

  const [friends, lastMessages] = await Promise.all([
    User.find({ _id: { $in: friendIds } })
      .select('username name avatar status isOnline')
      .lean(),
    Promise.all(
      convos.map((c) =>
        DirectMessage.findOne({ conversation: c._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'name avatar')
          .lean(),
      ),
    ),
  ]);

  const friendMap = new Map(friends.map((f) => [String(f._id), f]));

  const result = convos.map((c, i) => {
    const friendId = String(c.user1) === myId ? String(c.user2) : String(c.user1);
    const friend = friendMap.get(friendId);
    const last = lastMessages[i];
    return {
      conversationId: String(c._id),
      friend: friend
        ? {
            id: String(friend._id),
            username: friend.username,
            name: friend.name,
            avatar: friend.avatar ?? null,
            status: friend.status ?? '',
            isOnline: friend.isOnline ?? false,
          }
        : null,
      lastMessage: last ? serializeDm(last, String(c._id), [myId, friendId]) : null,
    };
  });

  res.json({ conversations: result.filter((c) => c.friend) });
});

/* ── Get messages with a friend (creates convo if needed) ── */
router.get('/:friendId', async (req: AuthRequest, res: Response) => {
  const { friendId } = req.params;
  const myId = req.userId!;

  const friend = await User.findById(friendId).select('username name avatar status isOnline').lean();
  if (!friend) return res.status(404).json({ error: 'User not found' });

  const [u1, u2] = sortedPair(myId, friendId);
  let convo = await DirectConversation.findOne({ user1: u1, user2: u2 });
  if (!convo) {
    convo = await DirectConversation.create({ user1: u1, user2: u2 });
  }

  const before = req.query.before ? new Date(String(req.query.before)) : new Date();
  const messages = await DirectMessage.find({
    conversation: convo._id,
    createdAt: { $lt: before },
  })
    .sort({ createdAt: -1 })
    .limit(LIMITS.MESSAGES_PER_PAGE)
    .populate('sender', 'name avatar')
    .lean();

  res.json({
    conversationId: String(convo._id),
    friend: {
      id: String(friend._id),
      username: friend.username,
      name: friend.name,
      avatar: friend.avatar ?? null,
      status: friend.status ?? '',
      isOnline: friend.isOnline ?? false,
    },
    messages: messages
      .reverse()
      .map((m) => serializeDm(m, String(convo!._id), [myId, friendId])),
  });
});

function serializeDm(msg: any, conversationId: string, participants: string[]) {
  return {
    _id: String(msg._id),
    conversationId,
    participants,
    sender: {
      _id: String(msg.sender?._id ?? msg.sender),
      name: msg.sender?.name ?? '',
      avatar: msg.sender?.avatar ?? null,
    },
    text: msg.text,
    type: msg.type ?? 'text',
    createdAt:
      msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt),
  };
}

export default router;
