import type { Server } from 'socket.io';
import { SOCKET_EVENTS, locationUpdateSchema } from '@geomhls/shared';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import type { AuthedSocket } from './index.js';

export function registerLocationHandlers(io: Server, socket: AuthedSocket) {
  socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (payload: unknown) => {
    const parsed = locationUpdateSchema.safeParse(payload);
    if (!parsed.success) return;

    const { lat, lng, accuracy } = parsed.data;
    const updatedAt = new Date();

    await User.findByIdAndUpdate(socket.userId, {
      location: { lat, lng, accuracy, updatedAt },
    });

    const groups = await Group.find({ 'members.user': socket.userId }).select('_id');
    for (const g of groups) {
      io.to(`group:${g._id}`).emit(SOCKET_EVENTS.LOCATION_FRIENDS, {
        userId: socket.userId,
        lat,
        lng,
        accuracy,
        updatedAt,
      });
    }
  });
}
