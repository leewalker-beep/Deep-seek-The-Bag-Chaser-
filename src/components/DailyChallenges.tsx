import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';

export const DailyChallenges: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { dailyChallenges, loginStreak } = useGameStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

             <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Daily Grind</h2>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Login Streak: {loginStreak} Days 🔥</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
             </div>

             <div className="space-y-4 mb-8">
                {dailyChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl relative overflow-hidden group">
                    {challenge.isCompleted && (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-end px-4">
                        <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Completed</span>
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-sm">{challenge.description}</span>
                        <span className="text-[10px] font-black text-emerald-400 font-mono">REWARD: ${challenge.reward.cash.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                          className={`h-full ${challenge.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter italic">Progress</span>
                        <span className="text-[10px] font-mono text-slate-400">{challenge.current} / {challenge.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>

             <div className="text-center">
                <p className="text-[8px] text-slate-500 uppercase tracking-[0.2em] mb-4">Challenges reset every 24 hours</p>
                <BaseButton variant="secondary" onClick={onClose} className="w-full">Back to Hustle</BaseButton>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
