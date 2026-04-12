import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SOCKET_EVENTS, LIMITS } from '@geomhls/shared';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { EmojiBlast } from '@/components/chat/EmojiBlast';
import { Avatar } from '@/components/ui/Avatar';
import { useDmStore } from '@/stores/dmStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { sounds } from '@/lib/sounds';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useThemeStore } from '@/stores/themeStore';

const BLAST_EMOJIS = ['❤️', '🔥', '😂', '🎉', '😍', '🥹', '💯', '👏', '✨', '😘'];

export default function DmChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);

  const me = useAuthStore((s) => s.user);
  const fetchMessages = useDmStore((s) => s.fetchMessages);
  const setActive = useDmStore((s) => s.setActive);
  const messages = useDmStore((s) => s.messagesByFriend[friendId!] || []);
  const isTyping = useDmStore((s) => s.typingByFriend[friendId!] ?? false);
  const friend = useDmStore((s) => (friendId ? s.friendById[friendId] ?? null : null));

  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showBlastPicker, setShowBlastPicker] = useState(false);
  const [blast, setBlast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!friendId) return;
    setActive(friendId);
    setLoadError(false);

    fetchMessages(friendId).catch((err) => {
      console.error('[DM] fetchMessages failed:', err);
      setLoadError(true);
    });

    return () => setActive(null);
  }, [friendId]); // eslint-disable-line react-hooks/exhaustive-deps

  // If friend info isn't in store yet, fetch it directly
  useEffect(() => {
    if (!friendId || friend) return;
    api.get(`/dm/${friendId}`)
      .then(({ data }) => {
        useDmStore.setState((s) => ({
          friendById: data.friend ? { ...s.friendById, [friendId]: data.friend } : s.friendById,
          messagesByFriend: { ...s.messagesByFriend, [friendId]: data.messages ?? s.messagesByFriend[friendId] ?? [] },
          conversationIdByFriend: { ...s.conversationIdByFriend, [friendId]: data.conversationId },
        }));
      })
      .catch(() => {});
  }, [friendId, friend]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { emoji } = (e as CustomEvent).detail;
      setBlast(emoji);
    };
    window.addEventListener('dm:blast', handler);
    return () => window.removeEventListener('dm:blast', handler);
  }, []);

  const sendText = () => {
    const value = text.trim();
    if (!value || !friendId) return;
    getSocket()?.emit(SOCKET_EVENTS.DM_SEND, {
      friendId,
      text: value.slice(0, LIMITS.MESSAGE_MAX_LENGTH),
      type: 'text',
    });
    sounds.messageOut();
    setText('');
    setShowPicker(false);
  };

  const sendBlast = (emoji: string) => {
    if (!friendId) return;
    getSocket()?.emit(SOCKET_EVENTS.DM_SEND, { friendId, text: emoji, type: 'blast' });
    sounds.emojiBlast();
    setBlast(emoji);
    getSocket()?.emit(SOCKET_EVENTS.DM_BLAST, { friendId, emoji });
    setShowBlastPicker(false);
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !friendId) return;
    socket.emit(SOCKET_EVENTS.DM_TYPING, { friendId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.DM_STOP_TYPING, { friendId });
    }, LIMITS.TYPING_TIMEOUT_MS);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  const addEmoji = (e: { native: string }) => {
    setText((prev) => prev + e.native);
    inputRef.current?.focus();
  };

  const clearBlast = useCallback(() => setBlast(null), []);

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <header className="safe-top sticky top-0 z-20 backdrop-blur-xl bg-bg/80 border-b border-border/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {friend ? (
            <>
              <Avatar src={friend.avatar} name={friend.name} size={40} online={friend.isOnline} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">{friend.name}</div>
                <div className="text-xs text-text-muted">
                  {isTyping ? (
                    <span className="text-brand animate-pulse">печатает…</span>
                  ) : friend.isOnline ? (
                    'в сети'
                  ) : (
                    `@${friend.username}`
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 h-8 rounded-xl bg-surface-2 animate-pulse" />
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {loadError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-4xl">⚠️</div>
              <p className="text-text-muted text-sm">Не удалось загрузить чат</p>
              <button
                onClick={() => {
                  setLoadError(false);
                  fetchMessages(friendId!).catch(() => setLoadError(true));
                }}
                className="mt-3 text-sm font-semibold text-brand"
              >
                Повторить
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-5xl">👋</div>
              <p className="text-text-muted text-sm">
                {friend ? `Напишите ${friend.name} первым!` : 'Напишите первое сообщение'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const prev = messages[idx - 1];
            const sameSender = prev && String(prev.sender?._id) === String(m.sender?._id);
            const mine = String(m.sender?._id) === me?.id;

            if (m.type === 'blast') {
              return (
                <div key={m._id || idx} className={`flex mb-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <span
                    className="text-5xl cursor-pointer select-none hover:scale-110 transition-transform active:scale-95"
                    onClick={() => { sounds.emojiBlast(); setBlast(m.text); }}
                  >
                    {m.text}
                  </span>
                </div>
              );
            }

            return (
              <MessageBubble
                key={m._id || idx}
                text={m.text}
                time={m.createdAt}
                mine={mine}
                senderName={m.sender?.name}
                senderAvatar={m.sender?.avatar ?? null}
                showAvatar={!mine && !sameSender}
              />
            );
          })
        )}

        {isTyping && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar size={28} src={friend?.avatar} name={friend?.name} />
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

      {/* Input */}
      <div className="px-3 pb-3 relative">
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="absolute bottom-full left-0 right-0 mb-3 flex justify-center px-4"
            >
              <Picker data={data} onEmojiSelect={addEmoji} theme={theme} previewPosition="none" skinTonePosition="none" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBlastPicker && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              className="absolute bottom-full left-0 right-0 mb-3"
            >
              <div
                className="mx-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border) / 0.5)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">Реакция</p>
                <div className="flex gap-2 flex-wrap">
                  {BLAST_EMOJIS.map((e) => (
                    <button key={e} onClick={() => sendBlast(e)} className="text-3xl hover:scale-125 active:scale-95 transition-transform">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-strong flex items-end gap-2 rounded-[28px] p-2 safe-bottom">
          <button
            type="button"
            onClick={() => { setShowPicker((v) => !v); setShowBlastPicker(false); }}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-2 text-xl"
          >
            😊
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={onKey}
            rows={1}
            placeholder="Сообщение…"
            maxLength={LIMITS.MESSAGE_MAX_LENGTH}
            className="flex-1 resize-none bg-transparent outline-none px-2 py-2.5 text-[15px] placeholder:text-text-muted max-h-32"
          />
          <button
            type="button"
            onClick={() => { setShowBlastPicker((v) => !v); setShowPicker(false); }}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-2 text-xl"
            title="Emoji blast"
          >
            ✨
          </button>
          <button
            type="button"
            onClick={sendText}
            disabled={!text.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full gradient-brand text-white shadow-lg shadow-brand/30 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {blast && <EmojiBlast key={blast + Date.now()} emoji={blast} onDone={clearBlast} />}
      </AnimatePresence>
    </div>
  );
}
