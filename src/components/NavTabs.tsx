import React from 'react';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import type { Tier, AppTab } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface NavTabsProps {
  activeTab: AppTab;
  currentTier: Tier;
  onTabChange: (tab: AppTab) => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({
  activeTab,
  currentTier,
  onTabChange,
}) => {
  const campaignStage = useGameStore(state => state.pl.campaignStage || 0);
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
        const isLocked = (tab !== 'FLEX' && tab !== 'PRESIDENCY' && tabIndex > currentIndex);
        const isActive = activeTab === tab;

        const req = (tab !== 'FLEX' && tab !== 'PRESIDENCY') ? TIER_REQUIREMENTS[tab as Tier] : null;
        const unlockRequirement = req ? `${req.clout}C / ${req.aura}A / $${(req.cash / 1000).toFixed(0)}K` : '';

        return (
          <div key={tab} className="flex flex-col items-center shrink-0">
            <button
              data-testid={`nav-tab-${tab.toLowerCase()}`}
              onClick={() => !isLocked && onTabChange(tab)}
              disabled={!!isLocked}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black'
                  : isLocked
                  ? 'opacity-30 bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-300 active:scale-95'
              }`}
            >
              {isLocked && <span className="text-[8px] mr-1">🔒</span>}
              {tab}
            </button>
            {isLocked && (
              <div className="text-[7px] text-slate-600 uppercase tracking-wider mt-0.5">
                {unlockRequirement}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
