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

const PR_GOOD_WORDS = ['VIRAL', 'TRENDING', 'EPIC', 'MUST-READ', 'EXCLUSIVE', 'HYPE', 'BREAKING', 'GOODWILL', 'SPIN', 'PRAISE'];
const PR_BAD_WORDS = ['BORING', 'LAME', 'OLD', 'SPAM', 'FAKE', 'TRASH', 'EXPOSED', 'SCANDAL', 'LEAK', 'BACKLASH'];

const PSYCH_GOOD_WORDS = ['CLARITY', 'BALANCE', 'FOCUS', 'PEACE', 'RESILIENCE', 'MINDFUL', 'RECOVERY', 'GROUNDED', 'HARMONY', 'INSIGHT'];
const PSYCH_BAD_WORDS = ['BURNOUT', 'PANIC', 'CHAOS', 'ANXIETY', 'PARANOIA', 'FATIGUE', 'ISOLATION', 'DELUSION', 'STRESS', 'STAGNATION'];

interface WordTapProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instructions?: string;
}

export const WordTap: React.FC<WordTapProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title,
  instructions
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  const isPsychiatrist = tier === 'ELITE' || (title && title.toLowerCase().includes('psychiatrist'));

  const goodWordsPool = isPsychiatrist ? PSYCH_GOOD_WORDS : PR_GOOD_WORDS;
  const badWordsPool = isPsychiatrist ? PSYCH_BAD_WORDS : PR_BAD_WORDS;

  const displayTitle = title || (isPsychiatrist ? 'PSYCHIATRIST MENTAL INTEGRATION' : 'PR CAMPAIGN PRESS RELEASE');
  const displayInstructions = instructions || (isPsychiatrist ? 'Tap therapeutic focus thoughts while ignoring intrusive stress words' : 'Tap viral buzzwords and avoid scandal leaks');

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(200, (800 - (level - 1) * 100) / spawnFactor);
  const minSpeed = (0.5 + (level - 1) * 0.2) * Math.sqrt(scaling);
  const maxSpeed = (2.0 + (level - 1) * 0.5) * Math.sqrt(scaling);
  const targetScore = Math.floor((10 + (level - 1) * 5) * spawnFactor);

  const calculatedMultiplier = Math.max(0.2, Math.min(3.5, Number(((score / Math.max(1, targetScore)) * 2.5).toFixed(2))));

  const endGame = useCallback(() => {
    setGameActive(false);
    setTimeout(() => onComplete(calculatedMultiplier), 1500);
  }, [calculatedMultiplier, onComplete]);

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
        ? goodWordsPool[Math.floor(Math.random() * goodWordsPool.length)]
        : badWordsPool[Math.floor(Math.random() * badWordsPool.length)];

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
  }, [gameActive, level, spawnRate, minSpeed, maxSpeed, goodWordsPool, badWordsPool]);

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

  const handleTap = (id: number, isGood: boolean, e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!gameActive) return;
    if (isGood) {
      setScore(s => s + 1);
      setFeedback('hit');
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(20);
      }
    } else {
      setScore(s => Math.max(0, s - 3));
      setFeedback('miss');
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([30, 30]);
      }
    }
    setTimeout(() => setFeedback(null), 200);
    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div
      ref={gameRef}
      className={`transition-colors duration-200 bg-slate-950 p-4 rounded-3xl border-4 text-center select-none touch-none min-h-[400px] flex flex-col items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-blue-400/30'
      }`}
    >
      <div className="absolute top-3 flex justify-between w-full px-4 z-10 items-end">
        <div className="flex flex-col items-start">
          <h2 className="text-lg font-black text-blue-400 italic tracking-tighter uppercase drop-shadow-lg">
            {displayTitle} <span className="text-white text-xs">L{level}</span>
          </h2>
          <div className="text-[9px] text-slate-400 font-medium italic">{displayInstructions}</div>
          <div className="text-xl text-emerald-400 font-mono font-black tabular-nums">SCORE: {score}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">TIME REMAINING</div>
          <div className="text-base text-white font-mono font-black bg-slate-900 px-2.5 py-0.5 rounded-xl border border-slate-800">
            {timeLeft.toFixed(1)}s
          </div>
        </div>
      </div>

      <div className="relative w-full flex-1 my-12">
        <AnimatePresence>
          {words.map(word => (
            <motion.button
              key={word.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              onPointerDown={(e) => handleTap(word.id, word.isGood, e)}
              onTouchStart={(e) => handleTap(word.id, word.isGood, e)}
              className={`absolute px-4 py-2 rounded-xl text-xs font-black shadow-2xl border-t-2 transition-transform active:scale-75 touch-manipulation ${
                word.isGood ? 'bg-emerald-500 text-black border-emerald-300' : 'bg-red-600 text-white border-red-400'
              }`}
              style={{ left: `${word.x}%`, top: `${word.y}%`, x: '-50%' }}
            >
              {word.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full flex flex-col items-center gap-1.5 px-4 mt-auto mb-2">
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
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
        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
          GOAL: {targetScore} SCORE | YIELD: {calculatedMultiplier.toFixed(2)}x
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center z-30 p-6 text-center"
          >
            <div className="text-5xl mb-2 drop-shadow-2xl">{isPsychiatrist ? '🧠' : '📢'}</div>
            <div className="text-xl font-black text-white italic tracking-tighter uppercase">SESSION CONCLUDED</div>
            <div className="text-blue-400 font-black font-mono text-xl mt-1 drop-shadow-xl">{score} SCORE SECURED</div>
            <div className="text-emerald-400 font-mono text-sm font-bold mt-1">YIELD MULTIPLIER: {calculatedMultiplier.toFixed(2)}x</div>

            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-xs text-left">
              <div className="text-[9px] text-amber-400 font-black uppercase tracking-wider mb-1">ANALYSIS:</div>
              <p className="text-[10px] text-slate-300 leading-tight">
                {score === 0
                  ? 'Zero positive anchors logged.'
                  : score < targetScore
                  ? 'Intrusive distraction words degraded overall session output.'
                  : 'Flawless mental focus and prompt execution achieved.'}
              </p>
              <div className="text-[9px] text-indigo-300 font-bold mt-2">
                💡 TIP: Filter out red negative triggers early to protect score multipliers.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
