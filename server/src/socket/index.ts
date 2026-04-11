import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { verifyAccessToken } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { registerLocationHandlers } from './locationHandler.js';
import { registerChatHandlers } from './chatHandler.js';

export interface AuthedSocket extends Socket {
  userId: string;
}

/* Track currently connected socket IDs per user (a user may have multiple tabs) */
export const onlineUsers = new Map<string, Set<string>>();

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const { userId } = verifyAccessToken(token);
      (socket as AuthedSocket).userId = userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const s = socket as AuthedSocket;
    const userId = s.userId;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(s.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    const groups = await Group.find({ 'members.user': userId }).select('_id');
    for (const g of groups) {
      s.join(`group:${g._id}`);
    }

    s.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });

    registerLocationHandlers(io, s);
    registerChatHandlers(io, s);

    s.on('disconnect', async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(s.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          s.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
        }
      }
    });
  });

  return io;
}
