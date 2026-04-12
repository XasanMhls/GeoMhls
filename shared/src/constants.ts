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
  // Agent-generated events
  PROXIMITY_ALERT: 'proximity:alert',
  GEOFENCE_ENTER: 'geofence:enter',
  GEOFENCE_EXIT: 'geofence:exit',
  SAFETY_CHECK_IN: 'safety:check-in',
  ETA_UPDATE: 'eta:update',
  PRESENCE_IDLE: 'presence:idle',
  TRIP_TOGETHER: 'trip:together',
  MEETUP_SUGGEST: 'meetup:suggest',
  // Direct messages
  DM_SEND: 'dm:send',
  DM_NEW: 'dm:new',
  DM_TYPING: 'dm:typing',
  DM_STOP_TYPING: 'dm:stop-typing',
  DM_BLAST: 'dm:blast',
  // Friend requests
  FRIEND_REQUEST: 'friend:request',
  FRIEND_REQUEST_ACCEPTED: 'friend:accepted',
  FRIEND_REQUEST_DECLINED: 'friend:declined',
  // Client → Server agent commands
  ETA_SET: 'eta:set',
  ETA_CLEAR: 'eta:clear',
} as const;

export const LIMITS = {
  LOCATION_INTERVAL_MS: 10_000,
  MESSAGE_MAX_LENGTH: 1000,
  GROUP_NAME_MAX: 30,
  STATUS_MAX: 50,
  MESSAGES_PER_PAGE: 30,
  INVITE_CODE_LENGTH: 6,
  TYPING_TIMEOUT_MS: 2000,
} as const;

export const AGENT_CONFIG = {
  PROXIMITY_THRESHOLD_M: 200,       // meters — alert when friends get this close
  SAFETY_IDLE_MS: 2 * 60 * 60_000,  // 2 hours without movement → safety check
  PRESENCE_IDLE_MS: 3 * 60_000,     // 3 min no location update → idle
  ETA_BROADCAST_INTERVAL_MS: 30_000, // broadcast ETA every 30s
  TRIP_MIN_SPEED_MPS: 1.4,          // ~5km/h minimum to count as "moving"
  TRIP_ANGLE_TOLERANCE_DEG: 45,     // heading similarity for "together" detection
  LOCATION_HISTORY_TTL_DAYS: 7,
  MESSAGE_TTL_DAYS: 30,
  CLEANUP_INTERVAL_MS: 6 * 60 * 60_000, // run cleanup every 6 hours
  MEETUP_MIN_USERS: 2,
} as const;

export const GROUP_COLORS = [
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#ef4444',
] as const;

export const GROUP_EMOJIS = [
  '👨‍👩‍👧‍👦',
  '👫',
  '💼',
  '🏫',
  '🏠',
  '⚽',
  '🎮',
  '🎵',
  '✈️',
  '🍕',
  '❤️',
  '🔥',
] as const;
