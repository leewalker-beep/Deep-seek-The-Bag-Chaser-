import React, { useState } from 'react';
import { FLEX_ASSETS } from '../config/flexAssets';
import { useGameStore } from '../store/gameStore';
import { ConfirmationModal } from './ui/ConfirmationModal';

export const FlexMarket: React.FC = () => {
  const { pl, purchaseFlexAsset } = useGameStore();
  const [pendingAsset, setPendingAsset] = useState<{ id: string, name: string, cost: number } | null>(null);

  const handlePurchase = (assetId: string, name: string, cost: number) => {
    if (cost > pl.bag * 0.1) {
      setPendingAsset({ id: assetId, name, cost });
    } else {
      purchaseFlexAsset(assetId);
    }
  };

  const confirmPurchase = () => {
    if (pendingAsset) {
      purchaseFlexAsset(pendingAsset.id);
      setPendingAsset(null);
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmationModal
        isOpen={!!pendingAsset}
        title="Confirm Luxury Purchase"
        message={`Buying ${pendingAsset?.name} costs $${pendingAsset?.cost.toLocaleString()}, which is over 10% of your current bag. Are you sure?`}
        confirmLabel="Yes, Buy It"
        onConfirm={confirmPurchase}
        onCancel={() => setPendingAsset(null)}
        isHighStakes={true}
      />
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">FLEX ACQUISITIONS</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FLEX_ASSETS.map(asset => {
          const canAfford = pl.bag >= asset.cost;

          return (
            <button
              key={asset.id}
              onClick={() => handlePurchase(asset.id, asset.name, asset.cost)}
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
              {asset.maxCloutBoost > 0 && (
                <div className="text-[9px] text-purple-400">
                  📣 +{asset.maxCloutBoost} Clout cap
                </div>
              )}
              {asset.maxAuraBoost > 0 && (
                <div className="text-[9px] text-blue-400">
                  ✨ +{asset.maxAuraBoost} Aura cap
                </div>
              )}
              {asset.passiveYield > 0 && (
                <div className="text-[9px] text-emerald-400">
                  💵 +${(asset.passiveYield/1000).toFixed(0)}K/mo passive
                </div>
              )}
              {asset.heatDecayBonus && (
                <div className="text-[9px] text-cyan-400">
                  ❄️ -{asset.heatDecayBonus}% Heat decay
                </div>
              )}
              {asset.allGainsBonus && (
                <div className="text-[9px] text-amber-400">
                  ⚡ +{asset.allGainsBonus}% All gains
                </div>
              )}
              <div className="text-[10px] font-black
                text-slate-400 mt-2">
                ${asset.cost.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
