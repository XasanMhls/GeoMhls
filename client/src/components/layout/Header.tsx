import { type ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function Header({ title, subtitle, right }: Props) {
  return (
    <header
      className="safe-top sticky top-0 z-30"
      style={{
        background: 'rgb(var(--bg) / 0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgb(var(--border) / 0.35)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h1
            className="font-bold tracking-tight leading-none"
            style={{ fontSize: 'clamp(1.5rem, 7vw, 1.875rem)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </header>
  );
}
