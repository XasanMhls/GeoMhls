import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-border border-t-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
