import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="glass-strong relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 safe-bottom"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            {title && (
              <h2 className="mb-4 text-xl font-bold tracking-tight">{title}</h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
