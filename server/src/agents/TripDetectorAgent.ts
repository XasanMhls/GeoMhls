/**
 * TripDetectorAgent — Agent #7
 * Detects when 2+ group members are moving together in the same direction.
 * Emits trip:together to the group room.
 */
import type { Server } from 'socket.io';
import { BaseAgent } from './BaseAgent.js';
import { SOCKET_EVENTS, AGENT_CONFIG } from '@geomhls/shared';
import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { haversineMeters, bearingDeg } from '../utils/geo.js';

interface UserSnapshot {
  lat: number;
  lng: number;
  ts: number;
}

export class TripDetectorAgent extends BaseAgent {
  // userId → last 2 snapshots for speed/bearing calc
  private readonly snapshots = new Map<string, UserSnapshot[]>();

  constructor(io: Server) {
    super('TripDetectorAgent', io);
  }

  protected async onStart() {
    this.io.on('connection', (socket: any) => {
      socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (payload: any) => {
        if (payload?.lat == null) return;
        this.addSnapshot(socket.userId, payload.lat, payload.lng);
        await this.detectTrips(socket.userId);
      });
    });
  }

  protected async onStop() {
    this.snapshots.clear();
  }

  private addSnapshot(userId: string, lat: number, lng: number) {
    const list = this.snapshots.get(userId) ?? [];
    list.push({ lat, lng, ts: Date.now() });
    if (list.length > 2) list.shift();
    this.snapshots.set(userId, list);
  }

  private getVelocity(userId: string): { speedMps: number; headingDeg: number } | null {
    const snaps = this.snapshots.get(userId);
    if (!snaps || snaps.length < 2) return null;
    const [a, b] = snaps;
    const dtSec = (b.ts - a.ts) / 1000;
    if (dtSec <= 0) return null;
    const dist = haversineMeters(a.lat, a.lng, b.lat, b.lng);
    const speedMps = dist / dtSec;
    const headingDeg = bearingDeg(a.lat, a.lng, b.lat, b.lng);
    return { speedMps, headingDeg };
  }

  private async detectTrips(userId: string) {
    const vel = this.getVelocity(userId);
    if (!vel || vel.speedMps < AGENT_CONFIG.TRIP_MIN_SPEED_MPS) return;

    const groups = await Group.find({ 'members.user': userId }).select('_id members').lean();

    for (const group of groups) {
      const memberIds = (group.members as any[]).map((m) => String(m.user));
      const together: string[] = [];

      for (const memberId of memberIds) {
        if (memberId === userId) {
          together.push(memberId);
          continue;
        }
        const friendVel = this.getVelocity(memberId);
        if (!friendVel || friendVel.speedMps < AGENT_CONFIG.TRIP_MIN_SPEED_MPS) continue;

        const angleDiff = Math.abs(vel.headingDeg - friendVel.headingDeg);
        const normalized = Math.min(angleDiff, 360 - angleDiff);
        if (normalized <= AGENT_CONFIG.TRIP_ANGLE_TOLERANCE_DEG) {
          together.push(memberId);
        }
      }

      if (together.length >= AGENT_CONFIG.MEETUP_MIN_USERS) {
        this.io.to(`group:${group._id}`).emit(SOCKET_EVENTS.TRIP_TOGETHER, {
          groupId: String(group._id),
          memberIds: together,
          headingDeg: vel.headingDeg,
          speedMps: Math.round(vel.speedMps * 10) / 10,
        });
      }
    }
  }
}
