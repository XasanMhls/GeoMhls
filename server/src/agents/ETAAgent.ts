/**
 * ETAAgent — Agent #4
 * Users can set a destination (eta:set event). Agent calculates ETA based on
 * current location and broadcasts eta:update to the group every 30s.
 * Cleared on eta:clear or when user reaches destination (dist < 50m).
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { User } from '../models/User.js';
import { haversineMeters } from '../utils/geo.js';

interface EtaEntry {
  userId: string;
  groupId: string;
  destLat: number;
  destLng: number;
  destLabel?: string;
}

export class ETAAgent extends BaseAgent {
  private readonly destinations = new Map<string, EtaEntry>(); // userId → entry
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(io: Server) {
    super('ETAAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.ETA_SET, (payload: any) => {
        if (!payload?.groupId || payload.lat == null || payload.lng == null) return;
        this.destinations.set(socket.userId, {
          userId: socket.userId,
          groupId: payload.groupId,
          destLat: payload.lat,
          destLng: payload.lng,
          destLabel: payload.label,
        });
      });

      socket.on(SOCKET_EVENTS.ETA_CLEAR, () => {
        this.destinations.delete(socket.userId);
      });

      socket.on('disconnect', () => {
        this.destinations.delete(socket.userId);
      });
    });

    this.timer = setInterval(() => this.broadcast(), AGENT_CONFIG.ETA_BROADCAST_INTERVAL_MS);
  }

  protected async onStop() {
    if (this.timer) clearInterval(this.timer);
    this.destinations.clear();
  }

  private async broadcast() {
    if (this.destinations.size === 0) return;

    for (const [userId, entry] of this.destinations) {
      const user = await User.findById(userId).select('location').lean();
      if (!user?.location) continue;

      const distMeters = haversineMeters(
        user.location.lat, user.location.lng,
        entry.destLat, entry.destLng,
      );

      // Arrived — clear and notify
      if (distMeters < 50) {
        this.destinations.delete(userId);
        this.io.to(`group:${entry.groupId}`).emit(SOCKET_EVENTS.ETA_UPDATE, {
          userId,
          groupId: entry.groupId,
          destination: { lat: entry.destLat, lng: entry.destLng, label: entry.destLabel },
          etaSeconds: 0,
          distanceMeters: 0,
          arrived: true,
        });
        continue;
      }

      // Estimate: assume average walking/driving ~5km/h = 1.39m/s
      const avgSpeedMps = 5_000 / 3_600;
      const etaSeconds = Math.round(distMeters / avgSpeedMps);

      this.io.to(`group:${entry.groupId}`).emit(SOCKET_EVENTS.ETA_UPDATE, {
        userId,
        groupId: entry.groupId,
        destination: { lat: entry.destLat, lng: entry.destLng, label: entry.destLabel },
        etaSeconds,
        distanceMeters: Math.round(distMeters),
        arrived: false,
      });
    }
  }
}
