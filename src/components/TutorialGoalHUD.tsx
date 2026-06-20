import React from 'react';
import { motion } from 'framer-motion';
import { TUTORIAL_GOALS } from '../config/tutorialGoals';
import type { PlayerStats } from '../types/game';
import { PROGRESSION_ORDER } from '../config/tiers';

interface TutorialGoalHUDProps {
  goalIndex: number;
  player: PlayerStats;
  onSkip: () => void;
}

export const TutorialGoalHUD: React.FC<TutorialGoalHUDProps> = ({ goalIndex, player, onSkip }) => {
  const goal = TUTORIAL_GOALS[goalIndex];
  if (!goal) return null;

  const getProgress = () => {
    switch (goal.statType) {
      case 'bag':
        return Math.min(100, (player.bag / goal.targetValue) * 100);
      case 'clout':
        return Math.min(100, (player.clout / goal.targetValue) * 100);
      case 'aura':
        return Math.min(100, (player.aura / goal.targetValue) * 100);
      case 'mentalHealth':
        return Math.min(100, (player.mentalHealth / goal.targetValue) * 100);
      case 'currentTier':
        const currentTierIdx = PROGRESSION_ORDER.indexOf(player.currentTier);
        return currentTierIdx >= goal.targetValue ? 100 : 0;
      default:
        return 0;
    }
  };

  const getCurrentValueLabel = () => {
     switch (goal.statType) {
      case 'bag':
        return `$${Math.floor(player.bag).toLocaleString()}`;
      case 'clout':
        return Math.floor(player.clout).toString();
      case 'aura':
        return Math.floor(player.aura).toString();
      case 'mentalHealth':
        return `${Math.floor(player.mentalHealth)}%`;
      case 'currentTier':
        return player.currentTier;
      default:
        return '';
    }
  };

  const getTargetValueLabel = () => {
    if (goal.statType === 'currentTier') return PROGRESSION_ORDER[goal.targetValue];
    if (goal.statType === 'bag') return `$${goal.targetValue.toLocaleString()}`;
    if (goal.statType === 'mentalHealth') return `${goal.targetValue}%`;
    return goal.targetValue.toString();
  };

  const progress = getProgress();

  return (
    <div className="fixed top-[108px] left-0 right-0 z-[40] pointer-events-none px-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-xl p-3 pointer-events-auto flex items-center gap-4"
      >
        {/* Progress Circle */}
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle
              className="text-slate-800 stroke-current"
              strokeWidth="4"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
            <motion.circle
              className="text-emerald-500 stroke-current"
              strokeWidth="4"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - progress }}
              strokeLinecap="round"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-emerald-400">
            {Math.floor(progress)}%
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5 flex justify-between">
            <span>Current Goal</span>
            <span className="text-slate-500 font-mono">
              {getCurrentValueLabel()} / {getTargetValueLabel()}
            </span>
          </div>
          <h4 className="text-xs font-bold text-white truncate">{goal.title}</h4>
          <p className="text-[9px] text-slate-400 truncate">{goal.description}</p>
        </div>

        <button
          onClick={onSkip}
          className="shrink-0 h-11 px-3 flex items-center justify-center text-[9px] font-bold text-slate-500 hover:text-white uppercase transition-colors border-l border-slate-800"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
};
