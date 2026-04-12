import type { Server } from 'socket.io';
import { SOCKET_EVENTS, sendDmSchema } from '@geomhls/shared';
import { LIMITS } from '@geomhls/shared';
import { DirectConversation, sortedPair } from '../models/DirectConversation.js';
import { DirectMessage } from '../models/DirectMessage.js';
import { User } from '../models/User.js';
import type { AuthedSocket } from './index.js';
import { onlineUsers } from './index.js';
import { sendPushToUser } from '../utils/push.js';

export function registerDmHandlers(io: Server, socket: AuthedSocket) {
  socket.on(SOCKET_EVENTS.DM_SEND, async (payload: unknown) => {
    const parsed = sendDmSchema.safeParse(payload);
    if (!parsed.success) return;

    const { friendId, text, type } = parsed.data;
    const senderId = socket.userId;

    if (friendId === senderId) return;

    // Verify they are friends
    const me = await User.findById(senderId).select('friends name').lean();
    if (!me) return;
    const isFriend = (me as any).friends.some((f: any) => String(f) === friendId);
    if (!isFriend) return;

    // Find or create conversation
    const [u1, u2] = sortedPair(senderId, friendId);
    let convo = await DirectConversation.findOne({ user1: u1, user2: u2 });
    if (!convo) {
      convo = await DirectConversation.create({ user1: u1, user2: u2 });
    }

    // Save message
    const message = await DirectMessage.create({
      conversation: convo._id,
      sender: senderId,
      text: text.slice(0, LIMITS.MESSAGE_MAX_LENGTH),
      type,
    });

    const populated = await message.populate('sender', 'name avatar');

    const dmPayload = {
      _id: String(message._id),
      conversationId: String(convo._id),
      participants: [senderId, friendId],
      sender: {
        _id: String((populated.sender as any)._id ?? senderId),
        name: (populated.sender as any).name ?? '',
        avatar: (populated.sender as any).avatar ?? null,
      },
      text: message.text,
      type: message.type,
      createdAt: message.createdAt.toISOString(),
    };

    // Echo to sender
    socket.emit(SOCKET_EVENTS.DM_NEW, dmPayload);

    // Deliver to recipient
    io.to(`user:${friendId}`).emit(SOCKET_EVENTS.DM_NEW, dmPayload);

    // Push notification if recipient is offline
    if (!onlineUsers.has(friendId) && type !== 'blast') {
      await sendPushToUser(friendId, {
        title: (me as any).name ?? 'New message',
        body: text.length > 80 ? text.slice(0, 77) + '…' : text,
        tag: `dm-${convo._id}`,
        data: { friendId: senderId, url: `/dm/${senderId}` },
      }).catch(() => {});
    }
  });

  socket.on(SOCKET_EVENTS.DM_TYPING, ({ friendId }: { friendId: string }) => {
    if (!friendId) return;
    io.to(`user:${friendId}`).emit(SOCKET_EVENTS.DM_TYPING, { userId: socket.userId });
  });

  socket.on(SOCKET_EVENTS.DM_STOP_TYPING, ({ friendId }: { friendId: string }) => {
    if (!friendId) return;
    io.to(`user:${friendId}`).emit(SOCKET_EVENTS.DM_STOP_TYPING, { userId: socket.userId });
  });

  // Emoji blast — triggers full-screen animation on recipient side
  socket.on(SOCKET_EVENTS.DM_BLAST, ({ friendId, emoji }: { friendId: string; emoji: string }) => {
    if (!friendId || !emoji) return;
    io.to(`user:${friendId}`).emit(SOCKET_EVENTS.DM_BLAST, {
      from: socket.userId,
      emoji,
    });
  });
}
