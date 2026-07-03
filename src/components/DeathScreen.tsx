import React from 'react';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { useGameStore } from '../store/gameStore';
import { CinematicModal } from './ui/CinematicModal';
import { PortraitCard } from './ui/PortraitCard';

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
    fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
    fatalStatValue?: number;
  };
  onReset: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ deathBadge, fatalCause, lastHustleId, deathContext, onReset }) => {
  const deathInfo = (lastHustleId && DEATH_MESSAGES[lastHustleId]) || DEATH_MESSAGES['DEFAULT'];
  const displayBadge = deathBadge || deathInfo.badge;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <CinematicModal
        isOpen={true}
        title="BURNED OUT"
        subtitle="POST MORTEM"
        accentColor="red"
      >
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[200px] mb-8">
            <PortraitCard
              name={displayBadge || 'FALLEN'}
              role="DECEASED"
              flavorText={fatalCause || deathInfo.message}
              variant="newspaper"
              size="lg"
              image="💀"
            />
          </div>

          <div className="w-full space-y-6">
            {deathContext && (
              <div className="bg-slate-950/50 border border-red-500/20 rounded-2xl p-6 space-y-4">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 border-b border-red-500/10 pb-2">
                  THE FINAL RECORD
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Cause of Collapse</span>
                    <span className="text-red-400 font-black text-xs uppercase">
                      {deathContext.fatalStat || 'STRESS'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Peak Tier</span>
                    <span className="text-slate-300 font-black text-xs uppercase">{deathContext.tier}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Time Survived</span>
                    <span className="text-slate-300 font-black text-xs uppercase">{deathContext.monthsPlayed} Months</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Final Impact</span>
                    <span className="text-red-500 font-black text-xs italic">"{deathContext.lastHustleName}"</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <button
                onClick={onReset}
                className="w-full py-5 bg-red-600 text-white font-black text-sm rounded-xl uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all active:scale-95"
              >
                RUN IT BACK
              </button>

              <button
                onClick={() => useGameStore.setState({ ph: 'LEGACY_SHOP' })}
                className="w-full py-4 bg-slate-900 text-slate-400 border border-slate-800 font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:text-white transition-all"
              >
                Enter Legacy Shop
              </button>
            </div>
          </div>
        </div>
      </CinematicModal>
    </div>
  );
};
