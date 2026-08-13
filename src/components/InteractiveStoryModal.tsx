import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CinematicModal } from './ui/CinematicModal';
import { PortraitCard } from './ui/PortraitCard';
import { scanDialogueForNavigationLinks } from '../utils/discoverabilityUtils';

export const InteractiveStoryModal: React.FC = () => {
  const { pl, activeModalEvent, resolveInteractiveStoryEvent, updatePl } = useGameStore();

  const event = activeModalEvent;

  // Only render if we have an active modal event that is an interactive choice modal (has options)
  if (!event || !event.options) return null;

  return (
    <CinematicModal
      isOpen={true}
      title={event.title}
      subtitle={`CONVERSATION WITH ${event.speaker}`}
      accentColor="yellow"
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Speaker Info */}
        <div className="flex justify-center mb-2">
          <PortraitCard
            avatarId={event.avatar}
            name={event.speaker}
            role="DELI CONTACT"
            flavorText="A figure from your humble beginnings..."
            variant="npc"
            size="lg"
          />
        </div>

        {/* Narrative Context Message */}
        <div className="bg-slate-950/60 rounded-2xl p-6 border border-yellow-500/20 shadow-inner">
          <p className="text-slate-200 text-sm leading-relaxed italic text-center font-medium">
            {event.contextMessage}
          </p>
        </div>

        {/* Discoverability Links */}
        {(() => {
          const links = scanDialogueForNavigationLinks(event.contextMessage || '');
          if (links.length === 0) return null;
          return (
            <div className="flex flex-wrap justify-center gap-2 -mt-2 mb-1">
              {links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    updatePl({
                      narrativeFlags: {
                        ...(pl.narrativeFlags || {}),
                        [link.actionFlag]: true,
                        ...(link.scoreboardTab ? { open_scoreboard_tab: link.scoreboardTab } : {})
                      }
                    });
                  }}
                  className="px-3 py-1.5 bg-slate-950/80 hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md hover:border-emerald-500/60 cursor-pointer"
                >
                  <span>🔍</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          );
        })()}

        {/* Option Selection List */}
        <div className="space-y-3">
          {event.options.map((option: any, index: number) => {
            const hasCheck = typeof option.requirementCheck === 'function';
            const reqMet = hasCheck ? option.requirementCheck(pl) : true;
            const isDisabled = !reqMet;

            return (
              <button
                key={index}
                disabled={isDisabled}
                onClick={() => resolveInteractiveStoryEvent(index)}
                className={`w-full group text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden flex flex-col justify-center min-h-[50px] ${
                  isDisabled
                    ? 'bg-slate-900/60 border-slate-800 opacity-40 cursor-not-allowed pointer-events-none'
                    : 'bg-slate-800/40 border-slate-700 hover:border-yellow-500/50 hover:bg-slate-700/50 active:scale-[0.99] cursor-pointer'
                }`}
              >
                <div className="relative z-10 w-full flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[11px] font-black text-white uppercase mb-0.5 group-hover:text-yellow-400 transition-colors tracking-wide">
                      {option.text}
                    </div>
                    {isDisabled && (
                      <div className="mt-1 text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                        <span>🔒</span> INSUFFICIENT CASH
                      </div>
                    )}
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

export default InteractiveStoryModal;
