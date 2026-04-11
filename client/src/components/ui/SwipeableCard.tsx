import { type ReactNode, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useAnimation,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

interface Props {
  children: ReactNode;
  onDelete?: () => void;
  onLeave?: () => void;
  className?: string;
}

const SNAP_OPEN = -120;
const SNAP_CLOSED = 0;
const THRESHOLD = -80;

const SPRING = { type: 'spring' as const, stiffness: 500, damping: 30 };

// Door icon (log out / leave)
function DoorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4l-6 4v12l6 4" />
    </svg>
  );
}

// Trash icon (delete)
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function SwipeableCard({ children, onDelete, onLeave, className }: Props) {
  const { t } = useTranslation();
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Snap back when a tap/click lands outside this card
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        controls.start({ x: SNAP_CLOSED, transition: SPRING });
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [controls]);

  function handleDragEnd() {
    const current = x.get();
    if (current <= THRESHOLD) {
      controls.start({ x: SNAP_OPEN, transition: SPRING });
    } else {
      controls.start({ x: SNAP_CLOSED, transition: SPRING });
    }
  }

  // How many action buttons are visible determines the total revealed width
  const buttonCount = (onLeave ? 1 : 0) + (onDelete ? 1 : 0);
  // Each button takes equal share of the 120px revealed area
  const buttonWidth = buttonCount > 0 ? Math.floor(120 / buttonCount) : 0;

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Action buttons layer — sits behind the card */}
      <div className="absolute inset-y-0 right-0 flex items-stretch" style={{ width: 120 }}>
        {onLeave && (
          <button
            type="button"
            onClick={() => {
              controls.start({ x: SNAP_CLOSED, transition: SPRING });
              onLeave();
            }}
            style={{ width: buttonWidth }}
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              'bg-orange-500 text-white text-xs font-semibold',
              'rounded-2xl',
              'select-none active:brightness-90 transition-[filter] duration-150',
            )}
          >
            <DoorIcon />
            <span>{t('groups.leave')}</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => {
              controls.start({ x: SNAP_CLOSED, transition: SPRING });
              onDelete();
            }}
            style={{ width: buttonWidth }}
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              'bg-danger text-white text-xs font-semibold',
              'rounded-2xl',
              'select-none active:brightness-90 transition-[filter] duration-150',
              onLeave && 'ml-0.5',
            )}
          >
            <TrashIcon />
            <span>{t('groups.delete')}</span>
          </button>
        )}
      </div>

      {/* Draggable card — covers buttons until swiped */}
      <motion.div
        drag="x"
        dragConstraints={{ left: SNAP_OPEN, right: SNAP_CLOSED }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative bg-bg touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
