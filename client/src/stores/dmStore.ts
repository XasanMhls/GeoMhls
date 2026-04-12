import { create } from 'zustand';
import type { IDmMessage, IDmConversation, IFriend } from '@geomhls/shared';
import { api } from '@/lib/api';

interface DmState {
  messagesByFriend: Record<string, IDmMessage[]>;
  conversationIdByFriend: Record<string, string>;
  friendById: Record<string, IFriend>;
  conversations: IDmConversation[];
  typingByFriend: Record<string, boolean>;
  unreadByFriend: Record<string, number>;
  activeFriendId: string | null;

  fetchConversations: () => Promise<void>;
  fetchMessages: (friendId: string) => Promise<string>;
  addMessage: (message: IDmMessage, myUserId: string) => void;
  setTyping: (fromUserId: string, isTyping: boolean) => void;
  setActive: (friendId: string | null) => void;
}

export const useDmStore = create<DmState>((set, get) => ({
  messagesByFriend: {},
  conversationIdByFriend: {},
  friendById: {},
  conversations: [],
  typingByFriend: {},
  unreadByFriend: {},
  activeFriendId: null,

  fetchConversations: async () => {
    try {
      const { data } = await api.get('/dm/conversations');
      set({ conversations: data.conversations });
    } catch {}
  },

  fetchMessages: async (friendId) => {
    const { data } = await api.get(`/dm/${friendId}`);
    set((s) => ({
      messagesByFriend: { ...s.messagesByFriend, [friendId]: data.messages },
      conversationIdByFriend: { ...s.conversationIdByFriend, [friendId]: data.conversationId },
      friendById: data.friend ? { ...s.friendById, [friendId]: data.friend } : s.friendById,
    }));
    return data.conversationId as string;
  },

  addMessage: (message, myUserId) => {
    const friendId = message.participants.find((id) => id !== myUserId) ?? '';
    if (!friendId) return;

    const current = get().messagesByFriend[friendId] || [];
    const unread = { ...get().unreadByFriend };

    if (friendId !== get().activeFriendId) {
      unread[friendId] = (unread[friendId] || 0) + 1;
    }

    const convos = get().conversations.map((c) => {
      if (c.friend.id === friendId || c.conversationId === message.conversationId) {
        return { ...c, lastMessage: message };
      }
      return c;
    });

    set({
      messagesByFriend: { ...get().messagesByFriend, [friendId]: [...current, message] },
      conversationIdByFriend: {
        ...get().conversationIdByFriend,
        [friendId]: message.conversationId,
      },
      unreadByFriend: unread,
      conversations: convos,
    });
  },

  setTyping: (fromUserId, isTyping) => {
    set((s) => ({ typingByFriend: { ...s.typingByFriend, [fromUserId]: isTyping } }));
    if (isTyping) {
      setTimeout(() => {
        set((s) => ({ typingByFriend: { ...s.typingByFriend, [fromUserId]: false } }));
      }, 3000);
    }
  },

  setActive: (friendId) => {
    const unread = { ...get().unreadByFriend };
    if (friendId) delete unread[friendId];
    set({ activeFriendId: friendId, unreadByFriend: unread });
  },
}));
