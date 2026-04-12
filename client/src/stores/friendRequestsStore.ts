import { create } from 'zustand';
import type { IFriend } from '@geomhls/shared';

interface FriendRequestsState {
  requests: IFriend[];
  setRequests: (requests: IFriend[]) => void;
  addRequest: (from: IFriend) => void;
  removeRequest: (userId: string) => void;
}

export const useFriendRequestsStore = create<FriendRequestsState>((set) => ({
  requests: [],
  setRequests: (requests) => set({ requests }),
  addRequest: (from) =>
    set((s) => {
      if (s.requests.some((r) => r.id === from.id)) return s;
      return { requests: [...s.requests, from] };
    }),
  removeRequest: (userId) =>
    set((s) => ({ requests: s.requests.filter((r) => r.id !== userId) })),
}));
