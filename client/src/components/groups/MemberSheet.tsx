import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  member: any;
}

export function MemberSheet({ open, onClose, member }: Props) {
  if (!member) return null;

  const hasLocation =
    member.location &&
    member.location.coordinates &&
    member.location.coordinates.length === 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="glass-strong relative w-full max-w-lg rounded-t-3xl safe-bottom"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-10 rounded-full bg-border" />
            </div>

            <div className="flex flex-col items-center px-6 pb-2 pt-4">
              {/* Avatar */}
              <Avatar
                src={member.avatar}
                name={member.name}
                size={80}
                online={member.isOnline}
              />

              {/* Name */}
              <h2 className="mt-4 text-xl font-bold tracking-tight text-center">
                {member.name}
              </h2>

              {/* Status text */}
              {member.status && (
                <p className="mt-1 text-sm text-text-muted text-center">
                  {member.status}
                </p>
              )}

              {/* Online / offline badge */}
              <div
                className={cn(
                  'mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                  member.isOnline
                    ? 'bg-success/15 text-success'
                    : 'bg-surface-2 text-text-muted',
                )}
              >
                {member.isOnline ? (
                  <>
                    <Wifi size={12} />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} />
                    <span>Offline</span>
                  </>
                )}
              </div>

              {/* Last seen (offline only) */}
              {!member.isOnline && member.lastSeen && (
                <p className="mt-2 text-xs text-text-muted">
                  Last seen {formatRelative(member.lastSeen)} ago
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="mx-6 my-4 h-px bg-border/50" />

            {/* Location info */}
            <div className="px-6">
              {hasLocation ? (
                <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-white shadow-lg shadow-brand/30">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-muted">Last location update</p>
                    <p className="text-sm font-semibold">
                      {member.location.updatedAt
                        ? `${formatRelative(member.location.updatedAt)} ago`
                        : 'Location available'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-muted">
                    <MapPin size={16} />
                  </div>
                  <p className="text-sm text-text-muted">No location data available</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 px-6 pb-6 pt-4">
              <Button variant="primary" fullWidth className="gap-2">
                <MessageCircle size={17} />
                Message
              </Button>
              <Button variant="secondary" fullWidth className="gap-2">
                <MapPin size={17} />
                View on Map
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
