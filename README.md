# GeoMhls

Real-time friend geolocation tracking app. See where your people are, chat instantly, organize circles.

## Features

- **Live map** — real-time location of your circles (Mapbox GL)
- **Chat** — instant messaging with emoji picker and sounds
- **Circles** — create groups, invite with a 6-digit code
- **Dark / Light mode** — premium glassmorphism UI
- **3 languages** — English, Russian, Uzbek (i18n)
- **PWA** — installable on mobile, works offline
- **Google OAuth + Email** auth with JWT

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 3 |
| State | Zustand |
| Animations | Framer Motion |
| Maps | Mapbox GL JS |
| Backend | Express 4, TypeScript, Socket.io 4 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (access + refresh), Passport.js Google OAuth |
| Shared | Zod schemas, TypeScript types, constants |
| Monorepo | npm workspaces |

## Project Structure

```
blink/
├── shared/           # Shared types, Zod schemas, constants
│   └── src/
├── server/           # Express + Socket.io backend
│   └── src/
│       ├── config/       # env, db, passport
│       ├── middleware/   # auth, validate
│       ├── models/       # User, Group, Message
│       ├── routes/       # auth, users, groups, messages
│       ├── socket/       # Socket.io handlers (location, chat)
│       ├── utils/        # invite code generator
│       └── index.ts      # server entry
├── client/           # React Vite PWA
│   └── src/
│       ├── components/   # UI primitives, layout, map, chat, groups
│       ├── hooks/        # useGeolocation, useSocketEvents
│       ├── i18n/         # en, ru, uz translations
│       ├── lib/          # api, socket, sounds, format, cn
│       ├── pages/        # all app pages
│       ├── stores/       # Zustand (auth, theme, groups, chat)
│       ├── styles/       # globals.css (themes, glass, gradients)
│       └── main.tsx      # entry
├── .env.example      # all env vars documented
└── package.json      # root monorepo
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Mapbox account (free tier works)
- (Optional) Google OAuth credentials

### 1. Clone and install

```bash
git clone <repo-url> blink
cd blink
npm install
```

### 2. Environment variables

```bash
# Server
cp .env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, etc.

# Client
cp .env.example client/.env
# Keep only VITE_* vars in client/.env
```

**Required (server):**
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — random string, 16+ chars
- `JWT_REFRESH_SECRET` — another random string, 16+ chars

**Required (client):**
- `VITE_MAPBOX_TOKEN` — your Mapbox public token

**Optional:**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enables Google sign-in (server runs fine without them)

### 3. Run in development

```bash
npm run dev
```

This starts both server (port 5000) and client (port 5173) concurrently.

Or individually:
```bash
npm run dev:server   # server only
npm run dev:client   # client only
```

### 4. Build for production

```bash
npm run build         # builds client
npm run start         # starts server (serves from dist)
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Email login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Clear refresh cookie |
| GET | /api/auth/me | Get current user |
| GET | /api/auth/google | Google OAuth redirect |
| PATCH | /api/users/me | Update profile |
| PATCH | /api/users/me/settings | Update settings |
| GET | /api/groups | List user's circles |
| POST | /api/groups | Create circle |
| POST | /api/groups/join | Join with invite code |
| PATCH | /api/groups/:id | Update circle |
| DELETE | /api/groups/:id | Delete circle |
| POST | /api/groups/:id/leave | Leave circle |
| GET | /api/messages/:groupId | Get messages (paginated) |

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| location:update | Client → Server | Send location |
| location:friends | Server → Client | Friend location update |
| message:send | Client → Server | Send chat message |
| message:new | Server → Client | New message |
| message:typing | Both | Typing indicator |
| message:stop-typing | Both | Stop typing |
| user:online | Server → Client | User came online |
| user:offline | Server → Client | User went offline |

## License

MIT
