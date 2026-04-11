import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  text: string;
  time: string | Date;
  mine: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  showAvatar?: boolean;
}

export function MessageBubble({ text, time, mine, senderName, senderAvatar, showAvatar }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2 mb-1', mine ? 'justify-end' : 'justify-start')}
    >
      {!mine && (
        <div className="w-8 shrink-0">
          {showAvatar && <Avatar src={senderAvatar} name={senderName} size={32} />}
        </div>
      )}
      <div className={cn('flex max-w-[75%] flex-col', mine ? 'items-end' : 'items-start')}>
        {!mine && showAvatar && senderName && (
          <span className="mb-0.5 ml-3 text-[11px] text-text-muted">{senderName}</span>
        )}
        <div
          className={cn(
            'rounded-[22px] px-4 py-2.5 text-[15px] leading-snug break-words',
            mine
              ? 'gradient-brand text-white rounded-br-md shadow-lg shadow-brand/25'
              : 'glass rounded-bl-md',
          )}
        >
          {text}
        </div>
        <span className="mt-1 px-2 text-[10px] text-text-muted">{formatTime(time)}</span>
      </div>
    </motion.div>
  );
}
