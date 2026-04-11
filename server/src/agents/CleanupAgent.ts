/**
 * CleanupAgent — Agent #9
 * Runs every 6 hours and deletes:
 *   - LocationHistory records older than LOCATION_HISTORY_TTL_DAYS
 *   - Message records older than MESSAGE_TTL_DAYS
 * Logs deleted counts.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { AGENT_CONFIG } from '@geomhls/shared';
import { LocationHistory } from '../models/LocationHistory.js';
import { Message } from '../models/Message.js';

export class CleanupAgent extends BaseAgent {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(io: Server) {
    super('CleanupAgent', io);
  }

  protected async onStart() {
    // Run once at start, then on interval
    await this.run();
    this.timer = setInterval(() => this.run(), AGENT_CONFIG.CLEANUP_INTERVAL_MS);
  }

  protected async onStop() {
    if (this.timer) clearInterval(this.timer);
  }

  private async run() {
    const historyAge = new Date(
      Date.now() - AGENT_CONFIG.LOCATION_HISTORY_TTL_DAYS * 24 * 60 * 60_000,
    );
    const messageAge = new Date(
      Date.now() - AGENT_CONFIG.MESSAGE_TTL_DAYS * 24 * 60 * 60_000,
    );

    const [histRes, msgRes] = await Promise.all([
      LocationHistory.deleteMany({ recordedAt: { $lt: historyAge } }),
      Message.deleteMany({ createdAt: { $lt: messageAge } }),
    ]);

    if (histRes.deletedCount > 0 || msgRes.deletedCount > 0) {
      console.log(
        `[CleanupAgent] Removed ${histRes.deletedCount} location records, ${msgRes.deletedCount} messages`,
      );
    }
  }
}
