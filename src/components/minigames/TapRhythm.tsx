import React, { useState, useEffect, useRef } from 'react';

interface TapRhythmProps {
  onComplete: (multiplier: number) => void;
}

export const TapRhythm: React.FC<TapRhythmProps> = ({ onComplete }) => {
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [beats, setBeats] = useState<{ id: number; offset: number }[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const nextId = useRef(0);
  const TOTAL_BEATS = 8;
  const MAX_DURATION = 30000; // 30 seconds

  useEffect(() => {
    // Generate beats with some random spacing but ensuring exactly TOTAL_BEATS
    const intervals = [1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000];

    const timers = intervals.map((ms) => {
      return setTimeout(() => {
        if (!isGameOver) {
          setBeats(prev => [...prev, { id: nextId.current++, offset: 100 }]);
        }
      }, ms);
    });

    const timeoutTimer = setTimeout(() => {
      if (!isGameOver) {
        handleGameOver(hits, totalAttempts);
      }
    }, MAX_DURATION);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(timeoutTimer);
    };
  }, [isGameOver, hits, totalAttempts]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        const next = prev.map(b => ({ ...b, offset: b.offset - 1.5 }));
        const missed = next.filter(b => b.offset < 0);

        if (missed.length > 0) {
          const newTotal = totalAttempts + missed.length;
          setTotalAttempts(newTotal);
          if (newTotal >= TOTAL_BEATS) {
            handleGameOver(hits, newTotal);
          }
        }

        return next.filter(b => b.offset >= 0);
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [hits, totalAttempts, isGameOver]);

  const handleGameOver = (finalHits: number, finalAttempts: number) => {
    if (isGameOver) return;
    setIsGameOver(true);

    // Accuracy affects track quality (90%+ = 2x yield, 70-89% = 1.5x, below = 0.8x)
    const accuracy = finalAttempts > 0 ? finalHits / finalAttempts : 0;
    let multiplier = 0.8;
    if (accuracy >= 0.9) multiplier = 2.0;
    else if (accuracy >= 0.7) multiplier = 1.5;

    onComplete(multiplier);
  };

  const handleTap = () => {
    if (isGameOver) return;

    const targetRange = [10, 25]; // Target is between 10% and 25% from left
    const hitIndex = beats.findIndex(b => b.offset >= targetRange[0] && b.offset <= targetRange[1]);

    if (hitIndex !== -1) {
      setHits(h => h + 1);
      setBeats(prev => prev.filter((_, i) => i !== hitIndex));
    }

    const newTotal = totalAttempts + 1;
    setTotalAttempts(newTotal);

    if (newTotal >= TOTAL_BEATS) {
      handleGameOver(hitIndex !== -1 ? hits + 1 : hits, newTotal);
    }
  };

  return (
    <div
      onClick={handleTap}
      className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none h-64 flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-8">
        8-BEAT SESSION ({hits}/{TOTAL_BEATS})
      </div>

      <div className="w-full h-12 bg-slate-800 relative rounded-full border border-slate-700">
        {/* Target Zone */}
        <div className="absolute left-[15%] top-0 bottom-0 w-[10%] bg-blue-500/30 border-x border-blue-400 z-0 animate-pulse" />

        {/* Moving Beats */}
        {beats.map(beat => (
          <div
            key={beat.id}
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10"
            style={{ left: `${beat.offset}%` }}
          />
        ))}
      </div>

      <div className="mt-8 text-[10px] text-blue-400 font-mono">
        90%+ ACCURACY = 2X YIELD | 70%+ = 1.5X
      </div>

      <div className="absolute bottom-4 text-[8px] text-slate-600 font-bold uppercase">
        TAP ON THE BEAT
      </div>
    </div>
  );
};
