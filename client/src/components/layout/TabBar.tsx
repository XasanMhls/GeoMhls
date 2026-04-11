import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/cn';

const tabs = [
  { to: '/map', key: 'map', icon: MapIcon },
  { to: '/groups', key: 'groups', icon: GroupsIcon },
  { to: '/chat', key: 'chat', icon: ChatIcon, badge: true },
  { to: '/profile', key: 'profile', icon: ProfileIcon },
];

export function TabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const hide = location.pathname.startsWith('/chat/');
  const unread = useChatStore((s) => s.unreadByGroup);
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  if (hide) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom px-4 pb-3 pt-2">
      <div className="glass-strong mx-auto flex max-w-md items-center justify-around rounded-[28px] px-2 py-2 shadow-2xl shadow-black/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const showBadge = (tab as any).badge && totalUnread > 0;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'relative flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors',
                  isActive ? 'text-brand' : 'text-text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-active"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-2xl bg-brand/15"
                    />
                  )}
                  <span className="relative">
                    <Icon className="h-6 w-6" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-brand px-1 text-[9px] font-bold text-white shadow-sm">
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                  </span>
                  <span className="relative text-[10px] font-semibold">
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

function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16M16 6v16" />
    </svg>
  );
}
function GroupsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
