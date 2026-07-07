import React from 'react';
import { useGameStore } from '../store/gameStore';
import { FLEX_ASSETS } from '../config/flexAssets';
import { getFlexCelebration } from '../engine/flexEngine';
import { CinematicModal } from './ui/CinematicModal';
import { PortraitCard } from './ui/PortraitCard';

interface Props {
  threshold: number;
  onDismiss: () => void;
}

const FLEX_THRESHOLDS: Record<number, string> = {
  10000:       'watch',
  50000:       'car',
  500000:      'yacht',
  1000000:     'penthouse',
  5000000:     'jet',
  25000000:    'island',
  100000000:   'franchise',
};

export const FlexOpportunityModal: React.FC<Props> = ({ threshold, onDismiss }) => {
  const { pl, purchaseFlexAsset, updatePl } = useGameStore();

  const assetId = FLEX_THRESHOLDS[threshold];
  const asset = FLEX_ASSETS.find(a => a.id === assetId);

  if (!asset) return null;

  const canAfford = pl.bag >= asset.cost;

  return (
    <CinematicModal
      isOpen={true}
      onClose={onDismiss}
      title={asset.name}
      subtitle="NEW FLEX OPPORTUNITY"
      accentColor="amber"
    >
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[240px] mb-6">
          <PortraitCard
            name={asset.name}
            role="NEWSPAPER"
            rarity="LEGENDARY"
            image={asset.icon}
          />
        </div>

        <div className="text-center mb-8">
           <div className="text-2xl font-black text-amber-400 font-mono">
             ${asset.cost.toLocaleString()}
           </div>
           <p className="text-slate-400 text-sm mt-2 font-medium italic">
             "{getFlexCelebration()}"
           </p>
        </div>

        <div className="w-full bg-slate-950/50 border border-amber-500/20 rounded-2xl p-6 mb-8 space-y-4">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2 border-b border-amber-500/10 pb-2">
            PRESTIGE BENEFITS
          </h4>

          {asset.maxCloutBoost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Clout Capacity</span>
              <span className="text-purple-400 font-black text-xs">📣 +{asset.maxCloutBoost}</span>
            </div>
          )}
          {asset.maxAuraBoost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Aura Capacity</span>
              <span className="text-blue-400 font-black text-xs">✨ +{asset.maxAuraBoost}</span>
            </div>
          )}
          {asset.passiveYield > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Monthly Passive</span>
              <span className="text-emerald-400 font-black text-xs">💵 +${(asset.passiveYield/1000).toFixed(0)}K</span>
            </div>
          )}
          {asset.heatDecayBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Heat Decay</span>
              <span className="text-cyan-400 font-black text-xs">❄️ -{asset.heatDecayBonus}%</span>
            </div>
          )}
          {asset.allGainsBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">All Gains</span>
              <span className="text-amber-400 font-black text-xs">⚡ +{asset.allGainsBonus}%</span>
            </div>
          )}
          {asset.mentalRecoveryBonus && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Mental Recovery</span>
              <span className="text-pink-400 font-black text-xs">🧠 +{asset.mentalRecoveryBonus}%</span>
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => {
              purchaseFlexAsset(asset.id);
              onDismiss();
            }}
            disabled={!canAfford}
            className={`w-full py-4 bg-amber-500 text-black font-black text-sm rounded-xl uppercase tracking-[0.2em] transition-all active:scale-95 ${
              !canAfford ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            }`}
          >
            ACQUIRE ASSET
          </button>

          <button
            onClick={() => {
              // Apply a random 6-12 month cooldown on decline
              const cooldown = 6 + Math.floor(Math.random() * 7);
              updatePl({ flexOfferCooldown: cooldown });
              onDismiss();
            }}
            className="w-full text-slate-500 text-[10px] text-center font-bold uppercase tracking-[0.2em] hover:text-slate-300 transition-colors"
          >
            Not right now
          </button>
        </div>
      </div>
    </CinematicModal>
  );
};
