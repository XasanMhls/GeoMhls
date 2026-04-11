/**
 * LocationHistoryAgent — Agent #6
 * Persists every location update to the LocationHistory collection.
 * Deduplicates: only writes if the user moved > 10 meters since the last record.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { LocationHistory } from '../models/LocationHistory.js';
import { haversineMeters } from '../utils/geo.js';

export class LocationHistoryAgent extends BaseAgent {
  // userId → last recorded position
  private readonly lastPos = new Map<string, { lat: number; lng: number }>();
  private readonly MIN_DISTANCE_M = 10;

  constructor(io: Server) {
    super('LocationHistoryAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (payload: any) => {
        if (payload?.lat == null || payload?.lng == null) return;
        const { lat, lng, accuracy } = payload;
        const userId = socket.userId;

        const last = this.lastPos.get(userId);
        if (last) {
          const dist = haversineMeters(last.lat, last.lng, lat, lng);
          if (dist < this.MIN_DISTANCE_M) return;
        }

        this.lastPos.set(userId, { lat, lng });
        await LocationHistory.create({ userId, lat, lng, accuracy });
      });

      socket.on('disconnect', () => {
        this.lastPos.delete(socket.userId);
      });
    });
  }

  protected async onStop() {
    this.lastPos.clear();
  }
}
