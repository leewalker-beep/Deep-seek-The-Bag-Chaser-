import React, { useState } from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { CinematicModal } from './ui/CinematicModal';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';

interface DeathScreenProps {
  deathBadge: string | null;
  fatalCause: string | null;
  lastHustleId?: string;
  deathContext?: {
    mentalHealthAtDeath: number;
    lastHustleMentalHit: number;
    lastHustleName: string;
    heatAtDeath: number;
    monthsPlayed: number;
    tier: string;
    fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
    fatalStatValue?: number;
    statBefore?: number;
    baseDamage?: number;
    multipliers?: { name: string; value: number }[];
    finalDamage?: number;
    actionName?: string;
  };
  onReset: () => void;
  onViewSummary: () => void;
  onLegacyShop: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
  deathBadge,
  fatalCause,
  lastHustleId,
  deathContext,
  onReset,
  onViewSummary,
  onLegacyShop
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const { pl } = useGameStore();

  const deathTitle = (() => {
    const stat = deathContext?.fatalStat;
    if (stat === 'clout') return 'IRRELEVANT';
    if (stat === 'aura') return 'CANCELLED';
    if (stat === 'bag') return 'BROKE';
    if (stat === 'mental') return 'BURNED OUT';
    if (fatalCause?.includes('jail'))
      return 'LOCKED UP';
    return 'GAME OVER';
  })();

  const deathInfo = (lastHustleId && DEATH_MESSAGES[lastHustleId]) || DEATH_MESSAGES['DEFAULT'];
  const displayBadge = deathBadge || deathInfo.badge;

  // Near Miss calculation
  const currentTier = deathContext?.tier || pl.currentTier;
  const currentTierIndex = PROGRESSION_ORDER.indexOf(currentTier as any);
  const nextTier = PROGRESSION_ORDER[currentTierIndex + 1];
  const nextTierReq = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  const isNearMiss = nextTierReq &&
    pl.clout < nextTierReq.clout &&
    pl.clout >= nextTierReq.clout * 0.8;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <CinematicModal
        isOpen={true}
        title={deathTitle}
        subtitle="POST MORTEM"
        accentColor="red"
      >
        <div className="flex flex-col items-center">
          {/* 1. DEATH BADGE */}
          <div className="text-center mb-2">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              {displayBadge || 'FALLEN'}
            </h2>
          </div>

          {/* 2. FATAL CAUSE */}
          <p className="text-slate-400 italic text-sm text-center mb-8 max-w-xs">
            {fatalCause || deathInfo.message}
          </p>

          {/* 3. WHAT HAPPENED */}
          <div className="w-full mb-4">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center justify-center w-full gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-colors py-2"
            >
              {showDetail ? '▲' : '▼'} WHAT HAPPENED
            </button>

            {showDetail && deathContext && (
              <div className="bg-slate-950/50 border border-red-500/20 rounded-2xl p-6 mt-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="text-center pb-2 border-b border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Fatal Action</span>
                  <span className="text-white font-black text-sm italic">"{deathContext.actionName || deathContext.lastHustleName}"</span>
                </div>

                {deathContext.statBefore !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">{deathContext.fatalStat === 'bag' ? 'Bag' : 'Stat'} before action</span>
                      <span className="text-slate-300">{deathContext.fatalStat === 'bag' ? '$' : ''}{Math.round(deathContext.statBefore).toLocaleString()}{deathContext.fatalStat !== 'bag' ? '%' : ''}</span>
                    </div>

                    {deathContext.baseDamage !== undefined && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500">Base Damage</span>
                        <span className="text-red-400">{deathContext.fatalStat === 'bag' ? '$' : ''}{Math.round(deathContext.baseDamage).toLocaleString()}</span>
                      </div>
                    )}

                    {deathContext.multipliers && deathContext.multipliers.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pl-2 border-l border-slate-800">
                        <span className="text-slate-600">{m.name}</span>
                        <span className="text-orange-400">×{m.value.toFixed(2)}</span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Final Damage</span>
                      <span className="text-red-500 font-black text-sm">
                        {deathContext.fatalStat === 'bag' ? '$' : ''}{Math.round(deathContext.finalDamage || deathContext.lastHustleMentalHit).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-red-950/20 p-2 rounded-lg border border-red-900/30">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Result</span>
                      <span className="text-red-400 font-mono font-black text-xs">
                        {deathContext.fatalStat === 'bag' ? '$' : ''}{Math.round(deathContext.statBefore).toLocaleString()} → {deathContext.fatalStat === 'bag' ? '$' : ''}{Math.round(deathContext.statBefore - (deathContext.finalDamage || deathContext.lastHustleMentalHit)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {!deathContext.statBefore && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Cause of Collapse</span>
                      <span className="text-red-400 font-black text-xs uppercase">
                        {deathContext.fatalStat || 'STRESS'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Peak Tier</span>
                      <span className="text-slate-300 font-black text-xs uppercase">{deathContext.tier}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Time Survived</span>
                      <span className="text-slate-300 font-black text-xs uppercase">{deathContext.monthsPlayed} Months</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-full">
            {/* 4. LEGACY POINTS EARNED */}
            <div className="text-center py-4">
              <div className="text-[9px] text-slate-600
                uppercase tracking-widest">
                Legacy Points Banked
              </div>
              <div className="text-3xl font-black
                text-emerald-400 font-mono mt-1">
                +{(pl.legacyScore || 0).toLocaleString()}
              </div>
            </div>

            {/* 5. NEAR MISS LINE */}
            {isNearMiss && nextTier && nextTierReq && (
              <div className="text-amber-400 italic text-xs text-center mb-4">
                You were {(nextTierReq.clout - pl.clout).toLocaleString()} clout from {nextTier}.
              </div>
            )}

            {/* 6. BUTTONS */}
            <div className="space-y-4 pt-4 text-center">
              <button
                onClick={onReset}
                className="w-full py-6 bg-red-600 text-white font-black text-base rounded-xl uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all active:scale-95"
              >
                RUN IT BACK
              </button>

              <button
                onClick={onViewSummary}
                className="w-full py-4 bg-slate-800 text-slate-200 border border-slate-700 font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-700 transition-all active:scale-95"
              >
                SEE THE LEDGER
              </button>

              <button
                onClick={onLegacyShop}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-[0.2em] transition-colors"
              >
                LEGACY SHOP
              </button>
            </div>
          </div>
        </div>
      </CinematicModal>
    </div>
  );
};
