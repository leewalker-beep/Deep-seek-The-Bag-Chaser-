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
});
