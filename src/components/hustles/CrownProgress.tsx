import React, { useMemo } from 'react';
import type { PlayerStats } from '../../types/game';
import { getCrownProgress } from '../../utils/masteryUtils';

interface CrownProgressProps {
  player: PlayerStats;
  hustleId: string;
}

export const CrownProgress: React.FC<CrownProgressProps> = ({ player, hustleId }) => {
  const crownProgress = useMemo(() => {
    return getCrownProgress(player, hustleId);
  }, [hustleId, player]);

  if (!crownProgress) return null;

  if (crownProgress.isMastered) {
    return (
      <div className="bg-yellow-500/10 rounded-xl p-2 mb-3 border border-yellow-500/30 flex items-center justify-between text-xs text-yellow-300">
        <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <span>👑</span>
          <span>MASTERED</span>
        </span>
        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
          PERMANENT CROWN
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 rounded-xl p-2.5 mb-3 border border-yellow-500/10 flex flex-col gap-1.5 text-xs text-slate-300">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-yellow-500 flex items-center gap-1">
          👑 Crown Progress
        </span>
        <span className="text-[10px] text-slate-400">
          {crownProgress.playsLabel}: <strong className="text-white font-mono">{crownProgress.actualPlays}</strong> / {crownProgress.targetPlays}
          {crownProgress.targetLevel !== undefined && (
            <>
              <span className="mx-1.5">|</span>
              Level: <strong className="text-white font-mono">{Math.min(crownProgress.actualLevel, crownProgress.targetLevel)}</strong> / {crownProgress.targetLevel}
            </>
          )}
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-yellow-500 h-full rounded-full transition-all duration-500"
          style={{
            width: `${crownProgress.progressPercent}%`,
          }}
        />
      </div>
    </div>
  );
};
