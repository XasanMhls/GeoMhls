/**
 * ProximityAgent — Agent #1
 * Fires a proximity:alert when two group members get within PROXIMITY_THRESHOLD_M of each other.
 * Listens to location:update socket events, deduplicates alerts (once per pair per minute).
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { haversineMeters } from '../utils/geo.js';

export class ProximityAgent extends BaseAgent {
  // key: `${userA}:${userB}`, value: last alert timestamp
  private readonly recentAlerts = new Map<string, number>();
  private readonly COOLDOWN_MS = 60_000;

  constructor(io: Server) {
    super('ProximityAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, () => this.checkProximity(socket.userId));
    });
  }

  protected async onStop() {
    this.recentAlerts.clear();
  }

  private async checkProximity(userId: string) {
    const user = await User.findById(userId).select('location settings').lean();
    if (!user?.location || user.settings?.ghostMode) return;

    // Find all groups this user belongs to and get their members' locations
    const groups = await Group.find({ 'members.user': userId })
      .populate('members.user', 'location settings _id')
      .lean();

    for (const group of groups) {
      for (const member of group.members as any[]) {
        const friend = member.user;
        if (!friend || String(friend._id) === userId) continue;
        if (!friend.location || friend.settings?.ghostMode) continue;

        const dist = haversineMeters(
          user.location.lat, user.location.lng,
          friend.location.lat, friend.location.lng,
        );

        if (dist <= AGENT_CONFIG.PROXIMITY_THRESHOLD_M) {
          const pairKey = [userId, String(friend._id)].sort().join(':');
          const lastAlert = this.recentAlerts.get(pairKey) ?? 0;
          if (Date.now() - lastAlert < this.COOLDOWN_MS) continue;

          this.recentAlerts.set(pairKey, Date.now());

          const payload = {
            userId,
            friendId: String(friend._id),
            distanceMeters: Math.round(dist),
            lat: user.location.lat,
            lng: user.location.lng,
          };

          // Alert both users
          this.io.to(`user:${userId}`).emit(SOCKET_EVENTS.PROXIMITY_ALERT, payload);
          this.io.to(`user:${String(friend._id)}`).emit(SOCKET_EVENTS.PROXIMITY_ALERT, {
            ...payload,
            userId: String(friend._id),
            friendId: userId,
          });
        }
      }
    }
  }
}
