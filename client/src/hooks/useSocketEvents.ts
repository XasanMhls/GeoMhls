import { useEffect } from 'react';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { getSocket } from '@/lib/socket';
import { useGroupsStore } from '@/stores/groupsStore';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { sounds } from '@/lib/sounds';

export function useSocketEvents() {
  const updateMemberLocation = useGroupsStore((s) => s.updateMemberLocation);
  const setMemberOnline = useGroupsStore((s) => s.setMemberOnline);
  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onLocation = (payload: any) => {
      updateMemberLocation(payload.userId, {
        lat: payload.lat,
        lng: payload.lng,
        accuracy: payload.accuracy,
        updatedAt: new Date(payload.updatedAt),
      });
    };

    const onNewMessage = (message: any) => {
      addMessage(message);
      if (String(message.sender?._id || message.sender) !== currentUserId) {
        sounds.messageIn();
      }
    };

    const onTyping = ({ userId, groupId }: any) => setTyping(groupId, userId, true);
    const onStopTyping = ({ userId, groupId }: any) => setTyping(groupId, userId, false);
    const onUserOnline = ({ userId }: { userId: string }) => setMemberOnline(userId, true);
    const onUserOffline = ({ userId }: { userId: string }) => setMemberOnline(userId, false);

    socket.on(SOCKET_EVENTS.LOCATION_FRIENDS, onLocation);
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_TYPING, onTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_STOP_TYPING, onStopTyping);
    socket.on(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);

    return () => {
      socket.off(SOCKET_EVENTS.LOCATION_FRIENDS, onLocation);
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_TYPING, onTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_STOP_TYPING, onStopTyping);
      socket.off(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);
    };
  }, [updateMemberLocation, setMemberOnline, addMessage, setTyping, currentUserId]);
}
