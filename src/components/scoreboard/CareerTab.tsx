import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';
import { getMasteryCount } from '../../utils/masteryUtils';

export const CareerTab: React.FC = () => {
  const { pl } = useGameStore();
  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  return (
    <motion.div
      key="career"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
        <span className="font-black text-white block mb-1">💼 Career Overview</span>
        Tracks your global performance and accomplishments across this lifetime. All activities shape your eventual retirement score.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="group relative">
          <StatCard label="Lifetime Profit" value={`$${stats.lifetimeEarnings.toLocaleString()}`} colorClass="text-emerald-400" />
          <div className="absolute top-full left-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
            The sum total of all cash cleared from successful contracts, deals, and revenue streams.
          </div>
        </div>

        <div className="group relative">
          <StatCard label="Success Rate" value={`${successRate}%`} colorClass="text-blue-400" />
          <div className="absolute top-full right-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
            Your historical accuracy rate in minigames. Higher rate means optimal payout multipliers.
          </div>
        </div>

        <div className="group relative">
          <StatCard label="Total Hustles" value={stats.totalHustles} />
          <div className="absolute top-full left-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
            Total number of months spent running active gigs or strategic actions.
          </div>
        </div>

        <div className="group relative">
          <StatCard label="Legacy Score" value={pl.legacyPoints || 0} colorClass="text-yellow-400" />
          <div className="absolute top-full right-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
            Current rating of your character's life. Converts to buyable meta upgrades upon death.
          </div>
        </div>

        <div className="group relative">
          <StatCard label="Mastery Crowns" value={getMasteryCount(pl)} icon="👑" colorClass="text-yellow-400" />
          <div className="absolute top-full left-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
            Number of hustles mastered across all tiers. Required to advance to higher progression tiers.
          </div>
        </div>

        <StatCard label="Login Streak" value={`${pl.loginStreak || 0} Days`} icon="🔥" />
        <StatCard label="Endings Found" value={`${JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length}/16`} icon="🎬" />
        <StatCard label="Grammys" value={pl.grammyCount || 0} icon="🏆" />
        <StatCard label="Vending Machines" value={pl.vendingCount || 0} icon="🥤" />
        <StatCard label="Flex Assets" value={Object.keys(pl.flexAssets || {}).length} icon="💎" />
      </div>

      <div className="p-4 bg-slate-950 border border-yellow-500/20 rounded-2xl group relative">
        <div className="absolute bottom-full left-0 mb-2 w-full p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
          Completed goals award Momentum. Every 10 milestones provide a permanent cross-lifetime multiplier for all cash yields.
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legacy Momentum</div>
          <div className="text-[10px] font-black text-yellow-400">
            +{(Math.floor((pl.totalChallengesCompleted || 0) / 10) * 0.1).toFixed(1)}% Multiplier
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
            <span>Next Boost</span>
            <span>{(pl.totalChallengesCompleted || 0) % 10} / 10 Challenges</span>
          </div>
          <ProgressBar
            value={((pl.totalChallengesCompleted || 0) % 10) * 10}
            colorClass="bg-yellow-500"
            className="h-1.5"
          />
        </div>
        <p className="text-[7px] text-slate-600 uppercase font-bold mt-2 text-center">
          Permanent cross-run boost for every 10 challenges completed
        </p>
      </div>
    </motion.div>
  );
};
