import React from 'react';
import { motion } from 'framer-motion';

interface PresidentialNewsTickerProps {
  headlines: string[];
}

export const PresidentialNewsTicker: React.FC<PresidentialNewsTickerProps> = ({ headlines }) => {
  const allHeadlines = headlines.length > 0 ? headlines : ["Presidential Administration ready for duty.", "Capitol Hill remains quiet this morning.", "Market analysts watch the Oval Office closely."];

  return (
    <div className="bg-red-900/10 border-y border-red-500/30 overflow-hidden py-1.5 mb-6 relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 flex items-center pl-3">
        <span className="text-[10px] font-black text-red-500 tracking-tighter uppercase italic">NEWS FLASH</span>
      </div>

      <motion.div
        animate={{ x: ['100%', '-100%'] }}
        transition={{
          duration: 20 + (allHeadlines.join(' • ').length / 10),
          repeat: Infinity,
          ease: "linear"
        }}
        className="whitespace-nowrap flex items-center gap-12"
      >
        <span className="text-xs font-serif italic text-slate-300">
          {allHeadlines.join('   •   ')}
        </span>
      </motion.div>
    </div>
  );
};
