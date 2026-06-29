import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import type { PlayerStats } from '../types/game';

export const NarrativeEventModal: React.FC = () => {
  const { pl, resolveNarrativeEvent } = useGameStore();
  const eventId = pl.activeNarrative;

  if (!eventId) return null;

  const event = NARRATIVE_EVENTS.find(e => e.id === eventId);
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-yellow-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]"
        >
          {/* Header */}
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-4">
             <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">⚡</span>
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Critical Event</h2>
                   <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Immediate Decision Required</p>
                </div>
             </div>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-black text-white mb-4 leading-tight">{event.title}</h3>
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8">
                <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{event.description}"
                </p>
            </div>

            <div className="space-y-4">
                {event.choices.map((choice) => {
                    const req = choice.requirement;
                    let disabled = false;
                    let reason = "";

                    if (req?.stat) {
                        const statKey = req.stat.type === 'mentalHealth' ? 'mentalHealth' : req.stat.type;
                        const current = pl[statKey as keyof PlayerStats];
                        if (typeof current === 'number' && current < req.stat.value) {
                            disabled = true;
                            reason = `Requires ${req.stat.value} ${req.stat.type}`;
                        }
                    }

                    return (
                        <button
                            key={choice.id}
                            disabled={disabled}
                            onClick={() => resolveNarrativeEvent(choice.id)}
                            className={`w-full group text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                                disabled
                                ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                                : 'bg-slate-800 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-700/50 active:scale-[0.98]'
                            }`}
                        >
                            <div className="relative z-10 flex justify-between items-start gap-4">
                                <div>
                                    <div className="text-sm font-black text-white uppercase mb-1 group-hover:text-yellow-400 transition-colors">
                                        {choice.label}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-snug">
                                        {choice.description}
                                    </p>
                                    {disabled && (
                                        <div className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-widest">
                                            ⚠️ Locked: {reason}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {Object.entries(choice.consequences).map(([key, val]) => {
                                        if (!val || key === 'specializationLock') return null;
                                        const isPos = +val > 0;
                                        const color = isPos ? 'text-emerald-400' : 'text-red-400';
                                        let label = key.toUpperCase();
                                        if (key === 'bag') label = 'CASH';
                                        if (key === 'passiveCash') label = 'PASSIVE';

                                        return (
                                            <span key={key} className={`text-[9px] font-black ${color}`}>
                                                {isPos ? '+' : ''}{val.toLocaleString()} {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 text-center">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Your choices define your legacy.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
