import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionGridProps {
  onComplete: (multiplier: number) => void;
}

export const ReactionGrid: React.FC<ReactionGridProps> = ({ onComplete }) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      const multiplier = Math.max(0.5, Math.min(3.0, hits / 10));
      onComplete(multiplier);
    }
  }, [isStarted, timeLeft, hits]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const spawn = () => {
        setActiveCell(Math.floor(Math.random() * 9));
      };
      spawn();
      const interval = setInterval(spawn, 800 - Math.min(400, hits * 20));
      return () => clearInterval(interval);
    }
  }, [isStarted, timeLeft, hits]);

  const handleHit = (index: number) => {
    if (index === activeCell) {
      setHits(prev => prev + 1);
      setActiveCell(null);
    }
  };

  if (!isStarted) {
    return (
      <div className="h-[400px] w-full bg-slate-950 border-4 border-indigo-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-indigo-400 mb-4 uppercase">Logistics Sorting</h2>
        <p className="text-slate-400 mb-8 uppercase text-xs tracking-widest">Tap the active hubs as fast as possible</p>
        <button
          onClick={() => setIsStarted(true)}
          className="px-10 py-4 bg-indigo-600 text-white font-black rounded-full hover:bg-indigo-500 transition-all"
        >
          START SORTING
        </button>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-2">
        <div className="text-xs font-bold text-slate-500 uppercase">TIME: <span className="text-white font-mono">{timeLeft}s</span></div>
        <div className="text-xs font-bold text-slate-500 uppercase">HITS: <span className="text-indigo-400 font-mono">{hits}</span></div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-4">
        {[...Array(9)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleHit(i)}
            className={`aspect-square rounded-xl transition-all duration-100 ${
              activeCell === i
                ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105'
                : 'bg-slate-800 active:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
