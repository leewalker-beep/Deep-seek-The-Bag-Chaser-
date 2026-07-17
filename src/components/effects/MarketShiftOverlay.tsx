import React from 'react';
import { motion } from 'framer-motion';
import { MARKET_CONFIGS } from '../../config/marketConfig';
import type { MarketType } from '../../types/game';

interface MarketShiftOverlayProps {
  market: MarketType;
}

export const MarketShiftOverlay: React.FC<MarketShiftOverlayProps> = ({ market }) => {
  const config = MARKET_CONFIGS[market];
  if (!config) return null;

  // Set colors and branding dynamically per market condition
  let themeColor = 'from-slate-900 via-slate-950 to-slate-900';
  let accentBorder = 'border-slate-800';
  let bannerColor = 'bg-blue-600';
  let flashColor = 'text-blue-400';
  let titleColor = 'text-white';

  if (market === 'RECESSION') {
    themeColor = 'from-red-950 via-slate-950 to-red-950';
    accentBorder = 'border-red-600/40';
    bannerColor = 'bg-red-600';
    flashColor = 'text-red-500';
    titleColor = 'text-red-100';
  } else if (market === 'BULL_MARKET') {
    themeColor = 'from-emerald-950 via-slate-950 to-emerald-950';
    accentBorder = 'border-emerald-500/40';
    bannerColor = 'bg-emerald-600';
    flashColor = 'text-emerald-400';
    titleColor = 'text-emerald-100';
  } else if (market === 'CRACKDOWN') {
    themeColor = 'from-indigo-950 via-slate-950 to-indigo-950';
    accentBorder = 'border-amber-500/40';
    bannerColor = 'bg-amber-500';
    flashColor = 'text-amber-400';
    titleColor = 'text-amber-100';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 select-none backdrop-blur-sm"
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`w-full max-w-lg rounded-3xl border-2 ${accentBorder} bg-gradient-to-b ${themeColor} shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative`}
      >
        {/* Flash/Ticker Header */}
        <div className={`${bannerColor} px-6 py-2.5 flex items-center justify-between text-black font-black uppercase tracking-[0.2em] text-[10px]`}>
          <span className="flex items-center gap-1.5">
            <span className="animate-ping w-2 h-2 rounded-full bg-black block" />
            🚨 MARKET UPDATE
          </span>
          <span className="animate-pulse">🔴 LIVE BROADCAST</span>
        </div>

        <div className="p-8 text-center space-y-6 relative z-10">
          <div className="text-7xl mb-4 animate-bounce duration-1000">
            {config.icon}
          </div>

          <div className="space-y-1">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${flashColor}`}>
              Economic Shift Registered
            </h3>
            <h2 className={`text-4xl font-black ${titleColor} uppercase tracking-tighter italic`}>
              {config.name}
            </h2>
          </div>

          <p className="text-slate-300 text-sm font-semibold leading-relaxed max-w-xs mx-auto italic">
            "{config.description}"
          </p>

          {/* Stat Multipliers Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-sm mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Yields</div>
              <div className={`text-lg font-black mt-1 ${market === 'RECESSION' ? 'text-red-400' : market === 'BULL_MARKET' ? 'text-emerald-400' : 'text-white'}`}>
                {config.yieldMultiplier}x
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Expenses</div>
              <div className={`text-lg font-black mt-1 ${market === 'RECESSION' ? 'text-red-400' : 'text-white'}`}>
                {config.expenseMultiplier}x
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Heat</div>
              <div className={`text-lg font-black mt-1 ${market === 'CRACKDOWN' ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {config.heatMultiplier}x
              </div>
            </div>
          </div>

          {/* Progress timer bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-4">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 1.5, ease: 'linear' }}
              className={`h-full ${bannerColor}`}
            />
          </div>
        </div>

        {/* Retro scanlines effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.4))] opacity-40 z-0"></div>
      </motion.div>
    </motion.div>
  );
};
