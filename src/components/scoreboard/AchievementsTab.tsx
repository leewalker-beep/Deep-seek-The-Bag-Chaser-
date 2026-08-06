import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';
import { ACHIEVEMENTS } from '../../config/achievements';
import { ProgressBar } from '../ui/ProgressBar';

export const AchievementsTab: React.FC = () => {
  const { achievements } = useGameStore();

  return (
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

      {achievements.length === 0 ? (
        <EmptyState message="No achievements found." className="bg-slate-950/30 text-slate-700" />
      ) : (
        <ScrollableList maxHeight="max-h-[320px]">
          <div className="space-y-2 pb-8 flex flex-col">
            {achievements.map((a) => {
              const config = ACHIEVEMENTS.find(c => c.id === a.id);
              const prog = config?.requirement.progress(useGameStore.getState());
              const progressValue = prog ? (prog.current / prog.target) * 100 : 0;

              return (
                <div
                  key={a.id}
                  className={`p-3 rounded-2xl border transition-all shrink-0 ${
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
        </ScrollableList>
      )}
    </motion.div>
  );
};
