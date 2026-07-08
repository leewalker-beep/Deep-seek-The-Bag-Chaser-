import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

interface PresidentialTermEndProps {
  onContinue: () => void;
}

export const PresidentialTermEnd: React.FC<PresidentialTermEndProps> = ({ onContinue }) => {
  const pl = useGameStore(state => state.pl);

  const approvalRating = pl.approvalRating || 50;
  const gdp = pl.gdp || 100;
  const worldPeace = pl.worldPeace || 50;
  const scandals = pl.scandalCount || 0;

  // Determine which historical quote to show based on the verdict
  // This should match the logic in advancementEngine.ts
  let historicalVerdict = '';
  if (pl.termVerdict === 'GREATEST OF ALL TIME') {
    historicalVerdict = "Historians will debate for a century whether you were real.";
  } else if (pl.termVerdict === 'RESPECTED LEADER') {
    historicalVerdict = "They named three airports after you. You deserved four.";
  } else if (pl.termVerdict === 'COMPLICATED LEGACY') {
    historicalVerdict = "The memoirs sold well. The truth did not.";
  } else if (pl.termVerdict === 'DISGRACED') {
    historicalVerdict = "The statues came down within a year.";
  } else {
    historicalVerdict = "A footnote. Nothing more.";
  }

  // Calculate legacy bonus for display (it was already added to pl.legacyScore in engine)
  let legacyBonus = 0;
  if (approvalRating >= 70 && scandals === 0) {
    legacyBonus = 500000;
  } else if (approvalRating >= 55) {
    legacyBonus = 200000;
  } else if (approvalRating >= 40) {
    legacyBonus = 50000;
  } else if (scandals > 2) {
    legacyBonus = 0;
  } else {
    legacyBonus = 10000;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-start p-6 overflow-y-auto"
    >
      <div className="max-w-sm w-full space-y-8 my-auto py-12">
        <div className="space-y-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] text-center">
            THE TERM IS OVER
          </div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-8xl text-center"
          >
            {pl.termVerdictEmoji}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-white uppercase tracking-tight text-center"
          >
            {pl.termVerdict}
          </motion.div>
          <div className="text-sm text-slate-400 text-center mt-2 font-serif italic">
            FINAL APPROVAL: {approvalRating}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-slate-800 py-6">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">GDP</div>
            <div className="text-lg font-black text-white font-mono">{gdp}%</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Peace</div>
            <div className="text-lg font-black text-white font-mono">{worldPeace}%</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Scandals</div>
            <div className="text-lg font-black text-white font-mono">{scandals}</div>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 mt-6 text-center"
        >
          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">
            LEGACY POINTS AWARDED
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            +{legacyBonus.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-slate-500 italic text-center mt-4 max-w-xs mx-auto"
        >
          {historicalVerdict}
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onContinue}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
        >
          ENTER THE OPEN TIER →
        </motion.button>
      </div>
    </motion.div>
  );
};
