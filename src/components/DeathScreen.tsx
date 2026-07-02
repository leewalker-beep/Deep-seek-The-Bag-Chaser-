import React from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { useGameStore } from '../store/gameStore';

interface DeathScreenProps {
  deathBadge: string | null;
  fatalCause: string | null;
  lastHustleId?: string;
  deathContext?: {
    mentalHealthAtDeath: number;
    lastHustleMentalHit: number;
    lastHustleName: string;
    heatAtDeath: number;
    monthsPlayed: number;
    tier: string;
  };
  onReset: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ deathBadge, fatalCause, lastHustleId, deathContext, onReset }) => {
  const deathInfo = (lastHustleId && DEATH_MESSAGES[lastHustleId]) || DEATH_MESSAGES['DEFAULT'];
  const displayBadge = deathBadge || deathInfo.badge;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-red-600 mb-6 tracking-tighter italic">GAME OVER</h1>

      <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 max-w-sm mb-8">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">FATAL CAUSE</div>
        <p className="text-slate-300 text-sm italic">{fatalCause || deathInfo.message}</p>
      </div>

      {deathContext && (
        <div className="bg-slate-900/80 border border-slate-700/30 rounded-2xl p-4 max-w-sm mb-6 text-left space-y-2">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-3">
            WHAT HAPPENED
          </div>

          {deathContext.lastHustleMentalHit > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                {deathContext.lastHustleName}
              </span>
              <span className="text-red-400 font-bold">
                -{deathContext.lastHustleMentalHit}% mental
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              Mental health at death
            </span>
            <span className={`font-bold ${
              deathContext.mentalHealthAtDeath < 20
                ? 'text-red-400' : 'text-orange-400'
            }`}>
              {deathContext.mentalHealthAtDeath}%
            </span>
          </div>

          {deathContext.heatAtDeath > 60 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                Heat level
              </span>
              <span className="text-orange-400 font-bold">
                {deathContext.heatAtDeath}% 🔥
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-slate-500">
              Survived
            </span>
            <span className="text-slate-400">
              {deathContext.monthsPlayed} months in {deathContext.tier}
            </span>
          </div>

          {deathContext.lastHustleMentalHit > 0 && deathContext.mentalHealthAtDeath < 30 && (
            <div className="text-[10px] text-slate-600 italic mt-2 pt-2 border-t border-slate-800">
              You ran {deathContext.lastHustleName} with only {deathContext.mentalHealthAtDeath + deathContext.lastHustleMentalHit}% mental health. It cost you {deathContext.lastHustleMentalHit}% — you had {deathContext.mentalHealthAtDeath}% left after. Not enough.
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 mb-8">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">DEATH BADGE</div>
        <div className="text-2xl font-bold text-white">💀 {displayBadge}</div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
        >
          RUN IT BACK
        </button>
        <button
          onClick={() => useGameStore.setState({ ph: 'LEGACY_SHOP' })}
          className="px-8 py-3 bg-slate-900 text-slate-400 border border-slate-800 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-all"
        >
          Legacy Shop
        </button>
      </div>
    </div>
  );
};
