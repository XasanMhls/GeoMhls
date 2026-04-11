import { motion } from "framer-motion";

// Brand gradient IDs are unique per component to avoid SVG id collisions
const COLORS = {
  indigo: "#6366f1",
  purple: "#a855f7",
  pink: "#ec4899",
};

// ─── EmptyGroups ─────────────────────────────────────────────────────────────
// Float animation lives on the wrapper div for hardware acceleration
// (rendering-animate-svg-wrapper rule)

export function EmptyGroups({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block", lineHeight: 0 }}
      animate={{ y: [5, -5, 5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="eg-grad-left" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.indigo} stopOpacity="0.85" />
            <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="eg-grad-right" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.pink} stopOpacity="0.85" />
            <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="eg-grad-bottom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLORS.indigo} stopOpacity="0.4" />
          </radialGradient>
          <filter id="eg-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Shadow layer */}
        <ellipse cx="80" cy="133" rx="50" ry="6" fill="#000" opacity="0.08" filter="url(#eg-blur)" />

        {/* Left circle */}
        <circle cx="56" cy="62" r="42" fill="url(#eg-grad-left)" opacity="0.75" />
        {/* Right circle */}
        <circle cx="104" cy="62" r="42" fill="url(#eg-grad-right)" opacity="0.75" />
        {/* Bottom circle */}
        <circle cx="80" cy="96" r="42" fill="url(#eg-grad-bottom)" opacity="0.75" />

        {/* Soft inner highlights */}
        <circle cx="44" cy="48" r="10" fill="white" opacity="0.12" />
        <circle cx="116" cy="48" r="10" fill="white" opacity="0.12" />
      </svg>
    </motion.div>
  );
}

// ─── EmptyChat ────────────────────────────────────────────────────────────────
// Mount scale animation on wrapper; dot bounce animations stay on SVG elements
// since they animate individual shapes, not the SVG root

const dotVariants = {
  bounce: (i: number) => ({
    y: [0, -5, 0],
    transition: {
      duration: 0.7,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.18,
    },
  }),
};

export function EmptyChat({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block", lineHeight: 0 }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ec-grad-back" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.indigo} />
            <stop offset="100%" stopColor={COLORS.purple} />
          </linearGradient>
          <linearGradient id="ec-grad-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.purple} />
            <stop offset="100%" stopColor={COLORS.pink} />
          </linearGradient>
          <filter id="ec-shadow" x="-10%" y="-10%" width="130%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={COLORS.purple} floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Back bubble — rotated slightly */}
        <g transform="rotate(-8, 80, 70)">
          <rect
            x="20"
            y="22"
            width="100"
            height="68"
            rx="18"
            fill="url(#ec-grad-back)"
            opacity="0.55"
            filter="url(#ec-shadow)"
          />
          {/* Tail */}
          <path d="M34 90 L24 108 L52 90Z" fill="url(#ec-grad-back)" opacity="0.55" />
        </g>

        {/* Front bubble */}
        <g transform="rotate(5, 80, 70)">
          <rect
            x="38"
            y="38"
            width="100"
            height="68"
            rx="18"
            fill="url(#ec-grad-front)"
            opacity="0.9"
            filter="url(#ec-shadow)"
          />
          {/* Tail */}
          <path d="M124 106 L138 122 L110 106Z" fill="url(#ec-grad-front)" opacity="0.9" />
          {/* Highlight sheen */}
          <rect x="46" y="44" width="60" height="8" rx="4" fill="white" opacity="0.15" />
        </g>

        {/* Animated dots — motion.circle on individual SVG elements is fine */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={70 + i * 16}
            cy={74}
            r={4.5}
            fill="white"
            opacity={0.9}
            custom={i}
            animate="bounce"
            variants={dotVariants}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── EmptyMap ─────────────────────────────────────────────────────────────────
// Bounce animation on wrapper div for hardware acceleration

export function EmptyMap({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block", lineHeight: 0 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="140"
        height="160"
        viewBox="0 0 140 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="em-grad-pin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.indigo} />
            <stop offset="50%" stopColor={COLORS.purple} />
            <stop offset="100%" stopColor={COLORS.pink} />
          </linearGradient>
          <radialGradient id="em-grad-inner" cx="38%" cy="35%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="em-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="em-shadow-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Shadow on ground */}
        <ellipse
          cx="70"
          cy="148"
          rx="24"
          ry="7"
          fill={COLORS.purple}
          opacity="0.18"
          filter="url(#em-shadow-blur)"
        />

        {/* Pin body: teardrop shape */}
        <path
          d="M70 16 C46 16 28 34 28 56 C28 82 70 128 70 128 C70 128 112 82 112 56 C112 34 94 16 70 16Z"
          fill="url(#em-grad-pin)"
          filter="url(#em-glow)"
        />

        {/* Inner highlight */}
        <path
          d="M70 16 C46 16 28 34 28 56 C28 82 70 128 70 128 C70 128 112 82 112 56 C112 34 94 16 70 16Z"
          fill="url(#em-grad-inner)"
        />

        {/* Center hole */}
        <circle cx="70" cy="55" r="16" fill="white" opacity="0.92" />
        <circle cx="70" cy="55" r="7" fill="url(#em-grad-pin)" opacity="0.7" />
      </svg>
    </motion.div>
  );
}

// ─── NoResults ────────────────────────────────────────────────────────────────
// Shake animation on wrapper div; originX/Y on the div for correct pivot

const shakeVariants = {
  initial: { rotate: 0 },
  shake: {
    rotate: [0, -12, 10, -8, 6, -4, 2, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

export function NoResults({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block", lineHeight: 0, originX: "50%", originY: "50%" }}
      initial="initial"
      animate="shake"
      variants={shakeVariants}
    >
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nr-grad-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.indigo} />
            <stop offset="50%" stopColor={COLORS.purple} />
            <stop offset="100%" stopColor={COLORS.pink} />
          </linearGradient>
          <linearGradient id="nr-grad-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.indigo} stopOpacity="0.08" />
            <stop offset="100%" stopColor={COLORS.pink} stopOpacity="0.12" />
          </linearGradient>
          <filter id="nr-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lens circle fill */}
        <circle cx="58" cy="58" r="40" fill="url(#nr-grad-fill)" />

        {/* Lens circle stroke */}
        <circle
          cx="58"
          cy="58"
          r="40"
          stroke="url(#nr-grad-stroke)"
          strokeWidth="5.5"
          strokeLinecap="round"
          filter="url(#nr-glow)"
        />

        {/* Handle */}
        <line
          x1="89"
          y1="89"
          x2="118"
          y2="118"
          stroke="url(#nr-grad-stroke)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#nr-glow)"
        />

        {/* X mark */}
        <line
          x1="44"
          y1="44"
          x2="72"
          y2="72"
          stroke="url(#nr-grad-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="44"
          x2="44"
          y2="72"
          stroke="url(#nr-grad-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
