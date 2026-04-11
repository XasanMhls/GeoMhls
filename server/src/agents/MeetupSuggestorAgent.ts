/**
 * MeetupSuggestorAgent — Agent #10
 * When 2+ group members are converging (distances decreasing), calculate the
 * geographic midpoint and emit meetup:suggest to the group room.
 * Throttles to one suggestion per group per 5 minutes.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { haversineMeters, geographicMidpoint } from '../utils/geo.js';

export class MeetupSuggestorAgent extends BaseAgent {
  // groupId → last suggestion timestamp
  private readonly lastSuggestion = new Map<string, number>();
  private readonly COOLDOWN_MS = 5 * 60_000;

  constructor(io: Server) {
    super('MeetupSuggestorAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, () => this.check(socket.userId));
    });
  }

  protected async onStop() {
    this.lastSuggestion.clear();
  }

  private async check(userId: string) {
    const groups = await Group.find({ 'members.user': userId })
      .populate('members.user', 'location settings _id')
      .lean();

    for (const group of groups) {
      const gid = String(group._id);
      if (Date.now() - (this.lastSuggestion.get(gid) ?? 0) < this.COOLDOWN_MS) continue;

      const activeMemberIds: string[] = [];
      const points: { lat: number; lng: number }[] = [];

      for (const m of group.members as any[]) {
        const friend = m.user;
        if (!friend?.location || friend.settings?.ghostMode) continue;
        activeMemberIds.push(String(friend._id));
        points.push({ lat: friend.location.lat, lng: friend.location.lng });
      }

      if (activeMemberIds.length < AGENT_CONFIG.MEETUP_MIN_USERS) continue;

      // Check if members are converging: avg pairwise distance should be < 5km
      let totalDist = 0;
      let pairs = 0;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          totalDist += haversineMeters(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
          pairs++;
        }
      }
      const avgDist = pairs > 0 ? totalDist / pairs : Infinity;
      if (avgDist > 5_000) continue; // Only suggest if within 5km of each other

      const midpoint = geographicMidpoint(points);
      this.lastSuggestion.set(gid, Date.now());

      this.io.to(`group:${gid}`).emit(SOCKET_EVENTS.MEETUP_SUGGEST, {
        groupId: gid,
        memberIds: activeMemberIds,
        midpoint,
      });
    }
  }
}
