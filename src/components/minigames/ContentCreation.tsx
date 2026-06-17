import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Topic {
  id: number;
  label: string;
  isViral: boolean;
}

const TOPICS: Topic[] = [
  { id: 1, label: 'Lofi Beats to Study To', isViral: true },
  { id: 2, label: 'Boring Meeting', isViral: false },
  { id: 3, label: 'ASMR Slime Cutting', isViral: true },
  { id: 4, label: 'Tax Returns Tutorial', isViral: false },
  { id: 5, label: 'Extreme Ironing', isViral: true },
  { id: 6, label: 'Watching Paint Dry', isViral: false },
  { id: 7, label: '100 Layers of Lipstick', isViral: true },
  { id: 8, label: 'How to Organize Socks', isViral: false },
  { id: 9, label: 'Dancing Cat in a Hat', isViral: true },
  { id: 10, label: 'Dusting the Shelves', isViral: false },
];

interface ContentCreationProps {
  onComplete: (multiplier: number) => void;
}

export const ContentCreation: React.FC<ContentCreationProps> = ({ onComplete }) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const touchStart = useRef<number | null>(null);

  const [shuffledTopics] = useState(() => {
    const shuffled = [...TOPICS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;
    let multiplier = 0.5;
    if (accuracy >= 0.8) multiplier = 3.0;
    else if (accuracy >= 0.6) multiplier = 2.0;
    else if (accuracy >= 0.4) multiplier = 1.2;
    else multiplier = 0.8;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, total, onComplete]);

  useEffect(() => {
    if (topicIndex < shuffledTopics.length && gameActive) {
      setCurrentTopic(shuffledTopics[topicIndex]);
      setResult(null);
      setOffsetY(0);
    } else if (topicIndex >= shuffledTopics.length && gameActive) {
      endGame();
    }
  }, [topicIndex, shuffledTopics, gameActive, endGame]);

  const handleAction = (isSwiped: boolean) => {
    if (!gameActive || !currentTopic || result !== null) return;

    const isCorrect = (isSwiped && currentTopic.isViral) || (!isSwiped && !currentTopic.isViral);
    if (isCorrect) {
      setScore(s => s + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(t => t + 1);

    setTimeout(() => {
      setTopicIndex(i => i + 1);
    }, 400);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const diff = e.targetTouches[0].clientY - touchStart.current;
      setOffsetY(Math.max(-150, Math.min(150, diff)));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStart.current;
    if (Math.abs(diff) > 50) {
      handleAction(true);
    } else {
      setOffsetY(0);
    }
    touchStart.current = null;
  };

  return (
    <div className={`bg-slate-900 p-6 rounded-3xl border-4 transition-colors duration-200 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden ${
      result === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
      result === 'wrong' ? 'border-red-500 bg-red-950/20' :
      'border-purple-500/30'
    }`}>
      <div className="absolute top-6 text-center z-20 w-full">
        <h2 className="text-xl font-black text-purple-400 italic tracking-tighter">CONTENT CREATION</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          VIRAL HITS: {score}/{total}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentTopic && gameActive && (
          <motion.div
            key={topicIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: offsetY }}
            exit={{ y: offsetY < -50 ? -300 : offsetY > 50 ? 300 : 0, opacity: 0 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={() => !currentTopic.isViral && handleAction(false)}
            className={`w-full max-w-[220px] aspect-video bg-slate-800 rounded-2xl border-4 flex flex-col items-center justify-center p-6 transition-all shadow-2xl ${
              result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
              result === 'wrong' ? 'border-red-500 bg-red-500/10' :
              'border-slate-700 hover:border-purple-500/50'
            }`}
          >
            <div className="text-5xl mb-3">{currentTopic.isViral ? '🔥' : '📄'}</div>
            <div className="text-sm font-black text-white leading-tight">{currentTopic.label}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 w-full flex flex-col items-center gap-2 px-6">
        <div className="flex justify-between w-full opacity-50">
           <div className="flex flex-col items-center gap-1">
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">↕️</motion.div>
              <span className="text-[8px] font-black text-purple-400 uppercase">SWIPE FOR VIRAL</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">👆</motion.div>
              <span className="text-[8px] font-black text-slate-400 uppercase">TAP TO SKIP</span>
           </div>
        </div>
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10 p-6">
          <div className="text-6xl mb-4">📈</div>
          <div className="text-2xl font-black text-white italic">FEED UPDATED</div>
          <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-2">{score}/{total} VIRAL SUCCESS</div>
        </div>
      )}
    </div>
  );
};
