import React, { useState } from 'react';
import { MindfulRecover } from '../minigames/MindfulRecover';
import { DreamWeaver } from '../minigames/DreamWeaver';
import { PerfectBrew } from '../minigames/PerfectBrew';
import { ThoughtClouds } from '../minigames/ThoughtClouds';
import { useGameStore } from '../../store/gameStore';

interface RestPanelProps {
  baseRecovery?: number;
  onClose: () => void;
}

type RestMode = 'CHOICE' | 'BREATHE' | 'WEAVE' | 'BREW' | 'CLOUDS';

export const RestPanel: React.FC<RestPanelProps> = ({ baseRecovery = 15, onClose }) => {
  const [activeMode, setActiveMode] = useState<RestMode>('CHOICE');

  // Use a reactive selector to fetch the current live progression tier profile
  const currentTier = useGameStore(state => state.pl.currentTier);
  const store = useGameStore.getState();

  const processResolution = (multiplier: number, tierKey: string) => {
    // Math clamping safety net ensures recovery bounds never leak past 100% capacity cap
    const addedRecovery = Math.floor(baseRecovery * multiplier);
    store.updatePl({
      mentalHealth: Math.min(100, store.pl.mentalHealth + addedRecovery)
    });

    // Fires the unified timeline progression ticker action cleanly
    store.executeHustleWithTimelineTick('r_sleep', tierKey);
    onClose();
  };

  const isMudTier = currentTier === 'MUD';

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm mx-auto text-white space-y-4 shadow-2xl">
      {activeMode === 'CHOICE' && (
        <>
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">
              RECOVERY DECK ({currentTier})
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Select a protocol. Failures still guarantee 100% baseline recovery values.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-0.5 custom-scrollbar">
            {/* Standard Baseline Option - Always visible across all career steps */}
            <button onClick={() => processResolution(1.0, 'l1')} className="p-2.5 bg-zinc-800 hover:bg-zinc-700/80 rounded-lg text-left text-xs border border-zinc-700/50 flex justify-between items-center transition-all">
              <div><p className="font-bold">Standard Power Nap</p><p className="text-[9px] text-slate-500">Instant resolution loop</p></div>
              <span className="text-emerald-400 font-mono text-xs font-bold">+{baseRecovery} MH</span>
            </button>

            {/* LOWER PROGRESSION (MUD TIER GATES): Render +50% tier items */}
            {isMudTier && (
              <>
                <button onClick={() => setActiveMode('BREATHE')} className="p-2.5 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 rounded-lg text-left text-xs flex justify-between items-center transition-all">
                  <div><p className="font-bold text-blue-400">🧘 Mindful Breathing</p><p className="text-[9px] text-blue-500/60">Rhythmic expansion matching</p></div>
                  <span className="text-blue-400 font-mono text-xs font-bold">+{Math.floor(baseRecovery * 1.5)} MH</span>
                </button>
              </>
            )}

            {/* STREET TIER: Show Perfect Brew and Constellation Tracing */}
            {currentTier === 'STREET' && (
              <>
                <button onClick={() => setActiveMode('BREW')} className="p-2.5 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/20 rounded-lg text-left text-xs flex justify-between items-center transition-all">
                  <div><p className="font-bold text-amber-400">🍵 The Perfect Brew</p><p className="text-[9px] text-amber-500/60">Hold & release pour sweetspot</p></div>
                  <span className="text-amber-400 font-mono text-xs font-bold">+{Math.floor(baseRecovery * 1.5)} MH</span>
                </button>

                <button onClick={() => setActiveMode('WEAVE')} className="p-2.5 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 rounded-lg text-left text-xs flex justify-between items-center transition-all">
                  <div><p className="font-bold text-purple-400">🌌 Constellation Tracing</p><p className="text-[9px] text-purple-400/60">Sequential pointer tracking</p></div>
                  <span className="text-purple-400 font-mono text-xs font-bold">+{Math.floor(baseRecovery * 2.0)} MH</span>
                </button>
              </>
            )}

            {/* STARTUP AND BEYOND: Show Constellation Tracing and Thought Clouds */}
            {currentTier !== 'MUD' && currentTier !== 'STREET' && (
              <>
                <button onClick={() => setActiveMode('WEAVE')} className="p-2.5 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 rounded-lg text-left text-xs flex justify-between items-center transition-all">
                  <div><p className="font-bold text-purple-400">🌌 Constellation Tracing</p><p className="text-[9px] text-purple-400/60">Sequential pointer tracking</p></div>
                  <span className="text-purple-400 font-mono text-xs font-bold">+{Math.floor(baseRecovery * 2.0)} MH</span>
                </button>

                <button onClick={() => setActiveMode('CLOUDS')} className="p-2.5 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-500/20 rounded-lg text-left text-xs flex justify-between items-center transition-all">
                  <div><p className="font-bold text-sky-400">☁️ Thought Clouds</p><p className="text-[9px] text-sky-400/60 font-medium">Slow-motion stress cleansing</p></div>
                  <span className="text-sky-400 font-mono text-xs font-bold">+{Math.floor(baseRecovery * 2.0)} MH</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {activeMode === 'BREATHE' && <MindfulRecover onComplete={(win) => processResolution(win ? 1.5 : 1.0, 'l2')} />}
      {activeMode === 'BREW' && <PerfectBrew onComplete={(win) => processResolution(win ? 1.5 : 1.0, 'l2')} />}
      {activeMode === 'WEAVE' && <DreamWeaver onComplete={(win) => processResolution(win ? 2.0 : 1.0, 'l3')} />}
      {activeMode === 'CLOUDS' && <ThoughtClouds onComplete={(win) => processResolution(win ? 2.0 : 1.0, 'l3')} />}
    </div>
  );
};
