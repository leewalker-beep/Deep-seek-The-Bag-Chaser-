import React from 'react';
import type { Hustle, HustleLevel } from '../config/hustles/base';
import type { PlayerStats } from '../types/game';

interface HustleCardProps {
  hustle: Hustle;
  player: PlayerStats;
  onExecute: () => void;
  onUpgrade: (branchId?: string) => void;
}

export const HustleCard: React.FC<HustleCardProps> = ({
  hustle,
  player,
  onExecute,
  onUpgrade,
}) => {
  const currentLevel = player.hustleLevels[hustle.id] || 1;
  let levelData: HustleLevel | undefined;
  let nextBranches: HustleLevel[] = [];

  if (hustle.branches) {
    const currentNodeId = player.hustleBranchIds[hustle.id] || hustle.startBranchId;
    levelData = currentNodeId ? hustle.branches[currentNodeId] : undefined;

    if (levelData?.nextBranches) {
      nextBranches = levelData.nextBranches.map(id => hustle.branches![id]);
    }
  } else if (hustle.levels) {
    levelData = hustle.levels.find((l) => l.level === currentLevel);
    const nextLevel = hustle.levels.find((l) => l.level === currentLevel + 1);
    if (nextLevel) nextBranches = [nextLevel];
  }

  if (!levelData) return null;

  const canAfford = player.bag >= levelData.cost;

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
                Level {currentLevel}
              </span>
              <span className="text-[10px] text-slate-500 italic">{hustle.description}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">EST. YIELD</div>
          <div className="text-emerald-400 font-bold font-mono">${levelData.yieldCash.toLocaleString()}</div>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
          <div className="text-[8px] text-slate-500 uppercase mb-0.5">CLOUT / AURA</div>
          <div className="text-sm font-medium">
            <span className="text-blue-400">+{levelData.yieldClout}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-purple-400">+{levelData.yieldAura}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onExecute}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
            canAfford
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {levelData.cost > 0 ? `RUN IT (-$${levelData.cost.toLocaleString()})` : 'EXECUTE'}
        </button>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Repeatable Logic */}
          {levelData.isRepeatable && (
            <button
              onClick={() => onUpgrade(player.hustleBranchIds[hustle.id] || hustle.startBranchId)}
              disabled={
                player.bag < levelData!.cost ||
                (levelData!.maxRepeat !== undefined &&
                  (levelData!.id === 'l2a' ? player.flipCount : player.rentalCount) >= levelData!.maxRepeat)
              }
              className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all active:scale-95 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 disabled:border-slate-800 disabled:text-slate-700 disabled:bg-transparent"
            >
              Repeat {levelData.name}
              <br />
              ${levelData.cost.toLocaleString()} ({levelData.id === 'l2a' ? player.flipCount : player.rentalCount}/{levelData.maxRepeat})
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
                onClick={() => onUpgrade(branch.id)}
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
