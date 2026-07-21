import React from 'react';
import type { Rival } from '../types/game';
import { BaseButton } from './ui/BaseButton';
import { useGameStore } from '../store/gameStore';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { getRivalAvatarId } from '../config/avatars';
import Avatar from './Avatar';
import { isRivalEligibleForRecruit } from '../utils/rivalUtils';

interface RivalLeaderboardProps {
  playerBag: number;
  playerName: string;
  rivals: Rival[];
}

const TIER_HELP_COSTS: Record<string, number> = {
  MUD: 1000,
  STREET: 10000,
  STARTUP: 100000,
  CORPORATE: 1000000,
  ELITE: 10000000,
  MOGUL: 20000000,
  PRESIDENT: 50000000,
  OPEN: 100000000
};

const formatGapValue = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
};

export const RivalLeaderboard: React.FC<RivalLeaderboardProps> = ({
  playerBag,
  playerName,
  rivals = []
}) => {
  const { pl, retaliateRival, sabotageRival, helpRival, counterBid, recruitRival } = useGameStore();
  const allParticipants = [
    ...(rivals || []),
    { id: 'player', name: playerName || 'You', netWorth: playerBag, currentBid: 0, isNpc: false, tier: pl.currentTier }
  ].sort((a, b) => b.netWorth - a.netWorth);

  const handleSabotage = (rivalId: string) => {
    sabotageRival(rivalId);
  };

  const handleHelp = (rivalId: string) => {
    if (helpRival) {
      helpRival(rivalId);
    }
  };

  const tierLabel = pl.currentTier || 'STREET';

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
            REGIONAL STANDINGS
          </span>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase italic">
            {tierLabel} Elite
          </h2>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/50 rounded-full px-3 py-1 border border-slate-700/50">
          NET WORTH
        </span>
      </div>

      <div className="space-y-4">
        {allParticipants.map((p, index) => {
          const isPlayer = p.id === 'player';
          const pAsRival = p as Rival;

          let cardStyle = "border border-slate-700/40 bg-slate-900/20 rounded-xl p-3";
          let nameStyle = "text-slate-300 font-medium";
          let prefixStyle = "text-slate-500";
          let amountStyle = "text-slate-400";
          let prefix = `#${index + 1}`;

          if (index === 0) {
            cardStyle = "border-2 border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.05)]";
            nameStyle = "text-amber-400 font-black text-lg italic tracking-tight";
            prefixStyle = "text-amber-500";
            amountStyle = "text-amber-300 font-black font-mono";
            prefix = `👑 #1`;
          } else if (isPlayer) {
            cardStyle = "border-2 border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.05)]";
            nameStyle = "text-emerald-400 font-black text-lg italic tracking-tight";
            prefixStyle = "text-emerald-500";
            amountStyle = "text-emerald-400 font-black font-mono";
            prefix = `#${index + 1}`;
          } else if (index === 1) {
            cardStyle = "border border-slate-700 bg-slate-800/30 rounded-2xl p-4";
            nameStyle = "text-slate-200 font-black text-base italic tracking-tight";
            prefixStyle = "text-slate-400";
            amountStyle = "text-slate-300 font-bold font-mono";
            prefix = `#${index + 1}`;
          } else {
            cardStyle = "border border-slate-800/50 bg-slate-900/30 rounded-2xl p-4 opacity-80";
            nameStyle = "text-slate-400 font-bold text-sm tracking-tight";
            prefixStyle = "text-slate-600";
            amountStyle = "text-slate-500 font-medium font-mono";
            prefix = `#${index + 1}`;
          }

          return (
            <div
              key={p.id}
              className={`flex flex-col transition-all ${cardStyle}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black w-10 shrink-0 ${prefixStyle}`}>
                    {prefix}
                  </span>
                  <Avatar
                    avatarId={isPlayer ? (pl.avatarId || 'av_m1') : getRivalAvatarId(p.name)}
                    size={36}
                    ring={index === 0
                      ? 'ring-amber-500'
                      : 'ring-slate-700'}
                  />
                  <div>
                    <div className={nameStyle}>
                      {p.name} {isPlayer && '(YOU)'}
                    </div>

                    {!isPlayer && (
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-2">
                        <span>{pAsRival.currentHustle || pAsRival.specialty || `${pAsRival.tier} OPERATOR`}</span>
                        {pAsRival.relationshipWithPlayer !== undefined && (
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                            Rel: <span className={pAsRival.relationshipWithPlayer >= 0 ? "text-emerald-400" : "text-red-400"}>{pAsRival.relationshipWithPlayer}</span>
                          </span>
                        )}
                      </div>
                    )}

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
                    {pl.marketLeaderTiers?.includes(pAsRival.tier) && !isPlayer && (
                      <div className="text-[8px] text-yellow-500 font-black uppercase">🏆 MARKET DOMINATED</div>
                    )}
                  </div>
                </div>
                {isPlayer ? (
                  (() => {
                    const isFirst = allParticipants[0].id === 'player';
                    if (isFirst) {
                      const nextBest = allParticipants[1];
                      if (nextBest) {
                        const gap = p.netWorth - nextBest.netWorth;
                        return (
                          <div className="text-[10px] text-emerald-400 font-black uppercase text-right leading-tight shrink-0">
                            <div>LEADING</div>
                            <div className="text-[8px] text-slate-500 font-mono">+{formatGapValue(gap)} ahead</div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-[10px] text-emerald-400 font-black uppercase text-right leading-tight shrink-0">
                            LEADING
                          </div>
                        );
                      }
                    } else {
                      const leader = allParticipants[0];
                      const gap = leader.netWorth - p.netWorth;
                      return (
                        <div className="text-[10px] text-red-400 font-black uppercase text-right leading-tight shrink-0">
                          <div>−{formatGapValue(gap)}</div>
                          <div className="text-[7.5px] text-slate-500 font-bold tracking-tighter truncate max-w-[120px]">
                            BEHIND {leader.name}
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className={`text-xs font-mono ${amountStyle} shrink-0`}>
                    ${p.netWorth.toLocaleString()}
                  </div>
                )}
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

                  <div className="mt-2 space-y-2">
                    {pAsRival.status === 'ally' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded px-2 py-0.5">
                        🤝 ALLIED
                      </span>
                    ) : (
                      <>
                        <div className="flex gap-2 w-full">
                          {p.netWorth > playerBag && (
                            <button
                              disabled={pAsRival.lastSabotagedMonth === pl.month}
                              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-400 font-bold transition-all disabled:opacity-50 text-center select-none"
                              onClick={() => handleSabotage(p.id)}
                            >
                              <span className="text-[16px] leading-none">⚔️</span>
                              <span className="text-[9px] uppercase tracking-tighter leading-tight font-black">
                                {pAsRival.lastSabotagedMonth === pl.month ? 'Sabotaged' : 'Sabotage'}
                              </span>
                              <span className="text-[8px] font-mono text-red-500/70 font-medium">
                                ${(GAME_CONSTANTS.SABOTAGE_COST / 1000).toLocaleString()}K
                              </span>
                            </button>
                          )}

                          {helpRival && !isPlayer && (
                            <button
                              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 font-bold transition-all text-center select-none"
                              onClick={() => handleHelp(p.id)}
                            >
                              <span className="text-[16px] leading-none">🤝</span>
                              <span className="text-[9px] uppercase tracking-tighter leading-tight font-black">Partner</span>
                              <span className="text-[8px] font-mono text-emerald-500/70 font-medium">
                                ${((TIER_HELP_COSTS[pAsRival.tier] || 10000) / 1000).toLocaleString()}K
                              </span>
                            </button>
                          )}

                          {pl.rivalThreats?.[pAsRival.tier] === 'RIVAL_DOMINANT' && (
                            <button
                              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-orange-950/40 hover:bg-orange-900/40 border border-orange-500/20 text-orange-400 font-bold transition-all text-center select-none"
                              onClick={() => retaliateRival(p.id)}
                            >
                              <span className="text-[16px] leading-none">🔥</span>
                              <span className="text-[9px] uppercase tracking-tighter leading-tight font-black">Retaliate</span>
                              <span className="text-[8px] font-mono text-orange-500/70 font-medium">10% Bag</span>
                            </button>
                          )}
                        </div>

                        {((p.currentBid > 0 && pAsRival.tier === pl.currentTier) || (recruitRival && isRivalEligibleForRecruit(pAsRival))) && (
                          <div className="flex gap-2 w-full">
                            {p.currentBid > 0 && pAsRival.tier === pl.currentTier && (
                              <button
                                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/20 text-blue-400 font-bold transition-all text-center select-none"
                                onClick={() => counterBid(p.id)}
                              >
                                <span className="text-[16px] leading-none">⚡</span>
                                <span className="text-[9px] uppercase tracking-tighter leading-tight font-black">Counter</span>
                                <span className="text-[8px] font-mono text-blue-500/70 font-medium">
                                  ${(Math.floor(p.currentBid * 1.5) / 1000).toLocaleString()}K
                                </span>
                              </button>
                            )}

                            {recruitRival && isRivalEligibleForRecruit(pAsRival) && (
                              <button
                                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 text-purple-400 font-bold transition-all text-center select-none"
                                onClick={() => recruitRival(p.id)}
                              >
                                <span className="text-[16px] leading-none">🤝</span>
                                <span className="text-[9px] uppercase tracking-tighter leading-tight font-black">Recruit</span>
                                <span className="text-[8px] font-mono text-purple-500/70 font-medium">Free</span>
                              </button>
                            )}
                          </div>
                        )}
                      </>
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
