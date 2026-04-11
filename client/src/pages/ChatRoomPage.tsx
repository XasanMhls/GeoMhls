import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SOCKET_EVENTS, LIMITS } from '@geomhls/shared';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChatStore } from '@/stores/chatStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { sounds } from '@/lib/sounds';
import { Avatar } from '@/components/ui/Avatar';
import { MemberSheet } from '@/components/groups/MemberSheet';

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const groupId = id!;

  const messages = useChatStore((s) => s.messagesByGroup[groupId] || []);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const setActiveChat = useChatStore((s) => s.setActiveGroup);
  const typing = useChatStore((s) => s.typingByGroup[groupId]);
  const groups = useGroupsStore((s) => s.groups);
  const currentUser = useAuthStore((s) => s.user);
  const group = useMemo(() => groups.find((g: any) => g._id === groupId), [groups, groupId]);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!groupId) return;
    // If groups haven't been loaded yet (e.g. page refresh), load them first
    if (groups.length === 0) {
      useGroupsStore.getState().fetchGroups();
    }
    fetchMessages(groupId).catch(() => {});
    setActiveChat(groupId);
    return () => setActiveChat(null);
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = (text: string) => {
    getSocket()?.emit(SOCKET_EVENTS.MESSAGE_SEND, { groupId, text });
    sounds.messageOut();
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_TYPING, { groupId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.MESSAGE_STOP_TYPING, { groupId });
    }, LIMITS.TYPING_TIMEOUT_MS);
  };

  const typingUsers = typing ? Array.from(typing) : [];

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="safe-top sticky top-0 z-20 backdrop-blur-xl bg-bg/80 border-b border-border/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
            aria-label="Back"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
            style={{ background: group?.color || '#6366f1' }}
          >
            {group?.emoji || '👥'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-semibold">{group?.name}</div>
            <div className="text-xs text-text-muted">
              {typingUsers.length > 0 ? t('chat.typing') : t('groups.members', { count: group?.members?.length || 0 })}
            </div>
          </div>
          <div className="flex -space-x-1.5">
            {(group?.members as any[])?.slice(0, 3).map((m: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedMember(m.user || m)}
                className="ring-2 ring-bg rounded-full"
              >
                <Avatar src={m.user?.avatar} name={m.user?.name} size={28} />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-5xl">👋</div>
              <p className="text-text-muted">{t('chat.emptySub')}</p>
            </div>
          </div>
        ) : (
          messages.map((m: any, idx: number) => {
            const prev = messages[idx - 1];
            const sameSender =
              prev && String(prev.sender?._id || prev.sender) === String(m.sender?._id || m.sender);
            const mine = String(m.sender?._id || m.sender) === currentUser?.id;
            return (
              <MessageBubble
                key={m._id || idx}
                text={m.text}
                time={m.createdAt}
                mine={mine}
                senderName={m.sender?.name}
                senderAvatar={m.sender?.avatar}
                showAvatar={!mine && !sameSender}
              />
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar size={28} name="…" />
            <div className="glass rounded-[22px] px-4 py-2.5 text-sm text-text-muted">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-3">
        <MessageInput onSend={send} onTyping={handleTyping} />
      </div>

      <MemberSheet
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
      />
    </div>
  );
}
