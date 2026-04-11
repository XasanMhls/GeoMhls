import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/stores/toastStore';
import { cn } from '@/lib/cn';

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

const icons = {
  success: <CheckIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
};

const borderAccent = {
  success: 'border-l-emerald-400',
  error: 'border-l-red-400',
  info: 'border-l-blue-400',
};

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'glass-strong rounded-2xl shadow-xl shadow-black/20',
              'flex items-center gap-3 w-full px-4 py-3',
              'border-l-4 pointer-events-auto',
              borderAccent[toast.type],
            )}
          >
            {icons[toast.type]}
            <p className="text-sm text-text flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded-lg text-text-muted hover:text-text transition-colors"
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
