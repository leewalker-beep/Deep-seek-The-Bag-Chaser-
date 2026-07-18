import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';

interface TalentAgencyGameProps {
  onComplete: (result: { success: boolean; multiplier: number; celebrity?: any }) => void;
  level?: number;
}

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CREATOR_POOL = [
  { name: "Slam-Dunk Marcus", avatar: "🏀", bio: "High-school basketball captain with a 40-inch vertical." },
  { name: "Vlog Titan Jenny", avatar: "📹", bio: "Unfiltered suburban makeup & drama YouTuber." },
  { name: "Skate-King Tony", avatar: "🛹", bio: "Local halfpipe legend with a massive TikTok following." },
  { name: "Lil Spitfire", avatar: "🎤", bio: "16-year-old rapid-fire freestyle bedroom rapper." },
  { name: "Gamer-Girl Chloe", avatar: "🎮", bio: "Semi-pro speedrunner who stream-rages with charisma." },
  { name: "Heavy-Lifter Dan", avatar: "🏋️‍♂️", bio: "17-year-old strongman competitor who eats raw eggs." },
  { name: "Speed-Demon Sarah", avatar: "🏃‍♀️", bio: "State record-holding track sprinter with huge endorsement buzz." },
  { name: "Ninja Kai", avatar: "🥋", bio: "Tricking and parkour artist who flips off rooftops." },
  { name: "Glam-Queen Sasha", avatar: "💄", bio: "Aspiring high-fashion model who does street-style shoots." },
  { name: "DJ Bass-Drop", avatar: "🎧", bio: "Part-time school DJ producing bass-boosted mashups." },
];

export const TalentAgencyGame: React.FC<TalentAgencyGameProps> = ({
  onComplete,
  level = 1,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mismatches, setMismatches] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signedTalent, setSignedTalent] = useState<any | null>(null);
  const timerRef = useRef<number | null>(null);

  // Difficulty scaling (Talent agency is a Corporate-tier hustle)
  const scaling = getScalingMultiplier(level, 'CORPORATE');
  const timerFactor = getTimerFactor(level, 'CORPORATE');

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

  // Selected sub-pool for this specific game round
  const gamePool = useMemo(() => {
    // Shuffle pool and slice pairsCount
    const shuffled = [...CREATOR_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, pairsCount);
  }, [pairsCount]);

  // Initialize and shuffle board
  const initializeBoard = () => {
    const deck: Card[] = [];
    gamePool.forEach((creator, idx) => {
      // Each pair has two identical cards
      deck.push({
        id: idx * 2,
        emoji: creator.avatar,
        name: creator.name,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 1,
        emoji: creator.avatar,
        name: creator.name,
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
    setSuccess(false);
    setLockBoard(false);
    setSignedTalent(null);
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
      const secondCard = clickedCard;

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

  const handleGameOver = (isWin: boolean) => {
    setGameEnded(true);
    setSuccess(isWin);
    if (timerRef.current) clearInterval(timerRef.current);

    let performanceBase = 0.5;
    let celebrityToSign: any = null;

    if (isWin) {
      if (mismatches <= pairsCount - 2) {
        performanceBase = 4.0; // Excellent Match-up
      } else if (mismatches <= pairsCount + 2) {
        performanceBase = 2.5; // Good Match-up
      } else {
        performanceBase = 1.2; // Standard Match-up
      }

      // Select a random creator from the current game round's pool to sign
      const randomCreator = gamePool[Math.floor(Math.random() * gamePool.length)];
      // Calculate starting relationshipScore (capped at 100, min 10)
      const calculatedScore = Math.max(10, Math.min(100, Math.floor(50 + (timeLeft * 1.5) - (mismatches * 4))));

      celebrityToSign = {
        id: `cel_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: randomCreator.name,
        avatar: randomCreator.avatar,
        relationshipScore: calculatedScore,
        isUnlocked: true,
      };

      setSignedTalent(celebrityToSign);
    }

    const multiplier = performanceBase * (0.8 + scaling * 0.2);

    if (navigator.vibrate) {
      if (isWin) navigator.vibrate([100, 50, 100]);
      else navigator.vibrate(200);
    }

    setTimeout(() => {
      onComplete({
        success: isWin,
        multiplier,
        celebrity: celebrityToSign || undefined,
      });
    }, 2500);
  };

  const gridColsClass = useMemo(() => {
    if (pairsCount === 6) return 'grid-cols-3';
    return 'grid-cols-4';
  }, [pairsCount]);

  const cardHeightClass = useMemo(() => {
    if (pairsCount === 6) return 'h-20';
    if (pairsCount === 8) return 'h-16';
    return 'h-12';
  }, [pairsCount]);

  if (!isStarted) {
    return (
      <div className="h-[520px] w-full max-w-[380px] mx-auto bg-slate-950 border-4 border-purple-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-6xl mb-4 z-10"
        >
          🎭
        </motion.div>
        <h2 className="text-2xl font-black text-purple-400 mb-1 italic tracking-tighter uppercase z-10">
          TALENT RECRUIT <span className="text-white text-xs bg-purple-900/60 px-1.5 py-0.5 rounded font-mono font-bold">L{level}</span>
        </h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 z-10">
          "GUESS WHO?" AUDITION MATRIX
        </p>
        <p className="text-slate-500 mb-8 uppercase text-[10px] font-bold tracking-wider leading-relaxed z-10 max-w-[280px]">
          Flipping audition files to match creator faces.<br />
          Clear the roster board before scouts leave.<br />
          Fewer mismatches signs top-tier talent with high starting relationships!
        </p>
        <button
          onClick={startGame}
          className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-500 transition-all border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-[0_0_30px_rgba(147,51,234,0.3)] uppercase tracking-widest italic z-10"
        >
          START RECRUITMENT
        </button>
      </div>
    );
  }

  return (
    <div className="h-[540px] w-full max-w-[380px] mx-auto bg-slate-950 border-4 border-purple-900 rounded-3xl flex flex-col items-center justify-between p-6 relative shadow-2xl overflow-hidden">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="w-full flex justify-between items-center mb-1 z-10">
        <div className="text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            MISMATCHES
          </span>
          <span className="text-base font-black text-red-400 font-mono">
            {mismatches}
          </span>
        </div>
        <div className="text-center">
          <span className="text-purple-400 font-black text-sm italic tracking-tighter uppercase">
            AUDITIONS
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
            TIME LEFT
          </span>
          <span
            className={`text-base font-black font-mono ${
              timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'
            }`}
          >
            {timeLeft.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid ${gridColsClass} gap-2.5 w-full flex-grow my-3 items-center justify-center p-1 z-10`}>
        {cards.map((card) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`w-full ${cardHeightClass} rounded-xl flex items-center justify-center text-3xl transition-all duration-300 relative border-2 ${
                card.isMatched
                  ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                  : card.isFlipped
                  ? 'bg-indigo-950 border-indigo-400'
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
                    className="text-purple-500/40 font-black text-lg select-none"
                  >
                    🎭
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
          colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-purple-500'}
        />
        <div className="mt-1.5 text-center text-[7.5px] text-slate-500 font-black uppercase tracking-widest">
          COMPLETE ALL {pairsCount} AUDITION MATCHES
        </div>
      </div>

      {/* Overlay on Game End */}
      <AnimatePresence>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center z-30 p-6 rounded-2xl"
          >
            {success ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-6xl animate-bounce">
                  ✨{signedTalent?.avatar || '👑'}✨
                </div>
                <div className="text-xl font-black text-white italic uppercase tracking-tighter">
                  AUDITIONS COMPLETE!
                </div>
                <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">
                  Signed: <span className="text-white font-black">{signedTalent?.name}</span>
                </div>
                <div className="text-slate-400 font-mono text-[10px] uppercase">
                  Starting Rel: <span className="text-emerald-400 font-black">{signedTalent?.relationshipScore}/100</span>
                </div>
                <div className="text-slate-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-slate-900 border border-slate-800 rounded-full mt-2">
                  RATING: {mismatches <= pairsCount - 2 ? 'EXCELLENT RECRUIT' : mismatches <= pairsCount + 2 ? 'GOOD RECRUIT' : 'STANDARD CONTRACT'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="text-6xl">
                  📉
                </div>
                <div className="text-xl font-black text-white italic uppercase tracking-tighter">
                  RECRUITMENT TERMINATED
                </div>
                <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">
                  TIME LIMIT EXPIRED
                </p>
                <p className="text-slate-500 text-[8px] font-bold uppercase tracking-wider leading-relaxed max-w-[200px]">
                  Scouts got tired of waiting. Retrying is recommended for optimal contract placement.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
