import React, { useState } from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { CinematicModal } from './ui/CinematicModal';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';
import { StatCard } from './ui/StatCard';

interface DeathScreenProps {
  deathBadge: string | null;
  fatalCause: string | null;
  lastHustleId?: string;
  deathContext?: {
    cause: string;
    narrative: string;
    statReachedZero: string;
    statValueAtDeath: number;
    timeline: { label: string; value: string | number; color?: string }[];
    technicalMath?: { label: string; multiplier: number }[];
    recommendations: string[];
    mentalHealthAtDeath: number;
    lastHustleMentalHit: number;
    lastHustleName: string;
    heatAtDeath: number;
    monthsPlayed: number;
    tier: string;
    fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
    fatalStatValue?: number;
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
        title={deathContext?.cause?.toUpperCase() || "GAME OVER"}
        subtitle="POST MORTEM"
        accentColor="red"
      >
        <div className="flex flex-col items-center max-w-md w-full mx-auto">
          {/* 1. CAUSE OF DEATH */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              {deathContext?.cause || displayBadge || 'FALLEN'}
            </h2>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Stat: <span className="text-red-500">{deathContext?.statReachedZero || 'UNKNOWN'}</span> reached zero
            </div>
          </div>

          {/* 2. WHAT HAPPENED (Narrative) */}
          <div className="bg-slate-900/50 border-l-4 border-red-600 p-4 mb-6 w-full">
            <p className="text-slate-300 text-sm italic leading-relaxed">
              "{deathContext?.narrative || fatalCause || deathInfo.message}"
            </p>
          </div>

          {/* 3a. FINAL EVENTS (Last 3 fatal events) */}
          {pl.lastMajorEvents && pl.lastMajorEvents.length > 0 && (
            <div className="w-full mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Closing Chapters</h3>
              <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 space-y-2">
                 {pl.lastMajorEvents.map((event, i) => (
                   <div key={i} className="flex gap-3 items-center text-[11px]">
                      <span className="text-slate-600">•</span>
                      <span className={event.color || 'text-slate-400'}>{event.text}</span>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* 3b. FINAL BREAKDOWN (Timeline) */}
          <div className="w-full mb-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Final Calculation</h3>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/50">
               {deathContext?.timeline.map((step, i) => (
                 <div key={i} className="flex justify-between items-center p-3">
                    <div className="flex items-center gap-2">
                       {i > 0 && <span className="text-slate-600">↓</span>}
                       <span className="text-[11px] font-bold text-slate-400 uppercase">{step.label}</span>
                    </div>
                    <span className={`font-mono text-xs font-black ${step.color || 'text-slate-200'}`}>
                      {step.value}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          {/* 4. TECHNICAL BREAKDOWN (Collapsible) */}
          {deathContext?.technicalMath && deathContext.technicalMath.length > 0 && (
            <div className="w-full mb-6">
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="flex items-center justify-between w-full px-4 py-2 bg-slate-900/30 border border-slate-800/50 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-800/50 transition-colors"
              >
                <span>{showDetail ? 'Close' : 'View'} Detailed Math Analysis</span>
                <span>{showDetail ? '▲' : '▼'}</span>
              </button>

              {showDetail && (
                <div className="bg-slate-950/50 border-x border-b border-slate-800/50 rounded-b-lg p-4 space-y-2 animate-in fade-in slide-in-from-top-1">
                   {deathContext.technicalMath.map((math, i) => (
                     <div key={i} className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-bold">{math.label}</span>
                        <span className="font-mono text-slate-300">
                          {i === 0 ? '' : '× '}
                          {typeof math.multiplier === 'number' && math.multiplier % 1 !== 0
                            ? math.multiplier.toFixed(2)
                            : math.multiplier}
                        </span>
                     </div>
                   ))}
                   <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-black">
                      <span className="text-slate-400 text-[10px] uppercase">Final Damage</span>
                      <span className="text-red-500 font-mono">
                        {deathContext.statValueAtDeath}
                      </span>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Turning Point */}
          {pl.turningPoint && (
            <div className="w-full mb-6 bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Turning Point</h4>
               <p className="text-xs text-amber-200/90 font-medium">
                 "{pl.turningPoint}"
               </p>
            </div>
          )}

          {/* 5. LESSONS LEARNED */}
          {deathContext?.recommendations && (
            <div className="w-full mb-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
               <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Lessons Learned</h4>
               <ul className="space-y-2">
                 {deathContext.recommendations.map((rec, i) => (
                   <li key={i} className="text-[11px] text-emerald-200/80 flex gap-2">
                      <span className="text-emerald-500">•</span>
                      {rec}
                   </li>
                 ))}
               </ul>
            </div>
          )}

          <div className="w-full">
            {/* 6. RUN SUMMARY */}
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Run Summary</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="col-span-2 p-4 bg-slate-950 border border-yellow-500/30 rounded-xl text-center">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Legacy Points Banked</div>
                <div className="text-4xl font-black text-emerald-400 tabular-nums font-mono">
                  +{(pl.legacyScore || 0).toLocaleString()}
                </div>
              </div>

              <StatCard label="Peak Tier" value={deathContext?.tier || pl.currentTier} colorClass="text-purple-400" />
              <StatCard label="Age" value={`${18 + Math.floor((deathContext?.monthsPlayed || pl.month) / 12)}`} icon="🎂" />
              <StatCard label="Time Survived" value={`${deathContext?.monthsPlayed || pl.month} Mo`} icon="📅" />
              <StatCard label="Net Worth" value={`$${pl.bag.toLocaleString()}`} colorClass="text-emerald-400" />
            </div>

            {/* 7. BIOGRAPHY */}
            {pl.biography && pl.biography.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Life Story</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {pl.biography.map((entry, idx) => (
                    <div key={idx} className="bg-slate-900/30 border border-slate-800/30 p-2.5 rounded-xl">
                      <p className="text-[10px] text-slate-400 leading-normal font-medium uppercase tracking-tight">
                        {entry}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. NEAR MISS LINE */}
            {isNearMiss && nextTier && nextTierReq && (
              <div className="text-amber-400 italic text-[10px] text-center mb-6 bg-amber-950/20 border border-amber-500/20 py-2 rounded-lg">
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
