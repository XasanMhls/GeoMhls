import express from 'express';
import http from 'node:http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import groupRoutes from './routes/groups.js';
import messageRoutes from './routes/messages.js';
import geofenceRoutes from './routes/geofences.js';
import historyRoutes from './routes/history.js';
import { createSocketServer } from './socket/index.js';
import { AgentManager } from './agents/AgentManager.js';

async function bootstrap() {
  await connectDB();
  configurePassport();

  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'geomhls' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/geofences', geofenceRoutes);
  app.use('/api/history', historyRoutes);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const httpServer = http.createServer(app);
  const io = createSocketServer(httpServer);

  const agentManager = new AgentManager(io);
  await agentManager.startAll();

  process.on('SIGTERM', async () => {
    await agentManager.stopAll();
    process.exit(0);
  });

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 GeoMhls server running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap:', err);
  process.exit(1);
});
