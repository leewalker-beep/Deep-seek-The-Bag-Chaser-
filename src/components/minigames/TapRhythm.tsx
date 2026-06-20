import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapRhythmProps {
  level?: number;
  onComplete: (multiplier: number) => void;
  title?: string;
  instruction?: string;
  icon?: string;
}

export const TapRhythm: React.FC<TapRhythmProps> = ({
  level = 1,
  onComplete,
  title = "PODCAST SESSION",
  instruction = "TAP ON THE BEAT",
  icon = "🎙️"
}) => {
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [beats, setBeats] = useState<{ id: number; offset: number; type: 'normal' | 'drop' }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);

  // Scaling: 8 to 16 beats
  const TOTAL_BEATS = 8 + (level * 2);
  const MAX_DURATION = 40000;

  useEffect(() => {
    // Scaling: 0 to 3 drops
    const dropsCount = Math.min(3, level - 1);

    // Generate intervals based on beat count
    const intervals = Array.from({ length: TOTAL_BEATS }, (_, i) => 1500 + i * 1500);

    // Randomly assign drops
    const dropIndices = new Set<number>();
    while (dropIndices.size < dropsCount) {
        dropIndices.add(Math.floor(Math.random() * TOTAL_BEATS));
    }

    const timers = intervals.map((ms, idx) => {
      return setTimeout(() => {
        if (!isGameOver) {
          setBeats(prev => [...prev, {
              id: nextId.current++,
              offset: 100,
              type: dropIndices.has(idx) ? 'drop' : 'normal'
          }]);
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
  }, [isGameOver, hits, totalAttempts, level, TOTAL_BEATS]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        // Speed scales with level
        const speed = 1.2 + (level * 0.4);
        const next = prev.map(b => ({ ...b, offset: b.offset - speed }));
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
  }, [hits, totalAttempts, isGameOver, level, TOTAL_BEATS]);

  const handleGameOver = (finalHits: number, finalAttempts: number) => {
    if (isGameOver) return;
    setIsGameOver(true);

    const accuracy = finalAttempts > 0 ? finalHits / finalAttempts : 0;
    let multiplier = 0.8;
    if (accuracy >= 0.9) multiplier = 3.0; // Buffed reward
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
      onPointerDown={handleTap}
      className={`transition-colors duration-200 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none min-h-[350px] flex flex-col justify-center items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-blue-900/50'
      }`}
    >
      <div className="absolute top-8 w-full text-center z-20">
        <h2 className="text-2xl font-black text-blue-400 italic tracking-tighter uppercase">{title}</h2>
        <div className="text-[10px] text-slate-500 uppercase font-black mt-2 tracking-widest">
          BEAT ACCURACY: {hits}/{TOTAL_BEATS}
        </div>
      </div>

      <div className="w-full h-20 bg-slate-950 relative rounded-2xl border-2 border-slate-800 shadow-inner overflow-hidden mt-8">
        {/* Target Zone */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[10%] bg-blue-500/10 border-x-2 border-blue-400/30 z-0">
           <motion.div
             animate={{ opacity: [0.1, 0.3, 0.1] }}
             transition={{ repeat: Infinity, duration: 1 }}
             className="w-full h-full bg-blue-400/10"
           />
        </div>

        {/* Moving Beats */}
        <AnimatePresence>
          {beats.map(beat => (
            <motion.div
              key={beat.id}
              exit={{ scale: 1.5, opacity: 0 }}
              className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-2xl z-10 flex items-center justify-center text-2xl transition-colors ${
                  beat.type === 'drop' ? 'bg-red-500 border-2 border-red-300' : 'bg-white'
              }`}
              style={{ left: `${beat.offset}%` }}
            >
              {beat.type === 'drop' ? '💥' : icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="text-[10px] text-blue-400 font-mono font-bold tracking-widest animate-pulse bg-blue-400/5 px-4 py-1 rounded-full border border-blue-400/20">
          90%+ ACCURACY = 3X YIELD
        </div>
        <div className="flex items-center gap-3 text-slate-400">
           <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-xl">👆</motion.div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{instruction}</span>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className={`absolute font-black text-5xl italic z-30 drop-shadow-lg ${feedback === 'hit' ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {feedback === 'hit' ? 'PERFECT!' : 'MISS!'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
        <div className="text-[40px] font-black italic">LVL {level}</div>
      </div>
    </div>
  );
};
