import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  id: number;
  text: string;
  isGood: boolean;
  x: number;
  y: number;
  speed: number;
}

const GOOD_WORDS = ['VIRAL', 'TRENDING', 'EPIC', 'MUST-READ', 'SHOCKING', 'EXCLUSIVE', 'LEAKED', 'HYPE'];
const BAD_WORDS = ['BORING', 'LAME', 'OLD', 'REPOST', 'AD', 'SPAM', 'FAKE', 'TRASH'];

interface WordTapProps {
  onComplete: (multiplier: number) => void;
}

export const WordTap: React.FC<WordTapProps> = ({ onComplete }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const nextId = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  const endGame = useCallback(() => {
    setGameActive(false);
    let multiplier = 0.5;
    if (score >= 10) multiplier = 3.0;
    else if (score >= 7) multiplier = 2.0;
    else if (score >= 4) multiplier = 1.2;
    else multiplier = 0.8;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, onComplete]);

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
      const isGood = Math.random() > 0.4;
      const text = isGood
        ? GOOD_WORDS[Math.floor(Math.random() * GOOD_WORDS.length)]
        : BAD_WORDS[Math.floor(Math.random() * BAD_WORDS.length)];

      const newWord: Word = {
        id: nextId.current++,
        text,
        isGood,
        x: 15 + Math.random() * 70,
        y: 100,
        speed: 0.5 + Math.random() * 1.5
      };
      setWords(prev => [...prev, newWord]);
    }, 800);

    return () => clearInterval(spawnTimer);
  }, [gameActive]);

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
      setScore(s => Math.max(0, s - 2));
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTimeout(() => setFeedback(null), 200);
    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div
      ref={gameRef}
      className={`transition-colors duration-200 bg-slate-900 p-6 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col items-center relative overflow-hidden ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-blue-400/30'
      }`}
    >
      <div className="absolute top-4 flex justify-between w-full px-8 z-10">
        <div className="flex flex-col items-start">
            <h2 className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">PR HEADLINE CRAFTER</h2>
            <div className="text-[12px] text-emerald-400 font-mono font-black">HYPE: {score}</div>
        </div>
        <div className="text-sm text-white font-mono font-black bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {timeLeft.toFixed(1)}s
        </div>
      </div>

      <div className="relative w-full h-full mt-10">
        <AnimatePresence>
            {words.map(word => (
            <motion.button
                key={word.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                onClick={() => handleTap(word.id, word.isGood)}
                className={`absolute px-4 py-2 rounded-xl text-xs font-black shadow-xl border-t-2 transition-transform active:scale-75 ${
                word.isGood ? 'bg-emerald-500 text-black border-emerald-300' : 'bg-red-500 text-white border-red-300'
                }`}
                style={{ left: `${word.x}%`, top: `${word.y}%`, transform: 'translateX(-50%)' }}
            >
                {word.text}
            </motion.button>
            ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 w-full flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase">
            <span className="text-emerald-500">TAP GREEN</span>
            <span>•</span>
            <span className="text-red-500">AVOID RED</span>
        </div>
        <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
            />
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
            >
                <div className="text-6xl mb-4">📢</div>
                <div className="text-2xl font-black text-white italic tracking-tighter uppercase">CAMPAIGN ENDED</div>
                <div className="text-blue-400 font-black font-mono mt-2">TOTAL HYPE: {score}</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
