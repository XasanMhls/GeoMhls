import type { Server } from 'socket.io';

export abstract class BaseAgent {
  protected readonly name: string;
  protected readonly io: Server;
  private running = false;

  constructor(name: string, io: Server) {
    this.name = name;
    this.io = io;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    console.log(`[Agent:${this.name}] started`);
    await this.onStart();
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    await this.onStop();
    console.log(`[Agent:${this.name}] stopped`);
  }

  get isRunning() {
    return this.running;
  }

  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
}
