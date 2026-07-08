import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const BoardroomBattle = lazy(() =>
  import('../../minigames/BoardroomBattle')
  .then(m => ({ default: m.BoardroomBattle })));

interface VCPitchRoomProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
  playerBid: number;
  rivalBid: number;
  onOutbid: (amount: number) => void;
}

export const VCPitchRoom: React.FC<VCPitchRoomProps> = ({
  onComplete,
  level,
  tier,
  playerBid,
  rivalBid,
  onOutbid
}) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Polishing the Deck...</div>}>
      <BoardroomBattle
        onComplete={onComplete}
        level={level}
        tier={tier}
        playerBid={playerBid}
        rivalBid={rivalBid}
        onOutbid={onOutbid}
        title="PITCH ROOM"
        instruction="Read the room. Make your moves. Close the deal."
        icon="💼"
        scoreLabel="DEAL VALUE"
        accentColor="emerald"
      />
    </Suspense>
  );
};
