import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenprintMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

export const ScreenprintMinigame: React.FC<ScreenprintMinigameProps> = ({ onComplete, scaling }) => {
  const [round, setRound] = useState(1);
  const [pointerPos, setPointerPos] = useState(50); // 0 to 100
  const [isPressing, setIsPressing] = useState(false);
  const [roundResults, setRoundResults] = useState<{ percentage: number; rating: 'PERFECT' | 'GOOD' | 'MISS' }[]>([]);
  const [showResultOverlay, setShowResultOverlay] = useState<'PERFECT' | 'GOOD' | 'MISS' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const pointerPosRef = useRef(50);
  const animationFrameId = useRef<number | null>(null);
  const timeAccumulatorRef = useRef(0);

  // Speed scales with round and global scaling factor
  const baseSpeed = 1.6;
  const currentSpeed = baseSpeed * (1 + (round - 1) * 0.15) * (0.8 + scaling * 0.2);

  // Oscillating movement loop
  useEffect(() => {
    if (gameOver || isPressing) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    let lastTime = performance.now();

    const updatePointer = (time: number) => {
      const delta = (time - lastTime) / 16.67; // normalize to ~60fps
      lastTime = time;

      // Math.sin yields value between -1 and 1. We scale currentSpeed * 0.04 to represent phase delta.
      timeAccumulatorRef.current += currentSpeed * 0.035 * delta;

      const sineVal = Math.sin(timeAccumulatorRef.current);
      // Map -1..1 range linearly to 0..100 range
      const nextPos = (sineVal + 1) * 50;

      pointerPosRef.current = nextPos;
      setPointerPos(nextPos);

      animationFrameId.current = requestAnimationFrame(updatePointer);
    };

    animationFrameId.current = requestAnimationFrame(updatePointer);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [round, gameOver, isPressing, currentSpeed]);

  const handlePressPrint = () => {
    if (gameOver || isPressing) return;
    setIsPressing(true);

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

    // Calculate distance from center (center = 50)
    const distanceFromCenter = Math.abs(pointerPosRef.current - 50);

    let rating: 'PERFECT' | 'GOOD' | 'MISS' = 'MISS';
    let contribution = 0.2;

    if (distanceFromCenter < 2.5) { // <5% total track width from center (since max distance is 50)
      rating = 'PERFECT';
      contribution = 1.0;
    } else if (distanceFromCenter < 7.5) { // 5% to 15% total track width from center
      rating = 'GOOD';
      contribution = 0.6;
    } else {
      rating = 'MISS';
      contribution = 0.2;
    }

    const newResults = [...roundResults, { percentage: contribution, rating }];
    setRoundResults(newResults);
    setShowResultOverlay(rating);

    if (navigator.vibrate) {
      if (rating === 'PERFECT') navigator.vibrate([40, 40]);
      else if (rating === 'GOOD') navigator.vibrate(30);
      else navigator.vibrate(80);
    }

    setTimeout(() => {
      setShowResultOverlay(null);
      if (round < 3) {
        setRound(r => r + 1);
        // Randomize starting phase angle (0 to 2*PI) so that starting position and direction are fully randomized
        timeAccumulatorRef.current = Math.random() * Math.PI * 2;
        setIsPressing(false);
      } else {
        setGameOver(true);
        // Calculate final average contribution
        const totalContribution = newResults.reduce((acc, curr) => acc + curr.percentage, 0);
        const avgContribution = totalContribution / 3;

        // Map final contribution to game multiplier (existing range standard: 0.5 to 3.0)
        // 1.0 avg -> 3.0 max, 0.2 avg -> 0.5 min
        // Linear interpolation: multiplier = 0.5 + (avg - 0.2) * (2.5 / 0.8)
        let finalMultiplier = 0.5 + ((avgContribution - 0.2) / 0.8) * 2.5;
        finalMultiplier = Math.max(0.5, Math.min(3.0, finalMultiplier));

        setTimeout(() => {
          onComplete(finalMultiplier);
        }, 1200);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[450px]">
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-amber-500 tracking-tight italic">SCREENPRINT TEES</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ROUND {round} / 3</p>
      </div>

      {/* Target Preview Mock */}
      <div className="relative w-28 h-28 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-5xl select-none animate-pulse">👕</span>
        {/* Registration Overlay Effect */}
        <div className={`absolute inset-0 border-2 rounded-2xl transition-colors duration-300 ${
          isPressing && roundResults[round - 1]?.rating === 'PERFECT' ? 'border-emerald-500 bg-emerald-500/10' :
          isPressing && roundResults[round - 1]?.rating === 'GOOD' ? 'border-yellow-500 bg-yellow-500/10' :
          isPressing ? 'border-red-500 bg-red-500/10' : 'border-transparent'
        }`} />
      </div>

      {/* Timing Gauge Track */}
      <div className="w-full max-w-sm px-6 mb-8 relative">
        <div className="h-6 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-emerald-500 via-yellow-500 to-red-500 relative border-2 border-slate-800 overflow-hidden shadow-inner">
          {/* Optimal Registration Zone - Centered, ~15% wide (42.5 to 57.5) */}
          <div className="absolute top-0 bottom-0 left-[42.5%] right-[42.5%] bg-yellow-400 opacity-60 border-l border-r border-white animate-pulse" />
          <div className="absolute top-0 bottom-0 left-[47.5%] right-[47.5%] bg-amber-400 opacity-90" /> {/* Perfect Spot center */}

          {/* Pointer needle */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-white border border-slate-950 shadow-md rounded-full transition-shadow"
            style={{ left: `${pointerPos}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase mt-1 px-1">
          <span>Out of Reg</span>
          <span className="text-yellow-400 font-extrabold">GOLDEN ZONE</span>
          <span>Out of Reg</span>
        </div>
      </div>

      {/* Result Indicator Badge Overlay */}
      <AnimatePresence>
        {showResultOverlay && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`absolute top-1/2 -translate-y-1/2 px-6 py-3 rounded-2xl font-black text-lg tracking-widest z-10 shadow-2xl ${
              showResultOverlay === 'PERFECT' ? 'bg-emerald-600 text-white border-2 border-emerald-400' :
              showResultOverlay === 'GOOD' ? 'bg-yellow-600 text-slate-950 border-2 border-yellow-400' :
              'bg-red-600 text-white border-2 border-red-400'
            }`}
          >
            {showResultOverlay}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Press Button */}
      <div className="w-full max-w-xs px-4">
        <button
          onClick={handlePressPrint}
          disabled={isPressing || gameOver}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-100 ${
            isPressing || gameOver
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-b-2 border-slate-950'
              : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 shadow-lg'
          }`}
        >
          {isPressing ? 'PRINTING...' : 'PRESS PRINT'}
        </button>
      </div>

      {/* Individual Round Lights */}
      <div className="flex gap-4 mt-6">
        {[1, 2, 3].map((num) => {
          const result = roundResults[num - 1];
          return (
            <div
              key={num}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${
                result?.rating === 'PERFECT' ? 'bg-emerald-500 border-emerald-400 text-slate-950' :
                result?.rating === 'GOOD' ? 'bg-yellow-500 border-yellow-400 text-slate-950' :
                result ? 'bg-red-500 border-red-400 text-white' :
                'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
