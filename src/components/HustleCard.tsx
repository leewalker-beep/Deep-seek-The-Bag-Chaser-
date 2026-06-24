import React, { useState, useMemo } from 'react';
import type { Hustle, HustleLevel } from '../config/hustles/base';
import type { PlayerStats } from '../types/game';
import { HUSTLE_BADGES } from '../config/badges';
import { PROGRESSION_ORDER } from '../config/tiers';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { getEffectiveHustleStats, calculateHustleMath } from '../engine/mathEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { useGameStore } from '../store/gameStore';

interface HustleCardProps {
  hustle: Hustle;
  player: PlayerStats;
  onExecute: () => void;
  onUpgrade: (branchId?: string) => void;
  currentBranchId?: string;
}

export const HustleCard: React.FC<HustleCardProps> = ({
  hustle,
  player,
  onExecute,
  onUpgrade,
  currentBranchId,
}) => {
  const [pendingAction, setPendingAction] = useState<{
    type: 'EXECUTE' | 'UPGRADE' | 'REPEAT';
    branchId?: string;
    cost: number;
  } | null>(null);

  const currentMarket = useGameStore(state => state.currentMarket);

  const currentLevel = player.hustleLevels[hustle.id] || 1;
  let levelData: HustleLevel | undefined;
  let nextBranches: HustleLevel[] = [];

  if (hustle.branches) {
    const currentNodeId = currentBranchId || player.hustleBranchIds[hustle.id] || hustle.startBranchId;
    levelData = currentNodeId ? hustle.branches[currentNodeId] : undefined;
  } else if (hustle.levels) {
    levelData = hustle.levels.find((l) => l.level === currentLevel);
    const nextLevel = hustle.levels.find((l) => l.level === currentLevel + 1);
    if (nextLevel) nextBranches = [nextLevel];
  }

  const effectiveStats = useMemo(() => {
    if (!levelData) return null;
    const market = MARKET_CONFIGS[currentMarket];
    const isVending = hustle.id === 'r_vending';
    const rivalThreat = player.rivalThreats?.[hustle.tier] || 'NEUTRAL';

    const baseMath = calculateHustleMath(
      hustle.id,
      levelData,
      currentLevel,
      isVending ? 1 : market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1, // minigame multiplier 1.0 for display
      true, // success true for display
      player.mentalShieldTurns,
      rivalThreat
    );

    return getEffectiveHustleStats(hustle.id, levelData, player, currentLevel, baseMath);
  }, [hustle.id, levelData, player, currentLevel, currentMarket]);

  if (!levelData || !effectiveStats) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-red-400 text-xs">No data available for this branch</div>
      </div>
    );
  }

  const canAfford = player.bag >= effectiveStats.cost;
  const isVending = hustle.id === 'r_vending';

  const tierClass = `hustle-card-${hustle.tier.toLowerCase()}`;
  const isMastered = player.masteredHustles?.includes(hustle.id);
  const badge = HUSTLE_BADGES[hustle.id];

  const handleAction = (type: 'EXECUTE' | 'UPGRADE' | 'REPEAT', cost: number, branchId?: string) => {
    if (cost > player.bag * 0.1) {
      setPendingAction({ type, cost, branchId });
    } else {
      if (type === 'EXECUTE') onExecute();
      else if (type === 'UPGRADE' || type === 'REPEAT') onUpgrade(branchId);
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'EXECUTE') onExecute();
    else if (pendingAction.type === 'UPGRADE' || pendingAction.type === 'REPEAT') onUpgrade(pendingAction.branchId);
    setPendingAction(null);
  };

  return (
    <div className={`${tierClass} border rounded-2xl p-4 mb-4 transition-all relative overflow-hidden`}>
      <ConfirmationModal
        isOpen={!!pendingAction}
        title="Confirm Large Spend"
        message={`This action costs $${pendingAction?.cost.toLocaleString()}, which is over 10% of your current bag. Are you sure?`}
        confirmLabel="Yes, Spend It"
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
        isHighStakes={true}
      />
      {isMastered && badge && (
        <div className="absolute top-0 right-0 p-2 bg-emerald-500/20 rounded-bl-xl border-l border-b border-emerald-500/30 group">
           <span className="text-xl" title={badge.name}>{badge.icon}</span>
           <div className="absolute top-full right-0 mt-1 w-48 bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] hidden group-hover:block z-50 shadow-2xl">
              <div className="font-bold text-emerald-400">{badge.name}</div>
              <div className="text-slate-400 italic mb-1">{badge.description}</div>
              <div className="text-blue-400 font-mono">BUFF: {badge.buff.value}x {badge.buff.type}</div>
              {badge.futureBenefit && badge.relevantTier && (
                (() => {
                  const currentTierIdx = PROGRESSION_ORDER.indexOf(player.currentTier);
                  const relevantTierIdx = PROGRESSION_ORDER.indexOf(badge.relevantTier);
                  const isActive = currentTierIdx >= relevantTierIdx;
                  return isActive ? (
                    <div className="text-yellow-400 font-bold mt-1 border-t border-slate-700 pt-1">
                      ACTIVE: {badge.futureBenefit}
                    </div>
                  ) : null;
                })()
              )}
           </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
            {hustle.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{hustle.name}</h3>
            <div className="flex items-center gap-2">
              {!isVending && (
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase font-bold tracking-wider">
                  Level {currentLevel}
                </span>
              )}
              <span className="text-[10px] text-slate-500 italic">{hustle.description}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">EST. YIELD</div>
          <div className="text-emerald-400 font-bold font-mono">${effectiveStats.yieldCash.toLocaleString()}</div>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">CLOUT / AURA</div>
          <div className="text-sm font-medium">
            <span className="text-blue-400">+{effectiveStats.yieldClout}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-purple-400">+{effectiveStats.yieldAura}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isVending ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Current owned: {player.vendingCount}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Total passive: ${player.vendingCount * (levelData.passiveYield || 150)}/month</span>
            </div>
            <button
              onClick={() => onExecute()}
              className="w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              BUY MACHINE (${effectiveStats.cost.toLocaleString()})
            </button>
          </div>
        ) : (
          <button
            id="hustle-execute-button"
            onClick={() => handleAction('EXECUTE', effectiveStats.cost)}
            className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
              canAfford
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {hustle.id === 'r_scrap' ? 'MAGNETIC SWEEP' : (levelData.miniGame || hustle.miniGame ? 'PLAY' : (effectiveStats.cost > 0 ? `RUN IT (-$${effectiveStats.cost.toLocaleString()})` : 'EXECUTE'))}
          </button>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Repeatable Logic */}
          {levelData.isRepeatable && !isVending && (
            <button
              onClick={() => handleAction('REPEAT', effectiveStats.cost, player.hustleBranchIds[hustle.id] || hustle.startBranchId)}
              disabled={
                player.bag < effectiveStats.cost ||
                (levelData.maxRepeat !== undefined &&
                  (hustle.id === 'r_vending' ? player.vendingCount : (levelData.id === 'l2a' ? player.flipCount : player.rentPortfolioCount)) >= levelData.maxRepeat)
              }
              className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all active:scale-95 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 disabled:border-slate-800 disabled:text-slate-700 disabled:bg-transparent"
            >
              Repeat {levelData.name}
              <br />
              ${effectiveStats.cost.toLocaleString()} ({hustle.id === 'r_vending' ? player.vendingCount : (levelData.id === 'l2a' ? player.flipCount : player.rentPortfolioCount)}/{levelData.maxRepeat})
            </button>
          )}

          {/* Next Branches / Upgrades */}
          {nextBranches.map(branch => {
            const canUpgradeBranch =
              player.bag >= branch.cost &&
              player.clout >= branch.cloutReq &&
              player.aura >= branch.auraReq;

            return (
              <button
                key={branch.id || branch.level}
                onClick={() => handleAction('UPGRADE', branch.cost, branch.id)}
                disabled={!canUpgradeBranch}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all active:scale-95 border ${
                  canUpgradeBranch
                    ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                    : 'border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
              >
                {branch.name ? `Unlock ${branch.name}` : 'Upgrade'}
                <br />
                ${branch.cost.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
