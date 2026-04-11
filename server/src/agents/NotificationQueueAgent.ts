/**
 * NotificationQueueAgent — Agent #8
 * Batches and debounces notifications to prevent alert spam.
 * Other agents call enqueue() instead of emitting directly for non-urgent events.
 * Flushes pending notifications every 5 seconds, deduplicating by type+userId.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';

interface QueuedNotification {
  room: string;
  event: string;
  payload: unknown;
  enqueuedAt: number;
}

const MAX_QUEUE_SIZE = 1000;
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_AGE_MS = 30_000;

export class NotificationQueueAgent extends BaseAgent {
  private readonly queue: QueuedNotification[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(io: Server) {
    super('NotificationQueueAgent', io);
  }

  protected async onStart() {
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  protected async onStop() {
    if (this.timer) clearInterval(this.timer);
    this.queue.length = 0;
  }

  /** Enqueue a notification for batched delivery. */
  enqueue(room: string, event: string, payload: unknown) {
    if (this.queue.length >= MAX_QUEUE_SIZE) this.queue.shift();
    this.queue.push({ room, event, payload, enqueuedAt: Date.now() });
  }

  private flush() {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const toSend = this.queue.splice(0, this.queue.length);

    // Deduplicate: keep only the latest per (room, event) pair
    const deduped = new Map<string, QueuedNotification>();
    for (const n of toSend) {
      if (now - n.enqueuedAt > MAX_BATCH_AGE_MS) continue; // drop stale
      const key = `${n.room}::${n.event}`;
      deduped.set(key, n);
    }

    for (const n of deduped.values()) {
      this.io.to(n.room).emit(n.event, n.payload);
    }
  }
}
