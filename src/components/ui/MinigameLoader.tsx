import React from 'react';
import { motion } from 'framer-motion';

interface MinigameLoaderProps {
  icon: string;
  name: string;
  tip?: string;
}

const DEFAULT_TIPS = [
  "Preparing the Market...",
  "Connecting to the Trading Floor...",
  "Analyzing Competitor Moves...",
  "Securing the Bag...",
  "Calculating Potential ROI...",
  "Syncing with Global Indices..."
];

export const MinigameLoader: React.FC<MinigameLoaderProps> = ({ icon, name, tip }) => {
  const displayTip = tip || DEFAULT_TIPS[Math.floor(Math.random() * DEFAULT_TIPS.length)];

  return (
    <div className="w-full max-w-md mx-auto aspect-square bg-slate-900 rounded-3xl border-2 border-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />

      <motion.div
        animate={{
          scale: [0.9, 1.05, 0.9],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-7xl mb-6 relative z-10"
      >
        {icon}
      </motion.div>

      <div className="text-center relative z-10">
        <h3 className="text-white font-black text-lg uppercase tracking-tighter mb-1">
          {name}
        </h3>
        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
          {displayTip}
        </p>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>
    </div>
  );
};
