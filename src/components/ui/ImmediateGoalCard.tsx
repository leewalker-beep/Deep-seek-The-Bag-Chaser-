import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getImmediateGoal } from '../../utils/goalUtils';

export const ImmediateGoalCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const pl = useGameStore(state => state.pl);
  const goal = getImmediateGoal(pl);

  const getEmoji = (type: string) => {
    switch (type) {
      case 'RECOVER': return '🧘';
      case 'RISK': return '🚨';
      case 'ADVANCE': return '⚡';
      case 'CROWN': return '👑';
      case 'EMPIRE': return '🏢';
      case 'PRIORITY': return '🇺🇸';
      case 'LEGACY': return '💎';
      default: return '🎯';
    }
  };

  return (
    <div className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all shadow-lg ${goal.borderClass} ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{getEmoji(goal.type)}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${goal.badgeClass}`}>
            {goal.label}
          </span>
        </div>
        {goal.actionHint && (
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tight hidden sm:inline">
            {goal.actionHint}
          </span>
        )}
      </div>
      <h3 className="text-xs font-black text-white uppercase tracking-tight leading-snug">
        {goal.message}
      </h3>
      {goal.subtext && (
        <p className="text-[10px] text-slate-300 font-medium leading-normal mt-0.5 uppercase tracking-tight">
          {goal.subtext}
        </p>
      )}
    </div>
  );
};
