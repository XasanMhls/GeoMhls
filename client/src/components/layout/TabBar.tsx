import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores/chatStore';
import { useDmStore } from '@/stores/dmStore';
import { useFriendRequestsStore } from '@/stores/friendRequestsStore';
import { cn } from '@/lib/cn';

const tabs = [
  { to: '/map',     key: 'map',     icon: MapIcon },
  { to: '/groups',  key: 'groups',  icon: GroupsIcon },
  { to: '/friends', key: 'friends', icon: FriendsIcon, friendBadge: true },
  { to: '/chat',    key: 'chat',    icon: ChatIcon,    badge: true },
  { to: '/profile', key: 'profile', icon: ProfileIcon },
];

export function TabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const hide = location.pathname.startsWith('/chat/') || location.pathname.startsWith('/dm/');
  const unread = useChatStore((s) => s.unreadByGroup);
  const dmUnread = useDmStore((s) => s.unreadByFriend);
  const totalUnread =
    Object.values(unread).reduce((a, b) => a + b, 0) +
    Object.values(dmUnread).reduce((a, b) => a + b, 0);
  const pendingRequests = useFriendRequestsStore((s) => s.requests.length);

  if (hide) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 safe-bottom"
      style={{ padding: '0 12px calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      {/* Fade-up blur backdrop */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 'calc(100% + 20px)',
          background: 'linear-gradient(to top, rgb(var(--bg)) 40%, transparent 100%)',
          maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
        }}
      />

      {/* Pill */}
      <div
        className="relative mx-auto flex max-w-sm items-center justify-around rounded-[26px] px-1 py-1.5 shadow-2xl"
        style={{
          background: 'rgb(var(--surface) / 0.88)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgb(var(--border) / 0.5)',
          boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.35), 0 2px 8px -2px rgb(0 0 0 / 0.2), inset 0 1px 0 rgb(255 255 255 / 0.06)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const showBadge = (tab as any).badge && totalUnread > 0;
          const showFriendBadge = (tab as any).friendBadge && pendingRequests > 0;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'relative flex h-[54px] w-[54px] flex-col items-center justify-center gap-[3px] rounded-[20px] transition-colors duration-200',
                  isActive ? 'text-brand' : 'text-text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill background */}
                  {isActive && (
                    <motion.span
                      layoutId="tab-active-bg"
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      className="absolute inset-0 rounded-[20px]"
                      style={{ background: 'rgb(var(--brand) / 0.13)' }}
                    />
                  )}

                  {/* Icon + badge */}
                  <span className="relative z-10">
                    <Icon
                      className={cn(
                        'h-[22px] w-[22px] transition-transform duration-200',
                        isActive && 'scale-110',
                      )}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full gradient-brand px-1 text-[9px] font-bold text-white shadow-sm">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                    {showFriendBadge && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                        {pendingRequests > 9 ? '9+' : pendingRequests}
                      </span>
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-semibold tracking-wide transition-all duration-200',
                      isActive ? 'opacity-100' : 'opacity-60',
                    )}
                  >
                    {t(`tabs.${tab.key}`)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function MapIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
    </svg>
  );
}
function GroupsIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ChatIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ProfileIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function FriendsIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  );
}
