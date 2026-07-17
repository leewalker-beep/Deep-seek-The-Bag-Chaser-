import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface ConcentrationMatchProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_POOL = ['💰', '💼', '📈', '🚀', '🧠', '💻', '🤝', '🔥', '💎', '🎨'];

export const ConcentrationMatch: React.FC<ConcentrationMatchProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const timerRef = useRef<number | null>(null);

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
    const pool = EMOJI_POOL.slice(0, pairsCount);
    const deck = [...pool, ...pool].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setSelectedIds([]);
    setMismatches(0);
    setTimeLeft(totalTime);
    setGameEnded(false);
    setLockBoard(false);
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

  const handleCardClick = (id: number) => {
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

      if (firstCard.emoji === secondCard.emoji) {
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

    setTimeout(() => {
      onComplete(multiplier);
    }, 1500);
  };

  const gridColsClass = useMemo(() => {
    if (pairsCount === 6) return 'grid-cols-3';
    return 'grid-cols-4';
  }, [pairsCount]);

  const cardHeightClass = useMemo(() => {
    if (pairsCount === 6) return 'h-16';
    if (pairsCount === 8) return 'h-14';
    return 'h-11';
  }, [pairsCount]);

  if (!isStarted) {
    return (
      <div className="h-[500px] w-full max-w-[380px] mx-auto bg-slate-950 border-4 border-emerald-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4"
        >
          🧠
        </motion.div>
        <h2 className="text-3xl font-black text-emerald-400 mb-2 italic tracking-tighter uppercase">
          MARKET SYNC <span className="text-white text-xs">L{level}</span>
        </h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
          CONCENTRATION MATCH
        </p>
        <p className="text-slate-500 mb-8 uppercase text-[10px] font-black tracking-wider leading-relaxed">
          Flip cards to pair identical assets.<br />
          Clear the board before the capacity decays.<br />
          Fewer mismatches yields premium returns.
        </p>
        <button
          onClick={startGame}
          className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase tracking-widest italic"
        >
          START SYNC
        </button>
      </div>
    );
  }

  return (
    <div className="h-[520px] w-full max-w-[380px] mx-auto bg-slate-950 border-4 border-emerald-900 rounded-3xl flex flex-col items-center justify-between p-6 relative shadow-2xl">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center mb-1">
        <div className="text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            MISMATCHES
          </span>
          <span className="text-lg font-black text-red-400 font-mono">
            {mismatches}
          </span>
        </div>
        <div className="text-center">
          <span className="text-emerald-400 font-black text-sm italic tracking-tighter uppercase">
            MARKET SYNC
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            CAPACITY
          </span>
          <span
            className={`text-lg font-black font-mono ${
              timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {timeLeft.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid ${gridColsClass} gap-2 w-full flex-grow my-3 items-center justify-center p-1`}>
        {cards.map((card) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`w-full ${cardHeightClass} rounded-xl flex items-center justify-center text-2xl transition-all duration-300 relative border-2 ${
                card.isMatched
                  ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : card.isFlipped
                  ? 'bg-blue-950 border-blue-400'
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
                    {card.emoji}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-emerald-500/40 font-black text-lg select-none"
                  >
                    ❓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Timer and Quota */}
      <div className="w-full mt-1">
        <ProgressBar
          value={timeLeft}
          max={totalTime}
          colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}
        />
        <div className="mt-1.5 text-center text-[8px] text-slate-500 font-black uppercase tracking-widest">
          COMPLETE ALL {pairsCount} MATCHES FOR BONUS YIELD
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
