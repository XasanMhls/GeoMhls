import { useTranslation } from 'react-i18next';
import type { Language } from '@geomhls/shared';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { api } from '@/lib/api';

const LANGS: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uz', label: 'Oʻzbekcha' },
];

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const updateSettings = async (patch: Record<string, unknown>) => {
    const { data } = await api.patch('/users/me/settings', patch);
    setUser(data.user);
  };

  const toggleShare = (checked: boolean) => updateSettings({ shareLocation: checked });
  const toggleNotifications = (checked: boolean) => updateSettings({ notifications: checked });
  const toggleFreeze = (checked: boolean) => updateSettings({ freezeLocation: checked });

  const switchLang = (lang: Language) => {
    i18n.changeLanguage(lang);
    updateSettings({ language: lang });
  };

  const switchTheme = (next: 'dark' | 'light') => {
    setTheme(next);
    updateSettings({ theme: next });
  };

  const freezeLocation = user?.settings?.freezeLocation ?? false;

  return (
    <div className="pb-36 lg:pb-10">
      <Header title={t('profile.title')} />
      <div className="px-5 space-y-4">
        {/* Profile card */}
        <GlassCard className="flex items-center gap-4 p-5">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.name} size={68} online />
            {/* Freeze badge on avatar */}
            {freezeLocation && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs shadow-lg">
                ❄️
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[19px] font-bold">{user?.name}</div>
            {user?.username && (
              <div className="truncate text-sm font-medium text-brand">@{user.username}</div>
            )}
            <div className="truncate text-sm text-text-muted">{user?.email}</div>
            {user?.status && (
              <div className="mt-1 text-xs text-text-muted">{user.status}</div>
            )}
          </div>
        </GlassCard>

        {/* Location settings — freeze gets its own card for prominence */}
        <GlassCard className="p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            {t('profile.locationSettings') || 'Location'}
          </div>

          {/* Share location */}
          <Toggle
            checked={user?.settings?.shareLocation ?? true}
            onChange={toggleShare}
            label={t('profile.shareLocation')}
          />

          {/* Freeze location */}
          <div className={`rounded-2xl p-4 transition-all ${freezeLocation ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-surface-2/50'}`}>
            <Toggle
              checked={freezeLocation}
              onChange={toggleFreeze}
              label={
                <span className="flex items-center gap-2">
                  <span className="text-lg leading-none">❄️</span>
                  <span>
                    <span className="block font-semibold">{t('profile.freezeLocation') || 'Freeze location'}</span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {t('profile.freezeLocationSub') || 'Others see your last known position'}
                    </span>
                  </span>
                </span>
              }
            />
          </div>
        </GlassCard>

        {/* Appearance & language */}
        <GlassCard className="divide-y divide-border/60">
          <div className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('profile.theme')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => switchTheme('dark')}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  theme === 'dark' ? 'gradient-brand text-white' : 'bg-surface-2 text-text-muted'
                }`}
              >
                🌙 {t('profile.themeDark')}
              </button>
              <button
                onClick={() => switchTheme('light')}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  theme === 'light' ? 'gradient-brand text-white' : 'bg-surface-2 text-text-muted'
                }`}
              >
                ☀️ {t('profile.themeLight')}
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t('profile.language')}
            </div>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                    i18n.language.startsWith(l.code)
                      ? 'gradient-brand text-white'
                      : 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <Toggle
              checked={user?.settings?.notifications ?? true}
              onChange={toggleNotifications}
              label={t('profile.notifications')}
            />
          </div>
        </GlassCard>

        <Button variant="danger" fullWidth size="lg" onClick={logout}>
          {t('auth.signOut')}
        </Button>

        <p className="text-center text-xs text-text-muted pt-2">
          {t('profile.version')} 1.0.0
        </p>
      </div>
    </div>
  );
}
