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
  name: string;
  avatar: string;
  status: string;
  googleId?: string | null;
  location: IUserLocation;
  settings: IUserSettings;
  createdAt: string;
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
