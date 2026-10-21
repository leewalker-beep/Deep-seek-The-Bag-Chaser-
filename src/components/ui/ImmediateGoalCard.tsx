import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getImmediateGoal } from '../../utils/goalUtils';

export const ImmediateGoalCard: React.FC<{
  className?: string;
  onNavigate?: (route: string) => void;
}> = ({ className = '', onNavigate }) => {
  const pl = useGameStore(state => state.pl);
  const goal = getImmediateGoal(pl);
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Reset dismissal if type or message changes
  React.useEffect(() => {
    setIsDismissed(false);
  }, [goal.type, goal.message]);

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

  if (isDismissed && goal.isDismissable) {
    return (
      <div className={`p-2 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs">{getEmoji(goal.type)}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate max-w-[200px]">
            {goal.message}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[9px] font-mono text-emerald-400 underline hover:text-emerald-300 px-2 py-1"
          aria-label="Expand recommendation"
        >
          Show Advice
        </button>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all shadow-lg ${goal.borderClass} ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{getEmoji(goal.type)}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${goal.badgeClass}`}>
            {goal.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {goal.actionHint && (
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tight hidden sm:inline">
              {goal.actionHint}
            </span>
          )}
          {goal.isDismissable && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded"
              title="Dismiss recommendation"
              aria-label="Dismiss recommendation"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <h3 className="text-xs font-black text-white uppercase tracking-tight leading-snug">
        {goal.message}
      </h3>
      {goal.subtext && (
        <p className="text-[10px] text-slate-300 font-medium leading-normal mt-0.5 uppercase tracking-tight">
          {goal.subtext}
        </p>
      )}

      {goal.actionLabel && goal.targetRoute && onNavigate && (
        <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={() => onNavigate(goal.targetRoute!)}
            className="min-h-[38px] px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
            aria-label={goal.actionLabel}
          >
            <span>{goal.actionLabel}</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};
