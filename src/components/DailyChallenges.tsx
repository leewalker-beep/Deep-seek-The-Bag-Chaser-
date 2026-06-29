import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { DailyChallenge } from '../types/game';

interface DailyChallengesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ isOpen, onClose }) => {
  const { dailyChallenges, loginStreak } = useGameStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white uppercase italic">Daily Grind</h2>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                  Login Streak: {loginStreak} Days 🔥
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {dailyChallenges.map((challenge: DailyChallenge) => {
                const progress = Math.min(100, (challenge.current / challenge.target) * 100);
                return (
                  <div key={challenge.id} className={`p-4 rounded-2xl border transition-colors ${
                    challenge.isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className={`text-sm font-bold ${challenge.isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                          {challenge.description}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          REWARD: ${challenge.reward.cash.toLocaleString()}
                        </div>
                      </div>
                      {challenge.isCompleted && <span className="text-xl">✅</span>}
                    </div>

                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${challenge.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                       <span className="text-[8px] text-slate-500 font-bold uppercase">Progress</span>
                       <span className="text-[10px] text-white font-mono">{challenge.current} / {challenge.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-950/50 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Challenges reset every 24 hours</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
