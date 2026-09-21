import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPECIALIZATIONS } from '../config/specializations';
import { useGameStore } from '../store/gameStore';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import { getMasteryCount } from '../utils/masteryUtils';

const TRANSITION_THEMES: Record<string, { title: string; subtitle: string; icon: string }> = {
  STREET: {
    title: "ESCAPE THE MUD",
    subtitle: "You've survived the daily grind. Now begin building your local empire.",
    icon: "🏙️"
  },
  STARTUP: {
    title: "ACCELERATE THE ENGINE",
    subtitle: "Incorporate, scale digital assets, and outpace aggressive market rivals.",
    icon: "🚀"
  },
  CORPORATE: {
    title: "SCALE THE ENTERPRISE",
    subtitle: "Institutional compliance unlocked. Command corporate boards and media empires.",
    icon: "🏢"
  },
  ELITE: {
    title: "EXERT SOVEREIGN INFLUENCE",
    subtitle: "Sovereign wealth and syndicates. Dictate market moves from high-rise sanctuaries.",
    icon: "👑"
  },
  MOGUL: {
    title: "UNLEASH DOMINANT POWER",
    subtitle: "Uncontested commercial power. Every industry answers to your global umbrella.",
    icon: "⚡"
  },
  PRESIDENT: {
    title: "ASCEND TO THE OVAL OFFICE",
    subtitle: "Commander-in-Chief. Exercise supreme statecraft and govern national GDP.",
    icon: "🇺🇸"
  },
  OPEN: {
    title: "SEAL YOUR IMMORTAL LEGACY",
    subtitle: "Absolute transcendence. Infinite freedom to shape your story for the Hall of Fame.",
    icon: "💎"
  }
};

export const SpecializationModal: React.FC = () => {
  const { pl, pendingSpecialization, selectSpecialization } = useGameStore();

  const nextTier = useMemo(() => {
    const currentIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
    return PROGRESSION_ORDER[currentIndex + 1];
  }, [pl.currentTier]);

  const req = nextTier ? TIER_REQUIREMENTS[nextTier] : null;
  const theme = nextTier ? TRANSITION_THEMES[nextTier] || { title: `ADVANCE TO ${nextTier}`, subtitle: "Step into your next career tier.", icon: "⚡" } : null;

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
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 rounded px-2 py-0.5">
              {theme?.icon} {nextTier} TIER PROMOTION
            </span>
            {req && (
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                FILING FEE: <span className="text-emerald-400 font-bold">${req.fee.toLocaleString()}</span> • CROWNS: <span className="text-yellow-400 font-bold">{getMasteryCount(pl)}/{req.crowns}</span>
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            {theme?.title}
          </h2>
          <p className="text-slate-300 text-xs mt-2 font-medium leading-relaxed">
            {theme?.subtitle} Select your corporate specialization below to manage filing fees and stat taxes.
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
