import React from 'react';
import type { Rival } from '../types/game';

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
  const allParticipants = [
    ...(rivals || []),
    { id: 'player', name: playerName || 'You', netWorth: playerBag, currentBid: 0 }
  ].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Elite Leaderboard</h3>
        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">Net Worth</span>
      </div>

      <div className="space-y-2">
        {allParticipants.map((p, index) => {
          const isPlayer = p.id === 'player';
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                isPlayer ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-slate-950/50 border border-transparent'
              }`}
            >
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
                </div>
              </div>
              <div className={`text-xs font-mono font-bold ${isPlayer ? 'text-emerald-400' : 'text-slate-400'}`}>
                ${p.netWorth.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
