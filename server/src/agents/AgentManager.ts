import type { Server } from 'socket.io';
import type { BaseAgent } from './BaseAgent.js';
import { ProximityAgent } from './ProximityAgent.js';
import { GeofenceAgent } from './GeofenceAgent.js';
import { SafetyCheckAgent } from './SafetyCheckAgent.js';
import { ETAAgent } from './ETAAgent.js';
import { PresenceAgent } from './PresenceAgent.js';
import { LocationHistoryAgent } from './LocationHistoryAgent.js';
import { TripDetectorAgent } from './TripDetectorAgent.js';
import { NotificationQueueAgent } from './NotificationQueueAgent.js';
import { CleanupAgent } from './CleanupAgent.js';
import { MeetupSuggestorAgent } from './MeetupSuggestorAgent.js';

export class AgentManager {
  private agents: BaseAgent[] = [];

  constructor(io: Server) {
    this.agents = [
      new ProximityAgent(io),
      new GeofenceAgent(io),
      new SafetyCheckAgent(io),
      new ETAAgent(io),
      new PresenceAgent(io),
      new LocationHistoryAgent(io),
      new TripDetectorAgent(io),
      new NotificationQueueAgent(io),
      new CleanupAgent(io),
      new MeetupSuggestorAgent(io),
    ];
  }

  async startAll(): Promise<void> {
    await Promise.all(this.agents.map((a) => a.start()));
    console.log(`[AgentManager] ${this.agents.length} agents running`);
  }

  async stopAll(): Promise<void> {
    await Promise.all(this.agents.map((a) => a.stop()));
  }
}
