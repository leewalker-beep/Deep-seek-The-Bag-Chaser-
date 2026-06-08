import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PROGRESSION_ORDER } from '../config/tiers';

export const TheReceipts: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pl } = useGameStore();
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [showDebug, setShowDebug] = useState(false);

  const actions = pl.actionLog || [];
  const milestones = pl.milestones || [];

  const filteredActions = filterTier === 'ALL'
    ? actions
    : actions.filter(a => a.tier === filterTier);

  // Calculate stats
  const totalProfit = actions.reduce((sum, a) => sum + a.netCash, 0);
  const vendingCount = actions.filter(a => a.hustleId === 'r_vending').length;
  const houseFlips = actions.filter(a => a.branchId === 'l2a').length;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-black text-emerald-400 cursor-pointer select-none"
            onDoubleClick={() => setShowDebug(!showDebug)}
          >
            📋 THE RECEIPTS
          </h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">✕</button>
        </div>

        {/* Stats Summary */}
        <div className="bg-slate-900 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-slate-500">TOTAL PROFIT</div>
              <div className="text-lg font-bold text-emerald-400">${totalProfit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">HOUSES FLIPPED</div>
              <div className="text-lg font-bold text-white">{houseFlips}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">VENDING MACHINES</div>
              <div className="text-lg font-bold text-white">{vendingCount}</div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-yellow-500 mb-2">🏆 MILESTONES</h3>
            <div className="space-y-2">
              {milestones.map(m => (
                <div key={m.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                  <div className="font-bold text-yellow-400">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.description}</div>
                  <div className="text-[10px] text-slate-400">Month {m.achievedAtMonth} • {m.tier} tier</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button onClick={() => setFilterTier('ALL')} className={`px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap ${filterTier === 'ALL' ? 'bg-emerald-600' : 'bg-slate-800'}`}>ALL</button>
          {PROGRESSION_ORDER.map(tier => (
            <button key={tier} onClick={() => setFilterTier(tier)} className={`px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap ${filterTier === tier ? 'bg-emerald-600' : 'bg-slate-800'}`}>{tier}</button>
          ))}
        </div>

        {/* Action Log */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 mb-2">ACTIVITY LOG</h3>
          {filteredActions.length === 0 && (
            <div className="text-center text-slate-600 py-8">No receipts yet. Start grinding.</div>
          )}
          {filteredActions.map(action => (
            <div key={action.id} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Month {action.month}</span>
                <span>{action.tier} tier • Lv.{action.level}</span>
              </div>
              <div className="font-bold text-white">
                {action.hustleName} {action.branchName !== action.hustleName && `→ ${action.branchName}`}
              </div>
              <div className="text-[10px] mt-1">
                <span className="text-red-400">-${action.cost.toLocaleString()}</span>
                {' + '}
                <span className="text-emerald-400">+${action.yieldCash.toLocaleString()}</span>
                {' = '}
                <span className={action.netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {action.netCash >= 0 ? '+' : ''}{action.netCash.toLocaleString()}
                </span>
              </div>
              {showDebug && action.marketMult && (
                <div className="text-[8px] text-slate-500 mt-1 bg-slate-950 p-1 rounded font-mono">
                  MKT ({action.marketName || 'NORMAL'}): [Y:{action.marketMult.yield} E:{action.marketMult.expense} H:{action.marketMult.heat}] | VAR: {action.variation || 0}
                </div>
              )}
              {action.passiveAdded ? (
                <div className="text-[9px] text-blue-400 mt-1">+${action.passiveAdded}/mo passive</div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Hidden Debug Mode (tap title 5 times) */}
        <div
          className="text-center text-[8px] text-slate-700 mt-8"
          onDoubleClick={() => setShowDebug(!showDebug)}
        >
          {showDebug && (
            <pre className="text-left text-[6px] text-slate-500 overflow-x-auto">
              {JSON.stringify(actions.slice(0, 10), null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
