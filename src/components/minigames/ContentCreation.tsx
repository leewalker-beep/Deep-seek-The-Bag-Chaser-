import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

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

interface LiveChat {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface ContentCreationProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instruction?: string;
  icon?: string;
  scoreLabel?: string;
  accentColor?: string;
}

export const ContentCreation: React.FC<ContentCreationProps> = ({
    onComplete,
    level = 1,
    tier = 'MUD',
    title = "CONTENT CREATOR",
    instruction = "VIRAL ACCURACY",
    icon = "📱",
    scoreLabel = "VIRAL ACCURACY",
    accentColor = "purple"
}) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [liveChats, setLiveChats] = useState<LiveChat[]>([]);
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const chatCounter = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Difficulty scaling
  const timePerTopic = useMemo(() => Math.max(0.8, (2.5 - (level * 0.2)) * timerFactor), [level, timerFactor]);
  const totalTopics = useMemo(() => Math.min(25, 3 + (level * 2) + Math.floor(scaling * 2)), [level, scaling]);
  const swipeThreshold = useMemo(() => Math.max(40, 80 * (1/scaling)), [scaling]);

  const [shuffledTopics] = useState(() => {
    const shuffled = [...TOPICS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let finalTopics = shuffled;
    while (finalTopics.length < totalTopics) {
        finalTopics = [...finalTopics, ...shuffled];
    }
    return finalTopics.slice(0, totalTopics);
  });

  const endGame = useCallback(() => {
    if (!gameActive) return;
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;

    let base = 0.5;
    if (accuracy >= 0.9) base = 3.0;
    else if (accuracy >= 0.7) base = 2.0;
    else if (accuracy >= 0.5) base = 1.2;
    else base = 0.8;

    const streakBonus = 1 + (Math.min(10, streak) * 0.05);
    const multiplier = base * (0.8 + scaling * 0.2) * streakBonus;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, total, onComplete, scaling, streak, gameActive]);

  const handleTimeout = useCallback(() => {
    if (!gameActive || result !== null) return;
    setResult('wrong');
    setStreak(0);
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    setTotal(t => t + 1);
    setTimeout(() => setTopicIndex(i => i + 1), 300);
  }, [gameActive, result]);

  useEffect(() => {
    if (topicIndex < shuffledTopics.length && gameActive) {
      setCurrentTopic(shuffledTopics[topicIndex]);
      setResult(null);
      setOffsetY(0);
      setOffsetX(0);
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

        // Random Live Chat spawn for L4+
        if (level >= 4 && Math.random() < 0.02) {
            setLiveChats(prev => [...prev, {
                id: chatCounter.current++,
                text: ["POG!", "CRINGE", "W", "L", "FR FR", "CAP"][Math.floor(Math.random() * 6)],
                x: Math.random() * 60 + 20,
                y: Math.random() * 60 + 20
            }]);
        }
      }, 50);
    } else if (topicIndex >= shuffledTopics.length && gameActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      endGame();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [topicIndex, shuffledTopics, gameActive, endGame, timePerTopic, handleTimeout, level]);

  const handleAction = (isPost: boolean) => {
    if (!gameActive || !currentTopic || result !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = (isPost && currentTopic.isViral) || (!isPost && !currentTopic.isViral);

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(prev => prev + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      setStreak(0);
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(t => t + 1);

    setTimeout(() => {
      setTopicIndex(i => i + 1);
    }, 300);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (touchStart.current !== null) {
      setOffsetY(e.clientY - touchStart.current.y);
      setOffsetX(e.clientX - touchStart.current.x);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (touchStart.current === null) return;
    const diffY = e.clientY - touchStart.current.y;
    const diffX = e.clientX - touchStart.current.x;

    if (level >= 3 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > swipeThreshold) handleAction(true);
      else if (diffX < -swipeThreshold) handleAction(false);
      else { setOffsetY(0); setOffsetX(0); }
    } else {
      if (diffY < -swipeThreshold) handleAction(true);
      else if (diffY > swipeThreshold) handleAction(false);
      else { setOffsetY(0); setOffsetX(0); }
    }
    touchStart.current = null;
  };

  const dismissChat = (id: number) => {
    setLiveChats(prev => prev.filter(c => c.id !== id));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500 text-purple-400 text-purple-500/50',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500 text-blue-400 text-blue-500/50',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500 text-amber-400 text-amber-500/50',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500 text-emerald-400 text-emerald-500/50',
  };

  const colors = colorMap[accentColor] || colorMap.purple;
  const [cText, cBorder, cBar, cStreak, cStreakSub] = colors.split(' ');

  return (
    <div className={`bg-slate-950 p-6 rounded-3xl border-4 transition-colors duration-200 text-center select-none touch-none h-[420px] flex flex-col justify-center items-center relative overflow-hidden ${
      result === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
      result === 'wrong' ? 'border-red-500 bg-red-950/20' :
      cBorder
    }`}>
      <div className="absolute top-6 text-center z-20 w-full">
        <h2 className={`text-2xl font-black ${cText} italic tracking-tighter`}>{title} <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-2">
          <span>{icon}</span>
          <span>{instruction}</span>
          <span>{scoreLabel}: {score}/{total}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentTopic && gameActive && (
          <motion.div
            key={topicIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: offsetY, x: offsetX }}
            exit={{
                y: Math.abs(offsetY) > swipeThreshold ? (offsetY < 0 ? -500 : 500) : 0,
                x: Math.abs(offsetX) > swipeThreshold ? (offsetX < 0 ? -500 : 500) : 0,
                opacity: 0
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`w-full max-w-[220px] aspect-[3/4] bg-slate-800 rounded-2xl border-4 flex flex-col items-center justify-center p-4 transition-all shadow-2xl relative ${
              result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
              result === 'wrong' ? 'border-red-500 bg-red-500/10' :
              'border-slate-700'
            }`}
          >
            {/* Feedback Overlays */}
            {(offsetY < -40 || (level >= 3 && offsetX > 40)) && (
                <div className="absolute top-4 font-black text-emerald-400 text-xl rotate-[-10deg] drop-shadow-lg z-30">POST IT!</div>
            )}
            {(offsetY > 40 || (level >= 3 && offsetX < -40)) && (
                <div className="absolute bottom-4 font-black text-red-400 text-xl rotate-[10deg] drop-shadow-lg z-30">DECLINE</div>
            )}

            <div className="text-5xl mb-2">{currentTopic.isViral ? '🔥' : '📄'}</div>
            <div className="text-base font-black text-white leading-tight mb-4 px-2">{currentTopic.label}</div>

            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700 mb-2">
                <motion.div
                    className={`h-full ${cBar}`}
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

      {/* Live Chat Popups */}
      <AnimatePresence>
        {liveChats.map(chat => (
            <motion.button
                key={chat.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onPointerDown={(e) => { e.stopPropagation(); dismissChat(chat.id); }}
                className="absolute z-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-[10px] font-black text-white shadow-xl flex items-center gap-1"
                style={{ top: `${chat.y}%`, left: `${chat.x}%` }}
            >
                💬 {chat.text} <span className="ml-1 opacity-50">×</span>
            </motion.button>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-6 w-full flex justify-around px-6 opacity-30 pointer-events-none">
           <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{level >= 3 ? '⬆️/➡️' : '⬆️'}</span>
              <span className="text-[8px] font-black text-emerald-400 uppercase">POST VIRAL</span>
           </div>
           {streak > 0 && (
              <div className="flex flex-col items-center">
                 <span className={`text-xs font-black ${cStreak} animate-pulse`}>{streak} STREAK!</span>
                 <span className={`text-[8px] ${cStreakSub} uppercase font-bold`}>x{(1 + Math.min(10, streak) * 0.05).toFixed(2)}</span>
              </div>
           )}
           <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{level >= 3 ? '⬇️/⬅️' : '⬇️'}</span>
              <span className="text-[8px] font-black text-red-400 uppercase">DECLINE TRASH</span>
           </div>
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 p-6">
          <div className="text-6xl mb-4">📈</div>
          <div className="text-3xl font-black text-white italic uppercase tracking-tighter">FEED UPDATED</div>
          <div className="text-emerald-500 font-black font-mono text-xl mt-2">{score}/{total} VIRAL SUCCESS</div>
        </div>
      )}
    </div>
  );
};
