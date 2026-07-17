import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { WorldFeedCategory, WorldFeedItem, AppTab } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

interface WorldReactionFeedProps {
  onClose: () => void;
}

const renderTextWithBusinessLinks = (text: string, pl: any, onClose: () => void) => {
  // Find all owned businesses
  const ownedHustles = Object.values(HUSTLES).filter(h =>
    pl.hustleLevels[h.id] !== undefined || pl.hustleBranchIds[h.id] !== undefined
  );

  if (ownedHustles.length === 0) {
    return <span>{text}</span>;
  }

  // Sort by name length descending so longer matching names are checked/matched first
  const sortedOwned = [...ownedHustles].sort((a, b) => b.name.length - a.name.length);

  // Escaping function for regex safety
  const esc = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  const patterns = sortedOwned.map(h => esc(h.name)).filter(Boolean);
  if (patterns.length === 0) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const matchedHustle = sortedOwned.find(h => h.name.toLowerCase() === part.toLowerCase());
        if (matchedHustle) {
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                useGameStore.getState().setActiveTab(matchedHustle.tier as AppTab);
                useGameStore.getState().setActiveHustleView(matchedHustle.id);
                onClose();
              }}
              className="text-emerald-400 hover:text-emerald-300 underline font-bold transition-colors bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block cursor-pointer select-none"
            >
              {part}
            </button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const WorldReactionFeed: React.FC<WorldReactionFeedProps> = ({ onClose }) => {
  const pl = useGameStore(state => state.pl);
  const [activeTab, setActiveTab] = useState<WorldFeedCategory | 'ALL'>('ALL');

  const worldFeed = pl.worldFeed || [];

  // Group into categories
  const categories: { id: WorldFeedCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All Feeds', icon: '📱' },
    { id: 'SOCIAL', label: 'Chirper', icon: '📱' },
    { id: 'NEWS', label: 'News', icon: '📰' },
    { id: 'BUSINESS', label: 'Business', icon: '💼' },
    { id: 'MARKET', label: 'Markets', icon: '📈' },
    { id: 'POLITICS', label: 'Politics', icon: '🏛' },
    { id: 'OPINION', label: 'Opinion', icon: '❤️' },
    { id: 'WORLD', label: 'World', icon: '🌍' }
  ];

  // Filter items
  const filteredItems = activeTab === 'ALL'
    ? worldFeed
    : worldFeed.filter(item => item.category === activeTab);

  // Group pinned vs scrollable
  const pinnedItems = filteredItems.filter(item => item.pinned);
  const scrollableItems = filteredItems.filter(item => !item.pinned);

  // Format month / year
  const formatTime = (monthCount: number) => {
    const years = Math.floor(monthCount / 12);
    const months = monthCount % 12;
    return `Month ${months + 1}, Year ${18 + years}`;
  };

  const getCategoryTheme = (cat: WorldFeedCategory) => {
    switch (cat) {
      case 'SOCIAL': return { border: 'border-blue-500/20', bg: 'bg-blue-950/20', iconColor: 'text-blue-400', tag: 'bg-blue-500/10 text-blue-400' };
      case 'NEWS': return { border: 'border-rose-500/20', bg: 'bg-rose-950/10', iconColor: 'text-rose-400', tag: 'bg-rose-500/10 text-rose-400' };
      case 'BUSINESS': return { border: 'border-emerald-500/20', bg: 'bg-emerald-950/10', iconColor: 'text-emerald-400', tag: 'bg-emerald-500/10 text-emerald-400' };
      case 'MARKET': return { border: 'border-amber-500/20', bg: 'bg-amber-950/10', iconColor: 'text-amber-400', tag: 'bg-amber-500/10 text-amber-400' };
      case 'POLITICS': return { border: 'border-indigo-500/20', bg: 'bg-indigo-950/10', iconColor: 'text-indigo-400', tag: 'bg-indigo-500/10 text-indigo-400' };
      case 'OPINION': return { border: 'border-purple-500/20', bg: 'bg-purple-950/10', iconColor: 'text-purple-400', tag: 'bg-purple-500/10 text-purple-400' };
      case 'WORLD': return { border: 'border-teal-500/20', bg: 'bg-teal-950/10', iconColor: 'text-teal-400', tag: 'bg-teal-500/10 text-teal-400' };
    }
  };

  const renderFeedCard = (item: WorldFeedItem) => {
    const theme = getCategoryTheme(item.category);

    if (item.category === 'SOCIAL') {
      return (
        <div key={item.id} className={`p-4 rounded-2xl border ${theme.border} bg-slate-900/60 shadow-lg hover:border-blue-500/40 transition-all flex flex-col gap-3 relative`}>
          {item.pinned && (
            <div className="absolute top-2 right-4 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[8px] text-yellow-400 font-bold uppercase tracking-wider">
              📌 PINNED
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
              {item.author ? item.author[1].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white uppercase">{item.author || '@anonymous'}</span>
                <span className="text-[9px] text-slate-500">chirped</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{formatTime(item.month)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-serif">
            {renderTextWithBusinessLinks(item.text, pl, onClose)}
          </p>
          <div className="flex justify-between items-center border-t border-slate-800/50 pt-2 mt-1">
            <div className="flex gap-4 text-[9px] font-bold text-slate-500">
              <span>❤️ {item.likes?.toLocaleString()} likes</span>
              <span>🔄 {item.shares?.toLocaleString()} shares</span>
            </div>
            {item.effect && (
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-black uppercase">
                {item.effect}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (item.category === 'OPINION') {
      // Opinion format with simulated polls metric
      return (
        <div key={item.id} className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} shadow-md flex flex-col gap-2 relative`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-purple-400 uppercase">
              <span>❤️ PUBLIC OPINION</span>
              <span className="text-slate-700">•</span>
              <span>{item.source}</span>
            </div>
            <span className="text-[8px] text-slate-500 font-mono">{formatTime(item.month)}</span>
          </div>
          <p className="text-xs text-white font-bold tracking-tight">
            {renderTextWithBusinessLinks(item.text, pl, onClose)}
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
              <span>National Approval Consensus</span>
              <span className="text-purple-400">74% Consensus</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
        </div>
      );
    }

    // Default Professional Broadcheck Style (NEWS, BUSINESS, MARKET, POLITICS, WORLD)
    return (
      <div key={item.id} className={`p-4 rounded-2xl border ${theme.border} ${item.pinned ? 'bg-amber-950/10 border-amber-500/30' : 'bg-slate-950/40'} shadow-md hover:border-slate-700 transition-all flex flex-col gap-1 relative`}>
        {item.pinned && (
          <div className="absolute top-3 right-4 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[8px] text-amber-400 font-bold uppercase tracking-wider">
            📌 STRAW POLL / CRITICAL
          </div>
        )}
        <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
          <span className={theme.iconColor}>
            {item.category === 'NEWS' ? '📰 NEWS' :
             item.category === 'BUSINESS' ? '💼 BUSINESS' :
             item.category === 'MARKET' ? '📈 MARKET' :
             item.category === 'POLITICS' ? '🏛 POLITICS' : '🌍 WORLD'}
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400">{item.source}</span>
        </div>
        <h4 className="font-serif text-sm font-bold text-white leading-tight uppercase tracking-tight mt-1">
          {renderTextWithBusinessLinks(item.text, pl, onClose)}
        </h4>
        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-900/50">
          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">{formatTime(item.month)}</span>
          {item.effect && (
            <span className="text-[8px] font-mono text-amber-400 uppercase font-black bg-amber-950/20 border border-amber-500/20 px-1.5 py-0.5 rounded">
              {item.effect}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Phone App Wrapper Mock */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="w-full max-w-md h-[88vh] bg-slate-950 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Notch / Speaker Simulator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-32 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-900 rounded-full" />
        </div>

        {/* Status Bar Simulator */}
        <div className="bg-black text-[9px] font-bold font-mono text-slate-400 px-8 pt-6 pb-2 flex justify-between items-center select-none">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-4 h-2.5 bg-slate-800 rounded-sm border border-slate-600 p-[1px] flex items-center">
              <div className="h-full w-4/5 bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Phone Header */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/90 flex justify-between items-center z-10">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Smartphone App</span>
            <span className="text-xl font-serif font-black text-white italic tracking-tighter">👜 BAG CHASER OSC</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* App Info Box */}
        <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-indigo-500/10 rounded-2xl text-[9px] text-slate-400 leading-normal uppercase text-center select-none">
          <span className="font-black text-white block mb-0.5">📱 THE LIVING WORLD FEED</span>
          Choose to monitor Chirper, broadsheet tabloids, political movements, public polls, and markets. See live effects of your decisions.
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex gap-1.5 px-6 py-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* World Reaction Feeds List */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 no-scrollbar">
          {worldFeed.length === 0 ? (
            <div className="text-center py-20 italic text-slate-700 text-xs border border-dashed border-slate-900 rounded-3xl mx-4">
              <span className="text-3xl block mb-2 opacity-30">📳</span>
              The feed is quiet. Run some contracts or execute deals to capture the world's attention!
            </div>
          ) : (
            <>
              {/* PINNED SECTION */}
              {pinnedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[8px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1 bg-amber-500/5 py-1 px-3.5 rounded-full border border-amber-500/10 w-fit">
                    <span>📌</span>
                    <span>Pinned Stories</span>
                  </div>
                  <div className="space-y-3">
                    {pinnedItems.map(item => renderFeedCard(item))}
                  </div>
                  <div className="h-px bg-slate-900/60 my-4" />
                </div>
              )}

              {/* SCROLLABLE STORIES */}
              {scrollableItems.length > 0 && (
                <div className="space-y-3">
                  {scrollableItems.map(item => renderFeedCard(item))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Home Indicator Simulator */}
        <div className="bg-black py-3 flex justify-center items-center select-none border-t border-slate-900">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};
export default WorldReactionFeed;
