import type { Server } from 'socket.io';
import { SOCKET_EVENTS, sendMessageSchema } from '@geomhls/shared';
import { Message } from '../models/Message.js';
import { Group } from '../models/Group.js';
import type { AuthedSocket } from './index.js';
import { onlineUsers } from './index.js';
import { sendPushToUser } from '../utils/push.js';

export function registerChatHandlers(io: Server, socket: AuthedSocket) {
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload: unknown) => {
    const parsed = sendMessageSchema.safeParse(payload);
    if (!parsed.success) return;

    const { groupId, text } = parsed.data;

    const isMember = await Group.exists({ _id: groupId, 'members.user': socket.userId });
    if (!isMember) return;

    const message = await Message.create({
      group: groupId,
      sender: socket.userId,
      text,
    });

    const populated = await message.populate('sender', 'name avatar');
    io.to(`group:${groupId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, populated);

    // Push notifications to offline members
    const group = await Group.findById(groupId).select('members name emoji');
    if (group) {
      const senderName = (populated.sender as any).name ?? 'Someone';
      const pushPayload = {
        title: `${group.emoji ?? ''} ${group.name}`.trim(),
        body: `${senderName}: ${text.length > 80 ? text.slice(0, 77) + '…' : text}`,
        tag: `chat-${groupId}`,
        data: { groupId, url: `/chat/${groupId}` },
      };

      await Promise.allSettled(
        group.members.map(async (m: any) => {
          const uid = String(m.user);
          if (uid === socket.userId) return;
          // Only push if user has NO active socket connections
          if (onlineUsers.has(uid)) return;
          await sendPushToUser(uid, pushPayload);
        }),
      );
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_TYPING, ({ groupId }: { groupId: string }) => {
    if (!groupId) return;
    socket.to(`group:${groupId}`).emit(SOCKET_EVENTS.MESSAGE_TYPING, {
      userId: socket.userId,
      groupId,
    });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_STOP_TYPING, ({ groupId }: { groupId: string }) => {
    if (!groupId) return;
    socket.to(`group:${groupId}`).emit(SOCKET_EVENTS.MESSAGE_STOP_TYPING, {
      userId: socket.userId,
      groupId,
    });
  });
}
