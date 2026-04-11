import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';

interface OnlineStatusProps {
  isOnline?: boolean;
  lastSeen?: string | Date;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { dot: 'h-2 w-2',     text: 'text-[10px]' },
  md: { dot: 'h-2.5 w-2.5', text: 'text-xs'     },
  lg: { dot: 'h-3 w-3',     text: 'text-sm'     },
} as const;

// Hoisted outside the component — stable object reference, never recreated
const PULSE_VARIANTS = {
  animate: {
    opacity: [1, 0.4, 1],
    scale: [1, 1.3, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

export function OnlineStatus({
  isOnline = false,
  lastSeen,
  showText = false,
  size = 'md',
  className,
}: OnlineStatusProps) {
  const { t } = useTranslation();
  const { dot, text } = SIZE_MAP[size];

  // Derive label lazily — only computed when showText is true
  const getLabel = () => {
    if (isOnline) return t('common.online');
    if (lastSeen) return t('common.lastSeen', { when: formatRelative(lastSeen) });
    return t('common.offline');
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {isOnline ? (
        <motion.span
          className={cn('rounded-full flex-shrink-0', dot)}
          style={{ backgroundColor: '#22c55e' }}
          variants={PULSE_VARIANTS}
          animate="animate"
        />
      ) : (
        <span className={cn('rounded-full flex-shrink-0 bg-gray-400', dot)} />
      )}

      {showText && (
        <span
          className={cn('leading-none', text)}
          style={{ color: 'var(--text-muted)' }}
        >
          {getLabel()}
        </span>
      )}
    </span>
  );
}
