import React from 'react';
import { PROGRESSION_ORDER } from '../config/tiers';
import type { Tier, AppTab } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface NavTabsProps {
  activeTab: AppTab;
  currentTier: Tier;
  onTabChange: (tab: AppTab) => void;
}

export const NavTabs: React.FC<NavTabsProps> = React.memo(({
  activeTab,
  currentTier,
  onTabChange,
}) => {
  const campaignStage = useGameStore(state => state.pl.campaignStage || 0);
  const inJail = useGameStore(state => state.pl.inJail);
  const isPresident = campaignStage >= 8;

  const currentIndex = PROGRESSION_ORDER.indexOf(currentTier);
  const flexUnlocked = currentIndex >= 3;

  const allTabs: AppTab[] = isPresident
    ? ['PRESIDENCY']
    : [...PROGRESSION_ORDER, 'FLEX'];

  return (
    <div className="flex flex-nowrap overflow-x-auto gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 sticky top-[93px] z-10 no-scrollbar">
      {allTabs.map(tab => {
        if (tab === 'FLEX' && !flexUnlocked) return null;

        const tabIndex = tab === 'FLEX' || tab === 'PRESIDENCY' ? 999 : PROGRESSION_ORDER.indexOf(tab as Tier);
        const isLocked = inJail || (tab !== 'FLEX' && tab !== 'PRESIDENCY' && tabIndex > currentIndex + 1);
        const isActive = activeTab === tab;

        return (
          <button
            key={tab} data-testid={`nav-tab-${tab.toLowerCase()}`}
            onClick={() => !isLocked && onTabChange(tab)}
            disabled={isLocked}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shrink-0 select-none ${
              isActive
                ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300/30'
                : isLocked
                ? 'opacity-40 bg-slate-900 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 border border-slate-700/50'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
});
