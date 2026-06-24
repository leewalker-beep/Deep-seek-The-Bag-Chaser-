import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerfectFlowProps {
  isActive: boolean;
  intensity?: number; // 1 to 5
}

export const PerfectFlow: React.FC<PerfectFlowProps> = ({ isActive, intensity = 1 }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[150]"
        >
          {/* Edge Glow */}
          <motion.div
            className="absolute inset-0"
            style={{ boxShadow: 'inset 0 0 80px rgba(16,185,129,0.3)' }}
            animate={{
                boxShadow: [
                    'inset 0 0 60px rgba(16,185,129,0.2)',
                    'inset 0 0 100px rgba(16,185,129,0.4)',
                    'inset 0 0 60px rgba(16,185,129,0.2)'
                ]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />

          {/* Speed Streaks */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
                style={{
                  height: '2px',
                  width: '200px',
                  top: `${15 + i * 15}%`,
                  left: '-250px'
                }}
                animate={{ x: typeof window !== 'undefined' ? window.innerWidth + 500 : 2000 }}
                transition={{
                  duration: 0.8 / (1 + intensity * 0.1),
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* Center Indicator */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 px-4 py-1 rounded-full"
          >
            <div className="flex items-center gap-2">
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Perfect Flow</span>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-2 rounded-full ${i < intensity ? 'bg-emerald-400' : 'bg-emerald-900/30'}`}
                        />
                    ))}
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
