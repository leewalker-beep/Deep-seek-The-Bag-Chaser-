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
        if (navigator.vibrate) navigator.vibrate(50);
      }, 1000 + Math.random() * 3000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

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
      className={`fixed inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 border-8 ${
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
            <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter italic italic drop-shadow-2xl">
            {gameState === 'waiting' ? 'STAND BY...' :
            gameState === 'ready' ? 'CLICK NOW!' :
            gameState === 'too-soon' ? 'FAIL!' : 'LOCKED IN!'}
            </h2>
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
                    <div className="text-6xl font-black font-mono tracking-tighter">{reactionTime}ms</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-2">
                        {reactionTime < 250 ? 'ELITE REFLEXES' : reactionTime < 400 ? 'GREAT SPEED' : 'AVERAGE'}
                    </div>
                </motion.div>
            ) : gameState === 'too-soon' ? (
                <motion.div
                    key="fail"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-black uppercase"
                >
                    ANTICIPATED START
                </motion.div>
            ) : gameState === 'waiting' ? (
                <motion.div
                    key="wait"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl"
                >
                    🛑
                </motion.div>
            ) : (
                <motion.div
                    key="go"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.2 }}
                    className="text-6xl"
                >
                    ⚡
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        <p className="mt-12 text-xs font-black uppercase tracking-[0.2em] text-white/50">
          {gameState === 'waiting' ? 'TAP IMMEDIATELY ON COLOR CHANGE' :
           gameState === 'clicked' || gameState === 'too-soon' ? 'PROCEED TO RESULTS' : ''}
        </p>
      </div>

      {(gameState === 'clicked' || gameState === 'too-soon') && (
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={(e) => { e.stopPropagation(); handleFinish(); }}
          className="absolute bottom-12 w-full max-w-xs py-5 bg-white text-black font-black rounded-2xl shadow-2xl active:scale-95 transition-all border-b-4 border-slate-300 uppercase tracking-widest text-xl italic"
        >
          CONTINUE
        </motion.button>
      )}
    </div>
  );
};
