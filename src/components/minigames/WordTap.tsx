import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface Word {
  id: number;
  text: string;
  isGood: boolean;
  x: number;
  y: number;
  speed: number;
}

const GOOD_WORDS = ['VIRAL', 'TRENDING', 'EPIC', 'MUST-READ', 'SHOCKING', 'EXCLUSIVE', 'LEAKED', 'HYPE', 'BREAKING', 'MASTERMIND'];
const BAD_WORDS = ['BORING', 'LAME', 'OLD', 'REPOST', 'AD', 'SPAM', 'FAKE', 'TRASH', 'EXPOSED', 'SCANDAL'];

interface WordTapProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const WordTap: React.FC<WordTapProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(200, (800 - (level - 1) * 100) / spawnFactor);
  const minSpeed = (0.5 + (level - 1) * 0.2) * Math.sqrt(scaling);
  const maxSpeed = (2.0 + (level - 1) * 0.5) * Math.sqrt(scaling);
  const targetScore = Math.floor((10 + (level - 1) * 5) * spawnFactor);

  const endGame = useCallback(() => {
    setGameActive(false);
    let multiplier = 0.5;
    if (score >= targetScore) multiplier = 4.0;
    else if (score >= targetScore * 0.7) multiplier = 2.5;
    else if (score >= targetScore * 0.4) multiplier = 1.2;
    else multiplier = 0.8;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, onComplete, targetScore]);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameActive, endGame]);

  useEffect(() => {
    if (!gameActive) return;
    const spawnTimer = setInterval(() => {
      const isGood = Math.random() > (0.3 + (level - 1) * 0.05);
      const text = isGood
        ? GOOD_WORDS[Math.floor(Math.random() * GOOD_WORDS.length)]
        : BAD_WORDS[Math.floor(Math.random() * BAD_WORDS.length)];

      const newWord: Word = {
        id: nextId.current++,
        text,
        isGood,
        x: 15 + Math.random() * 70,
        y: 100,
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed)
      };
      setWords(prev => [...prev, newWord]);
    }, spawnRate);

    return () => clearInterval(spawnTimer);
  }, [gameActive, level, spawnRate, minSpeed, maxSpeed]);

  useEffect(() => {
    if (!gameActive) return;
    const moveInterval = setInterval(() => {
      setWords(prev => {
        return prev
          .map(w => ({ ...w, y: w.y - w.speed }))
          .filter(w => w.y > -10);
      });
    }, 20);
    return () => clearInterval(moveInterval);
  }, [gameActive]);

  const handleTap = (id: number, isGood: boolean) => {
    if (!gameActive) return;
    if (isGood) {
      setScore(s => s + 1);
      setFeedback('hit');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setScore(s => Math.max(0, s - 3));
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTimeout(() => setFeedback(null), 200);
    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div
      ref={gameRef}
      className={`transition-colors duration-200 bg-slate-950 p-6 rounded-3xl border-4 text-center select-none touch-none h-96 flex flex-col items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-blue-400/30'
      }`}
    >
      <div className="absolute top-4 flex justify-between w-full px-8 z-10 items-end">
        <div className="flex flex-col items-start">
            <h2 className="text-xl font-black text-blue-400 italic tracking-tighter uppercase drop-shadow-lg">PR CAMPAIGN <span className="text-white text-xs">L{level}</span></h2>
            <div className="text-2xl text-emerald-400 font-mono font-black tabular-nums">HYPE: {score}</div>
        </div>
        <div className="flex flex-col items-end">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">SESSION TIME</div>
            <div className="text-lg text-white font-mono font-black bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                {timeLeft.toFixed(1)}s
            </div>
        </div>
      </div>

      <div className="relative w-full h-full mt-20">
        <AnimatePresence>
            {words.map(word => (
            <motion.button
                key={word.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                onPointerDown={() => handleTap(word.id, word.isGood)}
                className={`absolute px-5 py-2.5 rounded-xl text-xs font-black shadow-2xl border-t-2 transition-transform active:scale-75 ${
                word.isGood ? 'bg-emerald-500 text-black border-emerald-300' : 'bg-red-600 text-white border-red-400'
                }`}
                style={{ left: `${word.x}%`, top: `${word.y}%`, x: '-50%' }}
            >
                {word.text}
            </motion.button>
            ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 w-full flex flex-col items-center gap-2 px-8">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="text-emerald-500">TAP GREEN</span>
            <span className="text-slate-700">|</span>
            <span className="text-red-500">AVOID RED</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
            />
        </div>
        <div className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1">
            GOAL: {targetScore} HYPE POINTS
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8 text-center"
            >
                <div className="text-8xl mb-6 drop-shadow-2xl">📢</div>
                <div className="text-4xl font-black text-white italic tracking-tighter uppercase">CAMPAIGN COMPLETE</div>
                <div className="text-blue-400 font-black font-mono text-3xl mt-4 drop-shadow-xl">{score} HYPE SECURED</div>
                <div className="text-slate-500 text-[10px] font-black mt-6 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                    TARGET WAS {targetScore}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
