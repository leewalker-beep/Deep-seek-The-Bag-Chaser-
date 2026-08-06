import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';

export const DeathsTab: React.FC = () => {
  const { pl } = useGameStore();

  return (
    <motion.div
      key="deaths"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Death Badges</div>
      {!pl.collectedDeathBadges || pl.collectedDeathBadges.length === 0 ? (
        <EmptyState
          message="No death badges collected yet. Complete different playthroughs to find new ways to go out."
          className="text-red-500/40 border-red-500/20 bg-slate-950/30"
        />
      ) : (
        <ScrollableList maxHeight="max-h-[220px]">
          <div className="grid grid-cols-3 gap-3 pb-8">
            {pl.collectedDeathBadges.map((badge: string) => (
              <div key={badge} className="aspect-square bg-slate-950 border border-red-500/20 rounded-xl flex items-center justify-center text-3xl shadow-inner grayscale hover:grayscale-0 transition-all duration-500">
                {badge}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 9 - (pl.collectedDeathBadges?.length || 0)) }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-950/30 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-slate-700 text-xl font-black">
                ?
              </div>
            ))}
          </div>
        </ScrollableList>
      )}
      <p className="text-[8px] text-slate-500 text-center uppercase font-bold mt-4">Collect every unique way to go out</p>
    </motion.div>
  );
};
