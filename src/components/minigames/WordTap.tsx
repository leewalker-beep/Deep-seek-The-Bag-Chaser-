import React, { useState, useEffect, useCallback, useRef } from 'react';

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
        x: 10 + Math.random() * 80,
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
    if (isGood) setScore(s => s + 1);
    else setScore(s => Math.max(0, s - 2));

    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div
      ref={gameRef}
      className="bg-slate-900 p-6 rounded-2xl border border-blue-400/30 text-center select-none touch-none h-80 flex flex-col items-center relative overflow-hidden"
    >
      <div className="absolute top-4 flex justify-between w-full px-6 z-10">
        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">PR HEADLINE CRAFTER</div>
        <div className="text-[10px] text-emerald-400 font-mono font-bold">HYPE: {score}</div>
        <div className="text-[10px] text-white font-mono">{timeLeft.toFixed(1)}s</div>
      </div>

      <div className="relative w-full h-full mt-8">
        {words.map(word => (
          <button
            key={word.id}
            onClick={() => handleTap(word.id, word.isGood)}
            className={`absolute px-3 py-1 rounded-full text-[10px] font-black transition-transform active:scale-90 ${
              word.isGood ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
            }`}
            style={{ left: `${word.x}%`, top: `${word.y}%`, transform: 'translateX(-50%)' }}
          >
            {word.text}
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 text-[8px] text-slate-500 uppercase font-bold">
        Tap GREEN words to build HYPE • Avoid RED words
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-20">
          <div className="text-2xl font-black text-white italic">CAMPAIGN ENDED</div>
        </div>
      )}
    </div>
  );
};
