import React from 'react';
import type { Hustle, HustleLevel } from '../config/hustles/base';
import { useGameStore } from '../store/gameStore';

interface BranchChoiceProps {
  hustle: Hustle;
  currentBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onExecute: () => void;
}

export const BranchChoice: React.FC<BranchChoiceProps> = ({ hustle, currentBranchId, onSelectBranch, onExecute }) => {
  const { pl } = useGameStore();

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
  const currentCount = hustle.id === 'r_vending' ? pl.vendingCount : (currentBranch.id === 'l2a' ? pl.flipCount : pl.rentalCount);
  const canRepeat = isRepeatable && pl.bag >= currentBranch.cost && (!currentBranch.maxRepeat || currentCount < currentBranch.maxRepeat);

  // Show branch choices
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 transition-all hover:border-slate-700">
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
          onClick={onExecute}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
            canAffordExecute
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {currentBranch.cost > 0 ? `RUN IT (-$${currentBranch.cost.toLocaleString()})` : 'EXECUTE'}
        </button>

        {isRepeatable && (
          <button
            onClick={() => onSelectBranch(currentBranchId)}
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
                onClick={() => onSelectBranch(branch.id!)}
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
                <div className="text-[10px] text-slate-400 mt-1">
                  Yield: <span className="text-emerald-400">${branch.yieldCash.toLocaleString()}</span>
                  {branch.passiveYield && branch.passiveYield > 0 ? ` | Passive: +$${branch.passiveYield.toLocaleString()}/mo` : ''}
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
