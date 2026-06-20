import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HigherLowerProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

const SUITS = ['♠️', '♥️', '♣️', '♦️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card {
  value: number;
  label: string;
  suit: string;
}

export const HigherLower: React.FC<HigherLowerProps> = ({ onComplete, level = 1 }) => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // Difficulty scaling: less strikes at higher levels
  const maxStrikes = Math.max(1, 3 - Math.floor((level - 1) / 2));
  const payoutPerCorrect = 0.4 + (level - 1) * 0.1;

  const getRandomCard = (): Card => {
    const valueIndex = Math.floor(Math.random() * VALUES.length);
    return {
      value: valueIndex,
      label: VALUES[valueIndex],
      suit: SUITS[Math.floor(Math.random() * SUITS.length)]
    };
  };

  useEffect(() => {
    setCurrentCard(getRandomCard());
    setNextCard(getRandomCard());
  }, []);

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (!currentCard || !nextCard || feedback || isGameOver) return;

    const isCorrect = (guess === 'higher' && nextCard.value > currentCard.value) ||
                      (guess === 'lower' && nextCard.value < currentCard.value) ||
                      (nextCard.value === currentCard.value);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('CORRECT');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setStrikes(prev => prev + 1);
      setFeedback('WRONG');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    setTimeout(() => {
      if (!isCorrect && strikes + 1 >= maxStrikes) {
        setIsGameOver(true);
        if (navigator.vibrate) navigator.vibrate(100);
      } else {
        setCurrentCard(nextCard);
        setNextCard(getRandomCard());
        setFeedback(null);
      }
    }, 800);
  };

  const handleComplete = () => {
    const multiplier = Math.max(0.1, 1 + score * payoutPerCorrect);
    onComplete(multiplier);
  };

  if (!currentCard) return null;

  return (
    <div className={`transition-colors duration-500 bg-slate-950 p-6 rounded-3xl border-4 shadow-2xl text-center max-w-sm mx-auto font-mono ${
        feedback === 'CORRECT' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'WRONG' ? 'border-red-500 bg-red-950/20' :
        'border-yellow-600'
    }`}>
      <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic">DATA ANALYTICS <span className="text-white text-xs">L{level}</span></h2>

      <div className="flex justify-center gap-3 mb-4">
        {[...Array(maxStrikes)].map((_, i) => (
          <motion.div
            key={i}
            animate={strikes > i ? { scale: [1, 1.5, 1], opacity: 1 } : { opacity: 0.2 }}
            className="text-2xl"
          >
            ❌
          </motion.div>
        ))}
      </div>

      <div className="relative h-64 w-44 mx-auto mb-6">
        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div
              key={`${currentCard.label}-${currentCard.suit}`}
              initial={{ x: 300, opacity: 0, rotateY: 90 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: -300, opacity: 0, rotateY: -90 }}
              transition={{ type: 'spring', damping: 20 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y < -50) handleGuess('higher');
                else if (info.offset.y > 50) handleGuess('lower');
              }}
              className="absolute inset-0 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between p-6 text-black border-4 border-slate-200 cursor-grab active:cursor-grabbing"
            >
              <div className="text-left">
                <div className="text-3xl font-black leading-none">{currentCard.label}</div>
                <div className="text-2xl">{currentCard.suit}</div>
              </div>
              <div className="text-7xl self-center drop-shadow-md">{currentCard.suit}</div>
              <div className="text-right rotate-180">
                <div className="text-3xl font-black leading-none">{currentCard.label}</div>
                <div className="text-2xl">{currentCard.suit}</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: 15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border-4 border-red-500 p-6 shadow-2xl"
            >
              <div className="text-6xl mb-4">📊</div>
              <div className="text-red-500 font-black text-2xl mb-6 italic uppercase tracking-tighter">DATA SET CLOSED</div>
              <button
                onClick={handleComplete}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
              >
                SECURE YIELD
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
            {feedback && !isGameOver && (
            <motion.div
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: 1.8, opacity: 1, y: -40 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex items-center justify-center z-10 font-black text-4xl italic drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] ${feedback === 'CORRECT' ? 'text-emerald-400' : 'text-red-400'}`}
            >
                {feedback}!
            </motion.div>
            )}
        </AnimatePresence>
      </div>

      {!isGameOver && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleGuess('higher')}
              className="bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black text-white active:scale-95 transition-all shadow-[0_5px_0_rgb(6,95,70)] border-t border-white/20 uppercase tracking-widest"
            >
              HIGHER ▲
            </button>
            <button
              onClick={() => handleGuess('lower')}
              className="bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-black text-white active:scale-95 transition-all shadow-[0_5px_0_rgb(153,27,27)] border-t border-white/20 uppercase tracking-widest"
            >
              LOWER ▼
            </button>
          </div>
          <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] mb-4">Swipe Card or use Buttons</p>
        </>
      )}

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center">
            <div className="text-left">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">ANALYSIS STREAK</div>
                <div className="text-2xl font-black text-yellow-500 tabular-nums">{score}</div>
            </div>
            <div className="text-right">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">EST. YIELD</div>
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{(1 + score * payoutPerCorrect).toFixed(1)}x</div>
            </div>
        </div>
      </div>
    </div>
  );
};
