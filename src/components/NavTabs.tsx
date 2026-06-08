import React from 'react';
import { PROGRESSION_ORDER } from '../config/tiers';
import type { Tier } from '../types/game';

interface NavTabsProps {
  activeTab: Tier | 'FLEX';
  currentTier: Tier;
  onTabChange: (tab: Tier | 'FLEX') => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, currentTier, onTabChange }) => {
  const currentIndex = PROGRESSION_ORDER.indexOf(currentTier);
  const flexUnlocked = currentIndex >= 3;

  const allTabs: (Tier | 'FLEX')[] = [...PROGRESSION_ORDER, 'FLEX'];

  return (
    <div className="flex flex-nowrap overflow-x-auto gap-2 px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-[108px] z-10 no-scrollbar">
      {allTabs.map(tab => {
        if (tab === 'FLEX' && !flexUnlocked) return null;

        const tabIndex = tab === 'FLEX' ? 999 : PROGRESSION_ORDER.indexOf(tab as Tier);
        const isLocked = tab !== 'FLEX' && tabIndex > currentIndex + 1;
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            onClick={() => !isLocked && onTabChange(tab)}
            disabled={isLocked}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
              isActive
                ? 'bg-emerald-500 text-black'
                : isLocked
                ? 'opacity-50 bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 text-slate-300 active:scale-95'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
