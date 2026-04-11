import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { registerSchema, type RegisterInput, type Language } from '@geomhls/shared';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { AuthShell, FormField, GoogleIcon } from './LoginPage';

const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'uz', flag: '🇺🇿', label: 'UZ' },
];

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const isDark = theme === 'dark';
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setApiError(null);
    try {
      await registerUser(values.email, values.password, values.name, values.username);
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || '';
      if (status === 409 && msg.includes('Username')) {
        setApiError(t('errors.usernameTaken'));
      } else if (status === 409) {
        setApiError(t('errors.emailTaken'));
      } else {
        setApiError(t('errors.networkError'));
      }
    }
  };

  const currentLang = LANGS.find((l) => i18n.language.startsWith(l.code)) || LANGS[0];

  return (
    <AuthShell
      isDark={isDark}
      setTheme={setTheme}
      currentLang={currentLang}
      langOpen={langOpen}
      setLangOpen={setLangOpen}
      onChangeLang={(c) => i18n.changeLanguage(c)}
      side="left"
    >
      <div className="w-full max-w-md">
        <Link
          to="/welcome"
          className={`inline-flex items-center gap-1.5 text-sm font-medium mb-10 transition ${
            isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {t('common.back')}
        </Link>

        <div className="tagline-line mb-5">
          <span>{t('landing.tagline')}</span>
        </div>

        <h1
          className={`heading-hero ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.25rem)' }}
        >
          {t('auth.createAccount')}
        </h1>
        <p className={`mt-3 text-base ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          {t('app.tagline')}
        </p>

        {/* Google button */}
        <button
          type="button"
          onClick={() => { window.location.href = '/api/auth/google'; }}
          className={`mt-8 group flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-semibold transition-all ${
            isDark
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          <GoogleIcon />
          {t('auth.googleSignIn')}
        </button>

        {/* Divider */}
        <div className={`my-6 flex items-center gap-4 text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          <span className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          {t('auth.or')}
          <span className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            isDark={isDark}
            label={t('auth.name')}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            type="text"
            placeholder="Your name"
            autoComplete="name"
            error={errors.name && t('errors.nameShort')}
            {...register('name')}
          />
          <FormField
            isDark={isDark}
            label={t('auth.username') || 'Username'}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
              </svg>
            }
            type="text"
            placeholder="yourname"
            autoComplete="username"
            prefix="@"
            error={errors.username && (t('errors.usernameInvalid') || 'Min 3 chars, only a-z 0-9 _')}
            {...register('username')}
          />
          <FormField
            isDark={isDark}
            label={t('auth.email')}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email && t('errors.invalidEmail')}
            {...register('email')}
          />
          <FormField
            isDark={isDark}
            label={t('auth.password')}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password && t('errors.passwordShort')}
            {...register('password')}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`transition ${isDark ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            }
          />

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {apiError}
            </motion.div>
          )}

          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
            {t('auth.signUp')}
          </Button>
        </form>

        <p className={`mt-8 text-center text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-[#fbd784] hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
