import React, { useState, useEffect, useRef } from 'react';

interface TapRhythmProps {
  onComplete: (multiplier: number) => void;
}

export const TapRhythm: React.FC<TapRhythmProps> = ({ onComplete }) => {
  const [hits, setHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [beats, setBeats] = useState<{ id: number; offset: number }[]>([]);
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeats(prev => [...prev, { id: nextId.current++, offset: 100 }]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBeats(prev => {
        const next = prev.map(b => ({ ...b, offset: b.offset - 2 }));
        const missed = next.filter(b => b.offset < 0);
        if (missed.length > 0) {
          setTotalAttempts(t => t + missed.length);
          if (totalAttempts + missed.length >= 10) {
            // End game after 10 beats
            const accuracy = hits / (totalAttempts + missed.length);
            onComplete(accuracy >= 0.9 ? 2.0 : (accuracy >= 0.7 ? 1.5 : 1.0));
          }
        }
        return next.filter(b => b.offset >= 0);
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [hits, totalAttempts, onComplete]);

  const handleTap = () => {
    const targetRange = [10, 25]; // Target is between 10% and 25% from left
    const hitIndex = beats.findIndex(b => b.offset >= targetRange[0] && b.offset <= targetRange[1]);

    if (hitIndex !== -1) {
      setHits(h => h + 1);
      setBeats(prev => prev.filter((_, i) => i !== hitIndex));
    }
    setTotalAttempts(t => t + 1);

    if (totalAttempts + 1 >= 10) {
      const accuracy = (hitIndex !== -1 ? hits + 1 : hits) / (totalAttempts + 1);
      onComplete(accuracy >= 0.9 ? 2.0 : (accuracy >= 0.7 ? 1.5 : 1.0));
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none h-64 flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-8">
        TAP ON THE BEAT ({hits}/{totalAttempts})
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
        HIT 90% FOR 2X YIELD
      </div>

      <div className="absolute bottom-4 text-[8px] text-slate-600 font-bold uppercase">
        TAP ANYWHERE TO CAPTURE THE BEAT
      </div>
    </div>
  );
};
