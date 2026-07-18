import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

export interface ConcentrationCardItem {
  id: string;
  label: string;
  image: string;
  [key: string]: any;
}

interface ConcentrationMatchProps {
  onComplete: (multiplier: number, extraData?: any) => void;
  level?: number;
  tier?: Tier;
  cardSet?: ConcentrationCardItem[];
  theme?: 'emerald' | 'purple';
  title?: string;
  subtitle?: string;
  description?: string | React.ReactNode;
  startBtnText?: string;
  icon?: string;
  cardBackIcon?: string;
  delayMs?: number;
  onMatchComplete?: (
    success: boolean,
    multiplier: number,
    timeLeft: number,
    mismatches: number
  ) => any;
  renderOverlay?: (
    success: boolean,
    multiplier: number,
    mismatches: number,
    pairsCount: number,
    timeLeft: number,
    extraData?: any
  ) => React.ReactNode;
}

interface Card {
  id: string;
  sourceId: string;
  label: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_POOL = ['💰', '💼', '📈', '🚀', '🧠', '💻', '🤝', '🔥', '💎', '🎨'];

interface ThemeConfig {
  borderColor: string;
  highlightText: string;
  startBtn: string;
  progress: string;
  cardMatched: string;
  cardFlipped: string;
  cardBackText: string;
  startHeight: string;
  gameHeight: string;
}

const THEMES: Record<'emerald' | 'purple', ThemeConfig> = {
  emerald: {
    borderColor: 'border-emerald-900',
    highlightText: 'text-emerald-400',
    startBtn: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 active:border-b-0 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    progress: 'bg-emerald-500',
    cardMatched: 'bg-emerald-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    cardFlipped: 'bg-blue-950 border-blue-400',
    cardBackText: 'text-emerald-500/40',
    startHeight: 'h-[500px]',
    gameHeight: 'h-[520px]',
  },
  purple: {
    borderColor: 'border-purple-900',
    highlightText: 'text-purple-400',
    startBtn: 'bg-purple-600 hover:bg-purple-500 border-purple-800 active:border-b-0 shadow-[0_0_30px_rgba(147,51,234,0.3)]',
    progress: 'bg-purple-500',
    cardMatched: 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]',
    cardFlipped: 'bg-indigo-950 border-indigo-400',
    cardBackText: 'text-purple-500/40',
    startHeight: 'h-[520px]',
    gameHeight: 'h-[540px]',
  },
};

export const ConcentrationMatch: React.FC<ConcentrationMatchProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  cardSet,
  theme = 'emerald',
  title = 'MARKET SYNC',
  subtitle = 'CONCENTRATION MATCH',
  description,
  startBtnText = 'START SYNC',
  icon = '🧠',
  cardBackIcon = '❓',
  delayMs = 1500,
  onMatchComplete,
  renderOverlay,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [extraData, setExtraData] = useState<any>(undefined);
  const timerRef = useRef<number | null>(null);

  const themeConfig = THEMES[theme];

  // Difficulty scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Grid sizing: levels 1-2 = 12 cards (6 pairs), levels 3-4 = 16 cards (8 pairs), level 5+ = 20 cards (10 pairs)
  const pairsCount = useMemo(() => {
    if (level <= 2) return 6;
    if (level <= 4) return 8;
    return 10;
  }, [level]);

  const totalTime = useMemo(() => {
    const baseTime = 25 + pairsCount * 4;
    return Math.max(15, Math.floor(baseTime * timerFactor));
  }, [pairsCount, timerFactor]);

  // Initialize and shuffle board
  const initializeBoard = () => {
    // If cardSet is provided, use it. Otherwise, build it from EMOJI_POOL
    const pool = cardSet && cardSet.length > 0
      ? cardSet
      : EMOJI_POOL.slice(0, pairsCount).map((emoji, idx) => ({
          id: `emoji_${idx}`,
          label: emoji,
          image: emoji,
        }));

    const deck: Card[] = [];
    pool.forEach((item, index) => {
      // Each pair has two identical cards
      deck.push({
        id: `${index}_a`,
        sourceId: item.id,
        label: item.label,
        image: item.image,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `${index}_b`,
        sourceId: item.id,
        label: item.label,
        image: item.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    setCards(deck);
    setSelectedIds([]);
    setMismatches(0);
    setTimeLeft(totalTime);
    setGameEnded(false);
    setLockBoard(false);
    setExtraData(undefined);
  };

  const startGame = () => {
    initializeBoard();
    setIsStarted(true);
  };

  // Timer effect
  useEffect(() => {
    if (!isStarted || gameEnded) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleGameOver(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100) as unknown as number;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, gameEnded]);

  const handleCardClick = (id: string) => {
    if (lockBoard || gameEnded) return;

    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip current card
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    if (newSelected.length === 2) {
      setLockBoard(true);
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = clickedCard; // clickedCard is the second one

      if (firstCard.sourceId === secondCard.sourceId) {
        // MATCH found
        if (navigator.vibrate) navigator.vibrate(20);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true, isFlipped: false }
                : c
            )
          );
          setSelectedIds([]);
          setLockBoard(false);

          // Check if all are matched
          setCards((updatedCards) => {
            const allMatched = updatedCards.every(
              (c) => c.isMatched || c.id === firstId || c.id === secondId
            );
            if (allMatched) {
              handleGameOver(true);
            }
            return updatedCards;
          });
        }, 300);
      } else {
        // MISMATCH
        if (navigator.vibrate) navigator.vibrate([40, 40]);
        setMismatches((m) => m + 1);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedIds([]);
          setLockBoard(false);
        }, 800);
      }
    }
  };

  const handleGameOver = (success: boolean) => {
    setGameEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let performanceBase = 0.5;
    if (success) {
      if (mismatches <= pairsCount - 2) {
        performanceBase = 4.0; // Perfect/Excellent Memory
      } else if (mismatches <= pairsCount + 2) {
        performanceBase = 2.5; // Good Memory
      } else {
        performanceBase = 1.2; // Basic Complete
      }
    }

    const multiplier = performanceBase * (0.8 + scaling * 0.2);

    if (navigator.vibrate) {
      if (success) navigator.vibrate([100, 50, 100]);
      else navigator.vibrate(200);
    }

    let calculatedExtra: any = undefined;
    if (onMatchComplete) {
      calculatedExtra = onMatchComplete(success, multiplier, timeLeft, mismatches);
      setExtraData(calculatedExtra);
    }

    setTimeout(() => {
      onComplete(multiplier, calculatedExtra);
    }, delayMs);
  };

  const gridColsClass = useMemo(() => {
    if (pairsCount === 6) return 'grid-cols-3';
    return 'grid-cols-4';
  }, [pairsCount]);

  const cardHeightClass = useMemo(() => {
    if (pairsCount === 6) return theme === 'purple' ? 'h-20' : 'h-16';
    if (pairsCount === 8) return theme === 'purple' ? 'h-16' : 'h-14';
    return theme === 'purple' ? 'h-12' : 'h-11';
  }, [pairsCount, theme]);

  if (!isStarted) {
    return (
      <div className={`${themeConfig.startHeight} w-full max-w-[380px] mx-auto bg-slate-950 border-4 ${themeConfig.borderColor} rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden`}>
        {theme === 'purple' && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />
        )}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4 z-10"
        >
          {icon}
        </motion.div>
        <h2 className={`text-3xl font-black ${themeConfig.highlightText} mb-2 italic tracking-tighter uppercase z-10`}>
          {title} <span className="text-white text-xs">L{level}</span>
        </h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 z-10">
          {subtitle}
        </p>
        {description ? (
          typeof description === 'string' ? (
            <p className={`text-slate-500 mb-8 uppercase text-[10px] ${theme === 'purple' ? 'font-bold' : 'font-black'} tracking-wider leading-relaxed z-10 ${theme === 'purple' ? 'max-w-[280px]' : ''}`}>
              {description}
            </p>
          ) : (
            description
          )
        ) : (
          <p className="text-slate-500 mb-8 uppercase text-[10px] font-black tracking-wider leading-relaxed z-10">
            Flip cards to pair identical assets.<br />
            Clear the board before the capacity decays.<br />
            Fewer mismatches yields premium returns.
          </p>
        )}
        <button
          onClick={startGame}
          className={`w-full py-4 ${themeConfig.startBtn} text-white font-black rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 uppercase tracking-widest italic z-10`}
        >
          {startBtnText}
        </button>
      </div>
    );
  }

  return (
    <div className={`${themeConfig.gameHeight} w-full max-w-[380px] mx-auto bg-slate-950 border-4 ${themeConfig.borderColor} rounded-3xl flex flex-col items-center justify-between p-6 relative shadow-2xl overflow-hidden`}>
      {theme === 'purple' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10 pointer-events-none" />
      )}

      {/* Top Header */}
      <div className="w-full flex justify-between items-center mb-1 z-10">
        <div className="text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            MISMATCHES
          </span>
          <span className="text-lg font-black text-red-400 font-mono">
            {mismatches}
          </span>
        </div>
        <div className="text-center">
          <span className={`font-black text-sm italic tracking-tighter uppercase ${themeConfig.highlightText}`}>
            {theme === 'purple' ? 'AUDITIONS' : title}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            {theme === 'purple' ? 'TIME LEFT' : 'CAPACITY'}
          </span>
          <span
            className={`text-lg font-black font-mono ${
              timeLeft < 5 ? 'text-red-500 animate-pulse' : themeConfig.highlightText
            }`}
          >
            {timeLeft.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid ${gridColsClass} gap-2 w-full flex-grow my-3 items-center justify-center p-1 z-10`}>
        {cards.map((card) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`w-full ${cardHeightClass} rounded-xl flex items-center justify-center text-3xl transition-all duration-300 relative border-2 ${
                card.isMatched
                  ? themeConfig.cardMatched
                  : card.isFlipped
                  ? themeConfig.cardFlipped
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 active:bg-slate-800'
              }`}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.span
                    key="front"
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    exit={{ scale: 0 }}
                    className="select-none"
                  >
                    {card.image}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`${themeConfig.cardBackText} font-black text-lg select-none`}
                  >
                    {cardBackIcon}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Timer and Quota */}
      <div className="w-full mt-1 z-10">
        <ProgressBar
          value={timeLeft}
          max={totalTime}
          colorClass={timeLeft < 5 ? 'bg-red-500' : themeConfig.progress}
        />
        <div className={`mt-1.5 text-center ${theme === 'purple' ? 'text-[7.5px]' : 'text-[8px]'} text-slate-500 font-black uppercase tracking-widest`}>
          {theme === 'purple'
            ? `COMPLETE ALL ${pairsCount} AUDITION MATCHES`
            : `COMPLETE ALL ${pairsCount} MATCHES FOR BONUS YIELD`}
        </div>
      </div>

      {/* Overlay on Game End */}
      <AnimatePresence>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-6 rounded-2xl"
          >
            {renderOverlay ? (
              renderOverlay(
                cards.every((c) => c.isMatched),
                performanceBaseMultiplier(cards.every((c) => c.isMatched), mismatches, pairsCount, scaling),
                mismatches,
                pairsCount,
                timeLeft,
                extraData
              )
            ) : (
              <>
                <div className="text-6xl mb-3 drop-shadow-2xl">
                  {cards.every((c) => c.isMatched) ? '📈' : '📉'}
                </div>
                <div className="text-2xl font-black text-white italic uppercase tracking-tighter">
                  {cards.every((c) => c.isMatched) ? 'SYNC COMPLETED' : 'SYNC TERMINATED'}
                </div>
                <div className="text-emerald-400 font-black font-mono text-sm mt-1 uppercase tracking-widest">
                  {mismatches} MISMATCHES OCCURRED
                </div>
                <div className="text-slate-500 text-[8px] font-black mt-4 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 uppercase tracking-widest">
                  RATING: {mismatches <= pairsCount - 2 ? 'EXCELLENT' : mismatches <= pairsCount + 2 ? 'GOOD' : 'FAIR'}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper to calculate exact same performance formula inside the local component scope
function performanceBaseMultiplier(success: boolean, mismatches: number, pairsCount: number, scaling: number): number {
  let performanceBase = 0.5;
  if (success) {
    if (mismatches <= pairsCount - 2) {
      performanceBase = 4.0;
    } else if (mismatches <= pairsCount + 2) {
      performanceBase = 2.5;
    } else {
      performanceBase = 1.2;
    }
  }
  return performanceBase * (0.8 + scaling * 0.2);
}
