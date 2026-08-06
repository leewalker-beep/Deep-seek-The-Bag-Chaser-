import React from 'react';
import { motion } from 'framer-motion';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';

export const EndingsTab: React.FC = () => {
  const endings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');

  return (
    <motion.div
      key="endings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unlocked Endings</div>
      {endings.length === 0 ? (
        <EmptyState
          message="No endings unlocked yet. Complete the journey to fill your gallery."
          className="text-slate-600 text-sm bg-slate-950/30"
        />
      ) : (
        <ScrollableList maxHeight="max-h-[250px]">
          <div className="grid grid-cols-2 gap-2 pb-8">
            {endings.map((title: string) => (
              <div key={title} className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col items-center text-center gap-2">
                <span className="text-3xl">🏆</span>
                <span className="font-black text-white text-[10px] uppercase">{title}</span>
              </div>
            ))}
          </div>
        </ScrollableList>
      )}
    </motion.div>
  );
};
