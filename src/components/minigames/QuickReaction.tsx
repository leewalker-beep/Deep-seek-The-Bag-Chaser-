import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickReactionProps {
  onComplete: (multiplier: number) => void;
}

export const QuickReaction: React.FC<QuickReactionProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  useEffect(() => {
    if (gameState === 'waiting') {
      const timeout = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
      }, 1000 + Math.random() * 3000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  const handleClick = () => {
    if (gameState === 'waiting') {
      setGameState('too-soon');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('clicked');
    }
  };

  const handleFinish = () => {
    let multiplier = 0.5;
    if (reactionTime) {
      if (reactionTime < 250) multiplier = 3.0;
      else if (reactionTime < 400) multiplier = 2.0;
      else if (reactionTime < 600) multiplier = 1.0;
      else multiplier = 0.7;
    }
    if (gameState === 'too-soon') multiplier = 0.3;
    onComplete(multiplier);
  };

  return (
    <div
      onClick={handleClick}
      className={`h-[400px] w-full rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
        gameState === 'waiting' ? 'bg-slate-900 border-4 border-slate-800' :
        gameState === 'ready' ? 'bg-emerald-500' :
        gameState === 'too-soon' ? 'bg-red-500' : 'bg-blue-600'
      }`}
    >
      <div className="text-white text-center p-6 pointer-events-none">
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">
          {gameState === 'waiting' ? 'WAIT FOR IT...' :
           gameState === 'ready' ? 'GO! GO! GO!' :
           gameState === 'too-soon' ? 'TOO SOON!' : 'NICE WORK!'}
        </h2>

        <AnimatePresence>
          {reactionTime && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-mono font-bold"
            >
              {reactionTime}ms
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 text-sm opacity-80">
          {gameState === 'waiting' ? 'Tap as soon as the screen turns GREEN' :
           gameState === 'clicked' || gameState === 'too-soon' ? 'Tap below to finish' : ''}
        </p>
      </div>

      {(gameState === 'clicked' || gameState === 'too-soon') && (
        <button
          onClick={(e) => { e.stopPropagation(); handleFinish(); }}
          className="mt-8 px-8 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-transform"
        >
          CONTINUE
        </button>
      )}
    </div>
  );
};
