import { forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'gradient-brand text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40',
  secondary: 'glass text-text hover:bg-surface-2',
  ghost: 'text-text hover:bg-surface-2',
  danger: 'bg-danger/90 text-white hover:bg-danger',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-11 px-5 text-[15px] rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, type, onClick },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight',
        'transition-colors duration-200 select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </motion.button>
  );
});
