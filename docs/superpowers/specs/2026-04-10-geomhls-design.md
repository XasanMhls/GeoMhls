# GeoMhls — Design Specification

Real-time friend location tracking app. Premium UI, mobile-first PWA.

## Overview

GeoMhls lets friends and family see each other's locations on a live map, organize into groups, and chat — all with a polished, Apple-level dark UI.

**Target users:** Friends, families, coworkers who want to stay connected through location sharing.

**Core value:** Know where your people are, instantly, beautifully.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite | Fast dev, HMR, modern build |
| PWA | vite-plugin-pwa (Workbox) | Installable, offline shell, push-ready |
| State | Zustand | Lightweight, great for real-time updates |
| Routing | React Router v6 | SPA standard |
| Animations | Framer Motion | Spring physics, layout animations, gestures |
| CSS | Tailwind CSS 3 | Utility-first, glassmorphism support |
| Map | Mapbox GL JS | Dark map style, custom markers, smooth UX |
| Emoji | emoji-mart | Full emoji picker with search |
| Sounds | Howler.js | Chat sounds, notification audio |
| i18n | i18next + react-i18next | Multi-language: UZ, RU, EN |
| Forms | React Hook Form + Zod | Shared validation with server |
| HTTP | Axios | JWT interceptors, request/response handling |
| Backend | Express 4 | RESTful API |
| Real-time | Socket.io 4 | Bidirectional events for location + chat |
| Database | MongoDB + Mongoose 8 | Document model fits user/group/message schema |
| Auth | bcryptjs + jsonwebtoken + Passport (Google OAuth) | Email/password + Google sign-in |
| Validation | Zod (shared) | Same schemas on client and server |

## Project Structure

```
geomhls/
├── package.json              # npm workspaces root
├── .env.example              # Environment template
├── client/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/            # PWA icons
│   └── src/
│       ├── main.tsx
│       ├── App.tsx           # Router + AnimatePresence
│       ├── assets/
│       │   └── sounds/       # Chat notification sounds
│       ├── components/
│       │   ├── ui/           # Glass cards, buttons, inputs, skeleton
│       │   ├── map/          # MapView, UserMarker, LocationCard
│       │   ├── chat/         # MessageList, MessageInput, EmojiPicker
│       │   ├── groups/       # GroupCard, GroupCreate, InviteModal
│       │   └── layout/       # TabBar, PageTransition, Header
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useSocket.ts
│       │   ├── useLocation.ts
│       │   └── useSound.ts
│       ├── pages/
│       │   ├── Welcome.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Onboarding.tsx    # Enable Location screen
│       │   ├── MapPage.tsx
│       │   ├── GroupsPage.tsx
│       │   ├── ChatPage.tsx
│       │   ├── ChatRoom.tsx
│       │   └── ProfilePage.tsx
│       ├── store/
│       │   ├── authStore.ts
│       │   ├── locationStore.ts
│       │   ├── chatStore.ts
│       │   └── groupStore.ts
│       ├── lib/
│       │   ├── api.ts            # Axios instance + interceptors
│       │   ├── socket.ts         # Socket.io client singleton
│       │   └── mapbox.ts         # Map config + dark style
│       ├── styles/
│       │   └── globals.css       # Tailwind + custom glass utilities
│       └── types/                # Re-exports from shared
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts              # Express + Socket.io bootstrap
│   │   ├── config/
│   │   │   ├── db.ts             # MongoDB connection
│   │   │   ├── passport.ts       # Google OAuth strategy
│   │   │   └── env.ts            # Env validation with Zod
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Group.ts
│   │   │   └── Message.ts
│   │   ├── routes/
│   │   │   ├── auth.ts           # register, login, google, refresh
│   │   │   ├── users.ts          # profile, avatar, settings
│   │   │   ├── groups.ts         # CRUD, invite, join, leave
│   │   │   └── messages.ts       # History fetch
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification
│   │   │   └── validate.ts       # Zod schema middleware
│   │   ├── socket/
│   │   │   ├── index.ts          # Socket.io setup + auth
│   │   │   ├── locationHandler.ts
│   │   │   └── chatHandler.ts
│   │   └── utils/
│   │       └── invite.ts         # Generate 6-char invite codes
│   └── tsconfig.json
└── shared/
    ├── package.json
    └── src/
        ├── schemas.ts            # Zod schemas (auth, message, group)
        ├── types.ts              # TypeScript interfaces
        └── constants.ts          # Event names, limits, config
```

## Data Models

### User
```
{
  _id: ObjectId
  email: string (unique, indexed)
  password: string (bcrypt hash) — null for Google OAuth users
  googleId: string | null
  name: string
  avatar: string (URL, default generated)
  status: string (custom text, max 50 chars)
  location: {
    lat: number
    lng: number
    updatedAt: Date
  }
  settings: {
    shareLocation: boolean (default true)
    ghostMode: boolean (default false)
    notifications: boolean (default true)
  }
  createdAt: Date
}
```

### Group
```
{
  _id: ObjectId
  name: string (max 30 chars)
  emoji: string (single emoji as icon)
  color: string (hex, for gradient accent)
  owner: ObjectId (ref User)
  members: ObjectId[] (ref User)
  inviteCode: string (6 chars, unique, indexed)
  createdAt: Date
}
```

### Message
```
{
  _id: ObjectId
  groupId: ObjectId (ref Group, indexed)
  sender: ObjectId (ref User)
  text: string (max 1000 chars)
  createdAt: Date (indexed)
}
```

**Indexes:**
- User: `{ email: 1 }`, `{ googleId: 1 }` (sparse)
- Group: `{ inviteCode: 1 }`, `{ members: 1 }`
- Message: `{ groupId: 1, createdAt: -1 }` (compound, for paginated chat history)

## API Routes

### Auth
- `POST /api/auth/register` — email + password + name → JWT
- `POST /api/auth/login` — email + password → JWT
- `GET /api/auth/google` — redirect to Google OAuth
- `GET /api/auth/google/callback` — handle OAuth callback → JWT
- `POST /api/auth/refresh` — refresh token → new JWT

### Users
- `GET /api/users/me` — current user profile
- `PATCH /api/users/me` — update name, status, avatar, settings
- `GET /api/users/:id` — public profile (name, avatar, status)

### Groups
- `GET /api/groups` — list user's groups
- `POST /api/groups` — create group
- `GET /api/groups/:id` — group detail with members
- `PATCH /api/groups/:id` — update group (owner only)
- `DELETE /api/groups/:id` — delete group (owner only)
- `POST /api/groups/join` — join by invite code
- `POST /api/groups/:id/leave` — leave group
- `DELETE /api/groups/:id/members/:userId` — kick member (owner only)

### Messages
- `GET /api/groups/:id/messages?before=<cursor>&limit=30` — paginated chat history

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `location:update` | `{ lat, lng }` | User's current position (every 10s) |
| `message:send` | `{ groupId, text }` | Send chat message |
| `message:typing` | `{ groupId }` | Typing indicator start |
| `message:stop-typing` | `{ groupId }` | Typing indicator stop |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `location:friends` | `[{ userId, lat, lng, updatedAt }]` | Batch location update for visible friends |
| `message:new` | `{ _id, groupId, sender, text, createdAt }` | New message in group |
| `message:typing` | `{ groupId, userId, name }` | Someone is typing |
| `group:member-joined` | `{ groupId, user }` | New member joined |
| `group:member-left` | `{ groupId, userId }` | Member left |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

**Socket auth:** JWT token passed in handshake `auth.token`. Server validates before allowing connection.

**Rooms:** Each user auto-joins Socket.io rooms for their groups. Location updates broadcast to all groups the user belongs to.

## Auth Flow

1. User opens app → Welcome screen (if no stored JWT)
2. Register or Login or Google OAuth
3. Server returns `{ accessToken (15min), refreshToken (7d) }`
4. Tokens stored in `localStorage` (access) and `httpOnly cookie` (refresh)
5. Axios interceptor: on 401, attempt refresh, retry original request
6. First-time user → Onboarding: "Enable Location" screen with animated pulse button
7. After location granted → redirect to Map

## Screen Designs

### Welcome Screen
- Full-screen dark gradient background (#0a0a0f → #111118)
- GeoMhls logo (text + location pin icon) centered with glow
- "Get Started" primary button (gradient indigo→purple)
- "Already have an account? Log in" secondary link
- Subtle animated gradient orbs in background

### Login / Register
- Glass card centered on gradient background
- Inputs with glass styling (blur background, subtle border)
- Primary gradient button
- Google sign-in button (white, outlined)
- Smooth page transition (slide + fade via Framer Motion)

### Onboarding — Enable Location
- Large animated location pin icon (pulse + float animation)
- "GeoMhls needs your location to connect you with friends"
- Large gradient "Enable Location" button with ripple effect
- "Maybe later" skip link (sets shareLocation: false)
- Background: animated radial gradient pulse synced with icon

### Map (Main)
- Mapbox dark style filling entire screen above tab bar
- Friend markers: circular avatars (40px) with colored ring matching group color
  - Pulse animation on marker (CSS keyframe, scales ring)
  - Small green dot for online status
- Tap marker → bottom glass card slides up:
  - Avatar, name, status text
  - "Last seen: 2 min ago"
  - Distance from you
  - Group badge
- Top-left: group filter dropdown (glass pill)
- Bottom-right: FAB "locate me" button (glass circle, GPS icon)

### Groups
- Header: "Groups" title
- List of group cards (glass, rounded):
  - Group emoji + name + member count
  - Colored left border matching group color
  - Preview: top 3 member avatars (overlapping circles)
- FAB: "+" create group button
- Create modal: name input, emoji picker, color picker (preset gradients)
- After creation: share invite code/link modal

### Chat
- Chat list: groups with last message preview, unread badge
- Chat room:
  - Messages: bubbles (glass for others, gradient for mine)
  - Sender avatar + name on other's messages
  - Timestamps (relative: "2m ago")
  - Typing indicator: "Alex is typing..." with dot animation
  - Input bar: text input + emoji button + send button
  - Emoji picker: emoji-mart sliding up from bottom
  - Sound: soft "pop" on new message (Howler.js)

### Profile
- User avatar (large, editable, circular with gradient ring)
- Name + status (editable inline)
- Settings section (glass cards):
  - Share Location toggle (gradient thumb)
  - Ghost Mode toggle
  - Notifications toggle
- "Log Out" button (subtle red)

## Design System

### Colors
```
--bg-primary: #0a0a0f
--bg-secondary: #111118
--bg-tertiary: #1a1a24
--glass-bg: rgba(255, 255, 255, 0.05)
--glass-border: rgba(255, 255, 255, 0.08)
--glass-hover: rgba(255, 255, 255, 0.08)
--gradient-primary: linear-gradient(135deg, #6366f1, #a855f7)
--gradient-secondary: linear-gradient(135deg, #ec4899, #f97316)
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.6)
--text-tertiary: rgba(255, 255, 255, 0.3)
--success: #22c55e
--danger: #ef4444
--online: #22c55e
```

### Glass Effect (Tailwind utilities)
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### Typography
- Font: Inter (400, 500, 600, 700)
- Headings: 600-700 weight, white
- Body: 400, rgba(255,255,255,0.6)
- Small: 400, rgba(255,255,255,0.3)

### Spacing & Radius
- Border radius: 20px (modals), 16px (cards), 12px (buttons/inputs), 50% (avatars)
- Padding: 16px (cards), 12px (inputs), 20px (page padding)

### Animations (Framer Motion)
- Page transitions: slide + fade (0.3s spring)
- Card entrance: staggered fade-up (0.05s delay per item)
- Marker pulse: CSS keyframe (scale 1→1.5→1, opacity 1→0, 2s loop)
- Button press: scale(0.97) spring
- Tab switch: layout animation with shared element
- Message appear: slide up + fade (0.2s)
- Glass card slide-up: spring(damping: 25, stiffness: 300)
- Skeleton shimmer: CSS keyframe linear gradient sweep

### Sounds
- New message received: soft "pop" (100ms)
- Message sent: subtle "whoosh" (80ms)
- User joined group: soft chime (200ms)

### Theme Support
- Dark mode (default) and Light mode toggle
- Theme stored in localStorage + Zustand
- Light mode colors:
  - `--bg-primary: #f8f9fa`, `--bg-secondary: #ffffff`, `--bg-tertiary: #f0f0f5`
  - `--glass-bg: rgba(0, 0, 0, 0.03)`, `--glass-border: rgba(0, 0, 0, 0.08)`
  - `--text-primary: #111118`, `--text-secondary: rgba(0, 0, 0, 0.6)`
  - Gradients stay the same (brand identity)
  - Mapbox: light map style (`mapbox://styles/mapbox/light-v11`)
- Toggle in Profile page + system preference detection

### Internationalization (i18n)
- Languages: English (EN), Russian (RU), Uzbek (UZ)
- Default: EN, auto-detect from browser `navigator.language`
- Library: i18next + react-i18next
- Translation files: `client/src/i18n/{en,ru,uz}.json`
- All UI text goes through `useTranslation()` hook — no hardcoded strings
- Language selector in Profile page
- Language stored in localStorage

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT access tokens: 15min expiry, stored in memory/localStorage
- JWT refresh tokens: 7 days, httpOnly cookie
- Socket.io: JWT verified on handshake, reject unauthorized
- Input validation: Zod on all endpoints
- Rate limiting: express-rate-limit on auth routes (5 attempts/min)
- CORS: whitelist client origin only
- MongoDB: no raw queries, Mongoose schemas enforce structure
- Invite codes: cryptographically random (crypto.randomBytes)

## Environment Variables

```env
# Server
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<random-64-char>
JWT_REFRESH_SECRET=<random-64-char>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
CLIENT_URL=http://localhost:5173
PORT=5000

# Client
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=<mapbox-public-token>
VITE_SOCKET_URL=http://localhost:5000
```

## PWA Configuration

- App name: GeoMhls
- Theme color: #0a0a0f
- Background color: #0a0a0f
- Display: standalone
- Orientation: portrait
- Icons: 192x192, 512x512 (generated)
- Service worker: cache app shell, network-first for API calls
