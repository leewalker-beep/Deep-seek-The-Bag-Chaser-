import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTRAITS, type PortraitDef, getPortraitsByArchetype } from '../../config/portraitRegistry';
import Avatar from '../Avatar';
import { ScrollableList } from '../ui/ScrollableList';

export const PortraitsTab: React.FC = () => {
  const [selectedPortrait, setSelectedPortrait] = useState<PortraitDef | null>(null);
  const [activePool, setActivePool] = useState<'all' | 'music' | 'podcast' | 'talent' | 'corporate' | 'politics' | 'elite'>('all');

  const pools: ('all' | 'music' | 'podcast' | 'talent' | 'corporate' | 'politics' | 'elite')[] = [
    'all', 'music', 'podcast', 'talent', 'corporate', 'politics', 'elite'
  ];

  const displayedPortraits = activePool === 'all'
    ? PORTRAITS.filter(p => p.archetype !== 'advisor') // Filter out advisor from main grids
    : getPortraitsByArchetype(activePool);

  return (
    <motion.div
      key="portraits"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Character Portrait Gallery</div>
        <p className="text-[9px] text-slate-400 font-mono uppercase leading-normal">
          Browse the game's premium custom vector illustrated portrait library.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar gap-1">
        {pools.map(pool => (
          <button
            key={pool}
            onClick={() => setActivePool(pool)}
            className={`flex-shrink-0 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activePool === pool
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {pool}
          </button>
        ))}
      </div>

      {/* Portrait Grid */}
      <ScrollableList maxHeight="max-h-[360px]">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-8">
          {displayedPortraits.map(portrait => (
            <motion.div
              key={portrait.id}
              onClick={() => setSelectedPortrait(portrait)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-950/60 border border-slate-850 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative group transition-all"
            >
              <Avatar avatarId={portrait.id} size={48} className="rounded-full border border-slate-800" />
              <span className="text-[7px] text-slate-500 uppercase font-bold tracking-tight truncate w-full mt-1.5 group-hover:text-emerald-400 transition-colors">
                {portrait.name.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>
      </ScrollableList>

      {/* Selected Portrait Modal / Overlay Card */}
      <AnimatePresence>
        {selectedPortrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPortrait(null)}
            className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedPortrait(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>

              <div className="flex justify-center">
                <Avatar avatarId={selectedPortrait.id} size={96} className="rounded-full border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10" />
              </div>

              <div className="space-y-1">
                <span className="text-[8px] bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {selectedPortrait.archetype} Pool
                </span>
                <h4 className="text-white font-black text-lg uppercase tracking-tight leading-snug">
                  {selectedPortrait.name}
                </h4>
                <p className="text-[9px] text-slate-500 font-mono uppercase">
                  ID: {selectedPortrait.id} | Gender: {selectedPortrait.gender}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left">
                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-1">PROFILE DOSSIER</span>
                <p className="text-slate-300 text-[10px] font-medium leading-relaxed uppercase tracking-tight">
                  "{selectedPortrait.description}"
                </p>
              </div>

              <button
                onClick={() => setSelectedPortrait(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-slate-700/30"
              >
                CLOSE DOSSIER
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
