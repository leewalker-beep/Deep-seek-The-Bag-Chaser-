import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';
import { HUSTLE_BADGES } from '../config/badges';
import { PROGRESSION_ORDER } from '../config/tiers';
import { ACHIEVEMENTS } from '../config/achievements';
import { ProgressBar } from './ui/ProgressBar';

export const Scoreboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pl, achievements } = useGameStore();
  const [activeTab, setActiveTab] = useState<'career' | 'portfolio' | 'history' | 'badges' | 'achievements' | 'endings' | 'deaths'>('career');
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  const { setPh } = useGameStore();
  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  const handleEndRun = () => {
    setPh('POST_MORTEM');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">The Scoreboard</h2>
          <BaseButton variant="secondary" onClick={onClose} className="px-4 py-1.5 text-[10px]">Close</BaseButton>
        </div>

        <div className="flex bg-slate-950/50 p-1 m-4 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {['career', 'portfolio', 'history', 'badges', 'achievements', 'endings', 'deaths'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'career' | 'portfolio' | 'history' | 'badges' | 'achievements' | 'endings' | 'deaths')}
              className={`flex-shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'career' && (
              <motion.div
                key="career"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-3"
              >
                <StatCard label="Lifetime Profit" value={`$${stats.lifetimeEarnings.toLocaleString()}`} colorClass="text-emerald-400" />
                <StatCard label="Success Rate" value={`${successRate}%`} colorClass="text-blue-400" />
                <StatCard label="Total Hustles" value={stats.totalHustles} />
                <StatCard label="Legacy Score" value={pl.legacyPoints || 0} colorClass="text-yellow-400" />
                <StatCard label="Login Streak" value={`${pl.loginStreak || 0} Days`} icon="🔥" />
                <StatCard label="Endings Found" value={`${JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length}/16`} icon="🎬" />
                <StatCard label="Grammys" value={pl.grammyCount || 0} icon="🏆" />
                <StatCard label="Vending Machines" value={pl.vendingCount || 0} icon="🥤" />
                <StatCard label="Flex Assets" value={Object.keys(pl.flexAssets || {}).length} icon="💎" />
                <div className="col-span-2 p-4 bg-slate-950 border border-yellow-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legacy Momentum</div>
                    <div className="text-[10px] font-black text-yellow-400">
                      +{(Math.floor((pl.totalChallengesCompleted || 0) / 10) * 0.1).toFixed(1)}% Multiplier
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>Next Boost</span>
                      <span>{(pl.totalChallengesCompleted || 0) % 10} / 10 Challenges</span>
                    </div>
                    <ProgressBar
                      value={((pl.totalChallengesCompleted || 0) % 10) * 10}
                      colorClass="bg-yellow-500"
                      className="h-1.5"
                    />
                  </div>
                  <p className="text-[7px] text-slate-600 uppercase font-bold mt-2 text-center">
                    Permanent cross-run boost for every 10 challenges completed
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Total Earning Power HUD */}
                <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <div className="text-6xl uppercase font-black italic tracking-tighter text-white rotate-12">EMPIRE</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Total Earning Power</div>
                        <div className="text-4xl font-black text-white font-mono tracking-tighter">
                            ${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}
                            <span className="text-lg text-slate-500 font-normal"> / mo</span>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Base Value</span>
                                <span className="text-xs font-mono text-slate-300">${(pl.lastPassiveBreakdown?.baseTotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Multipliers</span>
                                <span className="text-xs font-mono text-emerald-400">
                                    x{((pl.lastPassiveBreakdown?.finalTotal || 1) / (pl.lastPassiveBreakdown?.baseTotal || 1)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Attribution */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Streams</h3>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Source Contribution</span>
                    </div>

                    {!pl.lastPassiveBreakdown || pl.lastPassiveBreakdown.sources.length === 0 ? (
                        <div className="text-center py-12 bg-slate-950/30 border-2 border-dashed border-slate-800 rounded-3xl italic text-slate-700 text-xs">
                            No passive assets acquired yet. Build your first revenue stream.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pl.lastPassiveBreakdown.sources
                                .sort((a, b) => b.amount - a.amount)
                                .map((src, idx) => (
                                    <div key={src.id} className="group p-4 bg-slate-950 border border-slate-800/50 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                                                idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                                    {src.name}
                                                </div>
                                                <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                                                    {src.category} {src.count ? `• ${src.count} Units` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono font-black text-emerald-400">
                                                +${src.amount.toLocaleString()}
                                            </div>
                                            <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
                                                {((src.amount / pl.lastPassiveBreakdown!.baseTotal) * 100).toFixed(0)}% SHARE
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                {/* Specialization Impact Card */}
                {pl.activeSpecializationId && (
                    <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">⚡</span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.1em]">Specialization Synergy</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Your <span className="text-white font-black">{pl.activeSpecializationId.toUpperCase()}</span> perk is amplifying all passive yields by <span className="text-emerald-400 font-black">
                                +{Math.round(((pl.lastPassiveBreakdown?.multipliers.specialization || 1) - 1) * 100)}%
                            </span>.
                        </div>
                    </div>
                )}
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* TIER BADGES SECTION */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier Badges</div>
                  {pl.tierBadges.length === 0 ? (
                    <div className="text-center py-6 text-slate-600 text-[10px] italic border border-dashed border-slate-800 rounded-2xl uppercase font-black">
                      No tiers mastered yet. Complete every hustle in a tier to earn its badge.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {pl.tierBadges.map(tier => (
                        <div key={tier} className="p-3 bg-slate-950 border border-yellow-500/30 rounded-2xl flex flex-col items-center text-center gap-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1 bg-yellow-500/10 text-[6px] font-bold text-yellow-400 border-l border-b border-yellow-500/20 uppercase tracking-tighter">MASTER</div>
                          <span className="text-2xl mb-1">🏆</span>
                          <span className="font-black text-white text-[10px] uppercase italic tracking-tighter">{tier} MASTER</span>
                          <span className="text-[8px] text-emerald-400 font-bold">+2% YIELD</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HUSTLE MASTERY SECTION */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mastery Badges</div>
                  {pl.masteredHustles.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-sm italic border-2 border-dashed border-slate-800 rounded-2xl">
                      No hustles mastered yet. Max out a hustle to earn a badge.
                    </div>
                  ) : (
                    pl.masteredHustles.map(hId => {
                      const badge = HUSTLE_BADGES[hId];
                      if (!badge) return null;
                      return (
                        <div key={badge.id} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 text-[8px] font-bold text-emerald-400 border-l border-b border-emerald-500/20">MASTERED</div>
                          <div className="text-4xl bg-slate-900 w-16 h-16 flex items-center justify-center rounded-xl shadow-inner border border-slate-800">
                            {badge.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-black text-white text-lg tracking-tight leading-none mb-1">{badge.name}</div>
                            <div className="text-xs text-slate-400 italic mb-2">{badge.description}</div>
                            <div className="flex flex-wrap gap-2">
                              <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                                BUFF: {badge.buff.value}x {badge.buff.type}
                              </div>
                              {badge.futureBenefit && badge.relevantTier && (
                                (() => {
                                  const currentTierIdx = PROGRESSION_ORDER.indexOf(pl.currentTier);
                                  const relevantTierIdx = PROGRESSION_ORDER.indexOf(badge.relevantTier);
                                  const isActive = currentTierIdx >= relevantTierIdx;
                                  return isActive ? (
                                    <div className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                      ACTIVE: {badge.futureBenefit}
                                    </div>
                                  ) : null;
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Achievements</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">
                    {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
                  </div>
                </div>

                <div className="space-y-2">
                  {achievements.map((a) => {
                    const config = ACHIEVEMENTS.find(c => c.id === a.id);
                    const prog = config?.requirement.progress(useGameStore.getState());
                    const progressValue = prog ? (prog.current / prog.target) * 100 : 0;

                    return (
                      <div
                        key={a.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          a.isUnlocked
                            ? 'bg-slate-950 border-emerald-500/30'
                            : 'bg-slate-900/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase italic ${a.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                            {a.name}
                          </span>
                          {a.isUnlocked && <span className="text-emerald-400 text-[10px]">🏆</span>}
                        </div>
                        <div className="text-[8px] text-slate-400 mb-2 uppercase tracking-tight">{a.description}</div>

                        {!a.isUnlocked && prog && prog.target > 1 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                              <span>Progress</span>
                              <span>{Math.floor(prog.current).toLocaleString()} / {prog.target.toLocaleString()}</span>
                            </div>
                            <ProgressBar value={progressValue} colorClass="bg-slate-700" className="h-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'endings' && (
              <motion.div
                key="endings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unlocked Endings</div>
                <div className="grid grid-cols-2 gap-2">
                  {JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').map((title: string) => (
                    <div key={title} className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">🏆</span>
                      <span className="font-black text-white text-[10px] uppercase">{title}</span>
                    </div>
                  ))}
                </div>
                {JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length === 0 && (
                  <div className="text-center py-12 text-slate-600 text-sm italic border-2 border-dashed border-slate-800 rounded-2xl">
                    No endings unlocked yet. Complete the journey to fill your gallery.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'deaths' && (
              <motion.div
                key="deaths"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Death Badges</div>
                <div className="grid grid-cols-3 gap-3">
                  {(pl.collectedDeathBadges || []).map((badge: string) => (
                    <div key={badge} className="aspect-square bg-slate-950 border border-red-500/20 rounded-xl flex items-center justify-center text-3xl shadow-inner grayscale hover:grayscale-0 transition-all duration-500">
                      {badge}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 9 - (pl.collectedDeathBadges?.length || 0)) }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-950/30 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-slate-700 text-xl font-black">
                      ?
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-slate-500 text-center uppercase font-bold mt-4">Collect every unique way to go out</p>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                 {pl.actionLog?.slice(0, 20).map((log) => (
                   <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl flex justify-between items-center">
                     <div>
                       <div className="text-[10px] font-bold text-white uppercase">{log.hustleName}</div>
                       <div className="text-[8px] text-slate-500">{log.branchName || 'Standard'}</div>
                     </div>
                     <div className={`text-xs font-mono font-bold ${log.netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                       {log.netCash >= 0 ? '+' : ''}${log.netCash.toLocaleString()}
                     </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 space-y-4">
          {!confirmingEnd ? (
            <button
              onClick={() => setConfirmingEnd(true)}
              className="w-full py-3 border border-red-900/50 text-red-700 text-xs font-black uppercase tracking-widest rounded-xl hover:border-red-700 hover:text-red-500 transition-all"
            >
              End Run
            </button>
          ) : (
            <div className="p-4 border border-red-500/30 rounded-xl bg-red-950/20 space-y-3 animate-in fade-in zoom-in duration-200">
              <div className="text-xs text-red-400 font-black uppercase tracking-widest text-center">
                This ends your run permanently.
              </div>
              <div className="text-[10px] text-slate-500 text-center">
                Your legacy score will be saved.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmingEnd(false)}
                  className="py-3 border border-slate-700 text-slate-400 text-xs font-black uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndRun}
                  className="py-3 bg-red-900/60 border border-red-700 text-red-300 text-xs font-black uppercase rounded-xl"
                >
                  Confirm End
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
