import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import Avatar from './Avatar';
import { analyzeBehavior } from '../utils/personalityAnalyzer';

interface EndgameSummaryProps {
  onRestart: () => void;
  onViewHallOfFame: () => void;
}

export const EndgameSummary: React.FC<EndgameSummaryProps> = ({ onRestart, onViewHallOfFame }) => {
  const { pl } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const blueprint = useMemo(() => analyzeBehavior(pl), [pl]);

  const targetScore = pl.legacyScore || pl.legacyPoints || 0;

  // Animate the legacy score rolling up
  useEffect(() => {
    if (targetScore === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = targetScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setDisplayScore(targetScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [targetScore]);

  // Format career length
  const formatCareerLength = (months: number) => {
    const yrs = Math.floor(months / 12);
    const mths = months % 12;
    if (yrs === 0) return `${months} Months`;
    return `${yrs} Year${yrs > 1 ? 's' : ''}, ${mths} Month${mths !== 1 ? 's' : ''} (${months}m)`;
  };

  // Determine Greatest Achievement
  const greatestAchievement = useMemo(() => {
    if (pl.currentTier === 'PRESIDENT' || pl.currentTier === 'OPEN') {
      return "🏆 Command of the Free World: Claimed the ultimate seat of power in the Oval Office.";
    }
    if (pl.currentTier === 'MOGUL') {
      return "🏙️ Commercial Empire Master: Commanded a multi-billion dollar conglomerate controlling global sectors.";
    }
    if ((pl.rentPortfolioCount || 0) >= 10 || (pl.rentalCount || 0) >= 5) {
      return "🏢 Real Estate Baron: Amassed a legendary portfolio of passive rent-producing estates.";
    }
    if (pl.bag >= 100000000) {
      return "💰 Ultra-High-Net-Worth Sovereign: Achieved extreme liquid wealth exceeding $100M.";
    }
    if (pl.clout >= 10000) {
      return "✨ Global Icon: Gained massive public influence, becoming a household name across sectors.";
    }
    return `💪 Resilience in the ${pl.currentTier} Tier: Navigated difficult starting conditions to establish a stable market footprint.`;
  }, [pl]);

  // Determine Biggest Mistake
  const biggestMistake = useMemo(() => {
    const fatal = pl.deathContext?.fatalStat;
    if (fatal === 'mental' || pl.mentalHealth <= 0) {
      return "🧠 Mind Overdose: Sacrificing your psychological sanity and sleep under high burnout stress.";
    }
    if (fatal === 'bag' || pl.bag <= 0) {
      return "📉 Capital Liquidity Failure: Over-leveraging assets without maintaining cash reserves, leading to default.";
    }
    if (fatal === 'heat' || pl.heat >= 100) {
      return "👮 Legal Blindspot: Drawing extreme regulatory and street Heat, leading to compliance crackdowns.";
    }
    if (pl.arrestCount && pl.arrestCount > 0) {
      return "⚖️ Federal Offender: Getting caught in high-stakes illicit deals and serving hard jail time.";
    }
    return "💔 Systemic Friction: Miscalculating monthly running costs during rapid business branch upgrades.";
  }, [pl]);

  // Advisor Final Reflections
  const advisorReflection = useMemo(() => {
    const fatal = pl.deathContext?.fatalStat;
    if (fatal === 'mental' || pl.mentalHealth <= 0) {
      return "You ran too fast and slept too little, Chaser. You built an incredible narrative, but forgot you had to live in it. Your mind was the engine, and you ran it completely out of oil. Remember for your next life: a leader who cannot rest is a leader who cannot rule.";
    }
    if (fatal === 'bag' || pl.bag <= 0) {
      return "The mathematics of high-society never lie. You expanded too quickly, upgrading corporate branches without maintaining a liquid cash cushion to weather the recession cycles. Next time, secure multiple automated passive pipelines before taking the big leap.";
    }
    if (fatal === 'heat' || pl.heat >= 100) {
      return "You flew too close to the sun. Shady deals and high street Heat aren't just numbers on a screen—they are steel handcuffs. You can't spend your millions from inside a federal penitentiary. Next time, use Ghost Mode, buy legal front-ends, and cool down your signature.";
    }
    return "A remarkable journey, Chaser. You started from the absolute bottom, broke the systemic chains, and etched your name in the history books. Every choice you made wrote a chapter in history. The block will speak of your name for generations to come.";
  }, [pl]);

  // Option 2 Check: can they continue in OPEN?
  const canContinueInOpen = useMemo(() => {
    return pl.currentTier === 'OPEN' || pl.tierBadges?.includes('OPEN');
  }, [pl]);

  // Option 2 Action: Continue in OPEN sandbox
  const handleContinueInOpen = () => {
    useGameStore.setState(state => ({
      ph: 'PLAYING',
      activeTab: 'OPEN',
      pl: {
        ...state.pl,
        currentTier: 'OPEN',
        mentalHealth: 100,
        heat: 0,
        bag: Math.max(state.pl.bag, 2500000), // Ensure they have enough liquidity to enjoy the sandbox
        inJail: false,
        isIncarcerated: false,
        jailMonthsRemaining: 0,
        deathContext: undefined
      },
      deathBadge: null,
      fatalCause: null
    }));
  };

  const shareText = useMemo(() => {
    return `I just finished a run of Bag Chaser! Hit ${pl.currentTier} tier with $${pl.bag.toLocaleString()} net worth. My Advisor Blueprint: ${blueprint.primaryColor} — ${blueprint.dominantPersona}. Legacy score: ${targetScore.toLocaleString()}. Can you beat me?`;
  }, [pl.currentTier, pl.bag, blueprint.primaryColor, blueprint.dominantPersona, targetScore]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bag Chaser Run',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  // Famous Chronological Moments (Importance >= 3)
  const historyHighlights = useMemo(() => {
    if (!pl.history) return [];
    return pl.history
      .filter((h: any) => h.importance >= 3)
      .slice(0, 5);
  }, [pl.history]);

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-slate-900 border-2 border-slate-800/80 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col p-6 md:p-10 space-y-8"
      >

        {/* 1. EMOTIONAL HEADER: IN MEMORIAM */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar avatarId={pl.avatarId} size={96} ring="ring-4 ring-emerald-500/20" />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black tracking-[0.4em] uppercase block">
              CHRONICLES OF AN ERA — EULOGY
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-white italic">
              {pl.name}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950/60 border border-white/5 rounded-full mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Highest Tier: {pl.currentTier}
              </span>
            </div>
          </div>
        </div>

        {/* 2. STATS & LEGACY SCORE SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-2xl text-center">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-1">
              Final Net Worth
            </span>
            <span className="text-emerald-400 font-mono font-black text-xl">
              ${pl.bag.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-2xl text-center">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-1">
              Career Length
            </span>
            <span className="text-white font-black text-xs md:text-sm leading-tight block">
              {formatCareerLength(pl.month)}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-2xl text-center">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-1">
              Reputation
            </span>
            <span className="text-blue-400 font-bold text-sm block truncate">
              {String(pl.narrativeFlags?.publicReputation || 'Chaser')}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-1 block">
              FINAL LEGACY SCORE
            </span>
            <span className="text-yellow-400 font-mono font-black text-xl">
              +{displayScore.toLocaleString()}
            </span>
          </div>

        </div>

        {/* 3. EMOTIONAL REFLECTIONS: GREATEST ACHIEVEMENT & BIGGEST MISTAKE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-slate-950/40 border border-emerald-500/15 p-5 rounded-2xl space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
              ⭐ Greatest Achievement
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {greatestAchievement}
            </p>
          </div>

          <div className="bg-slate-950/40 border border-rose-500/15 p-5 rounded-2xl space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 block">
              ⚠️ Biggest Mistake
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {biggestMistake}
            </p>
          </div>

        </div>

        {/* 4. CHRONOLOGICAL BIOGRAPHY SUMMARY */}
        <div className="space-y-3">
          <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase block text-center">
            Epitaph & Life Chronicle
          </span>

          <div className="p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-slate-300 text-sm leading-relaxed italic font-serif relative">
            <span className="absolute top-2 right-4 text-6xl text-slate-800 pointer-events-none">“</span>
            {pl.biography && pl.biography.length > 0 ? (
              <p className="line-clamp-4 pr-6">
                {pl.biography.map((b: any) => b.text || b).join(' ')}
              </p>
            ) : (
              <p>A fast-paced chaser who fought bravely against systemic odds to claim their footprint in this digital age.</p>
            )}
          </div>
        </div>

        {/* BEHAVIORAL BLUEPRINT PANEL */}
        <div className="space-y-4 text-left border border-slate-800 bg-slate-950/60 p-6 rounded-[2rem]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧬</span>
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Advisor's Record</span>
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Behavioral Blueprint</h3>
              </div>
            </div>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${blueprint.colorHex}15`,
                color: blueprint.colorHex,
                borderColor: `${blueprint.colorHex}40`
              }}
            >
              {blueprint.primaryColor} Archetype
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wide text-white block">
              Persona Sub-Label: <span style={{ color: blueprint.colorHex }}>{blueprint.dominantPersona}</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
              {blueprint.colorDescription}
            </p>
          </div>

          {/* Metrics Readout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[7px] text-slate-500 uppercase font-bold block mb-1">Action Pace</span>
              <span className="text-white font-mono font-bold text-xs">{blueprint.paceSeconds}s ({blueprint.paceLabel})</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[7px] text-slate-500 uppercase font-bold block mb-1">Advice Compliance</span>
              <span className="text-white font-mono font-bold text-xs">{Math.round(blueprint.adviceRatio * 100)}%</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[7px] text-slate-500 uppercase font-bold block mb-1">Setbacks Recovery</span>
              <span className="text-white font-mono font-bold text-xs">{Math.round(blueprint.setbackRatio * 100)}% ({blueprint.setbackRatio >= 0.5 ? 'Retreat' : 'Escalate'})</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[7px] text-slate-500 uppercase font-bold block mb-1">Risk Cadence</span>
              <span className="text-white font-mono font-bold text-xs">{Math.round(blueprint.riskCadenceRatio * 100)}%</span>
            </div>
          </div>

          {/* Advisor Synthesis Lines */}
          <div className="pt-2 border-t border-slate-900 space-y-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Systemic Tension Synthesis</span>
            <div className="space-y-2.5">
              {blueprint.synthesisLines.map((line, idx) => (
                <div key={idx} className="flex gap-2.5 items-start pl-2 border-l-2 border-slate-700">
                  <span className="text-xs text-slate-300 leading-relaxed font-serif italic">
                    "{line}"
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. DYNAMIC FAMOUS MOMENTS */}
        {historyHighlights.length > 0 && (
          <div className="space-y-3 text-left">
            <span className="text-[9px] text-slate-500 font-black tracking-wider uppercase block">
              📜 Chronological Highlights
            </span>
            <div className="space-y-2">
              {historyHighlights.map((event: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start bg-slate-950/30 border border-white/5 rounded-xl px-4 py-3 text-xs">
                  <span className="font-mono text-slate-500 whitespace-nowrap">Month {event.month}</span>
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-200 uppercase block text-[10px]">{event.title}</span>
                    <span className="text-slate-400 text-[11px] leading-relaxed block">{event.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FINAL ADVISOR REFLECTION */}
        <div className="bg-emerald-950/15 border border-emerald-900/30 p-5 rounded-2xl space-y-2 text-left relative">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧠</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
              Strategic Advisor Reflection
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
            "{advisorReflection}"
          </p>
        </div>

        {/* 7. CONTROLLER CHOICE PATHS (OPTION 1 & OPTION 2) */}
        <div className="pt-4 border-t border-slate-800/50 space-y-4 text-center">
          <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase block">
            Choose Your Destiny Path
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* OPTION 1: BEGIN A NEW LIFE */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-xs font-black text-white uppercase block">
                  Option 1: Begin A New Life
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Creates a completely new character. New name, face, and origin. No previous relationships, businesses, rivals, or narrative state carries over. Unlocked Legacy points and upgrades carry over permanently.
                </p>
              </div>
              <BaseButton
                variant="primary"
                onClick={onRestart}
                className="w-full py-4 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/10"
              >
                Begin A New Life 🚀
              </BaseButton>
            </div>

            {/* OPTION 2: CONTINUE IN OPEN SANDBOX */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-xs font-black text-white uppercase block flex justify-between items-center">
                  Option 2: Continue in OPEN
                  {!canContinueInOpen && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-500 uppercase">
                      Locked
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Sandbox play. If you unlocked OPEN before, continue playing indefinitely as the same character. Maintain all current assets, businesses, and history with full metric restoration.
                </p>
              </div>
              <BaseButton
                disabled={!canContinueInOpen}
                variant="secondary"
                onClick={handleContinueInOpen}
                className={`w-full py-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  canContinueInOpen
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border-slate-800/50'
                }`}
              >
                {canContinueInOpen ? "Continue in OPEN 🌍" : "Locked: Unlock OPEN Tier First"}
              </BaseButton>
            </div>

          </div>

          {/* Hall of Fame / Share buttons */}
          <div className="flex gap-4 pt-2">
            <BaseButton
              variant="secondary"
              onClick={onViewHallOfFame}
              className="flex-1 py-3 text-xs uppercase font-bold tracking-wider"
            >
              Hall of Fame 🏆
            </BaseButton>
            <BaseButton
              variant="secondary"
              onClick={handleShare}
              className="flex-1 py-3 text-xs uppercase font-bold tracking-wider"
            >
              {copied ? "COPIED! ✓" : "Share Score 🔗"}
            </BaseButton>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
