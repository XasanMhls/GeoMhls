import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Language } from '@geomhls/shared';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/stores/themeStore';

/* ─── Animation helpers ─── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Icons (inline SVG) ─── */
function MapPinIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function UsersIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ShieldIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ChevronDown({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   WELCOME PAGE — MNTN-style landing (i18n + theme-aware)
   ═══════════════════════════════════════════════════════ */
const LANGS: { code: Language; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'uz', flag: '🇺🇿', label: 'UZ' },
];

export default function WelcomePage() {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [langOpen, setLangOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const isDark = theme === 'dark';

  // Theme palettes
  const bgMain = isDark ? 'rgb(11 14 20)' : 'rgb(250 250 253)';
  const bgAlt = isDark ? 'rgb(15 20 30)' : 'rgb(243 244 250)';
  const bgDeep = isDark ? 'rgb(8 10 16)' : 'rgb(238 240 248)';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-white/50' : 'text-gray-600';
  const textSoft = isDark ? 'text-white/60' : 'text-gray-500';
  const textFaint = isDark ? 'text-white/40' : 'text-gray-400';
  const textDim = isDark ? 'text-white/30' : 'text-gray-400';
  const textNav = isDark ? 'text-white/70' : 'text-gray-700';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const subtleBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const mockupBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)';

  const currentLang = LANGS.find((l) => i18n.language.startsWith(l.code)) || LANGS[0];

  return (
    <div className="min-h-screen" style={{ background: bgMain }}>

      {/* ━━━ NAVBAR ━━━ */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{ background: isDark ? 'linear-gradient(180deg, rgba(11,14,20,0.9) 0%, transparent 100%)' : 'linear-gradient(180deg, rgba(250,250,253,0.95) 0%, transparent 100%)' }}>
        <div className="landing-container flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
            <span className={`heading-section text-xl ${textMain}`}>GeoMhls</span>
          </div>
          <div className={`hidden md:flex items-center gap-8 text-sm ${textNav}`}>
            <a href="#features" className="hover:text-[#fbd784] transition">{t('landing.nav.features')}</a>
            <a href="#how-it-works" className="hover:text-[#fbd784] transition">{t('landing.nav.howItWorks')}</a>
            <a href="#safety" className="hover:text-[#fbd784] transition">{t('landing.nav.safety')}</a>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
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

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
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
                        onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold transition ${
                          i18n.language.startsWith(l.code)
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

            <Link to="/login">
              <button className={`hidden sm:flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white hover:text-[#fbd784]' : 'text-gray-700 hover:text-indigo-600'} transition`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                {t('auth.signIn')}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO SECTION ━━━ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0" style={{
            background: isDark
              ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 30% 80%, rgba(236,72,153,0.08) 0%, transparent 50%)'
              : 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 30% 80%, rgba(251,215,132,0.2) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0" style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(11,14,20,0) 0%, rgba(11,14,20,0.4) 60%, rgb(11,14,20) 100%)'
              : 'linear-gradient(180deg, rgba(250,250,253,0) 0%, rgba(250,250,253,0.4) 60%, rgb(250,250,253) 100%)',
          }} />
        </motion.div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: '#6366f1', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#a855f7', animation: 'float 10s ease-in-out infinite 2s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: '#fbd784', animation: 'float 6s ease-in-out infinite 1s' }} />

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 landing-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="tagline-line justify-center mb-8">
              <span>{t('landing.tagline')}</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`heading-hero ${textMain}`}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
          >
            {t('landing.heroTitle1')}<br />
            <span className="gradient-gold" style={{ WebkitTextFillColor: 'transparent' }}>{t('landing.heroTitle2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-6 mx-auto max-w-xl text-lg ${textSoft} leading-relaxed`}
          >
            {t('landing.heroSub')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="px-10 text-base">
                {t('auth.getStarted')}
              </Button>
            </Link>
            <Link to="/login">
              <button className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold transition-all ${isDark ? 'text-white/80 border border-white/20 hover:border-white/40 hover:text-white' : 'text-gray-700 border border-gray-300 hover:border-gray-500 hover:text-gray-900'}`}>
                {t('auth.haveAccount')}
              </button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className={`mt-20 flex flex-col items-center gap-2 ${textFaint}`}
          >
            <span className="text-xs font-medium tracking-widest uppercase">{t('landing.scrollDown')}</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ FEATURE 01 — LIVE MAP ━━━ */}
      <section id="features" className="landing-section" style={{ background: bgMain }}>
        <div className="landing-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <FadeUp>
                <span className="section-number absolute -left-4 md:left-0 -top-8 select-none">01</span>
              </FadeUp>
              <FadeUp delay={0.1} className="relative z-10">
                <div className="tagline-line mb-4">
                  <span>{t('landing.f1.tag')}</span>
                </div>
                <h2 className={`heading-section ${textMain} text-4xl md:text-5xl mb-6`}>
                  {t('landing.f1.title1')}<br />{t('landing.f1.title2')}
                </h2>
                <p className={`${textMuted} text-base leading-relaxed mb-8 max-w-lg`}>
                  {t('landing.f1.desc')}
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-[#fbd784] font-semibold hover:gap-3 transition-all">
                  {t('landing.f1.cta')} <ArrowRight />
                </Link>
              </FadeUp>
            </div>
            <FadeUp delay={0.2} className="order-1 md:order-2">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.1) 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full border-2 border-indigo-500/30" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2">
                        <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-xl shadow-indigo-500/40" style={{ animation: 'float 3s ease-in-out infinite' }}>
                          {t('map.you')}
                        </div>
                      </div>
                      <div className="absolute top-20 right-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-xl shadow-emerald-500/40" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
                          AB
                        </div>
                      </div>
                      <div className="absolute bottom-16 left-10">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-xl shadow-amber-500/40" style={{ animation: 'float 3.5s ease-in-out infinite 0.5s' }}>
                          CD
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border border-indigo-400/30" style={{ animation: 'pulse-ring 3s ease-out infinite' }} />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl" style={{ border: `1px solid ${subtleBorder}` }} />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ━━━ FEATURE 02 — CIRCLES ━━━ */}
      <section className="landing-section" style={{ background: bgMain }}>
        <div className="landing-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="space-y-4">
                    {[
                      { emoji: '👨‍👩‍👧‍👦', name: 'Family', color: '#a855f7', members: 4 },
                      { emoji: '🎮', name: 'Gaming Squad', color: '#6366f1', members: 6 },
                      { emoji: '💼', name: 'Work Team', color: '#06b6d4', members: 8 },
                    ].map((g, i) => (
                      <motion.div
                        key={g.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                        className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
                        style={{ background: mockupBg, backdropFilter: 'blur(10px)', border: `1px solid ${cardBorder}` }}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: g.color }}>
                          {g.emoji}
                        </div>
                        <div>
                          <div className={`${textMain} font-semibold text-sm`}>{g.name}</div>
                          <div className={`${textFaint} text-xs`}>{t('groups.members', { count: g.members })}</div>
                        </div>
                        <div className="ml-auto flex -space-x-2">
                          {Array.from({ length: Math.min(3, g.members) }).map((_, j) => (
                            <div key={j} className="w-7 h-7 rounded-full border-2" style={{ background: `hsl(${200 + j * 40}, 60%, 60%)`, borderColor: bgMain }} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.65 }}
                      className="mt-2 text-center"
                    >
                      <div className={`${textDim} text-xs uppercase tracking-widest mb-2`}>{t('groups.inviteCode')}</div>
                      <div className="gradient-gold text-3xl font-black tracking-[0.3em]" style={{ WebkitTextFillColor: 'transparent' }}>
                        X7K9M2
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl" style={{ border: `1px solid ${subtleBorder}` }} />
              </div>
            </FadeUp>
            <div className="relative">
              <FadeUp>
                <span className="section-number absolute right-0 -top-8 select-none">02</span>
              </FadeUp>
              <FadeUp delay={0.1} className="relative z-10">
                <div className="tagline-line mb-4">
                  <span>{t('landing.f2.tag')}</span>
                </div>
                <h2 className={`heading-section ${textMain} text-4xl md:text-5xl mb-6`}>
                  {t('landing.f2.title1')}<br />{t('landing.f2.title2')}
                </h2>
                <p className={`${textMuted} text-base leading-relaxed mb-8 max-w-lg`}>
                  {t('landing.f2.desc')}
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-[#fbd784] font-semibold hover:gap-3 transition-all">
                  {t('landing.f2.cta')} <ArrowRight />
                </Link>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FEATURE 03 — CHAT ━━━ */}
      <section className="landing-section" style={{ background: bgMain }}>
        <div className="landing-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <FadeUp>
                <span className="section-number absolute -left-4 md:left-0 -top-8 select-none">03</span>
              </FadeUp>
              <FadeUp delay={0.1} className="relative z-10">
                <div className="tagline-line mb-4">
                  <span>{t('landing.f3.tag')}</span>
                </div>
                <h2 className={`heading-section ${textMain} text-4xl md:text-5xl mb-6`}>
                  {t('landing.f3.title1')}<br />{t('landing.f3.title2')}
                </h2>
                <p className={`${textMuted} text-base leading-relaxed mb-8 max-w-lg`}>
                  {t('landing.f3.desc')}
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-[#fbd784] font-semibold hover:gap-3 transition-all">
                  {t('landing.f3.cta')} <ArrowRight />
                </Link>
              </FadeUp>
            </div>
            <FadeUp delay={0.2} className="order-1 md:order-2">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(6,182,212,0.1) 100%)' }}>
                <div className="absolute inset-0 flex items-center justify-center px-8">
                  <div className="w-full max-w-xs space-y-3">
                    {[
                      { key: 'msg1', mine: false, name: 'Alice' },
                      { key: 'msg2', mine: true },
                      { key: 'msg3', mine: false, name: 'Alice' },
                      { key: 'msg4', mine: true },
                    ].map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, x: msg.mine ? 10 : -10 }}
                        whileInView={{ opacity: 1, y: 0, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.2 }}
                        className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm max-w-[80%] ${
                            msg.mine
                              ? 'rounded-br-md text-white'
                              : `rounded-bl-md ${isDark ? 'text-white' : 'text-gray-900'}`
                          }`}
                          style={{
                            background: msg.mine
                              ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                              : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          }}
                        >
                          {!msg.mine && <div className="text-[#fbd784] text-xs font-semibold mb-0.5">{msg.name}</div>}
                          {t(`landing.chat.${msg.key}`)}
                        </div>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2 }}
                      className="flex gap-1 px-4 py-3 rounded-2xl rounded-bl-md w-16"
                      style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/50' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '-0.3s' }} />
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/50' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '-0.15s' }} />
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/50' : 'bg-gray-500'} animate-bounce`} />
                    </motion.div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl" style={{ border: `1px solid ${subtleBorder}` }} />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="landing-section" style={{ background: isDark ? 'linear-gradient(180deg, rgb(11 14 20) 0%, rgb(15 20 30) 100%)' : 'linear-gradient(180deg, rgb(250 250 253) 0%, rgb(243 244 250) 100%)' }}>
        <div className="landing-container">
          <FadeUp className="text-center mb-20">
            <div className="tagline-line justify-center mb-4">
              <span>{t('landing.tutorial.tag')}</span>
            </div>
            <h2 className={`heading-section ${textMain} text-4xl md:text-5xl`}>
              {t('landing.tutorial.title')}
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M12 14v7" /><path d="M9 18h6" /></svg>,
                title: t('landing.tutorial.step1'),
                desc: t('landing.tutorial.step1d'),
              },
              {
                step: '02',
                icon: <UsersIcon className="w-8 h-8" />,
                title: t('landing.tutorial.step2'),
                desc: t('landing.tutorial.step2d'),
              },
              {
                step: '03',
                icon: <MapPinIcon className="w-8 h-8" />,
                title: t('landing.tutorial.step3'),
                desc: t('landing.tutorial.step3d'),
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.15}>
                <div className="feature-card relative text-center group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="mt-6 mb-1 text-xs font-bold tracking-widest text-[#fbd784] uppercase">Step {item.step}</div>
                  <h3 className={`heading-section ${textMain} text-xl mb-3`}>{item.title}</h3>
                  <p className={`${textSoft} text-sm leading-relaxed`}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SAFETY / PRIVACY ━━━ */}
      <section id="safety" className="landing-section" style={{ background: bgAlt }}>
        <div className="landing-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="tagline-line mb-4">
                <span>{t('landing.safety.tag')}</span>
              </div>
              <h2 className={`heading-section ${textMain} text-4xl md:text-5xl mb-6`}>
                {t('landing.safety.title1')}<br />{t('landing.safety.title2')}
              </h2>
              <p className={`${textMuted} text-base leading-relaxed mb-8 max-w-lg`}>
                {t('landing.safety.desc')}
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <ShieldIcon />, label: t('landing.safety.encrypted') },
                  { icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: t('landing.safety.private') },
                  { icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /><line x1="1" y1="1" x2="23" y2="23" /></svg>, label: t('landing.safety.ghost') },
                  { icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>, label: t('landing.safety.noAds') },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="feature-card flex flex-col items-center text-center py-8"
                  >
                    <div className="text-[#fbd784] mb-4">{item.icon}</div>
                    <div className={`${textMain} text-sm font-semibold whitespace-pre-line`}>{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <section className="landing-section" style={{ background: isDark ? 'linear-gradient(180deg, rgb(15 20 30) 0%, rgb(11 14 20) 100%)' : 'linear-gradient(180deg, rgb(243 244 250) 0%, rgb(250 250 253) 100%)' }}>
        <div className="landing-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', key: 'users' },
              { value: '50K+', key: 'circles' },
              { value: '1M+', key: 'messages' },
              { value: '99.9%', key: 'uptime' },
            ].map((stat, i) => (
              <FadeUp key={stat.key} delay={i * 0.1}>
                <div className="stat-number mb-2">{stat.value}</div>
                <div className={`${textFaint} text-sm font-medium`}>{t(`landing.stats.${stat.key}`)}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section className="landing-section" style={{ background: bgMain }}>
        <div className="landing-container text-center">
          <FadeUp>
            <h2 className={`heading-hero ${textMain}`} style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t('landing.cta.title1')}<br />
              <span className="gradient-gold" style={{ WebkitTextFillColor: 'transparent' }}>{t('landing.cta.title2')}</span>
            </h2>
            <p className={`mt-6 mx-auto max-w-md ${textMuted} leading-relaxed`}>
              {t('landing.cta.desc')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="px-12 text-base">
                  {t('landing.cta.btn')}
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer style={{ background: bgDeep, borderTop: `1px solid ${subtleBorder}` }}>
        <div className="landing-container py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                  <MapPinIcon className="w-4 h-4 text-white" />
                </div>
                <span className={`heading-section text-lg ${textMain}`}>GeoMhls</span>
              </div>
              <p className={`${textFaint} text-sm leading-relaxed max-w-xs`}>
                {t('landing.footer.desc')}
              </p>
            </div>
            <div>
              <h4 className={`${textMain} font-semibold text-sm mb-4`}>{t('landing.footer.product')}</h4>
              <div className="space-y-3">
                <a href="#features" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.nav.features')}</a>
                <a href="#how-it-works" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.nav.howItWorks')}</a>
                <a href="#safety" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.nav.safety')}</a>
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.pricing')}</a>
              </div>
            </div>
            <div>
              <h4 className={`${textMain} font-semibold text-sm mb-4`}>{t('landing.footer.company')}</h4>
              <div className="space-y-3">
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.about')}</a>
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.blog')}</a>
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.careers')}</a>
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.contact')}</a>
                <a href="#" className={`block ${textFaint} hover:text-[#fbd784] text-sm transition`}>{t('landing.footer.privacy')}</a>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${subtleBorder}` }}>
            <p className={`${textDim} text-xs`}>
              {t('landing.footer.copyright')}
            </p>
            <div className="flex items-center gap-4">
              {[
                <svg key="ig" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
                <svg key="tw" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>,
                <svg key="gh" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>,
              ].map((icon, i) => (
                <a key={i} href="#" className={`${textDim} hover:text-[#fbd784] transition`}>{icon}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
