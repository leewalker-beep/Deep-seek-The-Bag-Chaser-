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
  { id: 11, label: 'Clickbait Mystery Box', isViral: true },
  { id: 12, label: 'Terms & Conditions Reading', isViral: false },
];

interface ContentCreationProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const ContentCreation: React.FC<ContentCreationProps> = ({ onComplete, level = 1 }) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Difficulty scaling
  const timePerTopic = Math.max(1.0, 3.0 - (level - 1) * 0.5);
  const totalTopics = 10 + (level * 2);
  const swipeThreshold = 80;

  const [shuffledTopics] = useState(() => {
    const shuffled = [...TOPICS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Repeat topics if needed for higher levels
    let finalTopics = shuffled;
    while (finalTopics.length < totalTopics) {
        finalTopics = [...finalTopics, ...shuffled];
    }
    return finalTopics.slice(0, totalTopics);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;
    let multiplier = 0.5;
    if (accuracy >= 0.9) multiplier = 4.0;
    else if (accuracy >= 0.7) multiplier = 2.5;
    else if (accuracy >= 0.5) multiplier = 1.2;
    else multiplier = 0.8;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, total, onComplete]);

  const handleTimeout = useCallback(() => {
    if (!gameActive || result !== null) return;
    setResult('wrong');
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    setTotal(t => t + 1);
    setTimeout(() => setTopicIndex(i => i + 1), 300);
  }, [gameActive, result]);

  useEffect(() => {
    if (topicIndex < shuffledTopics.length && gameActive) {
      setCurrentTopic(shuffledTopics[topicIndex]);
      setResult(null);
      setOffsetY(0);
      setTimeLeft(timePerTopic);

      if (timerRef.current) clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, timePerTopic - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
        }
      }, 50);
    } else if (topicIndex >= shuffledTopics.length && gameActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      endGame();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [topicIndex, shuffledTopics, gameActive, endGame, timePerTopic, handleTimeout]);

  const handleAction = (isPost: boolean) => {
    if (!gameActive || !currentTopic || result !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Viral items should be posted (swiped up), non-viral declined (swiped down)
    const isCorrect = (isPost && currentTopic.isViral) || (!isPost && !currentTopic.isViral);

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
    }, 300);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const diff = e.targetTouches[0].clientY - touchStart.current;
      setOffsetY(diff);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStart.current;

    if (diff < -swipeThreshold) {
      handleAction(true); // Swipe Up = Post
    } else if (diff > swipeThreshold) {
      handleAction(false); // Swipe Down = Decline
    } else {
      setOffsetY(0);
    }
    touchStart.current = null;
  };

  return (
    <div className={`bg-slate-950 p-6 rounded-3xl border-4 transition-colors duration-200 text-center select-none touch-none h-96 flex flex-col justify-center items-center relative overflow-hidden ${
      result === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
      result === 'wrong' ? 'border-red-500 bg-red-950/20' :
      'border-purple-500/30'
    }`}>
      <div className="absolute top-6 text-center z-20 w-full">
        <h2 className="text-2xl font-black text-purple-400 italic tracking-tighter">CONTENT CREATOR <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          VIRAL ACCURACY: {score}/{total}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentTopic && gameActive && (
          <motion.div
            key={topicIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: offsetY }}
            exit={{ y: offsetY < -swipeThreshold ? -500 : offsetY > swipeThreshold ? 500 : 0, opacity: 0 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`w-full max-w-[240px] aspect-[3/4] bg-slate-800 rounded-2xl border-4 flex flex-col items-center justify-center p-6 transition-all shadow-2xl relative ${
              result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
              result === 'wrong' ? 'border-red-500 bg-red-500/10' :
              'border-slate-700'
            }`}
          >
            {/* Feedback Overlays */}
            {offsetY < -40 && (
                <div className="absolute top-4 font-black text-emerald-400 text-xl rotate-[-10deg]">POST IT!</div>
            )}
            {offsetY > 40 && (
                <div className="absolute bottom-4 font-black text-red-400 text-xl rotate-[10deg]">DECLINE</div>
            )}

            <div className="text-6xl mb-4">{currentTopic.isViral ? '🔥' : '📄'}</div>
            <div className="text-lg font-black text-white leading-tight mb-4">{currentTopic.label}</div>

            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700 mb-2">
                <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / timePerTopic) * 100}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                />
            </div>

            <div className="absolute bottom-4 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                {topicIndex + 1} / {totalTopics}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 w-full flex justify-around px-6 opacity-30 pointer-events-none">
           <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">⬆️</span>
              <span className="text-[8px] font-black text-emerald-400 uppercase">POST VIRAL</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">⬇️</span>
              <span className="text-[8px] font-black text-red-400 uppercase">DECLINE TRASH</span>
           </div>
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-10 p-6">
          <div className="text-6xl mb-4">📈</div>
          <div className="text-3xl font-black text-white italic uppercase tracking-tighter">FEED UPDATED</div>
          <div className="text-emerald-500 font-black font-mono text-xl mt-2">{score}/{total} VIRAL SUCCESS</div>
        </div>
      )}
    </div>
  );
};
