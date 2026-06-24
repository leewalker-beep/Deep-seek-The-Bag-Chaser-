import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPECIALIZATIONS } from '../config/specializations';
import { useGameStore } from '../store/gameStore';
import { PROGRESSION_ORDER } from '../config/tiers';

export const SpecializationModal: React.FC = () => {
  const { pl, pendingSpecialization, selectSpecialization } = useGameStore();

  const nextTier = useMemo(() => {
    const currentIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
    return PROGRESSION_ORDER[currentIndex + 1];
  }, [pl.currentTier]);

  const options = useMemo(() => {
    // Pick 3 random specializations
    const shuffled = [...SPECIALIZATIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [pl.currentTier]); // Refresh options when tier changes

  if (!pendingSpecialization) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]"
      >
        <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-emerald-900/20 to-transparent">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            TIER ADVANCED: <span className="text-emerald-400">{nextTier}</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Choose your specialization to mitigate the stat tax and gain unique bonuses for this tier.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 gap-4">
          {options.map((spec) => (
            <button
              key={spec.id}
              onClick={() => selectSpecialization(spec.id)}
              className="group relative flex items-start gap-4 p-5 bg-slate-800/50 hover:bg-emerald-900/20 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all text-left"
            >
              <div className="text-4xl bg-slate-900 p-3 rounded-xl border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                {spec.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {spec.name}
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {spec.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="px-2 py-1 bg-slate-900 rounded-md text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    Clout Tax: {Math.round((1 - spec.cloutTaxMultiplier) * 100)}%
                  </div>
                  <div className="px-2 py-1 bg-slate-900 rounded-md text-[10px] font-black text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                    Aura Tax: {Math.round((1 - spec.auraTaxMultiplier) * 100)}%
                  </div>
                  {spec.yieldCashMult && (
                    <div className="px-2 py-1 bg-slate-900 rounded-md text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                      +{Math.round((spec.yieldCashMult - 1) * 100)}% Cash
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">
                CHOOSE WISELY • YOUR LEGACY DEPENDS ON IT
            </p>
        </div>
      </motion.div>
    </div>
  );
};
