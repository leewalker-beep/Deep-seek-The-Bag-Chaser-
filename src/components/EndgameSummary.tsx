import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';

interface EndgameSummaryProps {
  onRestart: () => void;
}

export const EndgameSummary: React.FC<EndgameSummaryProps> = ({ onRestart }) => {
  const { pl } = useGameStore();
  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

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
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white mb-2">Run Summary</h2>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">The Final Ledger</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 p-6 bg-slate-950 border border-yellow-500/30 rounded-2xl text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Final Legacy Score</div>
            <div className="text-5xl font-black text-yellow-400 tabular-nums">
              {(pl.legacyScore || 0).toLocaleString()}
            </div>
          </div>

          <StatCard label="Highest Tier" value={pl.currentTier} colorClass="text-purple-400" />
          <StatCard label="Total Profit" value={`$${stats.lifetimeEarnings.toLocaleString()}`} colorClass="text-emerald-400" />
          <StatCard label="Hustles" value={stats.totalHustles} />
          <StatCard label="Success Rate" value={`${successRate}%`} colorClass="text-blue-400" />
          <StatCard label="Achievements" value={pl.unlockedAchievements?.length || 0} icon="🏆" />
          <StatCard label="Death Badges" value={pl.collectedDeathBadges?.length || 0} icon="💀" />
          <StatCard label="Time Played" value={`${pl.month} Months`} icon="📅" />
          <StatCard label="Best Streak" value={`${pl.loginStreak || 0} Days`} icon="🔥" />
        </div>

        <div className="space-y-4">
          <BaseButton variant="primary" onClick={onRestart} className="w-full py-4 text-lg">
            RUN IT BACK
          </BaseButton>
          <p className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-widest">
            Your progress has been etched into history.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
