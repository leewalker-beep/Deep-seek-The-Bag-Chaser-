import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';
import { compileBiographyChapters } from '../../utils/biographyCompiler';

export const BiographyTab: React.FC = () => {
  const { pl } = useGameStore();
  const [bioViewMode, setBioViewMode] = useState<'book' | 'log'>('book');

  return (
    <motion.div
      key="biography"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Life Story</h3>
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Living Biography</span>
        </div>

        {/* Elegant View Mode Toggle */}
        <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 gap-0.5">
          <button
            onClick={() => setBioViewMode('book')}
            className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all ${
              bioViewMode === 'book'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            📖 Book View
          </button>
          <button
            onClick={() => setBioViewMode('log')}
            className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all ${
              bioViewMode === 'log'
                ? 'bg-slate-800 text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            📜 Log View
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
        <span className="font-black text-white block mb-1">📖 The Chronicled Legend</span>
        What is this? This biography dynamically compiles your life achievements into an elegant narrative. Read it like a professionally published autobiography of your rise to absolute power.
      </div>

      {!pl.biography || pl.biography.length === 0 ? (
        <EmptyState
          message="Your story is still being written. Every major move you make will be recorded here."
          className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
        />
      ) : bioViewMode === 'book' ? (
        /* Elegant Book Layout View */
        <ScrollableList maxHeight="max-h-[340px]">
          <div className="space-y-6 pb-12 pr-1">
            {compileBiographyChapters(pl).map((chapter, cIdx) => (
              <div
                key={chapter.id}
                className="p-5 bg-gradient-to-b from-slate-950/90 to-slate-950/40 border border-slate-800/80 rounded-3xl hover:border-emerald-500/20 transition-all space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Delicate background card glow */}
                <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />

                {/* Chapter Header */}
                <div className="flex items-center gap-3 border-b border-slate-900 pb-3 relative z-10">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-inner">
                    {chapter.icon}
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.25em]">
                      CHAPTER {String(cIdx + 1).padStart(2, '0')}
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight italic leading-tight">
                      {chapter.title}
                    </h4>
                  </div>
                </div>

                {/* Introductory Prose Paragraph */}
                <p className="text-[11px] text-slate-300 leading-relaxed font-serif tracking-tight italic select-text relative z-10 pl-2 border-l border-emerald-500/20">
                  "{chapter.intro}"
                </p>

                {/* Historical Log Entries Under This Chapter */}
                {chapter.entries.length > 0 && (
                  <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-900/50">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block pl-2">
                      KEY ACCOMPLISHMENTS
                    </span>
                    <div className="space-y-2 pl-2">
                      {chapter.entries.map((entry, eIdx) => (
                        <div key={eIdx} className="text-[10px] text-slate-400 leading-relaxed tracking-tight select-text flex items-start gap-2.5">
                          <span className="text-emerald-500 text-[9px] mt-0.5 select-none">✦</span>
                          <span>{entry}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bridging Transition Paragraph */}
                {chapter.transition && (
                  <div className="text-[9px] text-slate-500 italic leading-relaxed pt-3 border-t border-slate-950 font-medium tracking-tight">
                    {chapter.transition}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollableList>
      ) : (
        /* Classic Checkpoint Timeline Log View (100% Save Compatibility) */
        <ScrollableList maxHeight="max-h-[340px]">
          <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800 pb-8">
            {pl.biography.map((entry, idx) => (
              <div key={idx} className="relative pl-12 shrink-0">
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10">
                  <span className="text-yellow-500 font-black text-[10px] italic">{(idx + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl hover:border-emerald-500/30 transition-all">
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight">{entry}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollableList>
      )}
    </motion.div>
  );
};
