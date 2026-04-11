import { forwardRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema, type LoginInput, type Language } from '@geomhls/shared';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'uz', flag: '🇺🇿', label: 'UZ' },
];

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
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
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setApiError(null);
    try {
      await login(values.email, values.password);
      navigate('/map', { replace: true });
    } catch (err: any) {
      setApiError(
        err?.response?.status === 401 ? t('errors.invalidCredentials') : t('errors.networkError'),
      );
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
      side="right"
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
          {t('auth.welcome')}
        </h1>
        <p className={`mt-3 text-base ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          {t('auth.welcomeSub')}
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
            autoComplete="current-password"
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
            {t('auth.signIn')}
          </Button>
        </form>

        <p className={`mt-8 text-center text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-[#fbd784] hover:underline">
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED AUTH SHELL (split layout)
   ═══════════════════════════════════════════════════════ */
export function AuthShell({
  children,
  isDark,
  setTheme,
  currentLang,
  langOpen,
  setLangOpen,
  onChangeLang,
  side,
}: {
  children: React.ReactNode;
  isDark: boolean;
  setTheme: (t: 'dark' | 'light') => void;
  currentLang: { code: Language; flag: string; label: string };
  langOpen: boolean;
  setLangOpen: (v: boolean) => void;
  onChangeLang: (code: Language) => void;
  side: 'left' | 'right';
}) {
  const bgMain = isDark ? 'rgb(11 14 20)' : 'rgb(250 250 253)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgMain }}>
      {/* ━━━ Top bar ━━━ */}
      <header className="relative z-20">
        <div className="landing-container flex items-center justify-between py-5">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span className={`heading-section text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>GeoMhls</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-700'}`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              ) : (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-700'}`}
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: isDark ? 'rgb(24 26 35)' : 'rgb(255 255 255)', border: `1px solid ${cardBorder}` }}
                  >
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { onChangeLang(l.code); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold transition ${
                          currentLang.code === l.code
                            ? 'text-[#fbd784]'
                            : isDark ? 'text-white/70 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ━━━ Split layout ━━━ */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Form side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center justify-center px-6 py-12 ${side === 'right' ? 'lg:order-2' : 'lg:order-1'}`}
        >
          {children}
        </motion.div>

        {/* Visual side */}
        <div className={`relative hidden lg:flex items-center justify-center overflow-hidden ${side === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
          <AuthVisual isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH VISUAL (animated map mockup)
   ═══════════════════════════════════════════════════════ */
function AuthVisual({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 70%, rgba(168,85,247,0.2) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(251,215,132,0.15) 0%, transparent 50%), linear-gradient(135deg, rgb(11,14,20) 0%, rgb(20,15,35) 100%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 30% 70%, rgba(168,85,247,0.2) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(251,215,132,0.25) 0%, transparent 50%), linear-gradient(135deg, rgb(245,245,255) 0%, rgb(235,230,255) 100%)',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: '#6366f1', animation: 'float 8s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#a855f7', animation: 'float 10s ease-in-out infinite 2s' }} />
      <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ background: '#fbd784', animation: 'float 6s ease-in-out infinite 1s' }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12">
        {/* Circular map with markers */}
        <div className="relative mb-10">
          <div
            className="relative w-80 h-80 rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
              border: `2px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.25)'}`,
            }}
          >
            {/* pulse rings */}
            <div
              className="absolute inset-0 rounded-full border"
              style={{
                borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)',
                animation: 'pulse-ring 3s ease-out infinite',
              }}
            />

            {/* center avatar — You */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white font-bold shadow-2xl shadow-indigo-500/50" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  {t('map.you')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2" style={{ borderColor: isDark ? 'rgb(11 14 20)' : 'rgb(250 250 253)' }} />
              </div>
            </motion.div>

            {/* other members */}
            {[
              { top: '12%', left: '65%', delay: 0.5, color: '#10b981', letters: 'AB', floatDelay: '1s' },
              { top: '68%', left: '18%', delay: 0.7, color: '#f59e0b', letters: 'CD', floatDelay: '0.5s' },
              { top: '72%', left: '72%', delay: 0.9, color: '#ec4899', letters: 'EF', floatDelay: '1.5s' },
              { top: '18%', left: '22%', delay: 1.1, color: '#06b6d4', letters: 'GH', floatDelay: '0.8s' },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: m.delay, type: 'spring' }}
                className="absolute"
                style={{ top: m.top, left: m.left }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xl"
                  style={{
                    background: m.color,
                    boxShadow: `0 8px 24px ${m.color}66`,
                    animation: `float 3s ease-in-out infinite ${m.floatDelay}`,
                  }}
                >
                  {m.letters}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-center max-w-sm"
        >
          <div className="tagline-line justify-center mb-4">
            <span>{t('landing.tagline')}</span>
          </div>
          <h2
            className={`heading-section ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
          >
            {t('landing.heroTitle1')}<br />
            <span className="gradient-gold" style={{ WebkitTextFillColor: 'transparent' }}>{t('landing.heroTitle2')}</span>
          </h2>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FORM FIELD
   ═══════════════════════════════════════════════════════ */
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isDark: boolean;
  label: string;
  icon: React.ReactNode;
  error?: string | false;
  suffix?: React.ReactNode;
  prefix?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ isDark, label, icon, error, suffix, prefix, ...props }, ref) => (
    <div>
      <label className={`block mb-1.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
        {label}
      </label>
      <div
        className="relative flex items-center rounded-2xl transition-all focus-within:ring-2 focus-within:ring-[#fbd784]/50"
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <div className={`pl-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{icon}</div>
        {prefix && (
          <span className={`pl-2 text-base font-semibold select-none ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{prefix}</span>
        )}
        <input
          ref={ref}
          {...props}
          className={`flex-1 bg-transparent ${prefix ? 'pl-1' : 'px-3'} pr-3 py-4 text-base outline-none ${isDark ? 'text-white placeholder:text-white/30' : 'text-gray-900 placeholder:text-gray-400'}`}
        />
        {suffix && <div className="pr-4">{suffix}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  ),
);
FormField.displayName = 'FormField';

/* ═══════════════════════════════════════════════════════
   GOOGLE ICON
   ═══════════════════════════════════════════════════════ */
export function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C33.8 6.1 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9L6.2 33C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.1 5.2c-.4.4 6.7-4.9 6.7-14.8 0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
