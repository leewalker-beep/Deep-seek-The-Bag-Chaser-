import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';
import { HUSTLES } from '../config/hustles/base';

interface EndgameSummaryProps {
  onRestart: () => void;
  onViewHallOfFame: () => void;
}

export const EndgameSummary: React.FC<EndgameSummaryProps> = ({ onRestart, onViewHallOfFame }) => {
  const { pl } = useGameStore();
  const [copied, setCopied] = useState(false);
  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  const lastHustleName = pl.lastExecutedHustleId ? (HUSTLES[pl.lastExecutedHustleId]?.name || 'a mystery') : 'doing nothing';
  const personalizedSummary = `You hit ${pl.currentTier} tier, died ${pl.deathCount || 1} times, and your final act was ${lastHustleName}.`;

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
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white mb-2">Run Summary</h2>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">The Final Ledger</div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-6 text-center">
          <p className="text-slate-300 text-sm font-medium italic">"{personalizedSummary}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 p-6 bg-slate-950 border border-yellow-500/30 rounded-2xl text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Final Legacy Score</div>
            <div className="text-5xl font-black text-yellow-400 tabular-nums">
              {(pl.legacyScore || 0).toLocaleString()}
            </div>
          </div>

          <StatCard label="Highest Tier" value={pl.currentTier} colorClass="text-purple-400" />
          <StatCard label="Final Bag" value={`$${pl.bag.toLocaleString()}`} colorClass="text-emerald-400" />
          <StatCard label="Hustles" value={stats.totalHustles} />
          <StatCard label="Deaths" value={pl.deathCount || 1} colorClass="text-red-400" />
          <StatCard label="Achievements" value={pl.unlockedAchievements?.length || 0} icon="🏆" />
          <StatCard label="Death Badges" value={pl.collectedDeathBadges?.length || 0} icon="💀" />
          <StatCard label="Time Played" value={`${pl.month} Months`} icon="📅" />
          <StatCard label="Success Rate" value={`${successRate}%`} colorClass="text-blue-400" />
        </div>

        {pl.biography && pl.biography.length > 0 && (
          <div className="mb-8">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">The Life Story of {pl.name}</div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
              {pl.biography.map((entry, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10">
                    <span className="text-yellow-500 font-black text-[8px] italic">{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-2xl">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                      {entry}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
