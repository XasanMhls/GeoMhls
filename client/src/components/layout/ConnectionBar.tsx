import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSocket } from '@/lib/socket';

type Status = 'online' | 'offline' | 'reconnecting';

function WifiOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function ConnectionBar() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('online');

  useEffect(() => {
    function computeStatus() {
      if (!navigator.onLine) return 'offline';
      const sock = getSocket();
      if (sock && !sock.connected) return 'reconnecting';
      return 'online';
    }

    function update() {
      setStatus(computeStatus());
    }

    // Initial read
    update();

    // navigator.onLine events
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    // Socket events — attach to whatever socket exists now and re-attach
    // whenever the socket instance might be replaced (poll lazily via the
    // same event loop that socket.io uses to fire connect/disconnect).
    let sock = getSocket();

    function attach(s: ReturnType<typeof getSocket>) {
      if (!s) return;
      s.on('connect', update);
      s.on('disconnect', update);
    }

    function detach(s: ReturnType<typeof getSocket>) {
      if (!s) return;
      s.off('connect', update);
      s.off('disconnect', update);
    }

    attach(sock);

    // Poll every second to pick up a newly created socket instance
    // (connectSocket() may be called after this component mounts).
    const poll = setInterval(() => {
      const current = getSocket();
      if (current !== sock) {
        detach(sock);
        sock = current;
        attach(sock);
        update();
      }
    }, 1000);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      detach(sock);
      clearInterval(poll);
    };
  }, []);

  const isVisible = status !== 'online';

  const bgClass =
    status === 'offline' ? 'bg-danger' : 'bg-amber-500/90';

  const label =
    status === 'offline'
      ? t('connection.noInternet', 'No internet connection')
      : t('connection.reconnecting', 'Reconnecting...');

  const Icon = status === 'offline' ? WifiOffIcon : RefreshIcon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="connection-bar"
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={`fixed inset-x-0 top-0 z-[60] ${bgClass} safe-top`}
        >
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
