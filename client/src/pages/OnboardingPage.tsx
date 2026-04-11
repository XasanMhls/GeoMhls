import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    { key: 'slide1', gradient: 'from-brand to-accent', icon: '🗺️' },
    { key: 'slide2', gradient: 'from-accent to-pink-500', icon: '💬' },
    { key: 'slide3', gradient: 'from-pink-500 to-orange-400', icon: '👥' },
  ];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate('/map', { replace: true });
  };

  const slide = slides[step];

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden px-6 py-10 safe-top safe-bottom">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20 transition-all duration-700`} />

      <div className="relative flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-[48px] glass-strong text-7xl shadow-2xl">
              {slide.icon}
            </div>
            <h2 className="max-w-xs text-3xl font-extrabold tracking-tight">
              {t(`onboarding.${slide.key}Title`)}
            </h2>
            <p className="mt-3 max-w-xs text-text-muted">
              {t(`onboarding.${slide.key}Sub`)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-brand' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
        <Button size="lg" fullWidth onClick={next}>
          {step < slides.length - 1 ? t('common.next') : t('common.done')}
        </Button>
      </div>
    </div>
  );
}
