import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  delay: number;
  size: number;
  drift: number;
  rotEnd: number;
}

interface Props {
  emoji: string;
  onDone: () => void;
}

export function EmojiBlast({ emoji, onDone }: Props) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        delay: Math.random() * 0.55,
        size: 1.8 + Math.random() * 2.8,
        drift: -40 + Math.random() * 80,
        rotEnd: -60 + Math.random() * 120,
      })),
    [],
  );

  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {/* dim backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0.25, 0] }}
        transition={{ duration: 2.5, times: [0, 0.1, 0.7, 1] }}
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            bottom: '-8%',
            fontSize: `${p.size}rem`,
            lineHeight: 1,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, x: 0 }}
          animate={{
            y: -(window.innerHeight * 1.3),
            opacity: [1, 1, 1, 0],
            rotate: p.rotEnd,
            x: p.drift,
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: [0.15, 0.8, 0.4, 1],
            opacity: { times: [0, 0.5, 0.75, 1] },
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
