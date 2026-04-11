import { create } from 'zustand';
import type { IGroup } from '@geomhls/shared';
import { api } from '@/lib/api';

interface GroupsState {
  groups: IGroup[];
  activeGroupId: string | null;
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (input: { name: string; emoji: string; color: string }) => Promise<IGroup>;
  joinGroup: (inviteCode: string) => Promise<IGroup>;
  leaveGroup: (id: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  setActiveGroup: (id: string | null) => void;
  updateMemberLocation: (
    userId: string,
    loc: { lat: number; lng: number; accuracy?: number; updatedAt: Date },
  ) => void;
  setMemberOnline: (userId: string, isOnline: boolean) => void;
}

const patchMembers = (groups: IGroup[], userId: string, patch: (m: any) => any): IGroup[] =>
  groups.map((g) => ({
    ...g,
    members: g.members.map((m: any) =>
      String(m.user?._id || m.user) === userId ? patch(m) : m,
    ),
  }));

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  activeGroupId: null,
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/groups');
      set({ groups: data.groups });
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (input) => {
    const { data } = await api.post('/groups', input);
    set({ groups: [data.group, ...get().groups] });
    return data.group;
  },

  joinGroup: async (inviteCode) => {
    const { data } = await api.post('/groups/join', { inviteCode });
    const exists = get().groups.some((g) => g._id === data.group._id);
    set({ groups: exists ? get().groups : [data.group, ...get().groups] });
    return data.group;
  },

  leaveGroup: async (id) => {
    await api.post(`/groups/${id}/leave`);
    set({ groups: get().groups.filter((g) => g._id !== id) });
  },

  deleteGroup: async (id) => {
    await api.delete(`/groups/${id}`);
    set({ groups: get().groups.filter((g) => g._id !== id) });
  },

  setActiveGroup: (id) => set({ activeGroupId: id }),

  updateMemberLocation: (userId, loc) => {
    set({ groups: patchMembers(get().groups, userId, (m) => ({ ...m, user: { ...m.user, location: loc } })) });
  },

  setMemberOnline: (userId, isOnline) => {
    set({ groups: patchMembers(get().groups, userId, (m) => ({ ...m, user: { ...m.user, isOnline } })) });
  },
}));
