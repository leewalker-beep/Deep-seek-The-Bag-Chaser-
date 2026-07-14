import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { generateStrategicAdvice, type AdvisorInsight } from '../engine/advisorEngine';

interface StrategicAdvisorModalProps {
  onClose: () => void;
}

export const StrategicAdvisorModal: React.FC<StrategicAdvisorModalProps> = ({ onClose }) => {
  const pl = useGameStore(state => state.pl);
  const currentMarket = useGameStore(state => state.currentMarket);
  const acceptAmbition = useGameStore(state => state.acceptAmbition);
  const ignoreAmbition = useGameStore(state => state.ignoreAmbition);
  const replaceAmbition = useGameStore(state => state.replaceAmbition);

  const [activePriorityFilter, setActivePriorityFilter] = useState<'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS'>('ALL');

  // Derive strategic advice using the pure advisor engine helper
  const advice = generateStrategicAdvice(pl, currentMarket);

  const ambitions = pl.ambitions || [];
  const activeAmbitions = ambitions.filter(a => a.status === 'ACTIVE');
  const suggestedAmbitions = ambitions.filter(a => a.status === 'SUGGESTED');
  const completedAmbitions = ambitions.filter(a => a.status === 'COMPLETED');

  // Filter insights based on active filter button selection and limit to top 5 to avoid overwhelming the player
  const filteredInsights = advice.insights.filter(ins => {
    if (activePriorityFilter === 'ALL') return true;
    if (activePriorityFilter === 'CRITICAL' && ins.priority === 'Critical') return true;
    if (activePriorityFilter === 'IMPORTANT' && ins.priority === 'Important') return true;
    if (activePriorityFilter === 'OPPORTUNITIES' && ins.priority === 'Opportunity') return true;
    if (activePriorityFilter === 'INFO' && ins.priority === 'Information') return true;
    return false;
  }).slice(0, 5);

  const getPriorityBadgeClass = (priority: AdvisorInsight['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse';
      case 'Important':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'Opportunity':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Information':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const getCategoryEmoji = (category: AdvisorInsight['category']) => {
    switch (category) {
      case 'Economy': return '📉';
      case 'Businesses': return '🏢';
      case 'Passive': return '💸';
      case 'Media': return '📺';
      case 'Politics': return '🗳️';
      case 'Relationships': return '🤝';
      case 'Rivals': return '🔥';
      case 'Heat': return '⚖️';
      case 'Aura': return '🌟';
      case 'Clout': return '👑';
      case 'MentalHealth': return '🧘';
      case 'Stress': return '🧠';
      case 'RealEstate': return '🏠';
      case 'Campaigns': return '🇺🇸';
      case 'Consequences': return '🚨';
      case 'WorldMemory': return '📖';
      case 'Legacy': return '💎';
      default: return '💡';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">🧠</span>
            <div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
                Strategic Intelligence
              </h2>
              <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">
                Real-Time Advisor Console
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-lg p-1 bg-slate-800/50 hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 no-scrollbar">
          {/* Situation briefing box */}
          <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-1 right-1 bg-slate-900 border border-slate-800 text-[7px] font-black tracking-widest text-slate-500 px-1.5 py-0.5 rounded uppercase">
              Operational Briefing
            </div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
              Status Briefing
            </div>
            <p className="text-xs text-white font-bold leading-relaxed uppercase tracking-tight">
              {advice.whatIsHappening}
            </p>
            <div className="text-[9px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 font-medium">
              <span className="text-emerald-400 font-bold uppercase mr-1">Reasoning:</span> {advice.whyItHappened}
            </div>
          </div>

          {/* Opportunities and Risks */}
          <div className="grid grid-cols-2 gap-3">
            {/* Biggest Opportunity */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-1">
                  🌟 Biggest Opportunity
                </span>
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-snug">
                  {advice.biggestOpportunity.title}
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 leading-snug uppercase tracking-tight font-medium">
                  {advice.biggestOpportunity.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-500/10 text-[9px] text-emerald-400 font-semibold leading-normal">
                {advice.biggestOpportunity.recommendation}
              </div>
            </div>

            {/* Biggest Risk */}
            <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest block mb-1">
                  🚨 Biggest Risk
                </span>
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-snug">
                  {advice.biggestRisk.title}
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 leading-snug uppercase tracking-tight font-medium">
                  {advice.biggestRisk.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-red-500/10 text-[9px] text-red-400 font-semibold leading-normal">
                {advice.biggestRisk.recommendation}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar gap-1">
            {(['ALL', 'CRITICAL', 'IMPORTANT', 'OPPORTUNITIES', 'INFO', 'AMBITIONS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActivePriorityFilter(tab)}
                className={`flex-1 text-center py-1.5 px-2.5 text-[8px] font-black uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${
                  activePriorityFilter === tab
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'AMBITIONS' ? '🎯 AMBITIONS' : tab}
              </button>
            ))}
          </div>

          {activePriorityFilter === 'AMBITIONS' ? (
            <div className="space-y-6">
              {/* Active Ambitions Section */}
              <div>
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>🎯</span> Active Ambitions
                </h3>
                {activeAmbitions.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-[10px] text-slate-500 uppercase font-black">
                    No active ambitions. Accept suggestions below!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAmbitions.map(amb => {
                      const pct = Math.round((amb.progress / amb.target) * 100);
                      return (
                        <div key={amb.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-tight">
                              {amb.title}
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">{pct}%</span>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-relaxed uppercase font-medium">{amb.description}</p>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex flex-col gap-1 text-[8px] font-black text-slate-500 uppercase pt-1">
                            <span>Progress: {amb.progressText}</span>
                            <span className="text-yellow-400/90 font-bold">Reward: {amb.rewardDescription}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Suggested Ambitions Section */}
              <div>
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>💡</span> Suggested Ambitions
                </h3>
                {suggestedAmbitions.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-[10px] text-slate-500 uppercase font-black">
                    No new suggestions right now. Keep playing!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestedAmbitions.map(amb => (
                      <div key={amb.id} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight">
                          {amb.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-relaxed uppercase font-medium">{amb.description}</p>
                        <div className="text-[8px] font-black text-slate-500 uppercase">
                          <span className="text-yellow-400/90 font-bold">Reward: {amb.rewardDescription}</span>
                        </div>
                        <div className="flex gap-2 pt-1.5">
                          <button
                            onClick={() => acceptAmbition(amb.id)}
                            className="flex-1 py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => ignoreAmbition(amb.id)}
                            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 border border-slate-800 cursor-pointer"
                          >
                            Ignore
                          </button>
                          {activeAmbitions.length > 0 && (
                            <div className="relative group/replace">
                              <button className="py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border border-blue-500/20 cursor-pointer">
                                Replace...
                              </button>
                              <div className="absolute right-0 bottom-full mb-1 hidden group-hover/replace:flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-1 z-20 shadow-xl min-w-[150px] space-y-1">
                                <div className="text-[7px] text-slate-500 font-black uppercase px-2 py-0.5 tracking-wider">Select to Replace:</div>
                                {activeAmbitions.map(active => (
                                  <button
                                    key={active.id}
                                    onClick={() => replaceAmbition(active.id, amb.id)}
                                    className="text-left text-[8px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-1.5 rounded-lg uppercase tracking-tight transition-colors truncate cursor-pointer"
                                  >
                                    With: {active.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Ambitions Section */}
              <div>
                <h3 className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>👑</span> Historic Recognition
                </h3>
                {completedAmbitions.length === 0 ? (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-[10px] text-slate-500 uppercase font-black">
                    No ambitions completed yet. Build your legacy!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedAmbitions.map(amb => (
                      <div key={amb.id} className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl space-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-[7px] font-black tracking-widest text-emerald-400 px-2 py-1 rounded-bl uppercase">
                          🏆 COMPLETED
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight">
                          {amb.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-relaxed uppercase font-medium">{amb.description}</p>
                        <div className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider pt-1">
                          Reward Earned: {amb.rewardDescription}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Insights Feed */
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Prioritized Intelligence Recommendations
                </span>
                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                  Confidence Grounding
                </span>
              </div>

              {filteredInsights.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/30 border-2 border-dashed border-slate-800 rounded-2xl italic text-slate-600 text-xs uppercase font-bold">
                  No active insights for this category filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInsights.map(ins => (
                    <div
                      key={ins.id}
                      className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 transition-colors relative"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{getCategoryEmoji(ins.category)}</span>
                          <div>
                            <h4 className="text-[11px] font-black text-white uppercase tracking-tight">
                              {ins.title}
                            </h4>
                            <span className="text-[7px] text-slate-500 uppercase font-black tracking-wider">
                              Sector: {ins.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${getPriorityBadgeClass(ins.priority)}`}>
                            {ins.priority}
                          </span>
                          <span className="text-[7px] text-slate-500 font-mono uppercase">
                            Conf: {ins.confidence}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-slate-900 pt-2 text-[10px] text-slate-300 uppercase tracking-tight font-medium">
                        <div>
                          <span className="text-[8px] font-black text-slate-500 block mb-0.5">Observation</span>
                          <p className="leading-relaxed">{ins.whatIsHappening}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-500 block mb-0.5">Root Cause</span>
                          <p className="leading-relaxed text-slate-400">{ins.whyItHappened}</p>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                          <span className="text-[8px] font-black text-emerald-400 block mb-1 uppercase tracking-widest">
                            💡 Recommendation
                          </span>
                          <p className="text-white text-[10px] font-semibold leading-relaxed tracking-tight">
                            {ins.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-slate-700/30"
          >
            Acknowledge Intelligence Briefing
          </button>
        </div>
      </motion.div>
    </div>
  );
};
