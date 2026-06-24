import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface QuickReactionProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const QuickReaction: React.FC<QuickReactionProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: elite reaction time threshold gets tighter
  const eliteThreshold = Math.max(120, (250 - (level - 1) * 20) / Math.sqrt(scaling));

  useEffect(() => {
    if (gameState === 'waiting') {
      const waitTime = level >= 3 ? (500 + Math.random() * 2000) : (1000 + Math.random() * 3000);
      const timeout = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
        if (navigator.vibrate) navigator.vibrate(50);
      }, waitTime);
      return () => clearTimeout(timeout);
    }
  }, [gameState, level]);

  const handleClick = () => {
    if (gameState === 'waiting') {
      setGameState('too-soon');
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('clicked');
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const handleFinish = () => {
    let multiplier = 0.5;
    if (reactionTime) {
      if (reactionTime < eliteThreshold) multiplier = 4.0;
      else if (reactionTime < eliteThreshold + 150) multiplier = 2.5;
      else if (reactionTime < eliteThreshold + 350) multiplier = 1.2;
      else multiplier = 0.8;
    }
    if (gameState === 'too-soon') multiplier = 0.2;
    onComplete(multiplier);
  };

  return (
    <div
      onMouseDown={handleClick}
      className={`fixed inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 border-[16px] ${
        gameState === 'waiting' ? 'bg-slate-950 border-slate-900' :
        gameState === 'ready' ? 'bg-emerald-600 border-emerald-400' :
        gameState === 'too-soon' ? 'bg-red-600 border-red-400' :
        'bg-blue-600 border-blue-400'
      } z-[100] p-6`}
    >
      <div className="text-white text-center pointer-events-none max-w-sm">
        <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            key={gameState}
        >
            <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter italic drop-shadow-2xl">
            {gameState === 'waiting' ? 'STAND BY...' :
            gameState === 'ready' ? 'REFLEX!' :
            gameState === 'too-soon' ? 'EARLY!' : 'LOCKED!'}
            </h2>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-8">SESSION LEVEL {level}</div>
        </motion.div>

        <div className="h-24 flex items-center justify-center">
            <AnimatePresence mode="wait">
            {reactionTime ? (
                <motion.div
                    key="time"
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-7xl font-black font-mono tracking-tighter drop-shadow-xl">{reactionTime}ms</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white mt-4 bg-black/20 px-4 py-1 rounded-full border border-white/10">
                        {reactionTime < eliteThreshold ? 'ELITE REFLEXES' : reactionTime < eliteThreshold + 150 ? 'GREAT SPEED' : 'AVERAGE'}
                    </div>
                </motion.div>
            ) : gameState === 'too-soon' ? (
                <motion.div
                    key="fail"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-black uppercase"
                >
                    ANTICIPATED SIGNAL
                </motion.div>
            ) : gameState === 'waiting' ? (
                <motion.div
                    key="wait"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-6xl"
                >
                    🛑
                </motion.div>
            ) : (
                <motion.div
                    key="go"
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.15 }}
                    className="text-8xl drop-shadow-2xl"
                >
                    ⚡
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        <p className="mt-16 text-xs font-black uppercase tracking-[0.2em] text-white/50">
          {gameState === 'waiting' ? 'TAP IMMEDIATELY ON COLOR CHANGE' :
           gameState === 'clicked' || gameState === 'too-soon' ? 'PROCEED TO RESULTS' : ''}
        </p>
      </div>

      {(gameState === 'clicked' || gameState === 'too-soon') && (
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onMouseDown={(e) => { e.stopPropagation(); handleFinish(); }}
          className="absolute bottom-12 w-full max-w-xs py-6 bg-white text-black font-black rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all border-b-8 border-slate-300 uppercase tracking-widest text-2xl italic"
        >
          CONTINUE
        </motion.button>
      )}
    </div>
  );
};
