import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapRhythmProps {
  onComplete: (multiplier: number) => void;
}

export const TapRhythm: React.FC<TapRhythmProps> = ({ onComplete }) => {
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [beats, setBeats] = useState<{ id: number; offset: number }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);
  const TOTAL_BEATS = 8;
  const MAX_DURATION = 30000; // 30 seconds

  useEffect(() => {
    // Generate beats with some random spacing but ensuring exactly TOTAL_BEATS
    const intervals = [1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000];

    const timers = intervals.map((ms) => {
      return setTimeout(() => {
        if (!isGameOver) {
          setBeats(prev => [...prev, { id: nextId.current++, offset: 100 }]);
        }
      }, ms);
    });

    const timeoutTimer = setTimeout(() => {
      if (!isGameOver) {
        handleGameOver(hits, totalAttempts);
      }
    }, MAX_DURATION);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(timeoutTimer);
    };
  }, [isGameOver, hits, totalAttempts]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        const next = prev.map(b => ({ ...b, offset: b.offset - 1.5 }));
        const missed = next.filter(b => b.offset < 0);

        if (missed.length > 0) {
          const newTotal = totalAttempts + missed.length;
          setTotalAttempts(newTotal);
          setFeedback('miss');
          setTimeout(() => setFeedback(null), 200);
          if (newTotal >= TOTAL_BEATS) {
            handleGameOver(hits, newTotal);
          }
        }

        return next.filter(b => b.offset >= 0);
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [hits, totalAttempts, isGameOver]);

  const handleGameOver = (finalHits: number, finalAttempts: number) => {
    if (isGameOver) return;
    setIsGameOver(true);

    const accuracy = finalAttempts > 0 ? finalHits / finalAttempts : 0;
    let multiplier = 0.8;
    if (accuracy >= 0.9) multiplier = 2.0;
    else if (accuracy >= 0.7) multiplier = 1.5;

    onComplete(multiplier);
  };

  const handleTap = () => {
    if (isGameOver) return;

    const targetRange = [10, 25]; // Target is between 10% and 25% from left
    const hitIndex = beats.findIndex(b => b.offset >= targetRange[0] && b.offset <= targetRange[1]);

    if (hitIndex !== -1) {
      setHits(h => h + 1);
      setBeats(prev => prev.filter((_, i) => i !== hitIndex));
      setFeedback('hit');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    const newTotal = totalAttempts + 1;
    setTotalAttempts(newTotal);

    setTimeout(() => setFeedback(null), 200);

    if (newTotal >= TOTAL_BEATS) {
      handleGameOver(hitIndex !== -1 ? hits + 1 : hits, newTotal);
    }
  };

  return (
    <div
      onClick={handleTap}
      className={`transition-colors duration-200 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none h-72 flex flex-col justify-center items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800'
      }`}
    >
      <div className="absolute top-6 w-full text-center">
        <h2 className="text-xl font-black text-blue-400 italic tracking-tighter">PODCAST SESSION</h2>
        <div className="text-[10px] text-slate-500 uppercase font-black mt-1">
          PERFECT BEATS: {hits}/{TOTAL_BEATS}
        </div>
      </div>

      <div className="w-full h-16 bg-slate-800 relative rounded-2xl border-2 border-slate-700 shadow-inner overflow-hidden">
        {/* Target Zone */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[10%] bg-blue-500/20 border-x-2 border-blue-400/50 z-0">
           <motion.div
             animate={{ opacity: [0.2, 0.5, 0.2] }}
             transition={{ repeat: Infinity, duration: 1 }}
             className="w-full h-full bg-blue-400/20"
           />
        </div>

        {/* Moving Beats */}
        <AnimatePresence>
          {beats.map(beat => (
            <motion.div
              key={beat.id}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] z-10 flex items-center justify-center text-xl"
              style={{ left: `${beat.offset}%` }}
            >
              🎙️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="text-[10px] text-blue-400 font-mono font-bold tracking-widest animate-pulse">
          90%+ ACCURACY = 2X YIELD
        </div>
        <div className="flex items-center gap-2 text-slate-500">
           <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>👆</motion.span>
           <span className="text-[10px] font-black uppercase tracking-widest">TAP ON THE BEAT</span>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className={`absolute font-black text-4xl italic z-20 ${feedback === 'hit' ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {feedback === 'hit' ? 'GREAT!' : 'MISS!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
