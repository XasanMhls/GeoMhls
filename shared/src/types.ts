export type Theme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'ru' | 'uz';

export interface IUserSettings {
  shareLocation: boolean;
  ghostMode: boolean;
  notifications: boolean;
  freezeLocation: boolean;
  theme: Theme;
  language: Language;
}

export interface IUserLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  status: string;
  googleId?: string | null;
  location: IUserLocation;
  settings: IUserSettings;
  createdAt: string;
}

export interface IFriend {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  status: string;
  isOnline: boolean;
}

export interface IDmMessage {
  _id: string;
  conversationId: string;
  participants: string[];
  sender: { _id: string; name: string; avatar: string | null };
  text: string;
  type: 'text' | 'blast';
  createdAt: string;
}

export interface IDmConversation {
  conversationId: string;
  friend: IFriend;
  lastMessage?: IDmMessage;
  unreadCount: number;
}

export interface IFriendRequest {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  status: string;
  isOnline: boolean;
}

export interface IGroupMember {
  _id: string;
  name: string;
  avatar: string;
  status: string;
  location?: IUserLocation;
  isOnline?: boolean;
}

export interface IGroup {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  owner: string | { _id: string; name: string; avatar: string };
  members: IGroupMember[];
  inviteCode: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  groupId: string;
  sender: { _id: string; name: string; avatar: string };
  text: string;
  createdAt: string;
}

export interface ILocationUpdate {
  userId: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface ITypingEvent {
  groupId: string;
  userId: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}

// ── Agent-related types ────────────────────────────────────────────────────

export interface ILocationHistory {
  _id: string;
  userId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  recordedAt: string;
}

export interface IGeofence {
  _id: string;
  owner: string;
  groupId: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  active: boolean;
  createdAt: string;
}

export interface IEtaDestination {
  lat: number;
  lng: number;
  label?: string;
}

export interface IProximityAlert {
  userId: string;
  friendId: string;
  distanceMeters: number;
  lat: number;
  lng: number;
}

export interface IGeofenceEvent {
  geofenceId: string;
  geofenceName: string;
  userId: string;
  lat: number;
  lng: number;
  type: 'enter' | 'exit';
}

export interface IEtaUpdate {
  userId: string;
  groupId: string;
  destination: IEtaDestination;
  etaSeconds: number;
  distanceMeters: number;
}

export interface ITripEvent {
  groupId: string;
  memberIds: string[];
  headingDeg: number;
  speedMps: number;
}

export interface IMeetupSuggestion {
  groupId: string;
  memberIds: string[];
  midpoint: { lat: number; lng: number };
}
