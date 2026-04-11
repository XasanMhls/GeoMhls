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
  TYPING_TIMEOUT_MS: 2000,
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
