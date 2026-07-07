import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLoaderProps {
  message: string;
  subtitle?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ message, subtitle }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-6">
      <div className="text-center max-w-xs w-full">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl mb-6"
        >
          💎
        </motion.div>

        <h2 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2 animate-pulse">
          {message}
        </h2>

        {subtitle && (
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
            {subtitle}
          </p>
        )}

        <div className="mt-8 w-full bg-slate-900 h-0.5 overflow-hidden rounded-full">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
          />
        </div>
      </div>
    </div>
  );
};
