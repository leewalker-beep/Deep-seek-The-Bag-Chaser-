import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';
import { useGameStore } from '../../store/gameStore';

export interface Topic {
  id: number;
  label: string;
  isViral: boolean;
  emoji: string;
  minLevel?: number;
}

export const TOPICS: Topic[] = [
  // Level 1 Obvious Topics
  { id: 1, label: 'Lofi Beats to Study To', isViral: true, emoji: '🎵', minLevel: 1 },
  { id: 2, label: 'ASMR Satisfying Slime Cutting', isViral: true, emoji: '🧼', minLevel: 1 },
  { id: 3, label: '100 Layers of Lipstick Challenge', isViral: true, emoji: '💄', minLevel: 1 },
  { id: 4, label: 'Dancing Cat in a Hat', isViral: true, emoji: '🐱', minLevel: 1 },
  { id: 5, label: 'How to Fold Socks Neatly', isViral: false, emoji: '🧦', minLevel: 1 },
  { id: 6, label: 'Watching Paint Dry 10 Hour Loop', isViral: false, emoji: '🎨', minLevel: 1 },
  { id: 7, label: 'Boring Meeting', isViral: false, emoji: '💼', minLevel: 1 },
  { id: 8, label: 'Tax Returns Tutorial 2024', isViral: false, emoji: '📄', minLevel: 1 },

  // Level 2 Subtler Attention-Testing
  { id: 9, label: 'Speedrunning Minecraft BUT every block is lava', isViral: true, emoji: '🎮', minLevel: 2 },
  { id: 10, label: 'Minecraft: Building a basic dirt house (No Audio)', isViral: false, emoji: '🎮', minLevel: 2 },
  { id: 11, label: 'Unboxing a $10,000 Mystery Box from the Dark Web', isViral: true, emoji: '📦', minLevel: 2 },
  { id: 12, label: 'Unboxing a box of cardboard folders for office use', isViral: false, emoji: '📦', minLevel: 2 },
  { id: 13, label: 'Eating the World\'s Spiciest Pepper (GONE WRONG)', isViral: true, emoji: '🌶️', minLevel: 2 },
  { id: 14, label: 'Eating a moderately salted cracker in complete silence', isViral: false, emoji: '🌶️', minLevel: 2 },
  { id: 15, label: 'My $5,000/Month Passive Income Strategy', isViral: true, emoji: '💰', minLevel: 2 },
  { id: 16, label: 'Reviewing the IRS tax code section 179 for depreciation', isViral: false, emoji: '💰', minLevel: 2 },

  // Level 3 Advanced Visual Scrutiny / Caption-Reading
  { id: 17, label: 'Reacting to my old cringey TikToks (extremely emotional)', isViral: true, emoji: '📱', minLevel: 3 },
  { id: 18, label: 'Reacting to a 3-hour legislative senate debate on agricultural zoning', isViral: false, emoji: '📱', minLevel: 3 },
  { id: 19, label: 'Giving a Tesla away to a random subscriber!', isViral: true, emoji: '🚗', minLevel: 3 },
  { id: 20, label: 'Giving my car keys to my brother so he can buy milk', isViral: false, emoji: '🚗', minLevel: 3 },
  { id: 21, label: 'I spent 100 Days in a VR Metaverse Prison', isViral: true, emoji: '🕶️', minLevel: 3 },
  { id: 22, label: 'I spent 10 minutes looking at real estate listings in Ohio', isViral: false, emoji: '🕶️', minLevel: 3 },
];

export const calculateGrade = (
  accuracy: number,
  peakMomentum: number,
  level: number
): 'Flopped' | 'Solid' | 'Viral' | 'Legendary' => {
  const legendaryMinMomentum = level === 1 ? 5 : level === 2 ? 8 : 10;
  const viralMinMomentum = level === 1 ? 3 : level === 2 ? 5 : 7;
  const solidMinMomentum = level === 1 ? 2 : level === 2 ? 3 : 4;

  if (accuracy >= 0.90 && peakMomentum >= legendaryMinMomentum) {
    return 'Legendary';
  }
  if (accuracy >= 0.75 && peakMomentum >= viralMinMomentum) {
    return 'Viral';
  }
  if (accuracy >= 0.50 && peakMomentum >= solidMinMomentum) {
    return 'Solid';
  }
  return 'Flopped';
};

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
    instruction = "PUBLISH OR REJECT",
    icon = "📱",
    scoreLabel = "VIRAL ACCURACY",
    accentColor = "purple"
}) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [peakMomentum, setPeakMomentum] = useState(0);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  const [boostMultiplier, setBoostMultiplier] = useState(1.0);
  const [scoreWithBoost, setScoreWithBoost] = useState(0);
  const [finalMultiplier, setFinalMultiplier] = useState(1.0);
  const [finalGrade, setFinalGrade] = useState<'Flopped' | 'Solid' | 'Viral' | 'Legendary' | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBestText, setPersonalBestText] = useState('');
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
  const timePerTopic = useMemo(() => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test') {
      return 999;
    }
    return Math.max(0.8, (2.5 - (level * 0.2)) * timerFactor);
  }, [level, timerFactor]);
  const totalTopics = useMemo(() => Math.min(25, 3 + (level * 2) + Math.floor(scaling * 2)), [level, scaling]);
  const swipeThreshold = useMemo(() => Math.max(40, 80 * (1/scaling)), [scaling]);

  const [shuffledTopics] = useState(() => {
    const pool = TOPICS.filter(t => (t.minLevel || 1) <= level);
    const shuffled = [...pool];
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

  const previewCount = useMemo(() => {
    if (level === 1) return 1;
    if (level === 2) return 2;
    return 3;
  }, [level]);

  const upcomingTopics = useMemo(() => {
    return shuffledTopics.slice(topicIndex + 1, topicIndex + 1 + previewCount);
  }, [shuffledTopics, topicIndex, previewCount]);

  const thresholds = useMemo(() => {
    if (level === 1) return [3, 6, 9];
    if (level === 2) return [4, 8, 12];
    return [5, 10, 15];
  }, [level]);

  const boostDuration = useMemo(() => {
    if (level === 1) return 6;
    if (level === 2) return 4.5;
    return 3;
  }, [level]);

  useEffect(() => {
    if (boostTimeLeft > 0 && gameActive) {
      const interval = setInterval(() => {
        setBoostTimeLeft(prev => {
          const next = prev - 0.1;
          if (next <= 0) {
            setBoostMultiplier(1.0);
            return 0;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [boostTimeLeft > 0, gameActive]);

  const endGame = useCallback(() => {
    if (!gameActive) return;
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;

    let base = 0.5;
    if (accuracy >= 0.9) base = 3.0;
    else if (accuracy >= 0.7) base = 2.0;
    else if (accuracy >= 0.5) base = 1.2;
    else base = 0.8;

    const streakBonus = 1 + (Math.min(10, peakMomentum) * 0.05);
    const boostRatio = score > 0 ? scoreWithBoost / score : 1.0;
    const multiplier = base * (0.8 + scaling * 0.2) * streakBonus * boostRatio;

    const computedGrade = calculateGrade(accuracy, peakMomentum, level);

    // Save personal best per hustle level
    const store = useGameStore.getState?.();
    let newBest = false;
    let pbText = '';

    if (store && store.pl) {
      const currentFlags = store.pl.narrativeFlags || {};
      const bestGradeKey = `cc_level_${level}_best_grade`;
      const bestScoreKey = `cc_level_${level}_best_score`;
      const bestMomentumKey = `cc_level_${level}_best_momentum`;

      const previousBestGrade = currentFlags[bestGradeKey] as string || 'None';
      const previousBestScore = Number(currentFlags[bestScoreKey] || 0);

      const gradeRank: Record<string, number> = { 'None': 0, 'Flopped': 1, 'Solid': 2, 'Viral': 3, 'Legendary': 4 };
      const currentRank = gradeRank[computedGrade] || 0;
      const prevRank = gradeRank[previousBestGrade] || 0;

      if (currentRank > prevRank || (currentRank === prevRank && score > previousBestScore)) {
        newBest = true;
        pbText = `${computedGrade} (Score: ${score})`;
        store.updatePl({
          narrativeFlags: {
            ...currentFlags,
            [bestGradeKey]: computedGrade,
            [bestScoreKey]: score,
            [bestMomentumKey]: Math.max(Number(currentFlags[bestMomentumKey] || 0), peakMomentum)
          }
        });
      } else {
        pbText = `${previousBestGrade} (Score: ${previousBestScore})`;
      }
    } else {
      pbText = `${computedGrade} (Score: ${score})`;
    }

    setFinalMultiplier(multiplier);
    setFinalGrade(computedGrade);
    setIsNewBest(newBest);
    setPersonalBestText(pbText);
  }, [score, total, scaling, peakMomentum, scoreWithBoost, level, gameActive]);

  const handleTimeout = useCallback(() => {
    if (!gameActive || result !== null) return;
    setResult('wrong');
    setStreak(0);
    setMomentum(0);
    setBoostMultiplier(1.0);
    setBoostTimeLeft(0);
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    setTotal(t => t + 1);
    setTimeout(() => setTopicIndex(i => i + 1), 300);
  }, [gameActive, result]);

  const endGameRef = useRef(endGame);
  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const handleTimeoutRef = useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

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
          handleTimeoutRef.current();
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
      endGameRef.current();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [topicIndex, shuffledTopics, gameActive, level, timePerTopic]);

  const handleAction = (isPost: boolean) => {
    if (!gameActive || !currentTopic || result !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = (isPost && currentTopic.isViral) || (!isPost && !currentTopic.isViral);

    if (isCorrect) {
      setScore(s => s + 1);

      const activeMult = boostTimeLeft > 0 ? boostMultiplier : 1.0;
      setScoreWithBoost(sb => sb + activeMult);

      setMomentum(prev => {
        const nextMom = prev + 1;
        setPeakMomentum(pm => Math.max(pm, nextMom));

        if (nextMom === thresholds[0]) {
          setBoostMultiplier(1.5);
          setBoostTimeLeft(boostDuration);
        } else if (nextMom === thresholds[1]) {
          setBoostMultiplier(2.0);
          setBoostTimeLeft(boostDuration);
        } else if (nextMom >= thresholds[2]) {
          setBoostMultiplier(3.0);
          setBoostTimeLeft(boostDuration);
        }
        return nextMom;
      });

      setStreak(prev => prev + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      setStreak(0);
      setMomentum(0);
      setBoostMultiplier(1.0);
      setBoostTimeLeft(0);
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(t => t + 1);

    setTimeout(() => {
      setTopicIndex(i => i + 1);
    }, 300);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (typeof (e.target as HTMLElement).setPointerCapture === 'function') {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
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
  const [cText, _cBorder, cBar, cStreak, cStreakSub] = colors.split(' ');

  return (
    <div className={`w-full transition-colors duration-200 text-center select-none touch-none flex flex-col justify-center items-center relative overflow-hidden ${
      result === 'correct' ? 'bg-emerald-950/20' :
      result === 'wrong' ? 'bg-red-950/20' :
      'bg-transparent'
    }`}>
      <div className="absolute top-2 text-center z-20 w-full">
        <h2 className={`text-2xl font-black ${cText} italic tracking-tighter`}>{title} <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-center gap-2">
          <span>{icon}</span>
          <span>{instruction}</span>
          <span>{scoreLabel}: {score}/{total}</span>
        </div>
      </div>

      {/* MOMENTUM METER */}
      <div className="w-full max-w-[340px] px-4 mt-16 z-20 flex flex-col gap-1 items-center">
        <div className="flex justify-between w-full text-[9px] font-black uppercase tracking-wider">
          {boostTimeLeft > 0 ? (
            <span className="text-emerald-400 animate-pulse">🔥 {boostMultiplier.toFixed(1)}x Boost: {boostTimeLeft.toFixed(1)}s Left!</span>
          ) : (
            <span className="text-slate-400">Momentum: {momentum}x (Streak)</span>
          )}
          <span className="text-slate-500">Peak Streak: {peakMomentum}</span>
        </div>

        <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative shadow-inner">
          {thresholds.map((threshold) => {
            const percentage = (threshold / thresholds[2]) * 100;
            return (
              <div
                key={threshold}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-700/80 z-10"
                style={{ left: `${percentage}%` }}
              />
            );
          })}

          <motion.div
            className={`h-full rounded-full transition-colors duration-200 ${
              boostTimeLeft > 0 ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_#34d399]' : 'bg-purple-600'
            }`}
            animate={{
              width: `${Math.min(100, (momentum / thresholds[2]) * 100)}%`
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
        </div>

        <div className="flex justify-between w-full text-[7px] font-bold text-slate-500 uppercase tracking-widest px-1">
          <span>Start</span>
          <span>Tier 1 ({thresholds[0]})</span>
          <span>Tier 2 ({thresholds[1]})</span>
          <span>Max ({thresholds[2]})</span>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-6 w-full max-w-[420px] mt-3 z-10">
        <div className="relative w-full max-w-[220px] h-[300px] flex items-center justify-center">
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

                <div className="text-5xl mb-2">{currentTopic.emoji || (currentTopic.isViral ? '🔥' : '📄')}</div>
                <div data-testid="active-topic-label" className="text-base font-black text-white leading-tight mb-4 px-2">{currentTopic.label}</div>

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
        </div>

        {/* PREVIEW STRIP */}
        {gameActive && (
          <div className="flex flex-col gap-1.5 justify-center bg-slate-900/40 p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest text-left pl-1">NEXT UP</span>
            {Array.from({ length: previewCount }).map((_, idx) => {
              const topic = upcomingTopics[idx];
              if (topic) {
                return (
                  <div key={topic.id} className="flex items-center gap-2 bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 w-[140px] text-left transition-all duration-300 shadow-md">
                    <span className="text-lg">{topic.emoji}</span>
                    <div className="flex flex-col overflow-hidden w-full">
                      <span className="text-[7px] text-slate-500 font-black uppercase">+{idx + 1}</span>
                      <span className="text-[9px] text-slate-200 font-bold truncate leading-tight block w-full">{topic.label}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={`empty-${idx}`} className="border border-dashed border-slate-800/40 rounded-xl p-2 w-[140px] h-[34px] flex items-center justify-center text-slate-700 text-[8px] font-black italic uppercase tracking-wider">
                    END OF DECK
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

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

      <div className="absolute bottom-6 w-full flex justify-around px-6 z-30">
           <button
              onClick={() => handleAction(true)}
              data-testid="post-button"
              className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all bg-transparent border-0 cursor-pointer"
           >
              <span className="text-2xl">{level >= 3 ? '⬆️/➡️' : '⬆️'}</span>
              <span className="text-[8px] font-black text-emerald-400 uppercase">POST VIRAL</span>
           </button>
           {streak > 0 && (
              <div className="flex flex-col items-center">
                 <span className={`text-xs font-black ${cStreak} animate-pulse`}>{streak} STREAK!</span>
                 <span className={`text-[8px] ${cStreakSub} uppercase font-bold`}>x{(1 + Math.min(10, streak) * 0.05).toFixed(2)}</span>
              </div>
           )}
           <button
              onClick={() => handleAction(false)}
              data-testid="decline-button"
              className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all bg-transparent border-0 cursor-pointer"
           >
              <span className="text-2xl">{level >= 3 ? '⬇️/⬅️' : '⬇️'}</span>
              <span className="text-[8px] font-black text-red-400 uppercase">DECLINE TRASH</span>
           </button>
      </div>

      {!gameActive && finalGrade && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 p-6 text-center">
          <div className="text-5xl mb-3">📈</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">FEED UPDATED</div>

          <div className="text-xs text-slate-400 font-semibold mb-1">PERFORMANCE GRADE</div>
          <div className={`text-3xl font-black uppercase italic tracking-tighter mb-4 ${
            finalGrade === 'Legendary' ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse' :
            finalGrade === 'Viral' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]' :
            finalGrade === 'Solid' ? 'text-blue-400' :
            'text-red-500'
          }`}>
            {finalGrade}
          </div>

          <div className="flex flex-col gap-1 text-xs text-slate-300 font-medium mb-4 max-w-[200px] w-full border-t border-b border-slate-800/80 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Accuracy:</span>
              <span className="font-mono text-white font-bold">{score}/{total} ({total > 0 ? Math.round((score / total) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Peak Streak:</span>
              <span className="font-mono text-emerald-400 font-bold">{peakMomentum}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Multiplier:</span>
              <span className="font-mono text-amber-400 font-bold">x{finalMultiplier.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mb-6 bg-slate-900/60 px-3 py-1.5 border border-slate-800 rounded-lg">
            {isNewBest ? (
              <span className="text-amber-400 font-black uppercase tracking-wider block">🏆 NEW PERSONAL BEST!</span>
            ) : (
              <span>PERSONAL BEST: <strong className="text-slate-300">{personalBestText}</strong></span>
            )}
          </div>

          <button
            onClick={() => onComplete(finalMultiplier)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transform active:scale-95 transition-all cursor-pointer"
          >
            Claim Reward
          </button>
        </div>
      )}
    </div>
  );
};
