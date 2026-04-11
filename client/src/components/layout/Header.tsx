import { type ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function Header({ title, subtitle, right }: Props) {
  return (
    <header className="safe-top sticky top-0 z-30 backdrop-blur-xl bg-bg/70">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
