import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/map',     key: 'map',     icon: MapIcon },
  { to: '/groups',  key: 'groups',  icon: GroupsIcon },
  { to: '/chat',    key: 'chat',    icon: ChatIcon,    badge: true },
  { to: '/profile', key: 'profile', icon: ProfileIcon },
];

export function SideNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const unread = useChatStore((s) => s.unreadByGroup);
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  return (
    <aside className="app-sidebar">
      <div
        className="h-full flex flex-col glass-strong border-r"
        style={{ borderColor: 'rgb(var(--border) / 0.4)' }}
      >
        {/* ── Logo ── */}
        <div className="px-5 py-6 flex items-center gap-3 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="heading-section text-lg text-text">GeoMhls</span>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.badge && totalUnread > 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('side-nav-item group', isActive && 'active')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidenav-active"
                        className="absolute inset-0 rounded-[14px]"
                        style={{ background: 'rgb(var(--brand) / 0.1)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={cn('nav-icon relative z-10 flex-shrink-0 transition-colors', isActive ? 'text-brand' : 'text-text-muted group-hover:text-text')}>
                      <Icon className="h-[22px] w-[22px]" />
                      {showBadge && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-brand px-1 text-[9px] font-bold text-white">
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                    </span>
                    <span className="relative z-10 flex-1">{t(`tabs.${item.key}`)}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-4 h-px" style={{ background: 'rgb(var(--border) / 0.5)' }} />

        {/* ── User card ── */}
        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="m-3 flex items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-surface-2 press"
          >
            <Avatar src={user.avatar} name={user.name} size={38} online />
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-text">{user.name}</div>
              <div className="truncate text-xs text-text-muted">{user.email}</div>
            </div>
            <svg className="h-4 w-4 flex-shrink-0 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

/* ── Icons ── */
function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
    </svg>
  );
}
function GroupsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
