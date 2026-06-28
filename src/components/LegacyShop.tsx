import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { LEGACY_UPGRADES } from '../config/legacyUpgrades';

export const LegacyShop: React.FC<{ onProceed: () => void }> = ({ onProceed }) => {
  const { bankedLegacyPoints, unlockedLegacyUpgradeIds, unlockLegacyUpgrade } = useGameStore();

  const categories = ['STARTING_STATS', 'ASSETS', 'HUSTLES', 'PERKS', 'ORIGINS'];

  const handlePurchase = (id: string) => {
    unlockLegacyUpgrade(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tighter"
          >
            LEGACY SHOP
          </motion.h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
            Spend points earned from past runs
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Points</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {bankedLegacyPoints.toLocaleString()}
          </div>
        </div>

        <div className="space-y-6">
          {categories.map(cat => {
            const upgrades = LEGACY_UPGRADES.filter(u => u.category === cat);
            if (upgrades.length === 0) return null;

            return (
              <div key={cat} className="space-y-3">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
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

        <div className="pt-8 pb-12">
          <button
            onClick={onProceed}
            className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
          >
            Start New Run →
          </button>
          <p className="text-center text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-tighter">
            Unlocks are permanent across all future runs
          </p>
        </div>
      </div>
    </div>
  );
};
