import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { className, strong, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-2xl shadow-xl shadow-black/20',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
