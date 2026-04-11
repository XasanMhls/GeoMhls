# GeoMhls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build GeoMhls — a real-time friend location tracking PWA with premium glassmorphism UI, chat, groups, and multi-language support.

**Architecture:** Monorepo with npm workspaces: `shared` (Zod schemas + types), `server` (Express + Socket.io + Mongoose), `client` (React + Vite + Tailwind). Real-time location and chat via Socket.io. Auth via JWT (email/password + Google OAuth). Mapbox GL JS for dark/light map.

**Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, Mapbox GL JS, i18next, emoji-mart, Howler.js, Express 4, Socket.io 4, Mongoose 8, Zod, bcryptjs, jsonwebtoken, Passport

---

## File Structure

```
geomhls/
├── package.json                    # npm workspaces root
├── .env.example                    # Env template
├── .gitignore
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Re-export all
│       ├── schemas.ts              # Zod validation schemas
│       ├── types.ts                # TypeScript interfaces
│       └── constants.ts            # Socket event names, limits
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Express + Socket.io bootstrap
│       ├── config/
│       │   ├── db.ts               # MongoDB connection
│       │   ├── env.ts              # Env validation
│       │   └── passport.ts         # Google OAuth strategy
│       ├── middleware/
│       │   ├── auth.ts             # JWT verification
│       │   └── validate.ts         # Zod middleware
│       ├── models/
│       │   ├── User.ts
│       │   ├── Group.ts
│       │   └── Message.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── users.ts
│       │   ├── groups.ts
│       │   └── messages.ts
│       ├── socket/
│       │   ├── index.ts            # Socket.io init + auth
│       │   ├── locationHandler.ts
│       │   └── chatHandler.ts
│       └── utils/
│           └── invite.ts           # Invite code generator
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   │   └── icons/                  # PWA icons (placeholder)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── i18n/
│       │   ├── index.ts            # i18next config
│       │   ├── en.json
│       │   ├── ru.json
│       │   └── uz.json
│       ├── assets/
│       │   └── sounds/
│       │       ├── pop.mp3
│       │       ├── whoosh.mp3
│       │       └── chime.mp3
│       ├── styles/
│       │   └── globals.css         # Tailwind base + glass utilities + themes
│       ├── lib/
│       │   ├── api.ts              # Axios instance
│       │   ├── socket.ts           # Socket.io singleton
│       │   └── mapbox.ts           # Map config
│       ├── store/
│       │   ├── authStore.ts
│       │   ├── locationStore.ts
│       │   ├── chatStore.ts
│       │   ├── groupStore.ts
│       │   └── themeStore.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useSocket.ts
│       │   ├── useLocation.ts
│       │   └── useSound.ts
│       ├── components/
│       │   ├── ui/
│       │   │   ├── GlassCard.tsx
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Toggle.tsx
│       │   │   ├── Skeleton.tsx
│       │   │   ├── Avatar.tsx
│       │   │   └── Modal.tsx
│       │   ├── layout/
│       │   │   ├── TabBar.tsx
│       │   │   ├── PageTransition.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── map/
│       │   │   ├── MapView.tsx
│       │   │   ├── UserMarker.tsx
│       │   │   └── LocationCard.tsx
│       │   ├── chat/
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   └── TypingIndicator.tsx
│       │   └── groups/
│       │       ├── GroupCard.tsx
│       │       ├── CreateGroupModal.tsx
│       │       └── InviteModal.tsx
│       └── pages/
│           ├── Welcome.tsx
│           ├── Login.tsx
│           ├── Register.tsx
│           ├── Onboarding.tsx
│           ├── MapPage.tsx
│           ├── GroupsPage.tsx
│           ├── ChatPage.tsx
│           ├── ChatRoom.tsx
│           └── ProfilePage.tsx
```

---

### Task 1: Project Scaffolding & Monorepo Setup

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`
- Create: `shared/package.json`, `shared/tsconfig.json`
- Create: `server/package.json`, `server/tsconfig.json`
- Create: `client/package.json`, `client/tsconfig.json`

- [ ] **Step 1: Initialize git repo**

```bash
cd C:/Users/user/Desktop/blink
git init
```

- [ ] **Step 2: Create root package.json with workspaces**

Create `package.json`:
```json
{
  "name": "geomhls",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["shared", "server", "client"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w shared && npm run build -w server && npm run build -w client"
  },
  "devDependencies": {
    "concurrently": "^9.1.2",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 3: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
.env
.superpowers/
*.log
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:
```env
# Server
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geomhls?retryWrites=true&w=majority
JWT_SECRET=your-64-char-random-secret-here
JWT_REFRESH_SECRET=your-64-char-random-refresh-secret-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
CLIENT_URL=http://localhost:5173
PORT=5000

# Client (prefix with VITE_)
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your-mapbox-public-token
VITE_SOCKET_URL=http://localhost:5000
```

- [ ] **Step 5: Create shared package**

Create `shared/package.json`:
```json
{
  "name": "@geomhls/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "zod": "^3.24.2"
  }
}
```

Create `shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create server package**

Create `server/package.json`:
```json
{
  "name": "@geomhls/server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@geomhls/shared": "*",
    "express": "^4.21.2",
    "socket.io": "^4.8.1",
    "mongoose": "^8.12.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.5.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/passport-google-oauth20": "^2.0.16",
    "@types/cookie-parser": "^1.4.8",
    "@types/cors": "^2.8.17",
    "tsx": "^4.19.3"
  }
}
```

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Create client package**

Create `client/package.json`:
```json
{
  "name": "@geomhls/client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@geomhls/shared": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.2",
    "zustand": "^5.0.3",
    "framer-motion": "^12.4.7",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1",
    "mapbox-gl": "^3.9.3",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^4.1.3",
    "i18next": "^24.2.2",
    "react-i18next": "^15.4.1",
    "i18next-browser-languagedetector": "^8.0.4",
    "@emoji-mart/react": "^1.1.1",
    "@emoji-mart/data": "^1.2.1",
    "howler": "^2.2.4",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@types/mapbox-gl": "^3.4.1",
    "@types/howler": "^2.2.12",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.1.0",
    "vite-plugin-pwa": "^0.21.1",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.5.3",
    "autoprefixer": "^10.4.20"
  }
}
```

Create `client/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

- [ ] **Step 9: Commit scaffolding**

```bash
git add -A
git commit -m "chore: scaffold monorepo with shared, server, client packages"
```

---

### Task 2: Shared Package — Types, Schemas, Constants

**Files:**
- Create: `shared/src/types.ts`, `shared/src/schemas.ts`, `shared/src/constants.ts`, `shared/src/index.ts`

- [ ] **Step 1: Create types.ts**

Create `shared/src/types.ts`:
```ts
export interface IUser {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  status: string;
  googleId?: string;
  location: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  settings: {
    shareLocation: boolean;
    ghostMode: boolean;
    notifications: boolean;
    theme: 'dark' | 'light' | 'system';
    language: 'en' | 'ru' | 'uz';
  };
  createdAt: string;
}

export interface IGroup {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  owner: string;
  members: IUser[];
  inviteCode: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  groupId: string;
  sender: IUser;
  text: string;
  createdAt: string;
}

export interface ILocationUpdate {
  userId: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}
```

- [ ] **Step 2: Create schemas.ts**

Create `shared/src/schemas.ts`:
```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(50).trim(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  status: z.string().max(50).trim().optional(),
  avatar: z.string().url().optional(),
  settings: z.object({
    shareLocation: z.boolean().optional(),
    ghostMode: z.boolean().optional(),
    notifications: z.boolean().optional(),
    theme: z.enum(['dark', 'light', 'system']).optional(),
    language: z.enum(['en', 'ru', 'uz']).optional(),
  }).optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  emoji: z.string().min(1).max(4),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(30).trim().optional(),
  emoji: z.string().min(1).max(4).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().length(6),
});

export const sendMessageSchema = z.object({
  groupId: z.string().min(1),
  text: z.string().min(1).max(1000).trim(),
});

export const locationUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
```

- [ ] **Step 3: Create constants.ts**

Create `shared/src/constants.ts`:
```ts
export const SOCKET_EVENTS = {
  LOCATION_UPDATE: 'location:update',
  LOCATION_FRIENDS: 'location:friends',
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_TYPING: 'message:typing',
  MESSAGE_STOP_TYPING: 'message:stop-typing',
  GROUP_MEMBER_JOINED: 'group:member-joined',
  GROUP_MEMBER_LEFT: 'group:member-left',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
} as const;

export const LIMITS = {
  LOCATION_INTERVAL_MS: 10_000,
  MESSAGE_MAX_LENGTH: 1000,
  GROUP_NAME_MAX: 30,
  STATUS_MAX: 50,
  MESSAGES_PER_PAGE: 30,
  INVITE_CODE_LENGTH: 6,
} as const;

export const GROUP_COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f97316',
  '#22c55e', '#06b6d4', '#3b82f6', '#ef4444',
] as const;
```

- [ ] **Step 4: Create index.ts barrel**

Create `shared/src/index.ts`:
```ts
export * from './types';
export * from './schemas';
export * from './constants';
```

- [ ] **Step 5: Commit**

```bash
git add shared/
git commit -m "feat: add shared package with types, Zod schemas, and constants"
```

---

### Task 3: Server — Config, Database, Models

**Files:**
- Create: `server/src/config/env.ts`, `server/src/config/db.ts`
- Create: `server/src/models/User.ts`, `server/src/models/Group.ts`, `server/src/models/Message.ts`

- [ ] **Step 1: Create env config**

Create `server/src/config/env.ts`:
```ts
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CLIENT_URL: z.string().url(),
  PORT: z.coerce.number().default(5000),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Create database connection**

Create `server/src/config/db.ts`:
```ts
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
```

- [ ] **Step 3: Create User model**

Create `server/src/models/User.ts`:
```ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  email: string;
  password: string | null;
  googleId: string | null;
  name: string;
  avatar: string;
  status: string;
  location: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  settings: {
    shareLocation: boolean;
    ghostMode: boolean;
    notifications: boolean;
    theme: 'dark' | 'light' | 'system';
    language: 'en' | 'ru' | 'uz';
  };
  createdAt: Date;
}

const userSchema = new Schema<IUserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null, sparse: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  avatar: { type: String, default: '' },
  status: { type: String, default: '', maxlength: 50 },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  settings: {
    shareLocation: { type: Boolean, default: true },
    ghostMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    language: { type: String, enum: ['en', 'ru', 'uz'], default: 'en' },
  },
}, { timestamps: true });

userSchema.index({ googleId: 1 }, { sparse: true });

export const User = mongoose.model<IUserDoc>('User', userSchema);
```

- [ ] **Step 4: Create Group model**

Create `server/src/models/Group.ts`:
```ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupDoc extends Document {
  name: string;
  emoji: string;
  color: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  inviteCode: string;
  createdAt: Date;
}

const groupSchema = new Schema<IGroupDoc>({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  emoji: { type: String, required: true },
  color: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, required: true, unique: true, length: 6 },
}, { timestamps: true });

groupSchema.index({ inviteCode: 1 });
groupSchema.index({ members: 1 });

export const Group = mongoose.model<IGroupDoc>('Group', groupSchema);
```

- [ ] **Step 5: Create Message model**

Create `server/src/models/Message.ts`:
```ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDoc extends Document {
  groupId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessageDoc>({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

messageSchema.index({ groupId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessageDoc>('Message', messageSchema);
```

- [ ] **Step 6: Commit**

```bash
git add server/src/config/ server/src/models/
git commit -m "feat: add server config, database connection, and Mongoose models"
```

---

### Task 4: Server — Middleware & Utils

**Files:**
- Create: `server/src/middleware/auth.ts`, `server/src/middleware/validate.ts`, `server/src/utils/invite.ts`

- [ ] **Step 1: Create JWT auth middleware**

Create `server/src/middleware/auth.ts`:
```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

- [ ] **Step 2: Create Zod validation middleware**

Create `server/src/middleware/validate.ts`:
```ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
```

- [ ] **Step 3: Create invite code generator**

Create `server/src/utils/invite.ts`:
```ts
import crypto from 'crypto';

export function generateInviteCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/middleware/ server/src/utils/
git commit -m "feat: add auth middleware, validation middleware, and invite code generator"
```

---

### Task 5: Server — Auth Routes

**Files:**
- Create: `server/src/routes/auth.ts`, `server/src/config/passport.ts`

- [ ] **Step 1: Create auth routes**

Create `server/src/routes/auth.ts`:
```ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { registerSchema, loginSchema } from '@geomhls/shared';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';

const router = Router();

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function sanitizeUser(user: any) {
  const { password, __v, ...rest } = user.toObject();
  return rest;
}

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 12);
    const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({ email, password: hash, name, avatar });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: sanitizeUser(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${env.CLIENT_URL}/auth/callback?token=${accessToken}`);
  }
);

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

export default router;
```

- [ ] **Step 2: Create Passport Google strategy**

Create `server/src/config/passport.ts`:
```ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { env } from './env.js';

passport.use(new GoogleStrategy({
  clientID: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.findOne({ email: profile.emails?.[0]?.value });
      if (user) {
        user.googleId = profile.id;
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value || `https://api.dicebear.com/9.x/initials/svg?seed=${profile.displayName}`,
        });
      }
    }

    done(null, user);
  } catch (err) {
    done(err as Error);
  }
}));
```

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/auth.ts server/src/config/passport.ts
git commit -m "feat: add auth routes with register, login, refresh, Google OAuth"
```

---

### Task 6: Server — User, Group, Message Routes

**Files:**
- Create: `server/src/routes/users.ts`, `server/src/routes/groups.ts`, `server/src/routes/messages.ts`

- [ ] **Step 1: Create user routes**

Create `server/src/routes/users.ts`:
```ts
import { Router, Response } from 'express';
import { updateProfileSchema } from '@geomhls/shared';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authMiddleware);

// Get current user
router.get('/me', async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-password -__v');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update profile
router.patch('/me', validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const updates: any = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.avatar) updates.avatar = req.body.avatar;
  if (req.body.settings) {
    for (const [key, val] of Object.entries(req.body.settings)) {
      updates[`settings.${key}`] = val;
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true }).select('-password -__v');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Get public profile
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select('name avatar status');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export default router;
```

- [ ] **Step 2: Create group routes**

Create `server/src/routes/groups.ts`:
```ts
import { Router, Response } from 'express';
import { createGroupSchema, updateGroupSchema, joinGroupSchema } from '@geomhls/shared';
import { Group } from '../models/Group.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateInviteCode } from '../utils/invite.js';

const router = Router();

router.use(authMiddleware);

// List user's groups
router.get('/', async (req: AuthRequest, res: Response) => {
  const groups = await Group.find({ members: req.userId })
    .populate('members', 'name avatar status')
    .populate('owner', 'name avatar');
  res.json(groups);
});

// Create group
router.post('/', validate(createGroupSchema), async (req: AuthRequest, res: Response) => {
  const { name, emoji, color } = req.body;
  let inviteCode = generateInviteCode();

  // Ensure unique invite code
  while (await Group.findOne({ inviteCode })) {
    inviteCode = generateInviteCode();
  }

  const group = await Group.create({
    name, emoji, color,
    owner: req.userId,
    members: [req.userId],
    inviteCode,
  });

  const populated = await group.populate([
    { path: 'members', select: 'name avatar status' },
    { path: 'owner', select: 'name avatar' },
  ]);

  res.status(201).json(populated);
});

// Get group detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.userId })
    .populate('members', 'name avatar status location settings')
    .populate('owner', 'name avatar');
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json(group);
});

// Update group
router.patch('/:id', validate(updateGroupSchema), async (req: AuthRequest, res: Response) => {
  const group = await Group.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $set: req.body },
    { new: true }
  ).populate('members', 'name avatar status').populate('owner', 'name avatar');

  if (!group) return res.status(404).json({ error: 'Group not found or not owner' });
  res.json(group);
});

// Delete group
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const group = await Group.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!group) return res.status(404).json({ error: 'Group not found or not owner' });
  res.json({ message: 'Group deleted' });
});

// Join group by invite code
router.post('/join', validate(joinGroupSchema), async (req: AuthRequest, res: Response) => {
  const group = await Group.findOne({ inviteCode: req.body.inviteCode });
  if (!group) return res.status(404).json({ error: 'Invalid invite code' });

  if (group.members.some((m) => m.toString() === req.userId)) {
    return res.status(400).json({ error: 'Already a member' });
  }

  group.members.push(req.userId as any);
  await group.save();

  const populated = await group.populate([
    { path: 'members', select: 'name avatar status' },
    { path: 'owner', select: 'name avatar' },
  ]);

  res.json(populated);
});

// Leave group
router.post('/:id/leave', async (req: AuthRequest, res: Response) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (group.owner.toString() === req.userId) {
    return res.status(400).json({ error: 'Owner cannot leave. Delete group or transfer ownership.' });
  }

  group.members = group.members.filter((m) => m.toString() !== req.userId);
  await group.save();
  res.json({ message: 'Left group' });
});

// Kick member
router.delete('/:id/members/:userId', async (req: AuthRequest, res: Response) => {
  const group = await Group.findOne({ _id: req.params.id, owner: req.userId });
  if (!group) return res.status(404).json({ error: 'Group not found or not owner' });

  group.members = group.members.filter((m) => m.toString() !== req.params.userId);
  await group.save();
  res.json({ message: 'Member removed' });
});

export default router;
```

- [ ] **Step 3: Create message routes**

Create `server/src/routes/messages.ts`:
```ts
import { Router, Response } from 'express';
import { LIMITS } from '@geomhls/shared';
import { Message } from '../models/Message.js';
import { Group } from '../models/Group.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Get paginated messages for a group
router.get('/:groupId/messages', async (req: AuthRequest, res: Response) => {
  const group = await Group.findOne({ _id: req.params.groupId, members: req.userId });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const { before, limit } = req.query;
  const query: any = { groupId: req.params.groupId };

  if (before) {
    query.createdAt = { $lt: new Date(before as string) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit) || LIMITS.MESSAGES_PER_PAGE)
    .populate('sender', 'name avatar')
    .lean();

  res.json(messages.reverse());
});

export default router;
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/
git commit -m "feat: add user, group, and message API routes"
```

---

### Task 7: Server — Socket.io Setup

**Files:**
- Create: `server/src/socket/index.ts`, `server/src/socket/locationHandler.ts`, `server/src/socket/chatHandler.ts`

- [ ] **Step 1: Create Socket.io main setup**

Create `server/src/socket/index.ts`:
```ts
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { handleLocation } from './locationHandler.js';
import { handleChat } from './chatHandler.js';

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await User.findById(payload.userId).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Join rooms for all groups
    const groups = await Group.find({ members: userId });
    for (const group of groups) {
      socket.join(`group:${group._id}`);
    }

    // Broadcast online status to group members
    for (const group of groups) {
      socket.to(`group:${group._id}`).emit(SOCKET_EVENTS.USER_ONLINE, { userId });
    }

    handleLocation(io, socket);
    handleChat(io, socket);

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      const userGroups = await Group.find({ members: userId });
      for (const group of userGroups) {
        socket.to(`group:${group._id}`).emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
      }
    });
  });

  return io;
}
```

- [ ] **Step 2: Create location handler**

Create `server/src/socket/locationHandler.ts`:
```ts
import { Server, Socket } from 'socket.io';
import { locationUpdateSchema, SOCKET_EVENTS } from '@geomhls/shared';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

export function handleLocation(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (data: unknown) => {
    const result = locationUpdateSchema.safeParse(data);
    if (!result.success) return;

    const userId = socket.data.user._id.toString();
    const { lat, lng } = result.data;

    // Update user location in DB
    await User.findByIdAndUpdate(userId, {
      $set: {
        'location.lat': lat,
        'location.lng': lng,
        'location.updatedAt': new Date(),
      },
    });

    // Broadcast to all groups the user is in
    const groups = await Group.find({ members: userId });
    for (const group of groups) {
      socket.to(`group:${group._id}`).emit(SOCKET_EVENTS.LOCATION_FRIENDS, [{
        userId,
        lat,
        lng,
        updatedAt: new Date().toISOString(),
      }]);
    }
  });
}
```

- [ ] **Step 3: Create chat handler**

Create `server/src/socket/chatHandler.ts`:
```ts
import { Server, Socket } from 'socket.io';
import { sendMessageSchema, SOCKET_EVENTS } from '@geomhls/shared';
import { Message } from '../models/Message.js';
import { Group } from '../models/Group.js';

export function handleChat(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: unknown) => {
    const result = sendMessageSchema.safeParse(data);
    if (!result.success) return;

    const userId = socket.data.user._id.toString();
    const { groupId, text } = result.data;

    // Verify membership
    const group = await Group.findOne({ _id: groupId, members: userId });
    if (!group) return;

    const message = await Message.create({
      groupId,
      sender: userId,
      text,
    });

    const populated = await message.populate('sender', 'name avatar');

    io.to(`group:${groupId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, populated);
  });

  socket.on(SOCKET_EVENTS.MESSAGE_TYPING, (data: { groupId: string }) => {
    const user = socket.data.user;
    socket.to(`group:${data.groupId}`).emit(SOCKET_EVENTS.MESSAGE_TYPING, {
      groupId: data.groupId,
      userId: user._id.toString(),
      name: user.name,
    });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_STOP_TYPING, (data: { groupId: string }) => {
    socket.to(`group:${data.groupId}`).emit(SOCKET_EVENTS.MESSAGE_STOP_TYPING, {
      groupId: data.groupId,
      userId: socket.data.user._id.toString(),
    });
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/socket/
git commit -m "feat: add Socket.io setup with location and chat handlers"
```

---

### Task 8: Server — Express Bootstrap

**Files:**
- Create: `server/src/index.ts`

- [ ] **Step 1: Create main server entry**

Create `server/src/index.ts`:
```ts
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import './config/passport.js';
import { setupSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import groupRoutes from './routes/groups.js';
import messageRoutes from './routes/messages.js';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rate limiting on auth
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, try again later' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', messageRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Socket.io
setupSocket(server);

// Start
async function start() {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start();
```

- [ ] **Step 2: Add dotenv to server dependencies**

```bash
cd C:/Users/user/Desktop/blink && npm install dotenv -w server
```

- [ ] **Step 3: Commit**

```bash
git add server/src/index.ts server/package.json
git commit -m "feat: add Express server bootstrap with all routes and Socket.io"
```

---

### Task 9: Client — Vite, Tailwind, PWA Config

**Files:**
- Create: `client/vite.config.ts`, `client/tailwind.config.js`, `client/postcss.config.js`, `client/index.html`
- Create: `client/src/styles/globals.css`

- [ ] **Step 1: Create Vite config**

Create `client/vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GeoMhls',
        short_name: 'GeoMhls',
        description: 'Track your friends in real-time',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'mapbox-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 2: Create Tailwind config with dark/light theme**

Create `client/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#252530',
        },
        light: {
          50: '#f8f9fa',
          100: '#f0f0f5',
          200: '#e4e4eb',
          300: '#d1d1db',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
```

Create `client/postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create globals.css with glass utilities and themes**

Create `client/src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  body {
    @apply font-sans antialiased;
    -webkit-tap-highlight-color: transparent;
  }

  /* Dark theme (default) */
  .dark body, .dark {
    --bg-primary: #0a0a0f;
    --bg-secondary: #111118;
    --bg-tertiary: #1a1a24;
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-hover: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-tertiary: rgba(255, 255, 255, 0.3);
    --map-style: mapbox://styles/mapbox/dark-v11;
    color-scheme: dark;
  }

  /* Light theme */
  .light body, .light {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f0f0f5;
    --glass-bg: rgba(0, 0, 0, 0.03);
    --glass-border: rgba(0, 0, 0, 0.08);
    --glass-hover: rgba(0, 0, 0, 0.06);
    --text-primary: #111118;
    --text-secondary: rgba(0, 0, 0, 0.6);
    --text-tertiary: rgba(0, 0, 0, 0.35);
    --map-style: mapbox://styles/mapbox/light-v11;
    color-scheme: light;
  }
}

@layer components {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
  }

  .glass-hover:hover {
    background: var(--glass-hover);
  }

  .gradient-primary {
    background: linear-gradient(135deg, #6366f1, #a855f7);
  }

  .gradient-secondary {
    background: linear-gradient(135deg, #ec4899, #f97316);
  }

  .gradient-text {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--glass-bg) 25%,
      var(--glass-hover) 50%,
      var(--glass-bg) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: 8px;
  }

  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 2px;
}
```

- [ ] **Step 4: Create index.html**

Create `client/index.html`:
```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
  <meta name="theme-color" content="#0a0a0f" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>GeoMhls</title>
  <link rel="icon" type="image/svg+xml" href="/icons/icon-192.png" />
</head>
<body class="bg-[var(--bg-primary)] text-[var(--text-primary)]">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 5: Create placeholder PWA icons directory**

```bash
mkdir -p C:/Users/user/Desktop/blink/client/public/icons
```

Create a simple SVG as placeholder `client/public/icons/icon-192.png` — for now just touch the file; real icons later.

- [ ] **Step 6: Commit**

```bash
git add client/vite.config.ts client/tailwind.config.js client/postcss.config.js client/index.html client/src/styles/ client/public/
git commit -m "feat: add Vite, Tailwind, PWA config with dark/light theme support"
```

---

### Task 10: Client — i18n Setup (EN, RU, UZ)

**Files:**
- Create: `client/src/i18n/index.ts`, `client/src/i18n/en.json`, `client/src/i18n/ru.json`, `client/src/i18n/uz.json`

- [ ] **Step 1: Create i18next config**

Create `client/src/i18n/index.ts`:
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import ru from './ru.json';
import uz from './uz.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

- [ ] **Step 2: Create English translations**

Create `client/src/i18n/en.json`:
```json
{
  "app": { "name": "GeoMhls" },
  "welcome": {
    "title": "Stay Connected",
    "subtitle": "See where your friends and family are, in real time",
    "getStarted": "Get Started",
    "haveAccount": "Already have an account?",
    "logIn": "Log In"
  },
  "auth": {
    "login": "Log In",
    "register": "Sign Up",
    "email": "Email",
    "password": "Password",
    "name": "Full Name",
    "googleSignIn": "Continue with Google",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "signUp": "Sign Up",
    "logIn": "Log In",
    "invalidCredentials": "Invalid email or password",
    "emailTaken": "Email already in use"
  },
  "onboarding": {
    "title": "Enable Location",
    "description": "GeoMhls needs your location to connect you with friends and family",
    "enable": "Enable Location",
    "skip": "Maybe Later"
  },
  "map": {
    "title": "Map",
    "locateMe": "Locate Me",
    "allGroups": "All Groups",
    "lastSeen": "Last seen",
    "minutesAgo": "{{count}}m ago",
    "online": "Online",
    "navigate": "Navigate"
  },
  "groups": {
    "title": "Groups",
    "create": "Create Group",
    "name": "Group Name",
    "members": "{{count}} members",
    "invite": "Invite",
    "inviteCode": "Invite Code",
    "joinGroup": "Join Group",
    "enterCode": "Enter invite code",
    "join": "Join",
    "leave": "Leave Group",
    "delete": "Delete Group",
    "shareLink": "Share Link",
    "copied": "Copied!",
    "noGroups": "No groups yet",
    "createFirst": "Create your first group to get started"
  },
  "chat": {
    "title": "Chat",
    "typeMessage": "Type a message...",
    "send": "Send",
    "typing": "{{name}} is typing...",
    "noMessages": "No messages yet",
    "startConversation": "Start the conversation!"
  },
  "profile": {
    "title": "Profile",
    "editName": "Edit Name",
    "status": "Status",
    "statusPlaceholder": "What's on your mind?",
    "settings": "Settings",
    "shareLocation": "Share Location",
    "ghostMode": "Ghost Mode",
    "ghostModeDesc": "Hide your location from everyone",
    "notifications": "Notifications",
    "theme": "Theme",
    "dark": "Dark",
    "light": "Light",
    "system": "System",
    "language": "Language",
    "logout": "Log Out"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry"
  }
}
```

- [ ] **Step 3: Create Russian translations**

Create `client/src/i18n/ru.json`:
```json
{
  "app": { "name": "GeoMhls" },
  "welcome": {
    "title": "Оставайтесь на связи",
    "subtitle": "Смотрите, где ваши друзья и семья, в реальном времени",
    "getStarted": "Начать",
    "haveAccount": "Уже есть аккаунт?",
    "logIn": "Войти"
  },
  "auth": {
    "login": "Войти",
    "register": "Регистрация",
    "email": "Электронная почта",
    "password": "Пароль",
    "name": "Полное имя",
    "googleSignIn": "Войти через Google",
    "noAccount": "Нет аккаунта?",
    "hasAccount": "Уже есть аккаунт?",
    "signUp": "Зарегистрироваться",
    "logIn": "Войти",
    "invalidCredentials": "Неверный email или пароль",
    "emailTaken": "Email уже используется"
  },
  "onboarding": {
    "title": "Включить геолокацию",
    "description": "GeoMhls нужна ваша геолокация, чтобы связать вас с друзьями и семьёй",
    "enable": "Включить геолокацию",
    "skip": "Позже"
  },
  "map": {
    "title": "Карта",
    "locateMe": "Найти меня",
    "allGroups": "Все группы",
    "lastSeen": "Был(а)",
    "minutesAgo": "{{count}} мин назад",
    "online": "Онлайн",
    "navigate": "Маршрут"
  },
  "groups": {
    "title": "Группы",
    "create": "Создать группу",
    "name": "Название группы",
    "members": "{{count}} участников",
    "invite": "Пригласить",
    "inviteCode": "Код приглашения",
    "joinGroup": "Присоединиться",
    "enterCode": "Введите код приглашения",
    "join": "Вступить",
    "leave": "Покинуть группу",
    "delete": "Удалить группу",
    "shareLink": "Поделиться ссылкой",
    "copied": "Скопировано!",
    "noGroups": "Групп пока нет",
    "createFirst": "Создайте первую группу, чтобы начать"
  },
  "chat": {
    "title": "Чат",
    "typeMessage": "Введите сообщение...",
    "send": "Отправить",
    "typing": "{{name}} печатает...",
    "noMessages": "Сообщений пока нет",
    "startConversation": "Начните общение!"
  },
  "profile": {
    "title": "Профиль",
    "editName": "Изменить имя",
    "status": "Статус",
    "statusPlaceholder": "О чём думаете?",
    "settings": "Настройки",
    "shareLocation": "Делиться геолокацией",
    "ghostMode": "Режим невидимки",
    "ghostModeDesc": "Скрыть вашу геолокацию от всех",
    "notifications": "Уведомления",
    "theme": "Тема",
    "dark": "Тёмная",
    "light": "Светлая",
    "system": "Системная",
    "language": "Язык",
    "logout": "Выйти"
  },
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "delete": "Удалить",
    "confirm": "Подтвердить",
    "loading": "Загрузка...",
    "error": "Что-то пошло не так",
    "retry": "Повторить"
  }
}
```

- [ ] **Step 4: Create Uzbek translations**

Create `client/src/i18n/uz.json`:
```json
{
  "app": { "name": "GeoMhls" },
  "welcome": {
    "title": "Aloqada qoling",
    "subtitle": "Do'stlaringiz va oilangiz qayerdaligini real vaqtda ko'ring",
    "getStarted": "Boshlash",
    "haveAccount": "Akkauntingiz bormi?",
    "logIn": "Kirish"
  },
  "auth": {
    "login": "Kirish",
    "register": "Ro'yxatdan o'tish",
    "email": "Elektron pochta",
    "password": "Parol",
    "name": "To'liq ism",
    "googleSignIn": "Google orqali kirish",
    "noAccount": "Akkauntingiz yo'qmi?",
    "hasAccount": "Akkauntingiz bormi?",
    "signUp": "Ro'yxatdan o'tish",
    "logIn": "Kirish",
    "invalidCredentials": "Noto'g'ri email yoki parol",
    "emailTaken": "Bu email allaqachon ishlatilmoqda"
  },
  "onboarding": {
    "title": "Joylashuvni yoqish",
    "description": "GeoMhls sizni do'stlaringiz va oilangiz bilan bog'lash uchun joylashuvingizni bilishi kerak",
    "enable": "Joylashuvni yoqish",
    "skip": "Keyinroq"
  },
  "map": {
    "title": "Xarita",
    "locateMe": "Meni top",
    "allGroups": "Barcha guruhlar",
    "lastSeen": "Oxirgi marta",
    "minutesAgo": "{{count}} daqiqa oldin",
    "online": "Onlayn",
    "navigate": "Yo'nalish"
  },
  "groups": {
    "title": "Guruhlar",
    "create": "Guruh yaratish",
    "name": "Guruh nomi",
    "members": "{{count}} a'zo",
    "invite": "Taklif qilish",
    "inviteCode": "Taklif kodi",
    "joinGroup": "Guruhga qo'shilish",
    "enterCode": "Taklif kodini kiriting",
    "join": "Qo'shilish",
    "leave": "Guruhdan chiqish",
    "delete": "Guruhni o'chirish",
    "shareLink": "Havolani ulashish",
    "copied": "Nusxalandi!",
    "noGroups": "Guruhlar hali yo'q",
    "createFirst": "Boshlash uchun birinchi guruhni yarating"
  },
  "chat": {
    "title": "Chat",
    "typeMessage": "Xabar yozing...",
    "send": "Yuborish",
    "typing": "{{name}} yozmoqda...",
    "noMessages": "Xabarlar hali yo'q",
    "startConversation": "Suhbatni boshlang!"
  },
  "profile": {
    "title": "Profil",
    "editName": "Ismni o'zgartirish",
    "status": "Holat",
    "statusPlaceholder": "Nimalar haqida o'ylayapsiz?",
    "settings": "Sozlamalar",
    "shareLocation": "Joylashuvni ulashish",
    "ghostMode": "Ko'rinmas rejim",
    "ghostModeDesc": "Joylashuvingizni hammadan yashirish",
    "notifications": "Bildirishnomalar",
    "theme": "Mavzu",
    "dark": "Qorong'u",
    "light": "Yorug'",
    "system": "Tizim",
    "language": "Til",
    "logout": "Chiqish"
  },
  "common": {
    "save": "Saqlash",
    "cancel": "Bekor qilish",
    "delete": "O'chirish",
    "confirm": "Tasdiqlash",
    "loading": "Yuklanmoqda...",
    "error": "Xatolik yuz berdi",
    "retry": "Qayta urinish"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/i18n/
git commit -m "feat: add i18n setup with English, Russian, Uzbek translations"
```

---

### Task 11: Client — Stores (Zustand) & Lib

**Files:**
- Create: `client/src/store/authStore.ts`, `client/src/store/themeStore.ts`, `client/src/store/locationStore.ts`, `client/src/store/groupStore.ts`, `client/src/store/chatStore.ts`
- Create: `client/src/lib/api.ts`, `client/src/lib/socket.ts`

- [ ] **Step 1: Create API client with JWT interceptor**

Create `client/src/lib/api.ts`:
```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 2: Create Socket.io client**

Create `client/src/lib/socket.ts`:
```ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  s.auth = { token: localStorage.getItem('accessToken') };
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
```

- [ ] **Step 3: Create auth store**

Create `client/src/store/authStore.ts`:
```ts
import { create } from 'zustand';
import type { IUser } from '@geomhls/shared';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface AuthState {
  user: IUser | null;
  loading: boolean;
  setUser: (user: IUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user });
    connectSocket();
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    localStorage.setItem('accessToken', data.accessToken);
    set({ user: data.user });
    connectSocket();
  },

  logout: async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    disconnectSocket();
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ loading: false });
        return;
      }
      const { data } = await api.get('/api/users/me');
      set({ user: data, loading: false });
      connectSocket();
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, loading: false });
    }
  },

  updateProfile: async (updates) => {
    const { data } = await api.patch('/api/users/me', updates);
    set({ user: data });
  },
}));
```

- [ ] **Step 4: Create theme store**

Create `client/src/store/themeStore.ts`:
```ts
import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'dark' | 'light') {
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(resolved);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#0a0a0f' : '#f8f9fa');
}

const stored = (localStorage.getItem('theme') as Theme) || 'dark';
const initialResolved = resolveTheme(stored);
applyTheme(initialResolved);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,
  resolved: initialResolved,

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(resolved);
    set({ theme, resolved });
  },
}));

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const state = useThemeStore.getState();
  if (state.theme === 'system') {
    const resolved = getSystemTheme();
    applyTheme(resolved);
    useThemeStore.setState({ resolved });
  }
});
```

- [ ] **Step 5: Create location store**

Create `client/src/store/locationStore.ts`:
```ts
import { create } from 'zustand';
import type { ILocationUpdate } from '@geomhls/shared';

interface LocationState {
  myLocation: { lat: number; lng: number } | null;
  friendLocations: Map<string, ILocationUpdate>;
  setMyLocation: (loc: { lat: number; lng: number }) => void;
  updateFriendLocation: (update: ILocationUpdate) => void;
  updateFriendLocations: (updates: ILocationUpdate[]) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  myLocation: null,
  friendLocations: new Map(),

  setMyLocation: (loc) => set({ myLocation: loc }),

  updateFriendLocation: (update) =>
    set((state) => {
      const map = new Map(state.friendLocations);
      map.set(update.userId, update);
      return { friendLocations: map };
    }),

  updateFriendLocations: (updates) =>
    set((state) => {
      const map = new Map(state.friendLocations);
      for (const u of updates) {
        map.set(u.userId, u);
      }
      return { friendLocations: map };
    }),
}));
```

- [ ] **Step 6: Create group store**

Create `client/src/store/groupStore.ts`:
```ts
import { create } from 'zustand';
import type { IGroup } from '@geomhls/shared';
import api from '../lib/api';

interface GroupState {
  groups: IGroup[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (name: string, emoji: string, color: string) => Promise<IGroup>;
  joinGroup: (inviteCode: string) => Promise<IGroup>;
  leaveGroup: (id: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addGroup: (group: IGroup) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  loading: true,

  fetchGroups: async () => {
    const { data } = await api.get('/api/groups');
    set({ groups: data, loading: false });
  },

  createGroup: async (name, emoji, color) => {
    const { data } = await api.post('/api/groups', { name, emoji, color });
    set({ groups: [...get().groups, data] });
    return data;
  },

  joinGroup: async (inviteCode) => {
    const { data } = await api.post('/api/groups/join', { inviteCode });
    set({ groups: [...get().groups, data] });
    return data;
  },

  leaveGroup: async (id) => {
    await api.post(`/api/groups/${id}/leave`);
    set({ groups: get().groups.filter((g) => g._id !== id) });
  },

  deleteGroup: async (id) => {
    await api.delete(`/api/groups/${id}`);
    set({ groups: get().groups.filter((g) => g._id !== id) });
  },

  addGroup: (group) => set({ groups: [...get().groups, group] }),
}));
```

- [ ] **Step 7: Create chat store**

Create `client/src/store/chatStore.ts`:
```ts
import { create } from 'zustand';
import type { IMessage } from '@geomhls/shared';
import api from '../lib/api';

interface ChatState {
  messages: Record<string, IMessage[]>; // groupId -> messages
  typingUsers: Record<string, { userId: string; name: string }[]>;
  loading: boolean;
  fetchMessages: (groupId: string, before?: string) => Promise<IMessage[]>;
  addMessage: (message: IMessage) => void;
  setTyping: (groupId: string, userId: string, name: string) => void;
  clearTyping: (groupId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  typingUsers: {},
  loading: false,

  fetchMessages: async (groupId, before) => {
    set({ loading: true });
    const params = new URLSearchParams();
    if (before) params.set('before', before);
    const { data } = await api.get(`/api/groups/${groupId}/messages?${params}`);
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: before
          ? [...data, ...(state.messages[groupId] || [])]
          : data,
      },
      loading: false,
    }));
    return data;
  },

  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.groupId]: [...(state.messages[message.groupId] || []), message],
      },
    })),

  setTyping: (groupId, userId, name) =>
    set((state) => {
      const current = state.typingUsers[groupId] || [];
      if (current.some((t) => t.userId === userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [groupId]: [...current, { userId, name }],
        },
      };
    }),

  clearTyping: (groupId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [groupId]: (state.typingUsers[groupId] || []).filter((t) => t.userId !== userId),
      },
    })),
}));
```

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/ client/src/store/
git commit -m "feat: add Zustand stores and API/socket client libraries"
```

---

### Task 12: Client — UI Components (Design System)

**Files:**
- Create: `client/src/components/ui/GlassCard.tsx`, `Button.tsx`, `Input.tsx`, `Toggle.tsx`, `Skeleton.tsx`, `Avatar.tsx`, `Modal.tsx`

- [ ] **Step 1: Create GlassCard component**

Create `client/src/components/ui/GlassCard.tsx`:
```tsx
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`glass p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create Button component**

Create `client/src/components/ui/Button.tsx`:
```tsx
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'gradient-primary text-white shadow-lg shadow-indigo-500/25',
    secondary: 'glass text-[var(--text-primary)] glass-hover',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 3: Create Input component**

Create `client/src/components/ui/Input.tsx`:
```tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all backdrop-blur-glass ${error ? 'border-red-500/50' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
```

- [ ] **Step 4: Create Toggle component**

Create `client/src/components/ui/Toggle.tsx`:
```tsx
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-4 glass rounded-2xl glass-hover"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-300 ${
          checked ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-[var(--glass-border)]'
        }`}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}
```

- [ ] **Step 5: Create Skeleton, Avatar, Modal**

Create `client/src/components/ui/Skeleton.tsx`:
```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
```

Create `client/src/components/ui/Avatar.tsx`:
```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  ring?: string;
}

const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-20 h-20' };
const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-2xl' };

export function Avatar({ src, name, size = 'md', online, ring }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <div
        className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold text-white gradient-primary ${ring ? 'ring-2' : ''}`}
        style={ring ? { '--tw-ring-color': ring } as any : undefined}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={textSizes[size]}>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)] ${
            online ? 'bg-green-500' : 'bg-[var(--text-tertiary)]'
          }`}
        />
      )}
    </div>
  );
}
```

Create `client/src/components/ui/Modal.tsx`:
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 glass p-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: '-40%', scale: 0.95 }}
            animate={{ opacity: 1, y: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: '-40%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/ui/
git commit -m "feat: add UI design system components — GlassCard, Button, Input, Toggle, Avatar, Modal, Skeleton"
```

---

### Task 13: Client — Layout Components (TabBar, PageTransition, ProtectedRoute)

**Files:**
- Create: `client/src/components/layout/TabBar.tsx`, `PageTransition.tsx`, `ProtectedRoute.tsx`

- [ ] **Step 1: Create TabBar**

Create `client/src/components/layout/TabBar.tsx`:
```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const tabs = [
  { path: '/map', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', label: 'map.title' },
  { path: '/groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'groups.title' },
  { path: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'chat.title' },
  { path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'profile.title' },
];

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      <div className="bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-[var(--glass-border)]">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-4">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3"
              >
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 gradient-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <svg
                  className={`w-6 h-6 transition-colors ${active ? 'text-indigo-400' : 'text-[var(--text-tertiary)]'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={active ? 2 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className={`text-[10px] font-medium ${active ? 'text-indigo-400' : 'text-[var(--text-tertiary)]'}`}>
                  {t(tab.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create PageTransition**

Create `client/src/components/layout/PageTransition.tsx`:
```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create ProtectedRoute**

Create `client/src/components/layout/ProtectedRoute.tsx`:
```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Skeleton } from '../ui/Skeleton';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/layout/
git commit -m "feat: add TabBar with animated indicator, PageTransition, ProtectedRoute"
```

---

### Task 14: Client — Hooks (useSocket, useLocation, useSound)

**Files:**
- Create: `client/src/hooks/useSocket.ts`, `client/src/hooks/useLocation.ts`, `client/src/hooks/useSound.ts`

- [ ] **Step 1: Create useSocket hook**

Create `client/src/hooks/useSocket.ts`:
```ts
import { useEffect } from 'react';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { getSocket } from '../lib/socket';
import { useLocationStore } from '../store/locationStore';
import { useChatStore } from '../store/chatStore';

export function useSocket() {
  const updateFriendLocations = useLocationStore((s) => s.updateFriendLocations);
  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const clearTyping = useChatStore((s) => s.clearTyping);

  useEffect(() => {
    const socket = getSocket();

    socket.on(SOCKET_EVENTS.LOCATION_FRIENDS, (updates) => {
      updateFriendLocations(updates);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message) => {
      addMessage(message);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_TYPING, ({ groupId, userId, name }) => {
      setTyping(groupId, userId, name);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STOP_TYPING, ({ groupId, userId }) => {
      clearTyping(groupId, userId);
    });

    return () => {
      socket.off(SOCKET_EVENTS.LOCATION_FRIENDS);
      socket.off(SOCKET_EVENTS.MESSAGE_NEW);
      socket.off(SOCKET_EVENTS.MESSAGE_TYPING);
      socket.off(SOCKET_EVENTS.MESSAGE_STOP_TYPING);
    };
  }, [updateFriendLocations, addMessage, setTyping, clearTyping]);
}
```

- [ ] **Step 2: Create useLocation hook**

Create `client/src/hooks/useLocation.ts`:
```ts
import { useEffect, useRef } from 'react';
import { SOCKET_EVENTS, LIMITS } from '@geomhls/shared';
import { getSocket } from '../lib/socket';
import { useLocationStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';

export function useLocationTracking() {
  const setMyLocation = useLocationStore((s) => s.setMyLocation);
  const user = useAuthStore((s) => s.user);
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocation = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user?.settings.shareLocation) return;

    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        lastLocation.current = loc;
        setMyLocation(loc);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    // Send location to server at interval
    intervalId.current = setInterval(() => {
      if (lastLocation.current) {
        const socket = getSocket();
        if (socket.connected) {
          socket.emit(SOCKET_EVENTS.LOCATION_UPDATE, lastLocation.current);
        }
      }
    }, LIMITS.LOCATION_INTERVAL_MS);

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (intervalId.current !== null) {
        clearInterval(intervalId.current);
      }
    };
  }, [user?.settings.shareLocation, setMyLocation]);
}
```

- [ ] **Step 3: Create useSound hook**

Create `client/src/hooks/useSound.ts`:
```ts
import { useCallback, useRef } from 'react';
import { Howl } from 'howler';

const sounds: Record<string, Howl> = {};

function getSound(name: string): Howl {
  if (!sounds[name]) {
    sounds[name] = new Howl({
      src: [`/sounds/${name}.mp3`],
      volume: 0.5,
      preload: true,
    });
  }
  return sounds[name];
}

export function useSound() {
  const enabled = useRef(true);

  const play = useCallback((name: 'pop' | 'whoosh' | 'chime') => {
    if (enabled.current) {
      getSound(name).play();
    }
  }, []);

  const setEnabled = useCallback((val: boolean) => {
    enabled.current = val;
  }, []);

  return { play, setEnabled };
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/
git commit -m "feat: add hooks for socket events, location tracking, and sounds"
```

---

### Task 15: Client — Auth Pages (Welcome, Login, Register)

**Files:**
- Create: `client/src/pages/Welcome.tsx`, `client/src/pages/Login.tsx`, `client/src/pages/Register.tsx`

- [ ] **Step 1: Create Welcome page**

Create `client/src/pages/Welcome.tsx`:
```tsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative z-10 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">{t('app.name')}</h1>
        <p className="text-[var(--text-secondary)] text-lg font-medium mb-2">{t('welcome.title')}</p>
        <p className="text-[var(--text-tertiary)] text-sm max-w-xs mx-auto">{t('welcome.subtitle')}</p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 w-full max-w-xs mt-12 space-y-4"
      >
        <Button fullWidth onClick={() => navigate('/register')}>
          {t('welcome.getStarted')}
        </Button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-center text-sm text-[var(--text-secondary)]"
        >
          {t('welcome.haveAccount')}{' '}
          <span className="text-indigo-400 font-medium">{t('welcome.logIn')}</span>
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create Login page**

Create `client/src/pages/Login.tsx`:
```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@geomhls/shared';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/map');
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-8">{t('auth.login')}</h1>

        <GlassCard className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message as string}
              {...register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••"
              error={errors.password?.message as string}
              {...register('password')}
            />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <Button type="submit" fullWidth loading={loading}>
              {t('auth.logIn')}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--glass-border)]" /></div>
            <div className="relative flex justify-center"><span className="bg-[var(--bg-secondary)] px-3 text-xs text-[var(--text-tertiary)]">or</span></div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('auth.googleSignIn')}
          </Button>
        </GlassCard>

        <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
          {t('auth.noAccount')}{' '}
          <button onClick={() => navigate('/register')} className="text-indigo-400 font-medium">
            {t('auth.signUp')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Create Register page**

Create `client/src/pages/Register.tsx`:
```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@geomhls/shared';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerFn = useAuthStore((s) => s.register);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      await registerFn(data.email, data.password, data.name);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.status === 409 ? t('auth.emailTaken') : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-8">{t('auth.register')}</h1>

        <GlassCard className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('auth.name')}
              placeholder="John Doe"
              error={errors.name?.message as string}
              {...register('name')}
            />
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message as string}
              {...register('email')}
            />
            <Input
              label={t('auth.password')}
              type="password"
              placeholder="••••••"
              error={errors.password?.message as string}
              {...register('password')}
            />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <Button type="submit" fullWidth loading={loading}>
              {t('auth.signUp')}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--glass-border)]" /></div>
            <div className="relative flex justify-center"><span className="bg-[var(--bg-secondary)] px-3 text-xs text-[var(--text-tertiary)]">or</span></div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('auth.googleSignIn')}
          </Button>
        </GlassCard>

        <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
          {t('auth.hasAccount')}{' '}
          <button onClick={() => navigate('/login')} className="text-indigo-400 font-medium">
            {t('auth.logIn')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Welcome.tsx client/src/pages/Login.tsx client/src/pages/Register.tsx
git commit -m "feat: add Welcome, Login, Register pages with glassmorphism and i18n"
```

---

### Task 16: Client — Onboarding & Auth Callback Pages

**Files:**
- Create: `client/src/pages/Onboarding.tsx`, `client/src/pages/AuthCallback.tsx`

- [ ] **Step 1: Create Onboarding page (Enable Location)**

Create `client/src/pages/Onboarding.tsx`:
```tsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEnable = async () => {
    try {
      await navigator.geolocation.getCurrentPosition(() => {});
    } catch {}
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Pulsing background glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating pin icon */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 mb-8"
      >
        <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
          animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-center max-w-xs"
      >
        <h1 className="text-2xl font-bold mb-3">{t('onboarding.title')}</h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{t('onboarding.description')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 w-full max-w-xs mt-10 space-y-4"
      >
        <Button fullWidth onClick={handleEnable}>
          {t('onboarding.enable')}
        </Button>
        <button
          onClick={() => navigate('/map')}
          className="w-full text-center text-sm text-[var(--text-tertiary)]"
        >
          {t('onboarding.skip')}
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create Auth Callback page (for Google OAuth redirect)**

Create `client/src/pages/AuthCallback.tsx`:
```tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectSocket } from '../lib/socket';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      connectSocket();
      refreshUser().then(() => navigate('/map'));
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Onboarding.tsx client/src/pages/AuthCallback.tsx
git commit -m "feat: add Onboarding (Enable Location) and Google OAuth callback pages"
```

---

### Task 17: Client — Map Page & Components

**Files:**
- Create: `client/src/lib/mapbox.ts`, `client/src/components/map/MapView.tsx`, `client/src/components/map/UserMarker.tsx`, `client/src/components/map/LocationCard.tsx`, `client/src/pages/MapPage.tsx`

- [ ] **Step 1: Create Mapbox config**

Create `client/src/lib/mapbox.ts`:
```ts
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function getMapStyle(theme: 'dark' | 'light'): string {
  return theme === 'dark'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';
}

export const DEFAULT_CENTER: [number, number] = [69.2401, 41.2995]; // Tashkent
export const DEFAULT_ZOOM = 12;
```

- [ ] **Step 2: Create MapView component**

Create `client/src/components/map/MapView.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, getMapStyle, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import { useThemeStore } from '../../store/themeStore';
import { useLocationStore } from '../../store/locationStore';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapViewProps {
  onMarkerClick?: (userId: string) => void;
  selectedGroup?: string | null;
  members?: Array<{ _id: string; name: string; avatar: string; online?: boolean }>;
}

export function MapView({ onMarkerClick, members = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const resolved = useThemeStore((s) => s.resolved);
  const myLocation = useLocationStore((s) => s.myLocation);
  const friendLocations = useLocationStore((s) => s.friendLocations);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(resolved),
      center: myLocation ? [myLocation.lng, myLocation.lat] : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style on theme change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle(resolved));
    }
  }, [resolved]);

  // Update friend markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    friendLocations.forEach((loc, userId) => {
      const member = members.find((m) => m._id === userId);
      if (!member) return;

      let marker = markersRef.current.get(userId);

      if (!marker) {
        const el = document.createElement('div');
        el.className = 'friend-marker';
        el.innerHTML = `
          <div class="marker-ring animate-pulse-ring"></div>
          <img src="${member.avatar}" alt="${member.name}" class="marker-avatar" onerror="this.style.display='none'" />
          <div class="marker-fallback">${member.name[0]}</div>
        `;
        el.style.cssText = 'width:44px;height:44px;cursor:pointer;position:relative;';
        el.onclick = () => onMarkerClick?.(userId);

        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map);
        markersRef.current.set(userId, marker);
      } else {
        marker.setLngLat([loc.lng, loc.lat]);
      }
    });
  }, [friendLocations, members, onMarkerClick]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
```

- [ ] **Step 3: Create LocationCard component**

Create `client/src/components/map/LocationCard.tsx`:
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Avatar';

interface LocationCardProps {
  user: { _id: string; name: string; avatar: string; status: string } | null;
  lastSeen?: string;
  online?: boolean;
  onClose: () => void;
}

export function LocationCard({ user, lastSeen, online, onClose }: LocationCardProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-20 left-4 right-4 glass p-4 z-20"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-[var(--text-tertiary)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="lg" online={online} />
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              {user.status && <p className="text-sm text-[var(--text-secondary)]">{user.status}</p>}
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {online ? t('map.online') : lastSeen ? `${t('map.lastSeen')} ${lastSeen}` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Create MapPage**

Create `client/src/pages/MapPage.tsx`:
```tsx
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapView';
import { LocationCard } from '../components/map/LocationCard';
import { useLocationStore } from '../store/locationStore';
import { useGroupStore } from '../store/groupStore';
import { PageTransition } from '../components/layout/PageTransition';

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const myLocation = useLocationStore((s) => s.myLocation);
  const groups = useGroupStore((s) => s.groups);

  const allMembers = groups.flatMap((g) =>
    (selectedGroup === null || g._id === selectedGroup) ? g.members : []
  );

  // Deduplicate members
  const uniqueMembers = Array.from(
    new Map(allMembers.map((m) => [m._id, m])).values()
  );

  const selectedMember = uniqueMembers.find((m) => m._id === selectedUserId) || null;

  const handleLocateMe = useCallback(() => {
    // Map will center on user's location — handled via map ref in production
  }, []);

  return (
    <PageTransition>
      <div className="fixed inset-0 pb-16">
        {/* Group filter */}
        <div className="absolute top-4 left-4 z-20">
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
            className="glass px-4 py-2 text-sm text-[var(--text-primary)] bg-transparent appearance-none cursor-pointer pr-8"
          >
            <option value="">{t('map.allGroups')}</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.emoji} {g.name}</option>
            ))}
          </select>
        </div>

        {/* Locate me FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLocateMe}
          className="absolute bottom-20 right-4 z-20 w-12 h-12 glass rounded-full flex items-center justify-center shadow-lg"
        >
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>

        {/* Map */}
        <MapView
          onMarkerClick={(id) => setSelectedUserId(id)}
          members={uniqueMembers as any}
          selectedGroup={selectedGroup}
        />

        {/* Location card */}
        <LocationCard
          user={selectedMember as any}
          online={true}
          onClose={() => setSelectedUserId(null)}
        />
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 5: Add marker styles to globals.css**

Append to `client/src/styles/globals.css`:
```css

/* Map markers */
.friend-marker {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.marker-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #6366f1;
  opacity: 0.5;
}
.marker-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #6366f1;
  object-fit: cover;
  position: relative;
  z-index: 1;
}
.marker-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  position: absolute;
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/mapbox.ts client/src/components/map/ client/src/pages/MapPage.tsx client/src/styles/globals.css
git commit -m "feat: add Map page with Mapbox, friend markers, and location card"
```

---

### Task 18: Client — Groups Page & Components

**Files:**
- Create: `client/src/components/groups/GroupCard.tsx`, `CreateGroupModal.tsx`, `InviteModal.tsx`, `client/src/pages/GroupsPage.tsx`

- [ ] **Step 1: Create GroupCard**

Create `client/src/components/groups/GroupCard.tsx`:
```tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { IGroup } from '@geomhls/shared';
import { Avatar } from '../ui/Avatar';

interface GroupCardProps {
  group: IGroup;
  onClick: () => void;
  index: number;
}

export function GroupCard({ group, onClick, index }: GroupCardProps) {
  const { t } = useTranslation();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full glass p-4 flex items-center gap-4 glass-hover text-left"
      style={{ borderLeft: `3px solid ${group.color}` }}
    >
      <div className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--glass-bg)]">
        {group.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{group.name}</h3>
        <p className="text-sm text-[var(--text-tertiary)]">
          {t('groups.members', { count: group.members.length })}
        </p>
      </div>
      <div className="flex -space-x-2">
        {group.members.slice(0, 3).map((m) => (
          <Avatar key={m._id} src={m.avatar} name={m.name} size="sm" />
        ))}
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 2: Create CreateGroupModal**

Create `client/src/components/groups/CreateGroupModal.tsx`:
```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GROUP_COLORS } from '@geomhls/shared';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useGroupStore } from '../../store/groupStore';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (groupId: string) => void;
}

const EMOJIS = ['👨‍👩‍👧‍👦', '👫', '💼', '🏫', '🏠', '⚽', '🎮', '🎵', '✈️', '🍕', '❤️', '🔥'];

export function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const { t } = useTranslation();
  const createGroup = useGroupStore((s) => s.createGroup);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👨‍👩‍👧‍👦');
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const group = await createGroup(name.trim(), emoji, color);
      onCreated(group._id);
      onClose();
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">{t('groups.create')}</h2>

      <Input
        label={t('groups.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Family, Work, Friends..."
        maxLength={30}
      />

      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Emoji</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                emoji === e ? 'bg-indigo-500/20 ring-2 ring-indigo-500' : 'bg-[var(--glass-bg)]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Color</p>
        <div className="flex gap-2">
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-primary)]' : ''
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleCreate} loading={loading} className="flex-1">{t('groups.create')}</Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create InviteModal**

Create `client/src/components/groups/InviteModal.tsx`:
```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  inviteCode: string;
}

export function InviteModal({ open, onClose, inviteCode }: InviteModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-2">{t('groups.inviteCode')}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Share this code with friends to join your group</p>

      <div className="glass p-4 text-center">
        <p className="text-3xl font-mono font-bold tracking-[0.3em] gradient-text">
          {inviteCode}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" onClick={handleCopy} fullWidth>
          {copied ? t('groups.copied') : t('groups.shareLink')}
        </Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Create GroupsPage**

Create `client/src/pages/GroupsPage.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGroupStore } from '../store/groupStore';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { InviteModal } from '../components/groups/InviteModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/layout/PageTransition';

export default function GroupsPage() {
  const { t } = useTranslation();
  const { groups, loading, fetchGroups, joinGroup } = useGroupStore();
  const [showCreate, setShowCreate] = useState(false);
  const [inviteGroup, setInviteGroup] = useState<{ code: string } | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleJoin = async () => {
    if (joinCode.length !== 6) return;
    setJoinError('');
    try {
      await joinGroup(joinCode.toUpperCase());
      setJoinCode('');
    } catch {
      setJoinError(t('common.error'));
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-primary)] pb-20 px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">{t('groups.title')}</h1>

        {/* Join group */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder={t('groups.enterCode')}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="font-mono tracking-wider"
          />
          <Button onClick={handleJoin} disabled={joinCode.length !== 6}>
            {t('groups.join')}
          </Button>
        </div>
        {joinError && <p className="text-sm text-red-400 mb-4">{joinError}</p>}

        {/* Groups list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)] mb-2">{t('groups.noGroups')}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{t('groups.createFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group, i) => (
              <GroupCard
                key={group._id}
                group={group}
                index={i}
                onClick={() => setInviteGroup({ code: group.inviteCode })}
              />
            ))}
          </div>
        )}

        {/* Create FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreate(true)}
          className="fixed bottom-20 right-4 w-14 h-14 gradient-primary rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center z-20"
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>

        <CreateGroupModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            const group = groups.find((g) => g._id === id);
            if (group) setInviteGroup({ code: group.inviteCode });
          }}
        />

        {inviteGroup && (
          <InviteModal
            open={!!inviteGroup}
            onClose={() => setInviteGroup(null)}
            inviteCode={inviteGroup.code}
          />
        )}
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/groups/ client/src/pages/GroupsPage.tsx
git commit -m "feat: add Groups page with create, join, invite modals"
```

---

### Task 19: Client — Chat Page & Components

**Files:**
- Create: `client/src/components/chat/MessageBubble.tsx`, `MessageInput.tsx`, `MessageList.tsx`, `TypingIndicator.tsx`
- Create: `client/src/pages/ChatPage.tsx`, `client/src/pages/ChatRoom.tsx`

- [ ] **Step 1: Create chat components**

Create `client/src/components/chat/MessageBubble.tsx`:
```tsx
import { motion } from 'framer-motion';
import type { IMessage } from '@geomhls/shared';
import { Avatar } from '../ui/Avatar';

interface MessageBubbleProps {
  message: IMessage;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
    >
      {!isMine && <Avatar src={message.sender.avatar} name={message.sender.name} size="sm" />}
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && (
          <p className="text-xs text-[var(--text-tertiary)] mb-1 px-1">{message.sender.name}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl ${
          isMine
            ? 'gradient-primary text-white rounded-br-md'
            : 'glass rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <p className={`text-[10px] text-[var(--text-tertiary)] mt-1 px-1 ${isMine ? 'text-right' : ''}`}>
          {time}
        </p>
      </div>
    </motion.div>
  );
}
```

Create `client/src/components/chat/TypingIndicator.tsx`:
```tsx
import { motion } from 'framer-motion';

export function TypingIndicator({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 px-2 py-1"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--text-tertiary)]">{name}</span>
    </motion.div>
  );
}
```

Create `client/src/components/chat/MessageInput.tsx`:
```tsx
import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { getSocket } from '../../lib/socket';
import { useThemeStore } from '../../store/themeStore';

interface MessageInputProps {
  groupId: string;
}

export function MessageInput({ groupId }: MessageInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const resolved = useThemeStore((s) => s.resolved);

  const sendMessage = useCallback(() => {
    if (!text.trim()) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, { groupId, text: text.trim() });
    socket.emit(SOCKET_EVENTS.MESSAGE_STOP_TYPING, { groupId });
    setText('');
    setShowEmoji(false);
  }, [text, groupId]);

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.MESSAGE_TYPING, { groupId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.MESSAGE_STOP_TYPING, { groupId });
    }, 2000);
  }, [groupId]);

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-10"
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={resolved}
              previewPosition="none"
              skinTonePosition="none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 p-3 glass rounded-2xl">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          😊
        </button>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={t('chat.typeMessage')}
          className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none text-sm"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={!text.trim()}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            text.trim() ? 'gradient-primary text-white' : 'bg-[var(--glass-bg)] text-[var(--text-tertiary)]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
```

Create `client/src/components/chat/MessageList.tsx`:
```tsx
import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { IMessage } from '@geomhls/shared';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: IMessage[];
  currentUserId: string;
  typingUsers: { userId: string; name: string }[];
  onLoadMore?: () => void;
}

export function MessageList({ messages, currentUserId, typingUsers, onLoadMore }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0 && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id}
          message={msg}
          isMine={msg.sender._id === currentUserId}
        />
      ))}
      <AnimatePresence>
        {typingUsers
          .filter((t) => t.userId !== currentUserId)
          .map((t) => <TypingIndicator key={t.userId} name={t.name} />)
        }
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 2: Create ChatPage (chat list)**

Create `client/src/pages/ChatPage.tsx`:
```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGroupStore } from '../store/groupStore';
import { useChatStore } from '../store/chatStore';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/layout/PageTransition';

export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { groups, loading, fetchGroups } = useGroupStore();
  const messages = useChatStore((s) => s.messages);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-primary)] pb-20 px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">{t('chat.title')}</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group, i) => {
              const groupMessages = messages[group._id] || [];
              const lastMsg = groupMessages[groupMessages.length - 1];

              return (
                <motion.button
                  key={group._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${group._id}`)}
                  className="w-full glass p-4 flex items-center gap-3 glass-hover text-left"
                >
                  <div className="text-xl w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--glass-bg)]">
                    {group.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{group.name}</h3>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">
                      {lastMsg ? `${lastMsg.sender.name}: ${lastMsg.text}` : t('chat.noMessages')}
                    </p>
                  </div>
                  {lastMsg && (
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 3: Create ChatRoom page**

Create `client/src/pages/ChatRoom.tsx`:
```tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useSound } from '../hooks/useSound';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { PageTransition } from '../components/layout/PageTransition';

export default function ChatRoom() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const groups = useGroupStore((s) => s.groups);
  const { messages, typingUsers, fetchMessages } = useChatStore();
  const { play } = useSound();

  const group = groups.find((g) => g._id === groupId);
  const groupMessages = groupId ? (messages[groupId] || []) : [];
  const groupTyping = groupId ? (typingUsers[groupId] || []) : [];

  useEffect(() => {
    if (groupId) fetchMessages(groupId);
  }, [groupId, fetchMessages]);

  // Play sound on new message (not mine)
  useEffect(() => {
    const last = groupMessages[groupMessages.length - 1];
    if (last && last.sender._id !== user?._id) {
      play('pop');
    }
  }, [groupMessages.length]);

  if (!groupId || !group) return null;

  return (
    <PageTransition>
      <div className="fixed inset-0 flex flex-col bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 glass border-b border-[var(--glass-border)]">
          <button onClick={() => navigate('/chat')} className="text-[var(--text-secondary)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-xl">{group.emoji}</div>
          <div>
            <h2 className="font-semibold text-sm">{group.name}</h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              {t('groups.members', { count: group.members.length })}
            </p>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={groupMessages}
          currentUserId={user?._id || ''}
          typingUsers={groupTyping}
          onLoadMore={() => {
            const oldest = groupMessages[0];
            if (oldest) fetchMessages(groupId, oldest.createdAt);
          }}
        />

        {/* Input */}
        <div className="p-3 safe-bottom">
          <MessageInput groupId={groupId} />
        </div>
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/chat/ client/src/pages/ChatPage.tsx client/src/pages/ChatRoom.tsx
git commit -m "feat: add Chat pages with message bubbles, emoji picker, typing indicators"
```

---

### Task 20: Client — Profile Page

**Files:**
- Create: `client/src/pages/ProfilePage.tsx`

- [ ] **Step 1: Create ProfilePage**

Create `client/src/pages/ProfilePage.tsx`:
```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Avatar } from '../components/ui/Avatar';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { PageTransition } from '../components/layout/PageTransition';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState(user?.status || '');

  if (!user) return null;

  const handleSaveName = async () => {
    if (name.trim() && name !== user.name) {
      await updateProfile({ name: name.trim() } as any);
    }
    setEditingName(false);
  };

  const handleStatusBlur = async () => {
    if (status !== user.status) {
      await updateProfile({ status } as any);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    await updateProfile({ settings: { [key]: value } } as any);
  };

  const handleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    updateProfile({ settings: { language: lang } } as any);
  };

  const handleTheme = (t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    updateProfile({ settings: { theme: t } } as any);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-primary)] pb-20 px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <Avatar src={user.avatar} name={user.name} size="lg" ring="#6366f1" />
          </div>

          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-xl font-bold bg-transparent border-b border-indigo-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button onClick={handleSaveName} className="text-indigo-400 text-sm">{t('common.save')}</button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-xl font-bold">
              {user.name}
            </button>
          )}

          <input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onBlur={handleStatusBlur}
            placeholder={t('profile.statusPlaceholder')}
            className="mt-2 text-sm text-[var(--text-secondary)] text-center bg-transparent outline-none"
            maxLength={50}
          />
        </motion.div>

        {/* Settings */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-1">
            {t('profile.settings')}
          </p>

          <Toggle
            checked={user.settings.shareLocation}
            onChange={(v) => handleToggle('shareLocation', v)}
            label={t('profile.shareLocation')}
          />
          <Toggle
            checked={user.settings.ghostMode}
            onChange={(v) => handleToggle('ghostMode', v)}
            label={t('profile.ghostMode')}
            description={t('profile.ghostModeDesc')}
          />
          <Toggle
            checked={user.settings.notifications}
            onChange={(v) => handleToggle('notifications', v)}
            label={t('profile.notifications')}
          />
        </div>

        {/* Theme */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-1">
            {t('profile.theme')}
          </p>
          <GlassCard className="flex gap-2 p-2">
            {(['dark', 'light', 'system'] as const).map((th) => (
              <button
                key={th}
                onClick={() => handleTheme(th)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  theme === th ? 'gradient-primary text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                {t(`profile.${th}`)}
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Language */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-1">
            {t('profile.language')}
          </p>
          <GlassCard className="flex gap-2 p-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'ru', label: 'Русский' },
              { code: 'uz', label: "O'zbek" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguage(lang.code)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  i18n.language === lang.code ? 'gradient-primary text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Logout */}
        <Button
          variant="danger"
          fullWidth
          onClick={async () => { await logout(); navigate('/'); }}
        >
          {t('profile.logout')}
        </Button>
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/ProfilePage.tsx
git commit -m "feat: add Profile page with theme toggle, language selector, and settings"
```

---

### Task 21: Client — App Entry, Router, Main

**Files:**
- Create: `client/src/main.tsx`, `client/src/App.tsx`

- [ ] **Step 1: Create main.tsx**

Create `client/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 2: Create App.tsx with all routes**

Create `client/src/App.tsx`:
```tsx
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import { useLocationTracking } from './hooks/useLocation';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { TabBar } from './components/layout/TabBar';

import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import AuthCallback from './pages/AuthCallback';
import MapPage from './pages/MapPage';
import GroupsPage from './pages/GroupsPage';
import ChatPage from './pages/ChatPage';
import ChatRoom from './pages/ChatRoom';
import ProfilePage from './pages/ProfilePage';

const MAIN_TABS = ['/map', '/groups', '/chat', '/profile'];

export default function App() {
  const location = useLocation();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  useSocket();
  useLocationTracking();

  const showTabBar = user && MAIN_TABS.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected */}
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:groupId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>

      {showTabBar && <TabBar />}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/main.tsx client/src/App.tsx
git commit -m "feat: add App router with AnimatePresence, TabBar, and all page routes"
```

---

### Task 22: Sound Assets & Final Wiring

**Files:**
- Create: `client/src/assets/sounds/` placeholder files
- Create: `client/public/sounds/` with placeholder audio

- [ ] **Step 1: Create sound placeholders**

The app references `/sounds/pop.mp3`, `/sounds/whoosh.mp3`, `/sounds/chime.mp3`. Create empty placeholder files in `client/public/sounds/`. In production, replace with real short audio clips (can be generated or downloaded from freesound.org).

```bash
mkdir -p C:/Users/user/Desktop/blink/client/public/sounds
touch C:/Users/user/Desktop/blink/client/public/sounds/pop.mp3
touch C:/Users/user/Desktop/blink/client/public/sounds/whoosh.mp3
touch C:/Users/user/Desktop/blink/client/public/sounds/chime.mp3
```

- [ ] **Step 2: Commit**

```bash
git add client/public/sounds/
git commit -m "chore: add placeholder sound files for chat notifications"
```

---

### Task 23: Install Dependencies & Verify Build

- [ ] **Step 1: Install all dependencies**

```bash
cd C:/Users/user/Desktop/blink && npm install
```

- [ ] **Step 2: Create .env for local dev**

Create `.env` in root (NOT committed):
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=change-me-to-random-64-char-string-for-development-only
JWT_REFRESH_SECRET=change-me-to-another-random-64-char-string-for-dev
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_SOCKET_URL=http://localhost:5000
```

- [ ] **Step 3: Verify server compiles**

```bash
cd C:/Users/user/Desktop/blink && npx tsc --noEmit -p server/tsconfig.json
```

Fix any type errors.

- [ ] **Step 4: Verify client compiles**

```bash
cd C:/Users/user/Desktop/blink && npx tsc --noEmit -p client/tsconfig.json
```

Fix any type errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete GeoMhls MVP — full-stack location tracking app"
```
