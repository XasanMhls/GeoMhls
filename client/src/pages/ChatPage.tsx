import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useGroupsStore } from '@/stores/groupsStore';
import { useChatStore } from '@/stores/chatStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelative } from '@/lib/format';

export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groups = useGroupsStore((s) => s.groups);
  const loading = useGroupsStore((s) => s.loading);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const lastMessages = useChatStore((s) => s.lastMessageByGroup);
  const unread = useChatStore((s) => s.unreadByGroup);
  const fetchLastMessages = useChatStore((s) => s.fetchLastMessages);

  useEffect(() => {
    fetchGroups();
    fetchLastMessages();
  }, [fetchGroups, fetchLastMessages]);

  return (
    <div className="pb-36">
      <Header title={t('chat.title')} />
      <div className="px-5 space-y-3">
        {loading && groups.length === 0 ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : groups.length === 0 ? (
          <div className="glass mt-10 rounded-3xl p-12 text-center">
            <div className="mb-4 text-5xl">💬</div>
            <h3 className="text-xl font-bold">{t('chat.empty')}</h3>
            <p className="mt-1 text-sm text-text-muted">{t('chat.emptySub')}</p>
          </div>
        ) : (
          groups.map((g: any) => {
            const last = lastMessages[g._id];
            const count = unread[g._id] || 0;
            return (
              <GlassCard
                key={g._id}
                onClick={() => navigate(`/chat/${g._id}`)}
                className="flex cursor-pointer items-center gap-4 p-4 transition-all hover:bg-surface-2/70 active:scale-[0.99]"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg"
                  style={{ background: g.color, boxShadow: `0 10px 24px -8px ${g.color}66` }}
                >
                  {g.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[17px] font-semibold">{g.name}</div>
                    {last?.createdAt && (
                      <span className="shrink-0 text-[11px] text-text-muted">
                        {formatRelative(last.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="truncate text-[13px] text-text-muted">
                      {last ? (
                        <>
                          <span className="font-medium">{last.sender?.name}: </span>
                          {last.text}
                        </>
                      ) : (
                        t('chat.emptySub')
                      )}
                    </div>
                    {count > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full gradient-brand px-1.5 text-[11px] font-bold text-white">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
