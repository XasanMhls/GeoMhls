import { cn } from '@/lib/cn';
import { initialsOf } from '@/lib/format';

interface Props {
  src?: string | null;
  name?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 44, online, className }: Props) {
  return (
    <span
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name || ''}
          className="h-full w-full rounded-full object-cover ring-2 ring-border"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full gradient-brand text-white font-semibold ring-2 ring-border"
          style={{ fontSize: size * 0.38 }}
        >
          {initialsOf(name).toUpperCase()}
        </span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-bg" />
      )}
    </span>
  );
}
