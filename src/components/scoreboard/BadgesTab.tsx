import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';
import { HUSTLE_BADGES } from '../../config/badges';
import { PROGRESSION_ORDER } from '../../config/tiers';

export const BadgesTab: React.FC = () => {
  const { pl } = useGameStore();

  return (
    <motion.div
      key="badges"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* TIER BADGES SECTION */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier Badges</div>
        {pl.tierBadges.length === 0 ? (
          <EmptyState
            message="No tiers mastered yet. Complete every hustle in a tier to earn its badge."
            className="text-slate-600 text-[10px] uppercase font-black bg-slate-950/30"
            paddingClass="py-6"
          />
        ) : (
          <ScrollableList maxHeight="max-h-[180px]">
            <div className="grid grid-cols-2 gap-2 pb-8">
              {pl.tierBadges.map(tier => (
                <div key={tier} className="p-3 bg-slate-950 border border-yellow-500/30 rounded-2xl flex flex-col items-center text-center gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-yellow-500/10 text-[6px] font-bold text-yellow-400 border-l border-b border-yellow-500/20 uppercase tracking-tighter">MASTER</div>
                  <span className="text-2xl mb-1">🏆</span>
                  <span className="font-black text-white text-[10px] uppercase italic tracking-tighter">{tier} MASTER</span>
                  <span className="text-[8px] text-emerald-400 font-bold">+2% YIELD</span>
                </div>
              ))}
            </div>
          </ScrollableList>
        )}
      </div>

      {/* HUSTLE MASTERY SECTION */}
      <div className="grid grid-cols-1 gap-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mastery Badges</div>
        {pl.masteredHustles.length === 0 ? (
          <EmptyState
            message="No hustles mastered yet. Max out a hustle to earn a badge."
            className="text-slate-600 text-sm bg-slate-950/30"
          />
        ) : (
          <ScrollableList maxHeight="max-h-[280px]">
            <div className="space-y-3 pb-8 flex flex-col">
              {pl.masteredHustles.map(hId => {
                const badge = HUSTLE_BADGES[hId];
                if (!badge) return null;
                return (
                  <div key={badge.id} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center gap-4 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 text-[8px] font-bold text-emerald-400 border-l border-b border-emerald-500/20">MASTERED</div>
                    <div className="text-4xl bg-slate-900 w-16 h-16 flex items-center justify-center rounded-xl shadow-inner border border-slate-800 shrink-0">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-white text-lg tracking-tight leading-none mb-1">{badge.name}</div>
                      <div className="text-xs text-slate-400 italic mb-2">{badge.description}</div>
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                          BUFF: {badge.buff.value}x {badge.buff.type}
                        </div>
                        {badge.futureBenefit && badge.relevantTier && (
                          (() => {
                            const currentTierIdx = PROGRESSION_ORDER.indexOf(pl.currentTier);
                            const relevantTierIdx = PROGRESSION_ORDER.indexOf(badge.relevantTier);
                            const isActive = currentTierIdx >= relevantTierIdx;
                            return isActive ? (
                              <div className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                ACTIVE: {badge.futureBenefit}
                              </div>
                            ) : null;
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollableList>
        )}
      </div>
    </motion.div>
  );
};
