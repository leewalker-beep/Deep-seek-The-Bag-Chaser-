import React, { useState, useEffect } from 'react';
import type { Rival } from '../types/game';
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

  // State for tracking expanded rival card
  const [expandedRivalId, setExpandedRivalId] = useState<string | null>(null);

  // State for immediate feedback tracking
  const [actionFeedback, setActionFeedback] = useState<{
    rivalId: string;
    type: 'sabotage_success' | 'sabotage_fail' | 'help' | 'counter' | 'recruit' | 'retaliate';
    message: string;
    relationshipChange: { fear: string; respect: string; trust: string };
  } | null>(null);

  // Clear action feedback after a timeout
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => {
        setActionFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const allParticipants = [
    ...(rivals || []),
    { id: 'player', name: playerName || 'You', netWorth: playerBag, currentBid: 0, isNpc: false, tier: pl.currentTier }
  ].sort((a, b) => b.netWorth - a.netWorth);

  const handleAction = (
    rivalId: string,
    type: 'sabotage' | 'help' | 'counter' | 'recruit' | 'retaliate'
  ) => {
    const stateBefore = useGameStore.getState();
    const rivalBefore = stateBefore.pl.rivals.find(r => r.id === rivalId);
    if (!rivalBefore) return;

    // Trigger action
    if (type === 'sabotage') {
      sabotageRival(rivalId);
    } else if (type === 'help' && helpRival) {
      helpRival(rivalId);
    } else if (type === 'counter') {
      counterBid(rivalId);
    } else if (type === 'recruit' && recruitRival) {
      recruitRival(rivalId);
    } else if (type === 'retaliate') {
      retaliateRival(rivalId);
    }

    // Capture state immediately after dispatch
    const stateAfter = useGameStore.getState();
    const rivalAfter = stateAfter.pl.rivals.find(r => r.id === rivalId);
    if (!rivalAfter) return;

    // Compare states to determine success / feedback details
    if (type === 'sabotage') {
      const isSuccess = (rivalAfter.netWorth < rivalBefore.netWorth);
      if (isSuccess) {
        setActionFeedback({
          rivalId,
          type: 'sabotage_success',
          message: `🎯 SABOTAGE SUCCESS: ${rivalAfter.name}'s operations disrupted! Net worth -20%.`,
          relationshipChange: { fear: '+20', respect: '-10', trust: '-30' }
        });
      } else {
        setActionFeedback({
          rivalId,
          type: 'sabotage_fail',
          message: `🚫 SABOTAGE FAILED: You were nearly caught! Heat +25%, Aura -100.`,
          relationshipChange: { fear: '-5', respect: '-15', trust: '-15' }
        });
      }
    } else if (type === 'help') {
      if ((rivalAfter.relationshipWithPlayer ?? 0) > (rivalBefore.relationshipWithPlayer ?? 0)) {
        setActionFeedback({
          rivalId,
          type: 'help',
          message: `🤝 PARTNERSHIP ESTABLISHED: You backed ${rivalAfter.name}'s strategy with cash.`,
          relationshipChange: { fear: '-10', respect: '+15', trust: '+25' }
        });
      }
    } else if (type === 'counter') {
      setActionFeedback({
        rivalId,
        type: 'counter',
        message: `⚡ COUNTER-BID SUCCESS: You bought out ${rivalAfter.name}'s sector position! Clout +300.`,
        relationshipChange: { fear: '+15', respect: '+20', trust: '-10' }
      });
    } else if (type === 'recruit') {
      if (rivalAfter.status === 'ally') {
        setActionFeedback({
          rivalId,
          type: 'recruit',
          message: `👑 RECRUITED: Turned longtime rival ${rivalAfter.name} into an ally!`,
          relationshipChange: { fear: '-15', respect: '+30', trust: '+50' }
        });
      }
    } else if (type === 'retaliate') {
      setActionFeedback({
        rivalId,
        type: 'retaliate',
        message: `🔥 RETALIATED: Struck back against ${rivalAfter.name}'s dominance!`,
        relationshipChange: { fear: '+25', respect: '+15', trust: '-20' }
      });
    }
  };

  const tierLabel = pl.currentTier || 'STREET';

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes flash-green {
          0%, 100% { background-color: transparent; border-color: rgba(30, 41, 59, 0.5); }
          50% { background-color: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.6); }
        }
        @keyframes flash-red {
          0%, 100% { background-color: transparent; border-color: rgba(30, 41, 59, 0.5); }
          50% { background-color: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.6); }
        }
        @keyframes flash-blue {
          0%, 100% { background-color: transparent; border-color: rgba(30, 41, 59, 0.5); }
          50% { background-color: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.6); }
        }
        @keyframes flash-purple {
          0%, 100% { background-color: transparent; border-color: rgba(30, 41, 59, 0.5); }
          50% { background-color: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.6); }
        }
        @keyframes flash-orange {
          0%, 100% { background-color: transparent; border-color: rgba(30, 41, 59, 0.5); }
          50% { background-color: rgba(249, 115, 22, 0.15); border-color: rgba(249, 115, 22, 0.6); }
        }
        @keyframes glow-gold-purple {
          0%, 100% { border-color: rgba(234, 179, 8, 0.4); box-shadow: 0 0 8px rgba(234, 179, 8, 0.2); }
          50% { border-color: rgba(168, 85, 247, 0.8); box-shadow: 0 0 16px rgba(168, 85, 247, 0.4); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
        .animate-flash-green {
          animation: flash-green 1s ease-out;
        }
        .animate-flash-red {
          animation: flash-red 1s ease-out;
        }
        .animate-flash-blue {
          animation: flash-blue 1s ease-out;
        }
        .animate-flash-purple {
          animation: flash-purple 1s ease-out;
        }
        .animate-flash-orange {
          animation: flash-orange 1s ease-out;
        }
        .animate-glow-gold-purple {
          animation: glow-gold-purple 2s infinite alternate;
        }
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
            REGIONAL STANDINGS
          </span>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
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
          const isExpanded = expandedRivalId === p.id && !isPlayer;
          const canRecruit = !isPlayer && recruitRival && isRivalEligibleForRecruit(pAsRival);

          // Calculate feedback effects on active cards
          const feedback = actionFeedback?.rivalId === p.id ? actionFeedback : null;
          let feedbackClass = "";
          if (feedback) {
            if (feedback.type === 'sabotage_success' || feedback.type === 'help' || feedback.type === 'recruit') {
              feedbackClass = "animate-flash-green";
            } else if (feedback.type === 'sabotage_fail') {
              feedbackClass = "animate-shake animate-flash-red";
            } else if (feedback.type === 'counter') {
              feedbackClass = "animate-flash-blue";
            } else if (feedback.type === 'retaliate') {
              feedbackClass = "animate-shake animate-flash-orange";
            }
          }

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

          // If recruit available, add stunning gold/purple border glow
          if (canRecruit) {
            cardStyle += " animate-glow-gold-purple border-2";
          }

          return (
            <div
              key={p.id}
              onClick={() => {
                if (!isPlayer) {
                  setExpandedRivalId(isExpanded ? null : p.id);
                }
              }}
              className={`flex flex-col transition-all cursor-pointer relative ${cardStyle} ${feedbackClass} hover:border-slate-500/50`}
            >
              {/* Achievement Badge for Recruiting */}
              {canRecruit && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-purple-600 text-[8px] font-black uppercase text-white tracking-[0.2em] px-2.5 py-0.5 rounded-full border border-yellow-300/40 shadow-lg animate-pulse z-10">
                  🏆 RECRUIT AVAILABLE
                </div>
              )}

              {/* Action Result Banner */}
              {feedback && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center items-center p-4 rounded-xl z-20 border border-slate-700/50 animate-fade-in text-center">
                  <div className="text-xs font-black text-white mb-2 uppercase tracking-wide">
                    {feedback.type.includes('success') || feedback.type === 'recruit' || feedback.type === 'help' || feedback.type === 'counter' ? '🎉 VICTORY' : '🚨 COMPROMISED'}
                  </div>
                  <div className="text-[11px] text-slate-300 font-bold max-w-[280px] mb-3">
                    {feedback.message}
                  </div>
                  <div className="flex gap-4 items-center justify-center bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Relationship:</div>
                    <div className="flex gap-3 text-[9px] font-mono font-bold">
                      <span className={feedback.relationshipChange.fear.includes('+') ? "text-red-400" : "text-slate-400"}>
                        Fear {feedback.relationshipChange.fear}
                      </span>
                      <span className={feedback.relationshipChange.respect.includes('+') ? "text-emerald-400" : "text-red-400"}>
                        Respect {feedback.relationshipChange.respect}
                      </span>
                      <span className={feedback.relationshipChange.trust.includes('+') ? "text-emerald-400" : "text-red-400"}>
                        Trust {feedback.relationshipChange.trust}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsed view structure */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black w-10 shrink-0 ${prefixStyle}`}>
                    {prefix}
                  </span>
                  <div className="relative">
                    <Avatar
                      avatarId={isPlayer ? (pl.avatarId || 'av_m1') : getRivalAvatarId(p.name)}
                      size={36}
                      ring={index === 0
                        ? 'ring-amber-500'
                        : isPlayer
                          ? 'ring-emerald-500'
                          : 'ring-slate-700'}
                    />
                    {/* Tiny glow indicator inside collapsed view if recruiter available */}
                    {canRecruit && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500 border border-white"></span>
                      </span>
                    )}
                  </div>
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
                  <div className="flex flex-col items-end shrink-0">
                    <div className={`text-xs font-mono ${amountStyle}`}>
                      ${p.netWorth.toLocaleString()}
                    </div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">
                      {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded details view & Actions */}
              {isExpanded && (
                <div
                  className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fade-in"
                  onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking expanded section
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-[10px]">
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Empire Value</div>
                      <div className="text-white font-mono font-bold text-sm mt-0.5">${p.netWorth.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Threat Level</div>
                      <div className="mt-0.5 font-black">
                        {(() => {
                          const ratio = pAsRival.netWorth / Math.max(1, playerBag);
                          if (ratio > 2) return <span className="text-red-500">🔴 CRITICAL THREAT</span>;
                          if (ratio >= 1) return <span className="text-orange-400">🟠 HIGH THREAT</span>;
                          if (ratio >= 0.5) return <span className="text-yellow-500">🟡 MODERATE THREAT</span>;
                          return <span className="text-emerald-500">🟢 NEUTRALIZED</span>;
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Rivalry Status</div>
                      <div className="text-slate-300 font-bold mt-0.5">
                        {pAsRival.status === 'ally' ? (
                          <span className="text-emerald-400 font-black">🤝 ALLIED PARTNER</span>
                        ) : pAsRival.currentBid > 0 ? (
                          <span className="text-red-400 font-black animate-pulse">⚡ SECTOR HOSTILE BID</span>
                        ) : (
                          <span className="text-slate-400 uppercase">ACTIVE COMPETITOR</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Disposition</div>
                      <div className="text-slate-300 font-bold mt-0.5">
                        Hostility:{' '}
                        <span className={(pAsRival.vengeance ?? 0) > 2 ? "text-red-400 font-black" : "text-slate-400 font-semibold"}>
                          {(pAsRival.vengeance ?? 0) > 2 ? 'Furious' : 'Mild'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-800/40 text-[10px] space-y-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">RIVAL RECORD</span>
                    <div className="flex gap-4 text-slate-300 font-medium">
                      <div>Sabotages Dispatched: <span className="text-red-400 font-bold">{pAsRival.sabotagedCount ?? 0}</span></div>
                      <div>Partner Support: <span className="text-emerald-400 font-bold">{pAsRival.helpedCount ?? 0}</span></div>
                    </div>
                  </div>

                  {pl.activeChallenges.find(c => c.rivalId === p.id) && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <div className="flex justify-between text-[10px] font-black text-orange-400 uppercase mb-1">
                        <span>Active Challenge</span>
                        <span>{pl.activeChallenges.find(c => c.rivalId === p.id)?.monthsRemaining}m Left</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-orange-500 h-full transition-all duration-500"
                          style={{ width: `${(pl.activeChallenges.find(c => c.rivalId === p.id)!.hustlesCompleted / 3) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Completed: {pl.activeChallenges.find(c => c.rivalId === p.id)?.hustlesCompleted}/3 Hustles
                      </div>
                    </div>
                  )}

                  {/* Play Action Cards */}
                  <div className="space-y-3">
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Strategic Interactions</div>

                    {pAsRival.status === 'ally' ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                        <span className="text-2xl">🤝</span>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wide">Allied Partner</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {pAsRival.name} is a committed ally. Their roster stats have been integrated into your corporate holdings.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Sabotage Action Card */}
                        {p.netWorth > playerBag && (
                          <button
                            disabled={pAsRival.lastSabotagedMonth === pl.month}
                            onClick={() => handleAction(p.id, 'sabotage')}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-red-950/30 to-slate-900/40 hover:from-red-950/50 hover:to-slate-900/60 border border-red-500/20 hover:border-red-500/40 text-left transition-all group disabled:opacity-50 disabled:pointer-events-none select-none"
                          >
                            <span className="text-2xl mt-0.5 p-2 bg-red-950/50 rounded-xl border border-red-500/30 group-hover:scale-110 transition-transform">⚔️</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-red-400 tracking-wide">SABOTAGE</span>
                                <span className="text-[10px] font-mono text-red-500 font-bold">
                                  ${(GAME_CONSTANTS.SABOTAGE_COST / 1000).toLocaleString()}K
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                Attempt to disrupt their operations. Cuts their net worth by 20%. Failure triggers Heat & lost Aura.
                              </p>
                              {pAsRival.lastSabotagedMonth === pl.month && (
                                <span className="inline-block text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md font-bold mt-1.5">
                                  COOLDOWN ACTIVE
                                </span>
                              )}
                            </div>
                          </button>
                        )}

                        {/* Help / Partner Action Card */}
                        {helpRival && (
                          <button
                            onClick={() => handleAction(p.id, 'help')}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900/40 hover:from-emerald-950/50 hover:to-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all group select-none"
                          >
                            <span className="text-2xl mt-0.5 p-2 bg-emerald-950/50 rounded-xl border border-emerald-500/30 group-hover:scale-110 transition-transform">🤝</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-emerald-400 tracking-wide">PARTNER SUPPORT</span>
                                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                                  ${((TIER_HELP_COSTS[pAsRival.tier] || 10000) / 1000).toLocaleString()}K
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                Inject capital to back their projects. Boosts respect and trust, paving way for alliance.
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Retaliate Action Card */}
                        {pl.rivalThreats?.[pAsRival.tier] === 'RIVAL_DOMINANT' && (
                          <button
                            onClick={() => handleAction(p.id, 'retaliate')}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-orange-950/30 to-slate-900/40 hover:from-orange-950/50 hover:to-slate-900/60 border border-orange-500/20 hover:border-orange-500/40 text-left transition-all group select-none"
                          >
                            <span className="text-2xl mt-0.5 p-2 bg-orange-950/50 rounded-xl border border-orange-500/30 group-hover:scale-110 transition-transform">🔥</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-orange-400 tracking-wide">RETALIATE</span>
                                <span className="text-[10px] font-mono text-orange-500 font-bold">10% BAG</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                Strike back against their market dominance. Recovers regional footprint and Clout.
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Counter-Bid Action Card */}
                        {p.currentBid > 0 && pAsRival.tier === pl.currentTier && (
                          <button
                            onClick={() => handleAction(p.id, 'counter')}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-blue-950/30 to-slate-900/40 hover:from-blue-950/50 hover:to-slate-900/60 border border-blue-500/20 hover:border-blue-500/40 text-left transition-all group select-none"
                          >
                            <span className="text-2xl mt-0.5 p-2 bg-blue-950/50 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform">⚡</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-blue-400 tracking-wide">COUNTER-BID</span>
                                <span className="text-[10px] font-mono text-blue-500 font-bold">
                                  ${(Math.floor(p.currentBid * 1.5) / 1000).toLocaleString()}K
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                Forcefully out-bid their acquisition attempt. Unlocks passive yield multipliers.
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Recruit / Convert Action Card */}
                        {canRecruit && (
                          <button
                            onClick={() => handleAction(p.id, 'recruit')}
                            className="col-span-1 sm:col-span-2 flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-purple-600/20 hover:from-yellow-500/30 hover:to-purple-600/30 border border-yellow-500/40 hover:border-yellow-500/60 text-left transition-all group select-none shadow-[0_0_15px_rgba(234,179,8,0.15)] relative overflow-hidden"
                          >
                            <span className="text-2xl p-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl group-hover:scale-110 transition-transform shadow-md">👑</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-yellow-400 tracking-wider">RECRUIT AS ALLY</span>
                                <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded border border-yellow-400/30">
                                  CONVERT
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-normal font-medium">
                                Hire {pAsRival.name} permanently. Converts them into a high-stat Founder or Regional Executive!
                              </p>
                            </div>
                          </button>
                        )}

                      </div>
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
