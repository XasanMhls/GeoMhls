import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const applyToken = useAuthStore((s) => s.applyToken);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      await applyToken(token);
      navigate('/map', { replace: true });
    })();
  }, [params, navigate, applyToken]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-border border-t-brand animate-spin" />
    </div>
  );
}
