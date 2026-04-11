import { AnimatePresence, motion } from 'framer-motion';

const THRESHOLD = 80;

interface Props {
  pullDistance: number;
  refreshing: boolean;
}

export function PullIndicator({ pullDistance, refreshing }: Props) {
  const visible = refreshing || pullDistance > 0;

  // Progress 0→1 as pull approaches threshold
  const progress = Math.min(pullDistance / THRESHOLD, 1);
  // Arrow rotates 0→180deg as you pull down to threshold
  const arrowRotation = progress * 180;
  // Container slides down with pull distance (capped)
  const translateY = refreshing ? 0 : pullDistance * 0.6;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pull-indicator"
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: translateY }}
          exit={{ opacity: 0, y: -48 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-3 left-1/2 z-50 -translate-x-1/2 pointer-events-none"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: '#6366f1' }}
          >
            {refreshing ? (
              // Spinning circle when refreshing
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                className="block h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              // Arrow that rotates as you pull
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                animate={{ rotate: arrowRotation, opacity: 0.4 + progress * 0.6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </motion.svg>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
