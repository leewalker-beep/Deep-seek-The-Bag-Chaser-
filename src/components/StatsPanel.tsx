import React, { useEffect } from 'react';
import type { PlayerStats, MarketType } from '../types/game';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS, getTierMax } from '../config/tiers';
import { useGameStore } from '../store/gameStore';

interface StatsPanelProps {
  stats: PlayerStats;
  market: MarketType;
  onOpenReceipts?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, market, onOpenReceipts }) => {
  const { addTickerMessage } = useGameStore();

  useEffect(() => {
    if (stats.mentalHealth <= 25) {
      document.getElementById('mental-stat')?.classList.add('flash-red');
      addTickerMessage('Your mind is fracturing. One more hit could end you.', 'text-red-500');
    } else {
      document.getElementById('mental-stat')?.classList.remove('flash-red');
    }

    if (stats.clout <= 10) {
      document.getElementById('clout-stat')?.classList.add('flash-blue');
      addTickerMessage('Your influence is fading. The streets are forgetting you.', 'text-blue-400');
    } else {
      document.getElementById('clout-stat')?.classList.remove('flash-blue');
    }

    if (stats.aura <= 10) {
      document.getElementById('aura-stat')?.classList.add('flash-purple');
      addTickerMessage('Your mystique is gone. You are becoming invisible.', 'text-purple-400');
    } else {
      document.getElementById('aura-stat')?.classList.remove('flash-purple');
    }

    if (stats.heat >= 80) {
      document.getElementById('heat-stat')?.classList.add('flash-orange');
      addTickerMessage('The feds are circling. One wrong move and you are done.', 'text-orange-400');
    } else {
      document.getElementById('heat-stat')?.classList.remove('flash-orange');
    }

    if (stats.bag <= 1000) {
      document.getElementById('bag-amount')?.classList.add('flash-red-border');
      addTickerMessage('Your funds are critically low. One bad month ends everything.', 'text-red-500');
    } else {
      document.getElementById('bag-amount')?.classList.remove('flash-red-border');
    }
  }, [stats, addTickerMessage]);

  const currentIndex = PROGRESSION_ORDER.indexOf(stats.currentTier);
  const nextTier = PROGRESSION_ORDER[currentIndex + 1];
  const nextRequirements = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  const progressToNext = nextRequirements && nextTier ? {
    cash: Math.min(100, (stats.bag / nextRequirements.cash) * 100),
    clout: Math.min(100, (stats.clout / getTierMax(nextTier).clout) * 100),
    aura: Math.min(100, (stats.aura / getTierMax(nextTier).aura) * 100),
  } : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
      {/* Tier Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">CURRENT TIER</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceipts}
            className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold transition-colors"
          >
            📋 RECEIPTS
          </button>
          <span className="text-emerald-400 font-bold text-sm">{stats.currentTier}</span>
        </div>
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
          <div className="text-[10px] font-bold text-blue-400">
            {Math.floor(stats.clout)} / {getTierMax(stats.currentTier).clout}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">AURA</div>
          <div className="text-[10px] font-bold text-purple-400">
            {Math.floor(stats.aura)} / {getTierMax(stats.currentTier).aura}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">MENTAL</div>
          <div className={`text-sm font-bold ${stats.mentalHealth < 30 ? 'text-red-400' : 'text-white'}`}>
            {Math.floor(stats.mentalHealth)}%
            {stats.mentalShieldTurns > 0 && (
              <span className="text-blue-400 ml-1 text-[10px]">🛡️{stats.mentalShieldTurns}</span>
            )}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <div className="text-[8px] text-slate-500 uppercase">HEAT</div>
          <div className={`text-sm font-bold ${stats.heat > 70 ? 'text-orange-400' : 'text-white'}`}>
            {Math.floor(stats.heat)}%
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
        <div className="flex gap-2 mt-1">
          <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400">Yield: {MARKET_CONFIGS[market].yieldMultiplier}x</span>
          <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400">Exp: {MARKET_CONFIGS[market].expenseMultiplier}x</span>
          <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-400">Heat: {MARKET_CONFIGS[market].heatMultiplier}x</span>
        </div>
        <div className="text-[8px] text-slate-600 mt-1">{MARKET_CONFIGS[market].description}</div>
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
                  {Math.floor(stats.clout)} / {getTierMax(nextTier).clout}
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
                  {Math.floor(stats.aura)} / {getTierMax(nextTier).aura}
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
