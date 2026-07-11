import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
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

  // Difficulty scaling
  const TOTAL_BEATS = 5 + (level * 3); // Level 1 only requires 8 hits now (down from 15)
  const baseSpeed = (1.5 + (level * 0.4)) * Math.sqrt(scaling);
  const MAX_DURATION = 30000;

  // L4+ has tighter window
  const hitWindowWidth = level >= 4 ? 16 : 24;
  const targetRange = [20 - hitWindowWidth / 2, 20 + hitWindowWidth / 2];

  useEffect(() => {
    // Generate beats based on level and tier
    const beatsToGenerate = TOTAL_BEATS;
    const intervals: number[] = [];
    let currentMs = 1500;

    for (let i = 0; i < beatsToGenerate; i++) {
        intervals.push(currentMs);
        // Randomize interval between beats - tighter intervals at higher difficulty
        const minGap = Math.max(300, 1200 - (level * 150));
        currentMs += minGap + Math.random() * (800 / level);
    }

    const timers = intervals.map((ms, _index) => {
      return setTimeout(() => {
        if (!isGameOver) {
          // Higher levels have "drops" or "fast" beats
          let type: 'normal' | 'fast' | 'drop' = 'normal';
          if (level >= 2 && Math.random() < 0.15 * (level - 1)) {
            type = level >= 3 && Math.random() < 0.4 ? 'drop' : 'fast';
          }
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
  }, [isGameOver, hits, totalAttempts, level, TOTAL_BEATS]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        const next = prev.map(b => {
            let speed = b.type === 'fast' ? baseSpeed * 1.6 : baseSpeed;
            // Drops suddenly speed up when they hit 50%
            if (b.type === 'drop' && b.offset < 50) speed = baseSpeed * 2.5;

            return {
                ...b,
                offset: b.offset - speed
            };
        });
        const missed = next.filter(b => b.offset < 0);

        if (missed.length > 0) {
          setTotalAttempts(t => {
            const newTotal = t + missed.length;
            if (newTotal >= TOTAL_BEATS) {
                handleGameOver(hits, newTotal);
            }
            return newTotal;
          });
          setFeedback('miss');
          setTimeout(() => setFeedback(null), 200);
          if (navigator.vibrate) navigator.vibrate([30, 30]);
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
    let base = 0.5;
    if (accuracy >= 0.9) base = 4.0;
    else if (accuracy >= 0.7) base = 2.5;
    else if (accuracy >= 0.5) base = 1.2;

    const multiplier = base * (0.8 + scaling * 0.2);
    onComplete(multiplier);
  };

  const handleTap = (e: React.PointerEvent) => {
    if (isGameOver) return;
    e.stopPropagation();
    e.preventDefault();

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
      onPointerDown={handleTap}
      className={`transition-colors duration-200 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800'
      }`}
    >
      {/* 1. HEADER SECTION (with clean padding-bottom, explicit block separation, and z-10) */}
      <div className="text-center flex flex-col items-center gap-1 mb-4 relative z-10">
        <h1 className="text-xl font-black italic tracking-wider text-blue-400">{title} L{level}</h1>
        <div className="bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800/60 text-[11px] font-mono text-slate-300">
          ⚡ TRACK PROFILE: <span className="text-emerald-400 font-bold">{hits}</span> / <span className="text-slate-500">{TOTAL_BEATS}</span>
        </div>
      </div>

      <div className="w-full h-24 bg-slate-800 relative rounded-2xl border-2 border-slate-700 shadow-inner overflow-hidden flex items-center">
        {/* Target Zone */}
        <div
            className="absolute top-0 bottom-0 bg-blue-500/20 border-x-4 border-blue-400/50 z-0 transition-all duration-300"
            style={{ left: `${targetRange[0]}%`, width: `${hitWindowWidth}%` }}
        >
           <motion.div
             animate={{ opacity: [0.2, 0.5, 0.2] }}
             transition={{ repeat: Infinity, duration: 1 }}
             className="w-full h-full bg-blue-400/20"
           />
           {level >= 4 && <div className="absolute inset-0 flex items-center justify-center text-[8px] text-blue-300 font-black uppercase opacity-40">TIGHT</div>}
        </div>

        {/* Moving Beats */}
        <AnimatePresence>
          {beats.map(beat => (
            <motion.div
              key={beat.id}
              exit={{ scale: 2, opacity: 0 }}
              className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10 flex items-center justify-center text-2xl border-2 ${
                  beat.type === 'fast' ? 'bg-orange-500 border-orange-300' :
                  beat.type === 'drop' ? 'bg-purple-600 border-purple-400 animate-pulse' :
                  'bg-white border-blue-200'
              }`}
              style={{ left: `${beat.offset}%` }}
            >
              {beat.type === 'drop' ? '⚡' : icon}
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
