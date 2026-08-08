import React, { useState } from 'react';
import type { Hustle, HustleLevel } from '../config/hustles/base';
import { useGameStore } from '../store/gameStore';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { HUSTLE_BADGES } from '../config/badges';
import { PROGRESSION_ORDER } from '../config/tiers';
import { isHustleMastered } from '../utils/masteryUtils';
import { CrownProgress } from './hustles/CrownProgress';

interface BranchChoiceProps {
  hustle: Hustle;
  currentBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onExecute: () => void;
}

export const BranchChoice: React.FC<BranchChoiceProps> = ({ hustle, currentBranchId, onSelectBranch, onExecute }) => {
  const { pl } = useGameStore();
  const [pendingAction, setPendingAction] = useState<{
    type: 'EXECUTE' | 'SELECT';
    branchId?: string;
    cost: number;
  } | null>(null);

  const isMastered = pl.masteredHustles?.includes(hustle.id) || isHustleMastered(pl, hustle.id);
  const badge = HUSTLE_BADGES[hustle.id];

  if (!hustle.branches) return null;

  const currentBranch = hustle.branches[currentBranchId];
  const nextBranches = currentBranch?.nextBranches || [];

  const availableBranches = nextBranches
    .map(id => hustle.branches![id])
    .filter((b): b is HustleLevel => b !== undefined);

  if (!currentBranch) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
        <div className="text-red-400 text-xs">No data available for branch: {currentBranchId}</div>
      </div>
    );
  }

  const canAffordExecute = pl.bag >= currentBranch.cost;
  const isRepeatable = currentBranch.isRepeatable;
  const currentCount = hustle.id === 'r_vending' ? pl.vendingCount : (currentBranch.id === 'l2a' ? pl.flipCount : pl.rentPortfolioCount);
  const canRepeat = isRepeatable && pl.bag >= currentBranch.cost && (!currentBranch.maxRepeat || currentCount < currentBranch.maxRepeat);

  const handleAction = (type: 'EXECUTE' | 'SELECT', cost: number, branchId?: string) => {
    if (cost > pl.bag * 0.1) {
      setPendingAction({ type, cost, branchId });
    } else {
      if (type === 'EXECUTE') onExecute();
      else if (type === 'SELECT') onSelectBranch(branchId!);
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'EXECUTE') onExecute();
    else if (pendingAction.type === 'SELECT') onSelectBranch(pendingAction.branchId!);
    setPendingAction(null);
  };

  // Show branch choices
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 transition-all hover:border-slate-700 relative overflow-hidden">
      {isMastered && badge && (
        <div className="absolute top-0 right-0 p-2 bg-emerald-500/20 rounded-bl-xl border-l border-b border-emerald-500/30 group">
           <span className="text-xl" title={badge.name}>{badge.icon}</span>
           <div className="absolute top-full right-0 mt-1 w-48 bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] hidden group-hover:block z-50 shadow-2xl">
              <div className="font-bold text-emerald-400">{badge.name}</div>
              <div className="text-slate-400 italic mb-1">{badge.description}</div>
              <div className="text-blue-400 font-mono">BUFF: {badge.buff.value}x {badge.buff.type}</div>
              {badge.futureBenefit && badge.relevantTier && (
                (() => {
                  const currentTierIdx = PROGRESSION_ORDER.indexOf(pl.currentTier);
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
      <ConfirmationModal
        isOpen={!!pendingAction}
        title="Confirm Large Spend"
        message={`This action costs $${pendingAction?.cost.toLocaleString()}, which is over 10% of your current bag. Are you sure?`}
        confirmLabel="Yes, Spend It"
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
        isHighStakes={true}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
            {hustle.icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{hustle.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase font-bold tracking-wider">
                {currentBranch.name}
              </span>
              <span className="text-[10px] text-slate-500 italic">{hustle.description}</span>
            </div>
          </div>
        </div>
      </div>

      <CrownProgress player={pl} hustleId={hustle.id} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">EST. YIELD</div>
          <div className="text-emerald-400 font-bold font-mono">${currentBranch.yieldCash.toLocaleString()}</div>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">CLOUT / AURA</div>
          <div className="text-sm font-medium">
            <span className="text-blue-400">+{currentBranch.yieldClout}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-purple-400">+{currentBranch.yieldAura}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button
          id="hustle-execute-button"
          onClick={() => handleAction('EXECUTE', currentBranch.cost)}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
            canAffordExecute
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {hustle.id === 'r_scrap' ? 'MAGNETIC SWEEP' : (currentBranch.miniGame || hustle.miniGame ? 'PLAY' : (currentBranch.cost > 0 ? `RUN IT (-$${currentBranch.cost.toLocaleString()})` : 'EXECUTE'))}
        </button>

        {isRepeatable && (
          <button
            onClick={() => handleAction('SELECT', currentBranch.cost, currentBranchId)}
            disabled={!canRepeat}
            className={`w-full py-2 rounded-xl font-bold text-[10px] uppercase transition-all active:scale-95 border ${
              canRepeat
                ? 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                : 'border-slate-800 text-slate-700 cursor-not-allowed'
            }`}
          >
            Repeat {currentBranch.name}
            <br />
            ${currentBranch.cost.toLocaleString()} ({currentCount}/{currentBranch.maxRepeat})
          </button>
        )}
      </div>

      {availableBranches.length > 0 && (
        <div className="space-y-2 mt-2 border-t border-slate-800 pt-4">
          <div className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Select Next Branch:</div>
          {availableBranches.map(branch => {
            const canAffordUpgrade = pl.bag >= branch.cost;
            const meetsClout = pl.clout >= branch.cloutReq;
            const meetsAura = pl.aura >= branch.auraReq;
            const canTake = canAffordUpgrade && meetsClout && meetsAura;

            return (
              <button
                key={branch.id}
                onClick={() => handleAction('SELECT', branch.cost, branch.id!)}
                disabled={!canTake}
                className={`w-full p-3 rounded-lg text-left transition-all border ${
                  canTake
                    ? 'bg-slate-800 border-blue-500/50 hover:bg-slate-700 active:scale-[0.98]'
                    : 'bg-slate-900 border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white text-sm">{branch.name}</div>
                  <div className="text-blue-400 font-mono text-[11px]">-${branch.cost.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 text-xs my-2 space-y-2">
                  <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex justify-between items-center">
                    <span>🚀 Branch Upgrade Preview</span>
                    <span className="text-[9px] text-slate-500 lowercase font-medium">read-only preview</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900/60 rounded p-1">
                      <span className="text-slate-500 block text-[8px] uppercase font-black tracking-tighter">Est. Cash</span>
                      <span className="font-bold font-mono text-emerald-400">
                        ${(currentBranch?.yieldCash || 0).toLocaleString()} → ${(branch.yieldCash || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 rounded p-1">
                      <span className="text-slate-500 block text-[8px] uppercase font-black tracking-tighter">Clout</span>
                      <span className="font-bold font-mono text-blue-400">
                        +{(currentBranch?.yieldClout || 0)} → +{(branch.yieldClout || 0)}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 rounded p-1">
                      <span className="text-slate-500 block text-[8px] uppercase font-black tracking-tighter">Aura</span>
                      <span className="font-bold font-mono text-purple-400">
                        +{(currentBranch?.yieldAura || 0)} → +{(branch.yieldAura || 0)}
                      </span>
                    </div>
                  </div>

                  {((currentBranch?.passiveYield !== undefined && currentBranch.passiveYield > 0) || (branch.passiveYield !== undefined && branch.passiveYield > 0)) && (
                    <div className="text-center text-[10px] bg-indigo-950/20 rounded-lg py-1 border border-indigo-500/10">
                      <span className="text-slate-400 font-bold uppercase text-[8px] mr-1">Passive Income:</span>
                      <span className="font-bold font-mono text-indigo-400">
                        ${(currentBranch?.passiveYield || 0).toLocaleString()}/mo → ${(branch.passiveYield || 0).toLocaleString()}/mo
                      </span>
                    </div>
                  )}
                </div>
                {(branch.cloutReq > 0 || branch.auraReq > 0) && (
                  <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter">
                    Requires: {branch.cloutReq > 0 ? `${branch.cloutReq} CLT ` : ''}{branch.auraReq > 0 ? `${branch.auraReq} AUR` : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
