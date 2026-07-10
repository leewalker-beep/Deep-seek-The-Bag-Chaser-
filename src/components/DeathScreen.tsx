import React, { useState } from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';
import { motion, AnimatePresence } from 'framer-motion';

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
    preStatValue?: number;
    baseDamage?: number;
    multipliers?: Record<string, number>;
    finalDamage?: number;
    postStatValue?: number;
  };
  onReset: () => void;
  onQuickStart: () => void;
  onViewSummary: () => void;
  onLegacyShop: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
  deathBadge,
  fatalCause,
  lastHustleId,
  deathContext,
  onReset,
  onQuickStart,
  onViewSummary,
  onLegacyShop
}) => {
  const [stage, setStage] = useState<'downfall' | 'obituary' | 'legacy'>('downfall');
  const { pl } = useGameStore();

  // 1. Title matching cause of death
  const causeTitle = (() => {
    const stat = deathContext?.fatalStat;
    if (stat === 'clout') return 'Reputation Collapse';
    if (stat === 'aura') return 'Reputation Collapse';
    if (stat === 'bag') return 'Bankruptcy';
    if (stat === 'mental') return 'Burnout';
    if (fatalCause?.toLowerCase().includes('jail') || fatalCause?.toLowerCase().includes('arrest'))
      return 'Locked Up';
    return 'Scandal';
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

  // Build the mathematical calculation sequence
  const getMathSequence = () => {
    if (!deathContext) return null;
    const stat = deathContext.fatalStat || 'mental';
    const statLabel = {
      mental: 'Mental Health',
      bag: 'Cash Balance',
      clout: 'Clout',
      aura: 'Aura',
      heat: 'Heat Level'
    }[stat] || 'Stress Level';

    const unit = stat === 'mental' || stat === 'heat' ? '%' : stat === 'bag' ? '$' : '';
    const preValue = deathContext.preStatValue ?? 0;
    const baseDmg = deathContext.baseDamage ?? 0;
    const finalDmg = deathContext.finalDamage ?? baseDmg;
    const postValue = deathContext.postStatValue ?? 0;

    return (
      <div className="bg-slate-950/70 border border-red-500/15 rounded-2xl p-5 space-y-4 font-mono text-sm max-w-sm mx-auto text-left">
        <div className="text-center text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">
          Technical Accounting Sequence
        </div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="text-xs text-slate-500 uppercase font-black">Starting {statLabel}</span>
          <span className="font-bold text-white">
            {stat === 'bag' ? `$${preValue.toLocaleString()}` : `${preValue.toFixed(0)}${unit}`}
          </span>
        </div>

        <div className="flex justify-center text-red-500/60 font-black">↓</div>

        <div className="flex justify-between items-center text-slate-300">
          <span className="text-xs text-slate-500 uppercase font-black">Base Penalty / Impact</span>
          <span className="font-bold text-red-400">
            {stat === 'bag' ? `-$${Math.abs(baseDmg).toLocaleString()}` : `-${Math.abs(baseDmg).toFixed(1)}${unit}`}
          </span>
        </div>

        <div className="flex justify-center text-red-500/60 font-black">↓</div>

        {deathContext.multipliers && Object.keys(deathContext.multipliers).length > 0 ? (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Active Modifiers</span>
              {Object.entries(deathContext.multipliers).map(([name, val]) => (
                <div key={name} className="flex justify-between items-center pl-3 border-l border-red-500/20 text-xs text-slate-400">
                  <span className="capitalize">{name} Modifier</span>
                  <span className="font-bold text-orange-400">x{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center text-red-500/60 font-black">↓</div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Modifiers</span>
              <span>None (x1.00)</span>
            </div>
            <div className="flex justify-center text-red-500/60 font-black">↓</div>
          </>
        )}

        <div className="flex justify-between items-center text-slate-200 bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-900/30">
          <span className="text-xs text-red-400 uppercase font-black">Final Calculated Damage</span>
          <span className="font-bold text-red-500">
            {stat === 'bag' ? `-$${Math.abs(finalDmg).toLocaleString()}` : `-${Math.abs(finalDmg).toFixed(1)}${unit}`}
          </span>
        </div>

        <div className="flex justify-center text-red-500/60 font-black">↓</div>

        <div className="flex justify-between items-center text-white bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-black">Remaining {statLabel}</span>
          <span className="font-bold text-red-500 text-base">
            {stat === 'bag' ? `$${postValue.toLocaleString()}` : `${postValue.toFixed(0)}${unit}`}
          </span>
        </div>
      </div>
    );
  };

  const getLessonsLearned = () => {
    const stat = deathContext?.fatalStat;
    if (stat === 'mental') {
      return "🧠 BURNOUT LESSON: Your mental health reached 0%. Heavy-yielding high-tier gigs take a massive psychological toll. Balance the stress of corporate and elite life by stepping back into relaxation activities, or secure protective items and assets from lower tiers.";
    }
    if (stat === 'bag') {
      return "💸 BANKRUPTCY LESSON: You ran out of liquid funds. Rent or immediate costs exceeded your safety margin. Always keep a liquid cash reserve to weather economic downturns, and build automatic passive cash streams to secure your baseline.";
    }
    if (stat === 'heat') {
      return "👮 LAWDOWN LESSON: Police enforcement caught up with your operations. Your Heat exceeded critical thresholds. Use Ghost Mode or cooling strategies early, and establish legal front-ends to keep authority eyes off your operations.";
    }
    if (stat === 'clout') {
      return "👑 REPUTATION LESSON: You faded into total irrelevance. Your public clout dropped to zero. Secure your visibility by prioritizing contracts with steady clout payout, and avoid actions that compromise your standing.";
    }
    if (stat === 'aura') {
      return "✨ STARPOWER LESSON: You were canceled and stripped of your personal influence. Protect your Aura by steering clear of cash-grab moves that offend your core demographic, and pursue premium-tier projects.";
    }
    return "💀 COLD COMFORT: The ruthlessness of high society forgives no mistakes. Adapt, protect your core stats, and try again.";
  };

  const formattedBiography = pl.biography && pl.biography.length > 0
    ? pl.biography.map((line: any) => line.text || line).join(' ')
    : `A brief but intense chapter. ${pl.name || 'The Chaser'} began as a humble striver, navigating the complex systemic landscape before a sudden failure halted their progress.`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/35 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col max-h-[92vh]">

        {/* Banner/Header */}
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-800/50 bg-slate-950/40 shrink-0">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 text-red-500">
            THE FINAL CHAPTER
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            {causeTitle}
          </h2>
        </div>

        {/* Content Area with progressive stages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">

            {/* STAGE 1: THE DOWNFALL & MATH */}
            {stage === 'downfall' && (
              <motion.div
                key="downfall"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                {/* 1. Death Badge */}
                <div className="inline-block px-4 py-2 bg-red-950/40 border border-red-800/40 rounded-full">
                  <span className="text-xs font-black tracking-widest text-red-400 uppercase">
                    💀 {displayBadge || 'FALLEN CHASER'}
                  </span>
                </div>

                {/* 2. Story Explanation */}
                <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto italic font-medium px-2">
                  "The ruthlessness of the grind claims another soul. Your journey was cut short in the <span className="text-red-400 font-bold uppercase">{deathContext?.tier || pl.currentTier}</span> tier. The catalyst of your collapse was <span className="text-white font-semibold font-mono">"{deathContext?.lastHustleName || 'System Expenses'}"</span>. After {deathContext?.monthsPlayed || pl.month} months of chasing the bag, the absolute limit was reached: {fatalCause || deathInfo.message}"
                </p>

                {/* 3. Detailed Math Sequence */}
                {deathContext ? (
                  getMathSequence()
                ) : (
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-slate-500 text-xs">
                    No mathematical telemetry captured for this demise.
                  </div>
                )}

                {/* Button to process */}
                <button
                  onClick={() => setStage('obituary')}
                  className="w-full mt-4 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 border border-slate-700/60"
                >
                  Read Your Chronicle →
                </button>
              </motion.div>
            )}

            {/* STAGE 2: THE OBITUARY CHRONICLE */}
            {stage === 'obituary' && (
              <motion.div
                key="obituary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                <div className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                  Obituary & Chronicle
                </div>

                <div className="relative p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-left">
                  <div className="absolute top-3 right-4 font-serif text-5xl text-slate-800 pointer-events-none">“</div>
                  <h3 className="font-black text-white text-base tracking-tight mb-3 italic">
                    History will remember you...
                  </h3>
                  <p className="text-slate-300 font-serif text-sm leading-relaxed italic indent-4">
                    {formattedBiography}
                  </p>
                </div>

                {/* Lessons Learned */}
                <div className="p-5 bg-red-950/15 border border-red-950/40 rounded-2xl text-left text-xs leading-relaxed text-red-300/90 italic">
                  {getLessonsLearned()}
                </div>

                {/* Button to Legacy */}
                <button
                  onClick={() => setStage('legacy')}
                  className="w-full py-4 bg-red-950/40 hover:bg-red-950/60 text-red-400 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 border border-red-900/40"
                >
                  Claim Your Legacy →
                </button>
              </motion.div>
            )}

            {/* STAGE 3: LEGACY & RESET */}
            {stage === 'legacy' && (
              <motion.div
                key="legacy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-center"
              >
                <div className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                  Claim Your Inheritance
                </div>

                {/* Banked Legacy Points */}
                <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">
                    Legacy Points Banked
                  </span>
                  <div className="text-4xl font-black text-yellow-400 font-mono tracking-tight">
                    +{(pl.legacyScore || 0).toLocaleString()}
                  </div>
                </div>

                {/* Near Miss */}
                {isNearMiss && nextTier && nextTierReq && (
                  <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-amber-400 text-xs italic">
                    You were only {(nextTierReq.clout - pl.clout).toLocaleString()} clout away from achieving {nextTier} Tier.
                  </div>
                )}

                {/* Run Metadata Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Peak Tier reached</span>
                    <span className="font-black text-white text-sm uppercase">{deathContext?.tier || pl.currentTier}</span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Months Survived</span>
                    <span className="font-black text-white text-sm">{deathContext?.monthsPlayed || pl.month} Months</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={onReset}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-sm rounded-xl uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:from-red-500 hover:to-red-600 transition-all active:scale-95"
                  >
                    CONTINUE YOUR LEGACY
                  </button>

                  <button
                    onClick={onViewSummary}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all active:scale-95"
                  >
                    See Ledger & Share Run
                  </button>

                  <div className="flex justify-between items-center px-2 pt-2">
                    <button
                      onClick={onLegacyShop}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-widest transition-colors"
                    >
                      Vault / Shop
                    </button>

                    {(pl.deathCount || 0) > 0 && (
                      <button
                        onClick={onQuickStart}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-widest transition-colors"
                      >
                        Keep Origin
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-950/60 border-t border-slate-800/40 text-center shrink-0">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            Bag Chaser Chronicles — History Preserved
          </p>
        </div>

      </div>
    </div>
  );
};
