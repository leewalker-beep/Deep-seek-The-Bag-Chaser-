import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const FirstCrownModal: React.FC = () => {
  const pendingFirstCrown = useGameStore(state => state.pendingFirstCrown);
  const setPendingFirstCrown = useGameStore(state => state.setPendingFirstCrown);

  if (!pendingFirstCrown) return null;

  const handleDismiss = () => {
    setPendingFirstCrown(null);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-6 shadow-[0_0_60px_rgba(234,179,8,0.25)] relative overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 text-center">
          {/* Crown Icon & Header */}
          <div>
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/30 animate-bounce">
              👑
            </div>
            <span className="text-[10px] font-mono font-black text-yellow-400 uppercase tracking-widest block mb-1">
              MAJOR MILESTONE ACHIEVED
            </span>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
              FIRST CROWN EARNED!
            </h2>
            <p className="text-[11px] text-yellow-300 italic font-medium mt-1">
              "I mastered a different way of making it."
            </p>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mt-1">
              You mastered <span className="text-yellow-400 font-black">{pendingFirstCrown.hustleName}</span>!
            </p>
          </div>

          {/* Explanation Cards */}
          <div className="space-y-3 text-left">
            {/* Card 1: Why Earned */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">🎯</span>
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">
                  WHY YOU EARNED IT
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight pl-5">
                You reached total operational mastery in {pendingFirstCrown.hustleName} by completing its execution targets!
              </p>
            </div>

            {/* Card 2: Permanence */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">🛡️</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  PERMANENT ACHIEVEMENT
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight pl-5">
                Crowns are permanent—they never decay, reset, or consume when you advance to higher career tiers!
              </p>
            </div>

            {/* Card 3: Tier Advancement */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">⚡</span>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                  TIER ADVANCEMENT POWER
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight pl-5">
                Crowns prove your business leverage. Higher career tiers require Crown thresholds to unlock (e.g., STREET tier requires 3 Crowns).
              </p>
            </div>

            {/* Card 4: Stacking Crowns */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs">🚀</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                  MASTER MORE HUSTLES
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight pl-5">
                Each newly mastered hustle grants another Crown. Master multiple ventures across the city to build your empire!
              </p>
            </div>
          </div>

          {/* Claim Action Button */}
          <button
            onClick={handleDismiss}
            onTouchEnd={(e) => { e.preventDefault(); handleDismiss(); }}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-500/20 transition-all active:scale-95 cursor-pointer"
          >
            👑 CLAIM CROWN & CONTINUE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
