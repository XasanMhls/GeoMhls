import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4"
    >
      {label && <span className="flex-1 text-left text-[15px] text-text">{label}</span>}
      <span
        className={cn(
          'relative h-7 w-12 rounded-full transition-colors duration-300',
          checked ? 'bg-brand' : 'bg-surface-2 border border-border',
        )}
      >
        <motion.span
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
        />
      </span>
    </button>
  );
}
