import React from 'react';
import { useGameStore } from '../store/gameStore';
import { FLEX_ASSETS } from '../config/flexAssets';

interface Props {
  threshold: number;
  onDismiss: () => void;
}

export const FlexOpportunityModal: React.FC<Props> = ({ threshold, onDismiss }) => {
  const { pl, purchaseFlexAsset } = useGameStore();

  const FLEX_THRESHOLDS: Record<number, string> = {
    10000:       'watch',
    50000:       'car',
    500000:      'yacht',
    1000000:     'penthouse',
    5000000:     'jet',
    25000000:    'island',
    100000000:   'franchise',
  };

  const assetId = FLEX_THRESHOLDS[threshold];
  const asset = FLEX_ASSETS.find(a => a.id === assetId);

  if (!asset) return null;

  const canAfford = pl.bag >= asset.cost;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto p-6"
      style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #0f0a1a 100%)' }}>

      <div className="max-w-md mx-auto w-full flex flex-col">
        <div className="text-8xl text-center mt-16 animate-bounce">
          {asset.icon}
        </div>

        <div className="text-xs text-emerald-400 uppercase tracking-[0.3em] text-center mt-6 font-black">
          YOU CAN AFFORD THIS
        </div>

        <div className="text-4xl font-black text-white text-center mt-2 uppercase tracking-tight">
          {asset.name}
        </div>

        <div className="text-xl text-slate-400 text-center mt-1 font-mono">
          ${asset.cost.toLocaleString()}
        </div>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 mt-6 space-y-3">
          {asset.maxCloutBoost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">Clout Capacity</span>
              <span className="text-purple-400 font-black">📣 +{asset.maxCloutBoost}</span>
            </div>
          )}
          {asset.maxAuraBoost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">Aura Capacity</span>
              <span className="text-blue-400 font-black">✨ +{asset.maxAuraBoost}</span>
            </div>
          )}
          {asset.passiveYield > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">Monthly Passive</span>
              <span className="text-emerald-400 font-black">💵 +${(asset.passiveYield/1000).toFixed(0)}K</span>
            </div>
          )}
          {asset.heatDecayBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">Heat Decay</span>
              <span className="text-cyan-400 font-black">❄️ -{asset.heatDecayBonus}%</span>
            </div>
          )}
          {asset.allGainsBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">All Gains</span>
              <span className="text-amber-400 font-black">⚡ +{asset.allGainsBonus}%</span>
            </div>
          )}
          {asset.mentalRecoveryBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs uppercase font-bold">Mental Recovery</span>
              <span className="text-pink-400 font-black">🧠 +{asset.mentalRecoveryBonus}%</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            purchaseFlexAsset(asset.id);
            onDismiss();
          }}
          disabled={!canAfford}
          className={`w-full py-5 bg-emerald-500 text-black font-black text-lg rounded-2xl uppercase tracking-widest mt-6 transition-all active:scale-95 ${
            !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
          }`}
        >
          FLEX IT
        </button>

        <button
          onClick={onDismiss}
          className="text-slate-600 text-xs text-center mt-6 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
        >
          Maybe later — keep grinding
        </button>
      </div>
    </div>
  );
};
