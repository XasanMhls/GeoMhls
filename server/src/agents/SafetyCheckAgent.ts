/**
 * SafetyCheckAgent — Agent #3
 * If a user's location hasn't changed for SAFETY_IDLE_MS, emit safety:check-in
 * to that user's socket room. Throttles to one alert per idle period.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { User } from '../models/User.js';

export class SafetyCheckAgent extends BaseAgent {
  private timer: ReturnType<typeof setInterval> | null = null;
  // userId → timestamp of last emitted check-in
  private readonly alerted = new Map<string, number>();

  constructor(io: Server) {
    super('SafetyCheckAgent', io);
  }

  protected async onStart() {
    // Check every 15 minutes
    this.timer = setInterval(() => this.run(), 15 * 60_000);
  }

  protected async onStop() {
    if (this.timer) clearInterval(this.timer);
    this.alerted.clear();
  }

  private async run() {
    const cutoff = new Date(Date.now() - AGENT_CONFIG.SAFETY_IDLE_MS);

    const staleUsers = await User.find({
      'location.updatedAt': { $lte: cutoff },
      'settings.shareLocation': true,
      'settings.ghostMode': false,
    })
      .select('_id')
      .lean();

    for (const u of staleUsers) {
      const uid = String(u._id);
      const lastAlert = this.alerted.get(uid) ?? 0;
      // Only alert once per idle period
      if (Date.now() - lastAlert < AGENT_CONFIG.SAFETY_IDLE_MS) continue;

      this.alerted.set(uid, Date.now());
      this.io.to(`user:${uid}`).emit(SOCKET_EVENTS.SAFETY_CHECK_IN, {
        userId: uid,
        message: 'Are you safe? Your location has not updated for a while.',
      });
    }
  }
}
