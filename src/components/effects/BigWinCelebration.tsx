import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { showConfetti } from './Confetti';

interface BigWinCelebrationProps {
  onComplete: () => void;
  amount: number;
}

export const BigWinCelebration: React.FC<BigWinCelebrationProps> = ({ onComplete, amount }) => {
  useEffect(() => {
    showConfetti();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
    >
      {/* Confetti-like particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'][i % 4],
            left: `${Math.random() * 100}%`,
            top: `-5%`,
          }}
          animate={{
            top: '105%',
            left: `${Math.random() * 100}%`,
            rotate: 360,
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border-4 border-amber-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.5)] text-center relative"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          💰
        </motion.div>

        <h2 className="text-4xl font-black text-amber-400 mb-2 tracking-tighter">JACKPOT!</h2>
        <p className="text-xl text-slate-300 font-bold mb-4">RARE METAL DISCOVERED!</p>

        <div className="text-5xl font-black text-white mb-8">
          +${amount.toLocaleString()}
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl text-xl transition-colors shadow-lg"
        >
          COLLECT BAG
        </button>
      </motion.div>
    </motion.div>
  );
};
