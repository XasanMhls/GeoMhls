import { AnimatePresence, motion } from 'framer-motion';

export function SplashScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Logo container */}
          <motion.div
            className="flex items-center justify-center w-20 h-20 rounded-3xl gradient-brand"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 1.6,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-12 h-12"
            >
              <path
                d="M50 20C35.6 20 24 31.6 24 46c0 18 26 38 26 38s26-20 26-38c0-14.4-11.6-26-26-26zm0 36c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z"
                fill="white"
              />
            </svg>
          </motion.div>

          {/* App name */}
          <p className="mt-5 text-3xl font-extrabold gradient-text">GeoMhls</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
