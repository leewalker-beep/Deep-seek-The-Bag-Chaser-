import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export const JailOverlay: React.FC = () => {
  const { pl, serveMonth } = useGameStore();

  if (!pl.inJail) return null;

  const progress = ((pl.jailSentenceTotal - pl.jailMonthsRemaining) / pl.jailSentenceTotal) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 border-2 border-red-900/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-6">🚔</div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
            Incarcerated
          </h2>
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-6">
            Charge: {pl.jailCharge}
          </p>

          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sentence Progress</span>
              <span className="text-sm font-black text-white font-mono">
                {pl.jailMonthsRemaining} <span className="text-[10px] text-slate-400">Months Left</span>
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-red-600"
              />
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
            "Your operations are on hold. Your connections are fading.
            The only way out is through."
          </p>

          <button
            onClick={() => serveMonth()}
            className="w-full py-4 bg-white hover:bg-slate-200 text-black font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest text-sm shadow-xl"
          >
            Serve One Month
          </button>

          <p className="mt-4 text-[9px] text-slate-600 uppercase font-bold tracking-tighter">
            Passive losses apply every month served
          </p>
        </div>

        {/* Bars Decoration */}
        <div className="absolute inset-0 pointer-events-none flex justify-around opacity-5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-px h-full bg-white"></div>
           ))}
        </div>
      </motion.div>
    </div>
  );
};
