import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { HERO_ARTWORK } from '../config/heroArtwork';
import { LEGACY_UPGRADES } from '../config/legacyUpgrades';

export const LegacyShop: React.FC<{ onProceed: () => void }> = ({ onProceed }) => {
  const { bankedLegacyPoints, unlockedLegacyUpgradeIds, unlockLegacyUpgrade, triggerTransition } = useGameStore();

  useEffect(() => {
    triggerTransition(HERO_ARTWORK.LEGACY_SHOP);
  }, [triggerTransition]);

  const categories = ['STARTING_STATS', 'ASSETS', 'HUSTLES', 'PERKS', 'ORIGINS'];

  const handlePurchase = (id: string) => {
    unlockLegacyUpgrade(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-md space-y-8 pt-8">
        <div className="text-center space-y-1">
          <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mb-1">META PROGRESSION</div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tighter italic uppercase italic"
          >
            Legacy Shop
          </motion.h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
            Expand your potential for future runs
          </p>
        </div>

        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-[2rem] p-6 flex justify-between items-center shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">BANKED LEGACY</div>
          <div className="text-3xl font-black text-emerald-400 font-mono leading-none">
            {bankedLegacyPoints.toLocaleString()}
          </div>
        </div>

        <div className="space-y-10">
          {categories.map(cat => {
            const upgrades = LEGACY_UPGRADES.filter(u => u.category === cat);
            if (upgrades.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <h2 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] ml-1 border-b border-emerald-500/10 pb-2">
                  {cat.replace('_', ' ')}
                </h2>
                <div className="space-y-2">
                  {upgrades.map(upgrade => {
                    const isUnlocked = unlockedLegacyUpgradeIds.includes(upgrade.id);
                    const canAfford = bankedLegacyPoints >= upgrade.cost;

                    return (
                      <div
                        key={upgrade.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isUnlocked
                            ? 'bg-emerald-500/10 border-emerald-500/30 opacity-80'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{upgrade.icon}</span>
                            <div>
                              <h3 className="font-bold text-sm">{upgrade.name}</h3>
                              <p className="text-[10px] text-slate-400 leading-tight pr-4">
                                {upgrade.description}
                              </p>
                            </div>
                          </div>
                          {!isUnlocked && (
                            <div className="text-right">
                              <div className={`text-xs font-black font-mono ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                                {upgrade.cost.toLocaleString()}
                              </div>
                              <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Points</div>
                            </div>
                          )}
                        </div>

                        {isUnlocked ? (
                          <div className="w-full py-1 text-center text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 rounded">
                            Active
                          </div>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => handlePurchase(upgrade.id)}
                            className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all ${
                              canAfford
                                ? 'bg-white text-black hover:bg-emerald-400'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? 'Unlock Upgrade' : 'Insufficient Points'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-12 pb-16">
          <button
            onClick={onProceed}
            className="w-full py-6 bg-emerald-500 text-black font-black text-lg uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:bg-emerald-400 active:scale-[0.98] transition-all mb-4"
          >
            INITIALIZE RUN →
          </button>
          <p className="text-center text-[9px] text-slate-600 uppercase font-black tracking-widest opacity-50">
            BAG CHASER SYSTEM V1.0 // PERMANENT PROTOCOLS
          </p>
        </div>
      </div>
    </div>
  );
};
