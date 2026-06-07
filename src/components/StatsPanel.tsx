import React from 'react';
import type { PlayerStats, MarketType } from '../types/game';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';

interface StatsPanelProps {
  stats: PlayerStats;
  market: MarketType;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, market }) => {
  const currentIndex = PROGRESSION_ORDER.indexOf(stats.currentTier);
  const nextTier = PROGRESSION_ORDER[currentIndex + 1];
  const nextRequirements = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  const progressToNext = nextRequirements ? {
    cash: Math.min(100, (stats.bag / nextRequirements.cash) * 100),
    clout: Math.min(100, (stats.clout / nextRequirements.clout) * 100),
    aura: Math.min(100, (stats.aura / nextRequirements.aura) * 100),
  } : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
      {/* Tier Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">CURRENT TIER</span>
        <span className="text-emerald-400 font-bold text-sm">{stats.currentTier}</span>
      </div>

      {/* Bag Amount */}
      <div className="mb-4">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">LIQUID CAPITAL</div>
        <div className="text-3xl font-bold text-emerald-400 font-mono">
          ${stats.bag.toLocaleString()}
        </div>
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">CLOUT</div>
          <div className="text-sm font-bold text-blue-400">{stats.clout}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">AURA</div>
          <div className="text-sm font-bold text-purple-400">{stats.aura}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">MENTAL</div>
          <div className={`text-sm font-bold ${stats.mentalHealth < 30 ? 'text-red-400' : 'text-white'}`}>
            {stats.mentalHealth}%
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">HEAT</div>
          <div className={`text-sm font-bold ${stats.heat > 70 ? 'text-orange-400' : 'text-white'}`}>
            {stats.heat}%
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="mb-3 pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500">MARKET</span>
          <span className={`font-bold ${
            market === 'RECESSION' ? 'text-red-400' :
            market === 'BULL_MARKET' ? 'text-emerald-400' :
            market === 'CRACKDOWN' ? 'text-orange-400' : 'text-slate-300'
          }`}>
            {MARKET_CONFIGS[market].name}
          </span>
        </div>
        <div className="text-[8px] text-slate-600 mt-0.5">{MARKET_CONFIGS[market].description}</div>
      </div>

      {/* Next Tier Progress */}
      {nextRequirements && nextTier && (
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">
            NEXT: {nextTier} TIER
          </div>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[8px] mb-0.5">
                <span className="text-slate-500">Cash</span>
                <span className={stats.bag >= nextRequirements.cash ? 'text-emerald-400' : 'text-slate-400'}>
                  ${stats.bag.toLocaleString()} / ${nextRequirements.cash.toLocaleString()}
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressToNext?.cash || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[8px] mb-0.5">
                <span className="text-slate-500">Clout</span>
                <span className={stats.clout >= nextRequirements.clout ? 'text-blue-400' : 'text-slate-400'}>
                  {stats.clout} / {nextRequirements.clout}
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressToNext?.clout || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[8px] mb-0.5">
                <span className="text-slate-500">Aura</span>
                <span className={stats.aura >= nextRequirements.aura ? 'text-purple-400' : 'text-slate-400'}>
                  {stats.aura} / {nextRequirements.aura}
                </span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progressToNext?.aura || 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month Counter */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-[8px] text-slate-600 text-center">
        MONTH {stats.month}
      </div>
    </div>
  );
};
