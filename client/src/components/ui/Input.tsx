import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, error, icon, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-text-muted">{label}</span>
      )}
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl bg-surface-2/70 border px-4 h-14',
          'transition-all duration-200',
          'focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15',
          error ? 'border-danger/60' : 'border-border',
        )}
      >
        {icon && <span className="text-text-muted">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'flex-1 bg-transparent outline-none text-text placeholder:text-text-muted text-[15px]',
            className,
          )}
          {...rest}
        />
      </div>
      {error && <span className="mt-1.5 block text-xs text-danger">{error}</span>}
    </label>
  );
});
