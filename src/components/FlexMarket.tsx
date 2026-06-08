import React from 'react';
import { FLEX_ASSETS } from '../config/flexAssets';
import { useGameStore } from '../store/gameStore';

export const FlexMarket: React.FC = () => {
  const { pl, purchaseFlexAsset } = useGameStore();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">FLEX ACQUISITIONS</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FLEX_ASSETS.map(asset => {
          const canAfford = pl.bag >= asset.cost;

          return (
            <button
              key={asset.id}
              onClick={() => purchaseFlexAsset(asset.id)}
              disabled={!canAfford}
              className={`bg-slate-900 rounded-xl p-4 text-center border border-slate-800 transition-all ${
                canAfford
                  ? 'hover:border-slate-700 active:scale-95'
                  : 'opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              <div className="text-4xl mb-2">{asset.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                {asset.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
