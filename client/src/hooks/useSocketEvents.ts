import { useEffect } from 'react';
import { SOCKET_EVENTS } from '@geomhls/shared';
import { getSocket } from '@/lib/socket';
import { useGroupsStore } from '@/stores/groupsStore';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useFriendRequestsStore } from '@/stores/friendRequestsStore';
import { useDmStore } from '@/stores/dmStore';
import { useToastStore } from '@/stores/toastStore';
import { sounds } from '@/lib/sounds';

export function useSocketEvents() {
  const updateMemberLocation = useGroupsStore((s) => s.updateMemberLocation);
  const setMemberOnline = useGroupsStore((s) => s.setMemberOnline);
  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const addRequest = useFriendRequestsStore((s) => s.addRequest);
  const addToast = useToastStore((s) => s.addToast);
  const addDmMessage = useDmStore((s) => s.addMessage);
  const setDmTyping = useDmStore((s) => s.setTyping);
  const activeFriendId = useDmStore((s) => s.activeFriendId);

  // Blast state lives in a global ref so DmChatPage can subscribe
  // We publish it via a custom event on window for simplicity
  const dispatchBlast = (emoji: string) => {
    window.dispatchEvent(new CustomEvent('dm:blast', { detail: { emoji } }));
  };

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

    const onFriendRequest = ({ from }: { from: any }) => {
      addRequest(from);
      addToast(`${from.name} хочет добавить тебя в друзья`, 'info', 5000);
    };

    const onFriendRequestAccepted = ({ by }: { by: any }) => {
      addToast(`${by.name} принял(а) твою заявку в друзья`, 'success', 4000);
    };

    const onDmNew = (message: any) => {
      addDmMessage(message, currentUserId ?? '');
      const fromMe = String(message.sender?._id) === currentUserId;
      if (!fromMe) {
        sounds.messageIn();
      }
    };

    const onDmTyping = ({ userId }: { userId: string }) => setDmTyping(userId, true);
    const onDmStopTyping = ({ userId }: { userId: string }) => setDmTyping(userId, false);

    const onDmBlast = ({ emoji }: { emoji: string }) => {
      sounds.emojiBlast();
      dispatchBlast(emoji);
    };

    socket.on(SOCKET_EVENTS.LOCATION_FRIENDS, onLocation);
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_TYPING, onTyping);
    socket.on(SOCKET_EVENTS.MESSAGE_STOP_TYPING, onStopTyping);
    socket.on(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST, onFriendRequest);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);
    socket.on(SOCKET_EVENTS.DM_NEW, onDmNew);
    socket.on(SOCKET_EVENTS.DM_TYPING, onDmTyping);
    socket.on(SOCKET_EVENTS.DM_STOP_TYPING, onDmStopTyping);
    socket.on(SOCKET_EVENTS.DM_BLAST, onDmBlast);

    return () => {
      socket.off(SOCKET_EVENTS.LOCATION_FRIENDS, onLocation);
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_TYPING, onTyping);
      socket.off(SOCKET_EVENTS.MESSAGE_STOP_TYPING, onStopTyping);
      socket.off(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST, onFriendRequest);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);
      socket.off(SOCKET_EVENTS.DM_NEW, onDmNew);
      socket.off(SOCKET_EVENTS.DM_TYPING, onDmTyping);
      socket.off(SOCKET_EVENTS.DM_STOP_TYPING, onDmStopTyping);
      socket.off(SOCKET_EVENTS.DM_BLAST, onDmBlast);
    };
  }, [updateMemberLocation, setMemberOnline, addMessage, setTyping, currentUserId, addRequest, addToast, addDmMessage, setDmTyping, activeFriendId]);
}
