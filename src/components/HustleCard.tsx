import React from 'react';
import type { Hustle } from '../config/hustles/base';

interface HustleCardProps {
  hustle: Hustle;
  currentLevel: number;
  canAfford: boolean;
  canUpgrade: boolean;
  upgradeCost?: number;
  onExecute: () => void;
  onUpgrade: () => void;
}

export const HustleCard: React.FC<HustleCardProps> = ({
  hustle,
  currentLevel,
  canAfford,
  canUpgrade,
  upgradeCost,
  onExecute,
  onUpgrade,
}) => {
  const levelData = hustle.levels.find((l) => l.level === currentLevel);
  const nextLevelData = hustle.levels.find((l) => l.level === currentLevel + 1);

  if (!levelData) return null;

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

      <div className="flex gap-2">
        <button
          onClick={onExecute}
          className={`flex-grow py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
            canAfford
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {levelData.cost > 0 ? `RUN IT (-$${levelData.cost.toLocaleString()})` : 'EXECUTE'}
        </button>

        {nextLevelData && (
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase transition-all active:scale-95 border ${
              canUpgrade
                ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                : 'border-slate-800 text-slate-700 cursor-not-allowed'
            }`}
          >
            Upgrade
            <br />
            {upgradeCost ? `$${upgradeCost.toLocaleString()}` : 'MAX'}
          </button>
        )}
      </div>
    </div>
  );
};
