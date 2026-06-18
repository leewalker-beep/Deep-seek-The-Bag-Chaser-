import React from 'react';
import type { Rival } from '../types/game';
import { BaseButton } from './ui/BaseButton';
import { useGameStore } from '../store/gameStore';
import { GAME_CONSTANTS } from '../config/gameConstants';

interface RivalLeaderboardProps {
  playerBag: number;
  playerName: string;
  rivals: Rival[];
}

export const RivalLeaderboard: React.FC<RivalLeaderboardProps> = ({
  playerBag,
  playerName,
  rivals = []
}) => {
  const { addTickerMessage, pl, retaliateRival } = useGameStore();
  const allParticipants = [
    ...(rivals || []),
    { id: 'player', name: playerName || 'You', netWorth: playerBag, currentBid: 0, isNpc: false, tier: pl.currentTier }
  ].sort((a, b) => b.netWorth - a.netWorth);

  const handleSabotage = (rivalName: string) => {
    const cost = GAME_CONSTANTS.SABOTAGE_COST;
    if (pl.bag < cost) {
      addTickerMessage("Not enough cash to sabotage rival!", "text-red-400");
      return;
    }

    addTickerMessage(`Sabotage attempt on ${rivalName} initiated... (-$${cost.toLocaleString()})`, "text-yellow-400");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Elite Leaderboard</h3>
        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">Net Worth</span>
      </div>

      <div className="space-y-3">
        {allParticipants.map((p, index) => {
          const isPlayer = p.id === 'player';
          const pAsRival = p as Rival;
          return (
            <div
              key={p.id}
              className={`flex flex-col p-3 rounded-xl transition-all ${
                isPlayer ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-slate-950/50 border border-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black w-4 ${
                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <div className={`text-xs font-bold ${isPlayer ? 'text-white' : 'text-slate-300'}`}>
                      {p.name} {isPlayer && '(YOU)'}
                    </div>
                    {p.currentBid > 0 && (
                      <div className="text-[8px] text-red-400 font-bold uppercase animate-pulse">
                        Active Bid: ${p.currentBid.toLocaleString()}
                      </div>
                    )}
                    {pl.rivalThreats?.[pAsRival.tier] === 'RIVAL_DOMINANT' && !isPlayer && pAsRival.tier === pl.currentTier && (
                      <div className="text-[8px] text-red-500 font-black uppercase">DOMINATING MARKET</div>
                    )}
                    {pl.rivalThreats?.[pAsRival.tier] === 'PLAYER_DOMINANT' && !isPlayer && pAsRival.tier === pl.currentTier && (
                      <div className="text-[8px] text-emerald-500 font-black uppercase">BEING CRUSHED</div>
                    )}
                  </div>
                </div>
                <div className={`text-xs font-mono font-bold ${isPlayer ? 'text-emerald-400' : 'text-slate-400'}`}>
                  ${p.netWorth.toLocaleString()}
                </div>
              </div>

              {!isPlayer && (
                <div className="mt-2 space-y-2">
                  {pl.activeChallenges.find(c => c.rivalId === p.id) && (
                    <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <div className="flex justify-between text-[8px] font-black text-orange-400 uppercase mb-1">
                        <span>Active Challenge</span>
                        <span>{pl.activeChallenges.find(c => c.rivalId === p.id)?.monthsRemaining}m Left</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full transition-all duration-500"
                          style={{ width: `${(pl.activeChallenges.find(c => c.rivalId === p.id)!.hustlesCompleted / 3) * 100}%` }}
                        />
                      </div>
                      <div className="text-[8px] text-slate-400 mt-1">
                        Hustles: {pl.activeChallenges.find(c => c.rivalId === p.id)?.hustlesCompleted}/3
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {p.netWorth > playerBag && (
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        className="text-[8px] py-1 h-auto bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                        onClick={() => handleSabotage(p.name)}
                      >
                        Spy/Sabotage (${(GAME_CONSTANTS.SABOTAGE_COST / 1000).toLocaleString()}k)
                      </BaseButton>
                    )}

                    {pl.rivalThreats?.[pAsRival.tier] === 'RIVAL_DOMINANT' && (
                       <BaseButton
                        variant="ghost"
                        size="sm"
                        className="text-[8px] py-1 h-auto bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 text-orange-400"
                        onClick={() => retaliateRival(p.id)}
                      >
                        🔥 RETALIATE (10% Bag)
                      </BaseButton>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
