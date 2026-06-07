import React from 'react';
import { FLEX_ASSETS } from '../config/flexAssets';
import { useGameStore } from '../store/gameStore';

export const FlexMarket: React.FC = () => {
  const { pl, purchaseFlexAsset } = useGameStore();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">FLEX ACQUISITIONS</h2>
        <p className="text-[10px] text-slate-500">Convert capital into permanent status</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {FLEX_ASSETS.map(asset => {
          const owned = pl.flexAssets[asset.id] || 0;
          const canAfford = pl.bag >= asset.cost;

          return (
            <div key={asset.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{asset.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{asset.name}</div>
                    <div className="text-[10px] text-emerald-400">${asset.cost.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-500">OWNED</div>
                  <div className="text-xl font-bold text-white">{owned}</div>
                </div>
              </div>

              <div className="flex gap-3 text-[10px] mb-3">
                {asset.maxCloutBoost > 0 && <span className="text-blue-400">+{asset.maxCloutBoost} CLT</span>}
                {asset.maxAuraBoost > 0 && <span className="text-purple-400">+{asset.maxAuraBoost} AUR</span>}
                {asset.passiveYield > 0 && <span className="text-emerald-400">+${asset.passiveYield}/mo</span>}
              </div>

              <button
                onClick={() => purchaseFlexAsset(asset.id)}
                disabled={!canAfford}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                  canAfford
                    ? 'bg-emerald-600 text-white active:scale-95'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'PURCHASE' : `NEED $${(asset.cost - pl.bag).toLocaleString()} MORE`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
