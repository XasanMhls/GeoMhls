/**
 * GeofenceAgent — Agent #2
 * Listens to location updates and checks if any user has entered or exited a geofence.
 * Emits geofence:enter / geofence:exit to the group room.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { Geofence } from '../models/Geofence.js';
import { User } from '../models/User.js';
import { haversineMeters } from '../utils/geo.js';

export class GeofenceAgent extends BaseAgent {
  // key: `${userId}:${geofenceId}`, value: true if inside
  private readonly userState = new Map<string, boolean>();

  constructor(io: Server) {
    super('GeofenceAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, () => this.check(socket.userId));
    });
  }

  protected async onStop() {
    this.userState.clear();
  }

  private async check(userId: string) {
    const user = await User.findById(userId).select('location settings').lean();
    if (!user?.location || user.settings?.shareLocation === false) return;

    const geofences = await Geofence.find({ active: true }).lean();

    for (const fence of geofences) {
      const dist = haversineMeters(
        user.location.lat as number, user.location.lng as number,
        fence.lat, fence.lng,
      );
      const stateKey = `${userId}:${fence._id}`;
      const wasInside = this.userState.get(stateKey) ?? false;
      const isInside = dist <= fence.radiusMeters;

      if (isInside === wasInside) continue;
      this.userState.set(stateKey, isInside);

      const event = isInside ? SOCKET_EVENTS.GEOFENCE_ENTER : SOCKET_EVENTS.GEOFENCE_EXIT;
      const payload = {
        geofenceId: String(fence._id),
        geofenceName: fence.name,
        userId,
        lat: user.location.lat,
        lng: user.location.lng,
        type: isInside ? 'enter' : 'exit',
      };

      this.io.to(`group:${fence.groupId}`).emit(event, payload);
    }
  }
}
