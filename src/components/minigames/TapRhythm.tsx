import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface TapRhythmProps {
  onComplete: (multiplier: number) => void;
  title?: string;
  instruction?: string;
  icon?: string;
  level?: number;
  tier?: Tier;
}

export const TapRhythm: React.FC<TapRhythmProps> = ({
  onComplete,
  title = "PODCAST SESSION",
  instruction = "TAP ON THE BEAT",
  icon = "🎙️",
  level = 1,
  tier = 'MUD'
}) => {
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [beats, setBeats] = useState<{ id: number; offset: number; type: 'normal' | 'fast' | 'drop' }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const TOTAL_BEATS = Math.floor((10 + (level * 2)) * spawnFactor);
  const baseSpeed = (1.5 + (level * 0.4)) * Math.sqrt(scaling);
  const MAX_DURATION = 30000;

  useEffect(() => {
    // Generate beats based on level and tier
    const beatsToGenerate = TOTAL_BEATS;
    const intervals: number[] = [];
    let currentMs = 1500;

    for (let i = 0; i < beatsToGenerate; i++) {
        intervals.push(currentMs);
        // Randomize interval between beats - tighter intervals at higher difficulty
        currentMs += Math.max(400, (1500 - (level * 150)) / spawnFactor) + Math.random() * (1000 / (level * spawnFactor));
    }

    const timers = intervals.map((ms, _index) => {
      return setTimeout(() => {
        if (!isGameOver) {
          // Higher levels have "drops" (sudden speed changes or different visual types)
          const fastProb = Math.min(0.8, 0.1 * level * spawnFactor);
          const type = Math.random() < fastProb ? 'fast' : 'normal';
          setBeats(prev => [...prev, { id: nextId.current++, offset: 100, type }]);
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
  }, [isGameOver, hits, totalAttempts, level, TOTAL_BEATS, spawnFactor]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        const next = prev.map(b => ({
            ...b,
            offset: b.offset - (b.type === 'fast' ? baseSpeed * 1.5 : baseSpeed)
        }));
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
  }, [hits, totalAttempts, isGameOver, baseSpeed, TOTAL_BEATS]);

  const handleGameOver = (finalHits: number, finalAttempts: number) => {
    if (isGameOver) return;
    setIsGameOver(true);

    const accuracy = finalAttempts > 0 ? finalHits / finalAttempts : 0;
    let multiplier = 0.5;
    if (accuracy >= 0.9) multiplier = 4.0;
    else if (accuracy >= 0.7) multiplier = 2.5;
    else if (accuracy >= 0.5) multiplier = 1.2;

    onComplete(multiplier);
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isGameOver) return;
    e.stopPropagation();

    const targetRange = [10, 25]; // Target is between 10% and 25% from left
    const hitIndex = beats.findIndex(b => b.offset >= targetRange[0] && b.offset <= targetRange[1]);

    const newTotal = totalAttempts + 1;
    let newHits = hits;

    if (hitIndex !== -1) {
      newHits = hits + 1;
      setHits(newHits);
      setBeats(prev => prev.filter((_, i) => i !== hitIndex));
      setFeedback('hit');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    setTotalAttempts(newTotal);
    setTimeout(() => setFeedback(null), 200);

    if (newTotal >= TOTAL_BEATS) {
      handleGameOver(newHits, newTotal);
    }
  };

  return (
    <div
      onMouseDown={handleTap}
      onTouchStart={handleTap}
      className={`transition-colors duration-200 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800'
      }`}
    >
      <div className="absolute top-6 w-full text-center">
        <h2 className="text-2xl font-black text-blue-400 italic tracking-tighter uppercase">{title} <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 uppercase font-black mt-1">
          RHYTHM: {hits}/{TOTAL_BEATS}
        </div>
      </div>

      <div className="w-full h-20 bg-slate-800 relative rounded-2xl border-2 border-slate-700 shadow-inner overflow-hidden flex items-center">
        {/* Target Zone */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[10%] bg-blue-500/20 border-x-4 border-blue-400/50 z-0">
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
              exit={{ scale: 2, opacity: 0 }}
              className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10 flex items-center justify-center text-2xl border-2 ${
                  beat.type === 'fast' ? 'bg-orange-500 border-orange-300' : 'bg-white border-blue-200'
              }`}
              style={{ left: `${beat.offset}%` }}
            >
              {icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">
          Match the beat for massive gains
        </div>
        <div className="flex items-center gap-2 text-slate-500">
           <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>👆</motion.span>
           <span className="text-[10px] font-black uppercase tracking-widest">{instruction}</span>
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
            {feedback === 'hit' ? 'BOOM!' : 'MISS!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
