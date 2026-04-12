import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { IFriend } from '@geomhls/shared';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { useFriendRequestsStore } from '@/stores/friendRequestsStore';

export default function FriendsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IFriend[]>([]);
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requests = useFriendRequestsStore((s) => s.requests);
  const setRequests = useFriendRequestsStore((s) => s.setRequests);
  const removeRequest = useFriendRequestsStore((s) => s.removeRequest);

  useEffect(() => {
    api.get('/users/friends').then(({ data }) => setFriends(data.friends));
    api.get('/users/friend-requests').then(({ data }) => setRequests(data.requests));
  }, [setRequests]);

  const friendIds = new Set(friends.map((f) => f.id));

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim().replace(/^@/, '');
    if (!q || q.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
        setResults(data.users);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const sendRequest = async (user: IFriend) => {
    setAddingId(user.id);
    try {
      const { data } = await api.post(`/users/friends/${user.id}`);
      if (data.accepted) {
        setFriends((prev) => [...prev, user]);
      } else {
        setSentIds((prev) => new Set([...prev, user.id]));
      }
    } finally {
      setAddingId(null);
    }
  };

  const acceptRequest = async (user: IFriend) => {
    setAcceptingId(user.id);
    try {
      await api.post(`/users/friend-requests/${user.id}/accept`);
      removeRequest(user.id);
      setFriends((prev) => [...prev, user]);
    } finally {
      setAcceptingId(null);
    }
  };

  const declineRequest = async (userId: string) => {
    setDecliningId(userId);
    try {
      await api.delete(`/users/friend-requests/${userId}`);
      removeRequest(userId);
    } finally {
      setDecliningId(null);
    }
  };

  const removeFriend = async (id: string) => {
    setRemovingId(id);
    try {
      await api.delete(`/users/friends/${id}`);
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="pb-36 lg:pb-10">
      <Header title={t('friends.title') || 'Friends'} />
      <div className="px-5 space-y-4">

        {/* Search box */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4"
          style={{
            background: 'rgb(var(--surface-2))',
            border: '1px solid rgb(var(--border) / 0.5)',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-text-muted text-sm font-semibold select-none">@</span>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('friends.searchPlaceholder') || 'Search by username…'}
            className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-text-muted"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {searching && (
            <svg className="w-4 h-4 animate-spin text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgb(var(--border) / 0.5)', background: 'rgb(var(--surface))' }}
            >
              {results.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i > 0 ? '1px solid rgb(var(--border) / 0.3)' : undefined }}
                >
                  <Avatar src={u.avatar} name={u.name} size={40} online={u.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{u.name}</div>
                    <div className="text-xs text-text-muted">@{u.username}</div>
                  </div>
                  {friendIds.has(u.id) ? (
                    <span className="text-xs font-semibold text-brand px-3 py-1.5 rounded-xl" style={{ background: 'rgb(var(--brand) / 0.12)' }}>
                      {t('friends.added') || 'В друзьях'}
                    </span>
                  ) : sentIds.has(u.id) ? (
                    <span className="text-xs font-semibold text-text-muted px-3 py-1.5 rounded-xl" style={{ background: 'rgb(var(--surface-2))' }}>
                      Отправлено
                    </span>
                  ) : (
                    <button
                      onClick={() => sendRequest(u)}
                      disabled={addingId === u.id}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl gradient-brand text-white disabled:opacity-50"
                    >
                      {addingId === u.id ? '…' : (t('friends.add') || 'Добавить')}
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending friend requests */}
        <AnimatePresence>
          {requests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                Заявки в друзья
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {requests.length}
                </span>
              </div>
              <div className="space-y-2">
                {requests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: 'rgb(var(--surface-2))',
                      border: '1px solid rgb(var(--border) / 0.4)',
                    }}
                  >
                    <Avatar src={req.avatar} name={req.name} size={44} online={req.isOnline} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{req.name}</div>
                      <div className="text-xs text-text-muted">@{req.username}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => acceptRequest(req)}
                        disabled={acceptingId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl gradient-brand text-white disabled:opacity-50"
                      >
                        {acceptingId === req.id ? '…' : 'Принять'}
                      </button>
                      <button
                        onClick={() => declineRequest(req.id)}
                        disabled={decliningId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl text-text-muted disabled:opacity-50"
                        style={{ background: 'rgb(var(--surface))' }}
                      >
                        {decliningId === req.id ? '…' : 'Отказать'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friends list */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            {t('friends.myFriends') || 'My Friends'} {friends.length > 0 && `· ${friends.length}`}
          </div>

          {friends.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass mt-4 flex flex-col items-center justify-center rounded-3xl p-12 text-center"
            >
              <div className="mb-3 text-5xl">🙋</div>
              <h3 className="text-lg font-bold">{t('friends.empty') || 'No friends yet'}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('friends.emptySub') || 'Search by @username to add someone'}</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {friends.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: 'rgb(var(--surface-2))',
                      border: '1px solid rgb(var(--border) / 0.4)',
                    }}
                  >
                    <button onClick={() => navigate(`/dm/${f.id}`)} className="flex-shrink-0">
                      <Avatar src={f.avatar} name={f.name} size={44} online={f.isOnline} />
                    </button>
                    <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/dm/${f.id}`)}>
                      <div className="font-semibold text-sm truncate">{f.name}</div>
                      <div className="text-xs text-text-muted">@{f.username}</div>
                      {f.status && <div className="text-xs text-text-muted truncate mt-0.5">{f.status}</div>}
                    </button>
                    <button
                      onClick={() => navigate(`/dm/${f.id}`)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-brand hover:bg-brand/10 transition-colors"
                      title="Написать"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFriend(f.id)}
                      disabled={removingId === f.id}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                    >
                      {removingId === f.id ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="17" y1="8" x2="23" y2="14" /><line x1="23" y1="8" x2="17" y2="14" />
                        </svg>
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
