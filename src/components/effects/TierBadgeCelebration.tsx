import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { showConfetti } from './Confetti';
import { BaseButton } from '../ui/BaseButton';

interface TierBadgeCelebrationProps {
  tier: string;
  onClose: () => void;
}

export const TierBadgeCelebration: React.FC<TierBadgeCelebrationProps> = ({ tier, onClose }) => {
  const { pl } = useGameStore();
  const stats = pl.tierStats[tier] || { plays: 0, earnings: 0, favoriteHustle: 'N/A' };

  useEffect(() => {
    showConfetti();
  }, []);

  const shareText = `🏆 I just earned the ${tier} MASTER Badge in Bag Chaser! I played ${stats.plays} times, earned $${stats.earnings.toLocaleString()}, and my favorite hustle was ${stats.favoriteHustle}. +2% permanent yield unlocked! #BagChaser`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bag Chaser - Tier Master!',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard!');
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border-2 border-yellow-500 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)] animate-pulse" />

        <motion.div
          initial={{ rotate: -10, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
          className="text-7xl mb-6 relative z-10"
        >
          🏆
        </motion.div>

        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 relative z-10">
          {tier} MASTER
        </h2>

        <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-8 relative z-10">
          You mastered every {tier} hustle.
        </p>

        <div className="space-y-4 mb-8 relative z-10">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Career Stats</p>
            <p className="text-white text-sm font-medium">
              You played <span className="text-yellow-400 font-black">{stats.plays}</span> times,
              earned <span className="text-emerald-400 font-black">${stats.earnings.toLocaleString()}</span>,
              and your favorite hustle was <span className="text-blue-400 font-black">{stats.favoriteHustle}</span>.
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3">
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
              +2% permanent yield on {tier} hustles
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <BaseButton onClick={onClose} variant="primary" className="py-4 rounded-2xl">
            Continue
          </BaseButton>
          <button
            onClick={handleShare}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Share Achievement
          </button>
        </div>
      </motion.div>
    </div>
  );
};
