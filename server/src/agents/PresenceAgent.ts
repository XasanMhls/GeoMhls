/**
 * PresenceAgent — Agent #5
 * Tracks fine-grained online/idle/offline states.
 * Sets user idle if no location:update for PRESENCE_IDLE_MS.
 * Emits presence:idle to their group rooms.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

export class PresenceAgent extends BaseAgent {
  // userId → last location update timestamp
  private readonly lastSeen = new Map<string, number>();
  private readonly idleNotified = new Set<string>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(io: Server) {
    super('PresenceAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      // Mark active on any location update
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, () => {
        this.lastSeen.set(socket.userId, Date.now());
        this.idleNotified.delete(socket.userId);
      });

      socket.on('disconnect', () => {
        this.lastSeen.delete(socket.userId);
        this.idleNotified.delete(socket.userId);
      });
    });

    this.timer = setInterval(() => this.checkIdle(), 30_000);
  }

  protected async onStop() {
    if (this.timer) clearInterval(this.timer);
    this.lastSeen.clear();
    this.idleNotified.clear();
  }

  private async checkIdle() {
    const cutoff = Date.now() - AGENT_CONFIG.PRESENCE_IDLE_MS;

    for (const [userId, ts] of this.lastSeen) {
      if (ts > cutoff) continue;
      if (this.idleNotified.has(userId)) continue;

      this.idleNotified.add(userId);

      // Update lastSeen on the User model
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

      // Notify all groups this user belongs to
      const groups = await Group.find({ 'members.user': userId }).select('_id').lean();
      for (const g of groups) {
        this.io.to(`group:${g._id}`).emit(SOCKET_EVENTS.PRESENCE_IDLE, { userId });
      }
    }
  }
}
