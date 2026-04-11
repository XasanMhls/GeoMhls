import { create } from 'zustand';
import type { IMessage } from '@geomhls/shared';
import { api } from '@/lib/api';

interface ChatState {
  messagesByGroup: Record<string, IMessage[]>;
  lastMessageByGroup: Record<string, IMessage>;
  typingByGroup: Record<string, Set<string>>;
  unreadByGroup: Record<string, number>;
  activeGroupId: string | null;
  fetchMessages: (groupId: string) => Promise<void>;
  fetchLastMessages: () => Promise<void>;
  addMessage: (message: IMessage) => void;
  setTyping: (groupId: string, userId: string, isTyping: boolean) => void;
  setActiveGroup: (id: string | null) => void;
  markRead: (groupId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByGroup: {},
  lastMessageByGroup: {},
  typingByGroup: {},
  unreadByGroup: {},
  activeGroupId: null,

  fetchMessages: async (groupId) => {
    const { data } = await api.get(`/messages/${groupId}`);
    set({
      messagesByGroup: { ...get().messagesByGroup, [groupId]: data.messages },
    });
  },

  fetchLastMessages: async () => {
    try {
      const { data } = await api.get('/messages/latest/all');
      set({ lastMessageByGroup: data.lastMessages });
    } catch {}
  },

  addMessage: (message) => {
    const groupId = String((message as any).group);
    const current = get().messagesByGroup[groupId] || [];
    const lastMessages = { ...get().lastMessageByGroup, [groupId]: message };
    const unread = { ...get().unreadByGroup };

    if (groupId !== get().activeGroupId) {
      unread[groupId] = (unread[groupId] || 0) + 1;
    }

    set({
      messagesByGroup: { ...get().messagesByGroup, [groupId]: [...current, message] },
      lastMessageByGroup: lastMessages,
      unreadByGroup: unread,
    });
  },

  setTyping: (groupId, userId, isTyping) => {
    const current = new Set(get().typingByGroup[groupId] || []);
    if (isTyping) current.add(userId);
    else current.delete(userId);
    set({ typingByGroup: { ...get().typingByGroup, [groupId]: current } });
  },

  setActiveGroup: (id) => {
    const unread = { ...get().unreadByGroup };
    if (id) delete unread[id];
    set({ activeGroupId: id, unreadByGroup: unread });
  },

  markRead: (groupId) => {
    const unread = { ...get().unreadByGroup };
    delete unread[groupId];
    set({ unreadByGroup: unread });
  },
}));
