import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';
import { HUSTLE_BADGES } from '../config/badges';
import { ACHIEVEMENTS } from '../config/achievements';
import { ProgressBar } from './ui/ProgressBar';

export const Scoreboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pl, achievements } = useGameStore();
  const [activeTab, setActiveTab] = useState<'career' | 'history' | 'badges' | 'achievements' | 'endings' | 'deaths'>('career');

  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">The Scoreboard</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex bg-slate-950/50 p-1 m-4 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {['career', 'history', 'badges', 'achievements', 'endings', 'deaths'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
                <StatCard label="Flex Assets" value={Object.keys(pl.flexAssets || {}).length} icon="💎" />
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-3"
              >
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
                          <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                            BUFF: {badge.buff.value}x {badge.buff.type}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                    const prog = config?.requirement.progress((useGameStore.getState() as any));
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

        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
          <BaseButton variant="secondary" onClick={onClose} className="w-full">Close Scoreboard</BaseButton>
        </div>
      </motion.div>
    </div>
  );
};
