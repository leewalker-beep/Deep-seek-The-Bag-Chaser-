import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HigherLowerProps {
  onComplete: (multiplier: number) => void;
}

const SUITS = ['♠️', '♥️', '♣️', '♦️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card {
  value: number;
  label: string;
  suit: string;
}

export const HigherLower: React.FC<HigherLowerProps> = ({ onComplete }) => {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

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
    } else {
      setStrikes(prev => prev + 1);
      setFeedback('WRONG');
    }

    setTimeout(() => {
      if (!isCorrect && strikes + 1 >= 3) {
        setIsGameOver(true);
      } else {
        setCurrentCard(nextCard);
        setNextCard(getRandomCard());
        setFeedback(null);
      }
    }, 1000);
  };

  const handleComplete = () => {
    const multiplier = Math.max(0.5, 1 + score * 0.4);
    onComplete(multiplier);
  };

  if (!currentCard) return null;

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border-4 border-yellow-500 shadow-2xl text-center max-w-sm mx-auto font-mono">
      <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter">Higher or Lower</h2>

      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map(s => (
          <motion.div
            key={s}
            animate={strikes >= s ? { scale: [1, 1.5, 1], opacity: 1 } : { opacity: 0.2 }}
            className="text-2xl text-red-500"
          >
            ❌
          </motion.div>
        ))}
      </div>

      <div className="relative h-64 w-44 mx-auto mb-8">
        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div
              key={`${currentCard.label}-${currentCard.suit}`}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y < -50) handleGuess('higher');
                else if (info.offset.y > 50) handleGuess('lower');
              }}
              className="absolute inset-0 bg-white rounded-xl shadow-xl flex flex-col justify-between p-4 text-black border-2 border-slate-200 cursor-grab active:cursor-grabbing"
            >
              <div className="text-left">
                <div className="text-2xl font-bold leading-none">{currentCard.label}</div>
                <div className="text-xl">{currentCard.suit}</div>
              </div>
              <div className="text-6xl self-center">{currentCard.suit}</div>
              <div className="text-right rotate-180">
                <div className="text-2xl font-bold leading-none">{currentCard.label}</div>
                <div className="text-xl">{currentCard.suit}</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 rounded-xl border-2 border-red-500 p-4"
            >
              <div className="text-red-500 font-black text-xl mb-4">GAME OVER</div>
              <button
                onClick={handleComplete}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                COLLECT REWARD
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {feedback && !isGameOver && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            className={`absolute inset-0 flex items-center justify-center z-10 font-black text-4xl italic drop-shadow-lg ${feedback === 'CORRECT' ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      {!isGameOver && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleGuess('higher')}
              className="bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black text-white active:scale-95 transition-all shadow-lg"
            >
              HIGHER ▲
            </button>
            <button
              onClick={() => handleGuess('lower')}
              className="bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-white active:scale-95 transition-all shadow-lg"
            >
              LOWER ▼
            </button>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">Swipe Up/Down or use buttons</p>
        </>
      )}

      <div className="mt-6 text-yellow-500 font-bold">
        STREAK: {score} | MULTIPLIER: {(1 + score * 0.4).toFixed(1)}x
      </div>
    </div>
  );
};
