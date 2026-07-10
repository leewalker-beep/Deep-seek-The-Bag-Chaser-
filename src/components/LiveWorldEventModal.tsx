import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { LiveWorldEventType } from '../types/game';

export const LiveWorldEventModal: React.FC = () => {
  const pl = useGameStore(state => state.pl);
  const dismissLiveEvent = useGameStore(state => state.dismissLiveEvent);
  const event = pl?.activeLiveEvent;

  if (!event) return null;

  const getStyleConfigs = (type: LiveWorldEventType) => {
    switch (type) {
      case 'BREAKING_NEWS':
        return {
          bg: 'bg-gradient-to-b from-red-950/40 to-slate-900',
          border: 'border-red-500/50',
          shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.25)]',
          badgeBg: 'bg-red-600 text-white font-black animate-pulse',
          headerBg: 'bg-red-950/80 border-b border-red-500/30',
          textColor: 'text-red-400',
          icon: '📰',
          accent: 'red',
        };
      case 'SOCIAL_TRENDING':
        return {
          bg: 'bg-gradient-to-b from-blue-950/40 to-slate-900',
          border: 'border-blue-500/40',
          shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
          badgeBg: 'bg-blue-500 text-white font-black',
          headerBg: 'bg-blue-950/80 border-b border-blue-500/30',
          textColor: 'text-blue-400',
          icon: '📱',
          accent: 'blue',
        };
      case 'MARKET_FLASH':
        return {
          bg: 'bg-gradient-to-b from-emerald-950/40 to-slate-900',
          border: 'border-emerald-500/40',
          shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
          badgeBg: 'bg-emerald-500 text-slate-950 font-black',
          headerBg: 'bg-emerald-950/80 border-b border-emerald-500/30',
          textColor: 'text-emerald-400',
          icon: '📈',
          accent: 'emerald',
        };
      case 'POLICE_ALERT':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-red-950/20 to-slate-900',
          border: 'border-red-600/60',
          shadow: 'shadow-[0_0_50px_rgba(220,38,38,0.3)]',
          badgeBg: 'bg-red-600 text-white font-black tracking-widest',
          headerBg: 'bg-red-950/80 border-b border-red-600/30',
          textColor: 'text-red-500',
          icon: '🚔',
          accent: 'red',
        };
      case 'GOVERNMENT_BULLETIN':
        return {
          bg: 'bg-gradient-to-b from-amber-950/40 to-slate-900',
          border: 'border-amber-500/50',
          shadow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-500 text-slate-950 font-black tracking-widest',
          headerBg: 'bg-amber-950/80 border-b border-amber-500/30',
          textColor: 'text-amber-400',
          icon: '🏛',
          accent: 'amber',
        };
      case 'COMMUNITY_SPOTLIGHT':
        return {
          bg: 'bg-gradient-to-b from-purple-950/40 to-slate-900',
          border: 'border-purple-500/40',
          shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.2)]',
          badgeBg: 'bg-purple-600 text-white font-black',
          headerBg: 'bg-purple-950/80 border-b border-purple-500/30',
          textColor: 'text-purple-400',
          icon: '❤️',
          accent: 'purple',
        };
      case 'CELEBRITY_WATCH':
        return {
          bg: 'bg-gradient-to-b from-yellow-950/40 to-slate-900',
          border: 'border-yellow-500/40',
          shadow: 'shadow-[0_0_50px_rgba(234,179,8,0.2)]',
          badgeBg: 'bg-yellow-500 text-slate-950 font-black',
          headerBg: 'bg-yellow-950/80 border-b border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: '⭐',
          accent: 'yellow',
        };
    }
  };

  const style = getStyleConfigs(event.type);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 overflow-y-auto">
        {/* Dark overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-lg ${style.bg} border-2 ${style.border} ${style.shadow} rounded-[2rem] overflow-hidden flex flex-col max-h-[92vh] z-10`}
        >
          {/* Top Flashing / Styling Header Bar */}
          <div className={`px-6 py-4 flex justify-between items-center ${style.headerBg}`}>
            <span className={`text-[10px] px-3 py-1 rounded-full ${style.badgeBg} uppercase tracking-[0.2em] font-black flex items-center gap-1.5`}>
              <span>{style.icon}</span>
              <span>{event.title}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              {event.source}
            </span>
          </div>

          {/* Event Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-6">
            {/* Fame Context Label */}
            <div className="text-center">
              <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase bg-slate-950/60 border border-slate-800/80 px-3 py-1 rounded-full">
                📢 {event.fameLevel === 'local' ? 'Neighborhood Buzz' :
                    event.fameLevel === 'regional' ? 'Regional Coverage' :
                    event.fameLevel === 'national' ? 'National Headline' : 'Global Phenomenon'}
              </span>
            </div>

            {/* Headline Section */}
            <h2 className="text-2xl md:text-3xl font-serif font-black text-center text-white leading-tight tracking-tight mt-1 uppercase italic drop-shadow-md">
              "{event.headline}"
            </h2>

            {/* Category-Specific Aesthetics */}
            {event.type === 'SOCIAL_TRENDING' ? (
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-blue-500/10 flex flex-col gap-4 relative">
                {/* Simulated Social Media Post */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
                    {event.author ? event.author[1].toUpperCase() : 'B'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white uppercase">{event.author || '@buzz_master'}</span>
                      <span className="text-[10px] text-blue-400">✓</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">Trending right now</span>
                  </div>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-serif italic text-center">
                  "{event.body}"
                </p>
                <div className="flex justify-between items-center border-t border-slate-800/50 pt-3 mt-1 text-[10px] font-bold text-slate-500 uppercase font-mono">
                  <div className="flex gap-4">
                    <span>❤️ {event.likes?.toLocaleString()} likes</span>
                    <span>🔄 {event.shares?.toLocaleString()} shares</span>
                  </div>
                  <span className="text-blue-400 tracking-wider">#viral</span>
                </div>
              </div>
            ) : event.type === 'MARKET_FLASH' ? (
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-emerald-500/15 font-mono text-center flex flex-col gap-3 relative overflow-hidden">
                {/* Cyber Trading Ticker Background */}
                <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                <div className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-black">
                  💰 SEC REGISTERED / FINANCIAL INDEX
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-serif italic relative z-10 px-2">
                  "{event.body}"
                </p>
                <div className="h-px bg-emerald-500/10 my-1" />
                <div className="flex justify-center items-center gap-2 text-xs text-emerald-400 font-black uppercase">
                  <span>📈 MARKET IMPLICATION STABLE</span>
                </div>
              </div>
            ) : event.type === 'POLICE_ALERT' ? (
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-red-500/15 flex flex-col gap-3 relative">
                <div className="text-[9px] text-red-500/70 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>🚨</span> CRIMINAL RECORD SYNDICATED
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-serif italic text-center">
                  "{event.body}"
                </p>
                <div className="h-px bg-red-500/10 my-1" />
                <div className="text-[10px] text-slate-500 text-center font-bold font-mono uppercase">
                  Subject ID: {pl?.runId?.substring(0, 8).toUpperCase() || 'PLAYER_ALPHA'}
                </div>
              </div>
            ) : event.type === 'GOVERNMENT_BULLETIN' ? (
              <div className="bg-slate-950/50 rounded-2xl p-6 border border-amber-500/15 flex flex-col gap-4 relative">
                <div className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest text-center border-b border-amber-500/10 pb-2">
                  🏛️ EXECUTIVE MEMORANDUM • WHITE HOUSE
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-serif italic text-center px-4">
                  "{event.body}"
                </p>
                <div className="text-[8px] text-slate-500 text-center font-mono uppercase">
                  WASHINGTON D.C. • OFFICIAL RECORD
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-800/80">
                <p className="text-sm text-slate-200 leading-relaxed font-serif italic text-center">
                  "{event.body}"
                </p>
              </div>
            )}

            {/* Display Permanent Gameplay Effect if any */}
            {event.effect && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 flex justify-between items-center gap-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gameplay outcome:</span>
                <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                  {event.effect}
                </span>
              </div>
            )}
          </div>

          {/* Continue / Dismiss Button Area */}
          <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800/50 flex flex-col gap-1.5 shrink-0">
            <button
              onClick={dismissLiveEvent}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] bg-slate-900 border border-slate-700 hover:border-slate-500 hover:text-white transition-all active:scale-[0.98] ${
                event.type === 'BREAKING_NEWS' ? 'hover:bg-red-950/10 hover:border-red-500/40' :
                event.type === 'SOCIAL_TRENDING' ? 'hover:bg-blue-950/10 hover:border-blue-500/40' :
                event.type === 'MARKET_FLASH' ? 'hover:bg-emerald-950/10 hover:border-emerald-500/40' :
                event.type === 'POLICE_ALERT' ? 'hover:bg-red-950/10 hover:border-red-600/40' :
                event.type === 'GOVERNMENT_BULLETIN' ? 'hover:bg-amber-950/10 hover:border-amber-500/40' :
                event.type === 'COMMUNITY_SPOTLIGHT' ? 'hover:bg-purple-950/10 hover:border-purple-500/40' :
                'hover:bg-yellow-950/10 hover:border-yellow-500/40'
              }`}
            >
              Continue
            </button>
            <p className="text-[8px] text-slate-500 font-bold text-center uppercase tracking-wider">
              Click to resume chasin' the bag
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default LiveWorldEventModal;
