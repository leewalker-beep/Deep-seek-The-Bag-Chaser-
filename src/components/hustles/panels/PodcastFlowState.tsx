import React, { useState, lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';
import { PodcastDashboard } from '../../dashboard/PodcastDashboard';

const TapRhythm = lazy(() =>
  import('../../minigames/TapRhythm')
  .then(m => ({ default: m.TapRhythm })));

interface PodcastFlowStateProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const PodcastFlowState: React.FC<PodcastFlowStateProps> = ({ onComplete, level, tier }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const handleGuestLinked = (id: string) => {
    setSelectedGuestId(id);
  };

  if (!isGameStarted) {
    return (
      <div className="w-full space-y-4 max-w-md mx-auto p-2">
        {/* 1. Embed the live interactive studio console lobby */}
        <PodcastDashboard onSelectGuest={handleGuestLinked} level={level} />

        {/* 2. Gate the minigame launch action button based on active guest validation */}
        <div className="p-1">
          <button
            disabled={!selectedGuestId}
            onClick={() => selectedGuestId && setIsGameStarted(true)}
            className={`w-full py-3 rounded-xl font-bold font-mono tracking-wider transition-all duration-150 border uppercase text-xs ${
              selectedGuestId
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-zinc-900 text-zinc-600 border-zinc-850 cursor-not-allowed opacity-40'
            }`}
          >
            {selectedGuestId ? '🚀 GO LIVE / START BROADCAST' : '❌ LOCK IN A GUEST TO MIC UP'}
          </button>
          <p className="text-center text-[7px] text-zinc-600 font-mono uppercase tracking-widest mt-2">
            Streaming bitrates require an established live proxy link before audio routing triggers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Mic Check 1, 2...</div>}>
      <TapRhythm
        onComplete={onComplete}
        level={level}
        tier={tier}
        title="FLOW STATE"
        instruction="Hit the topics before the audience switches off — stay sharp"
        icon="🎙️"
      />
    </Suspense>
  );
};
