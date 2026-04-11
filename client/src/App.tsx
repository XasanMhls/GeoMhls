import { useEffect, lazy, Suspense } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { TabBar } from '@/components/layout/TabBar';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { ConnectionBar } from '@/components/layout/ConnectionBar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageTransition } from '@/components/layout/PageTransition';
import { useTranslation } from 'react-i18next';

import { Toast } from '@/components/ui/Toast';

const WelcomePage = lazy(() => import('@/pages/WelcomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ChatRoomPage = lazy(() => import('@/pages/ChatRoomPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

export default function App() {
  const location = useLocation();
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const theme = useThemeStore((s) => s.theme);
  const { i18n } = useTranslation();
  useSocketEvents();
  usePushNotifications();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user?.settings?.theme && user.settings.theme !== theme) {
      useThemeStore.getState().setTheme(user.settings.theme);
    }
    if (user?.settings?.language && user.settings.language !== i18n.language) {
      i18n.changeLanguage(user.settings.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="min-h-[100dvh]">
      <SplashScreen visible={!initialized} />
      <ConnectionBar />
      <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/welcome" element={<PageTransition><WelcomePage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <PageTransition><OnboardingPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <PageTransition><GroupsPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <PageTransition><ChatPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition><ProfilePage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? '/map' : '/welcome'} replace />} />
        </Routes>
      </AnimatePresence>
      </Suspense>
      {user && <TabBar />}
      <Toast />
    </div>
  );
}
