import React from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';

interface DeathScreenProps {
  deathBadge: string | null;
  fatalCause: string | null;
  lastHustleId?: string;
  onReset: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ deathBadge, fatalCause, lastHustleId, onReset }) => {
  const deathInfo = (lastHustleId && DEATH_MESSAGES[lastHustleId]) || DEATH_MESSAGES['DEFAULT'];
  const displayBadge = deathBadge || deathInfo.badge;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-red-600 mb-6 tracking-tighter italic">GAME OVER</h1>

      <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-sm mb-8">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">FATAL CAUSE</div>
        <p className="text-slate-300 text-sm italic">{fatalCause || deathInfo.message}</p>
      </div>

      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 mb-8">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">DEATH BADGE</div>
        <div className="text-2xl font-bold text-white">💀 {displayBadge}</div>
      </div>

      <button
        onClick={onReset}
        className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
      >
        RUN IT BACK
      </button>
    </div>
  );
};
