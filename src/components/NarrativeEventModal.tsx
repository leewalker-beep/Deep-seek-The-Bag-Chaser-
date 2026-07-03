import React from 'react';
import { useGameStore } from '../store/gameStore';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { CHARACTERS } from '../config/characters';
import type { PlayerStats } from '../types/game';
import { CinematicModal } from './ui/CinematicModal';
import { PortraitCard } from './ui/PortraitCard';

export const NarrativeEventModal: React.FC = () => {
  const { pl, resolveNarrativeEvent } = useGameStore();
  const eventId = pl.activeNarrative;

  if (!eventId) return null;

  const event = NARRATIVE_EVENTS.find(e => e.id === eventId);
  if (!event) return null;

  const character = event.characterId ? CHARACTERS.find(c => c.id === event.characterId) : null;

  return (
    <CinematicModal
      isOpen={true}
      title={event.title}
      subtitle={character ? `CONVERSATION: ${character.name}` : 'CRITICAL DECISION'}
      accentColor="yellow"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6">
        {character && (
          <div className="flex justify-center mb-2">
            <PortraitCard
              avatarId={character.portraitId}
              name={character.name}
              role={character.background}
              flavorText={character.personality}
              variant="npc"
              size="lg"
            />
          </div>
        )}

        <div className="bg-slate-950/50 rounded-2xl p-6 border border-yellow-500/20">
          <p className="text-slate-200 text-sm leading-relaxed italic text-center font-medium">
            "{event.description}"
          </p>
        </div>

        <div className="space-y-3">
          {event.choices.map((choice) => {
            const req = choice.requirement;
            let disabled = false;
            let reason = "";

            if (req?.stat) {
              const statKey = req.stat.type === 'mentalHealth' ? 'mentalHealth' : req.stat.type;
              const current = pl[statKey as keyof PlayerStats];
              if (typeof current === 'number' && current < req.stat.value) {
                disabled = true;
                reason = `Requires ${req.stat.value} ${req.stat.type}`;
              }
            }

            return (
              <button
                key={choice.id}
                disabled={disabled}
                onClick={() => resolveNarrativeEvent(choice.id)}
                className={`w-full group text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                  disabled
                    ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                    : 'bg-slate-800/40 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-700/50 active:scale-[0.99]'
                }`}
              >
                <div className="relative z-10 flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-black text-white uppercase mb-0.5 group-hover:text-yellow-400 transition-colors tracking-wide">
                      {choice.label}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight font-medium">
                      {choice.description}
                    </p>
                    {disabled && (
                      <div className="mt-1 text-[8px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                        <span>🔒</span> {reason}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {Object.entries(choice.consequences).map(([key, val]) => {
                      if (!val || key === 'specializationLock' || key === 'biographyEntry') return null;
                      const isPos = +val > 0;
                      const color = isPos ? 'text-emerald-400' : 'text-red-400';
                      let label = key.toUpperCase();
                      if (key === 'bag') label = 'CASH';
                      if (key === 'passiveCash') label = 'PASSIVE';

                      return (
                        <span key={key} className={`text-[8px] font-black ${color} tracking-tighter`}>
                          {isPos ? '+' : ''}{val.toLocaleString()} {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </CinematicModal>
  );
};
