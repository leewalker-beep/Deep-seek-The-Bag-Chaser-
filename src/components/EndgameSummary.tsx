import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import Avatar from './Avatar';

interface EndgameSummaryProps {
  onRestart: () => void;
  onViewHallOfFame: () => void;
}

export const EndgameSummary: React.FC<EndgameSummaryProps> = ({ onRestart, onViewHallOfFame }) => {
  const { pl } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] =
    useState(0);
  const targetScore = pl.legacyScore || 0;

  useEffect(() => {
    if (targetScore === 0) return;
    const duration = 1500;
    const steps = 60;
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

  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  const shareText = `I just finished a run of Bag Chaser! Hit ${pl.currentTier} tier with $${pl.bag.toLocaleString()} bag. Legacy score: ${(pl.legacyScore || 0).toLocaleString()}. Can you beat me?`;

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

  const summary = {
    date: new Date().toISOString(),
    name: pl.name,
    legacyScore: pl.legacyScore || 0,
    highestTier: pl.currentTier,
    lifetimeEarnings: stats.lifetimeEarnings,
    totalHustles: stats.totalHustles,
    successRate,
    achievementsUnlocked: pl.unlockedAchievements?.length || 0,
    endingsUnlocked: JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length,
    deathBadgesCollected: pl.collectedDeathBadges?.length || 0,
    monthsPlayed: pl.month,
    bestLoginStreak: pl.loginStreak || 0,
  };

  useEffect(() => {
    // Save to history
    const history = JSON.parse(localStorage.getItem('bag-chaser-run-history') || '[]');
    history.push(summary);
    localStorage.setItem('bag-chaser-run-history', JSON.stringify(history.slice(-50))); // Keep last 50 runs
  }, []);

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-8"
      >
        {/* 1. PLAYER HEADER */}
        <div className="flex flex-col items-center mb-8">
          <Avatar avatarId={pl.avatarId} size={80} ring="ring-slate-800" />
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{pl.name}</h2>
            <div className="inline-block px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">
              {pl.currentTier} TIER
            </div>
          </div>
        </div>

        {/* 2. LEGACY SCORE */}
        <div className="text-center mb-8">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-1">
            FINAL LEGACY SCORE
          </div>
          <div className="text-6xl font-black text-yellow-400 tabular-nums">
            {displayScore.toLocaleString()}
          </div>
        </div>

        {/* 3. THE STORY — biography as hero */}
        <div className="w-full mb-6">
          <div className="text-[9px] text-slate-600
            uppercase tracking-[0.3em] text-center mb-4">
            YOUR STORY
          </div>

          <div className="mb-4 p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight text-center">
            <span className="font-black text-white block mb-1">🎬 Your Chronicled Journey</span>
            Every critical decision, high-stakes trade, and systemic milestone in your run was cataloged to form this eternal biography. It highlights "What happened" and "Why" you achieved this legendary legacy.
          </div>

          {pl.biography && pl.biography.length > 0 ? (
            <div className="space-y-2">
              {pl.biography.map((line: any, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3 items-start
                    bg-slate-900/50 rounded-xl px-4 py-3
                    border border-slate-800/50"
                >
                  <span className="text-slate-600
                    font-mono text-[9px] uppercase
                    tracking-wider mt-0.5 shrink-0
                    w-16">
                    {line.month
                      ? `MO. ${line.month}`
                      : `CH. ${idx + 1}`}
                  </span>
                  <span className="text-slate-300
                    text-xs leading-relaxed italic">
                    {line.text || line}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-700
              text-xs italic py-8">
              No story written yet.
              Play longer to build your legend.
            </div>
          )}
        </div>

        {/* 4. STATS GRID — moved to position 4 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-900/50 rounded-xl
            p-3 text-center">
            <div className="text-[9px] text-slate-600
              uppercase tracking-wider mb-1">
              Months
            </div>
            <div className="text-white font-black
              text-lg">{pl.month}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl
            p-3 text-center">
            <div className="text-[9px] text-slate-600
              uppercase tracking-wider mb-1">
              Peak Tier
            </div>
            <div className="text-white font-black
              text-lg">{pl.currentTier}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl
            p-3 text-center">
            <div className="text-[9px] text-slate-600
              uppercase tracking-wider mb-1">
              Hustles
            </div>
            <div className="text-white font-black
              text-lg">
              {pl.stats?.totalHustles || 0}
            </div>
          </div>
        </div>

        {/* 5. BUTTONS — unchanged */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <BaseButton variant="primary" onClick={onRestart} className="w-full py-5 text-xl font-black">
              RUN IT BACK
            </BaseButton>

            <div className="flex gap-3">
              <BaseButton variant="secondary" onClick={onViewHallOfFame} className="flex-1 py-4 text-lg">
                HALL OF FAME
              </BaseButton>

              <BaseButton
                variant="secondary"
                onClick={handleShare}
                className="flex-1 py-4 text-lg relative overflow-hidden"
              >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    exit={{ y: -20 }}
                    className="flex items-center justify-center gap-2 text-emerald-400"
                  >
                    COPIED!
                  </motion.span>
                ) : (
                  <motion.span
                    key="share"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    exit={{ y: -20 }}
                    className="flex items-center justify-center gap-2"
                  >
                    SHARE
                  </motion.span>
                )}
              </AnimatePresence>
            </BaseButton>
          </div>
        </div>
          <p className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-widest">
            Your progress has been etched into history.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
