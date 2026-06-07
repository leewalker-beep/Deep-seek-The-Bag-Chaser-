import React from 'react';
import type { Hustle, HustleLevel } from '../config/hustles/base';
import { useGameStore } from '../store/gameStore';

interface BranchChoiceProps {
  hustle: Hustle;
  currentBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export const BranchChoice: React.FC<BranchChoiceProps> = ({ hustle, currentBranchId, onSelectBranch }) => {
  const { pl } = useGameStore();

  if (!hustle.branches) return null;

  const currentBranch = hustle.branches[currentBranchId];
  const nextBranches = currentBranch?.nextBranches || [];

  const availableBranches = nextBranches
    .map(id => hustle.branches![id])
    .filter((b): b is HustleLevel => b !== undefined);

  // If no branches available, just show current branch
  if (availableBranches.length === 0) {
    return (
      <button
        onClick={() => onSelectBranch(currentBranchId)}
        className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold"
      >
        EXECUTE {currentBranch?.name || hustle.name}
      </button>
    );
  }

  // Show branch choices
  return (
    <div className="space-y-2 mt-2">
      <div className="text-[10px] text-slate-500 mb-2">CHOOSE YOUR PATH:</div>
      {availableBranches.map(branch => {
        const canAfford = pl.bag >= branch.cost;
        const meetsClout = pl.clout >= branch.cloutReq;
        const meetsAura = pl.aura >= branch.auraReq;
        const canTake = canAfford && meetsClout && meetsAura;

        return (
          <button
            key={branch.id}
            onClick={() => onSelectBranch(branch.id!)}
            disabled={!canTake}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              canTake ? 'bg-blue-600 active:scale-95' : 'bg-slate-700 opacity-50'
            }`}
          >
            <div className="font-bold text-white">{branch.name}</div>
            <div className="text-[10px] text-slate-300">
              Cost: ${branch.cost.toLocaleString()} | Yield: ${branch.yieldCash.toLocaleString()}
              {branch.passiveYield && branch.passiveYield > 0 ? ` | +$${branch.passiveYield.toLocaleString()}/mo` : ''}
            </div>
            {(branch.cloutReq > 0 || branch.auraReq > 0) && (
              <div className="text-[9px] text-slate-400">
                Needs: {branch.cloutReq > 0 ? `${branch.cloutReq} CLT ` : ''}{branch.auraReq > 0 ? `${branch.auraReq} AUR` : ''}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
