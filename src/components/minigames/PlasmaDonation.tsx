import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier, getPrecisionFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface PlasmaDonationProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const PlasmaDonation: React.FC<PlasmaDonationProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [needlePos, setNeedlePos] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [round, setRound] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const direction = useRef(1);
  const requestRef = useRef<number | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const precisionFactor = getPrecisionFactor(level, tier);

  const totalRounds = 3;
  // Difficulty scaling: needle speed increases, target zone shrinks
  const needleSpeed = (2.5 + (level - 1) * 0.5) * Math.sqrt(scaling);
  const targetSize = Math.max(10, 25 * precisionFactor);
  const targetPos = useRef(20 + Math.random() * 60);

  const animate = (_time: number) => {
    if (!isStopped) {
      setNeedlePos(prev => {
        let next = prev + direction.current * needleSpeed;
        if (next > 100) {
          next = 100;
          direction.current = -1;
        } else if (next < 0) {
          next = 0;
          direction.current = 1;
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStopped, needleSpeed]);

  const handleStop = () => {
    if (isStopped) return;
    setIsStopped(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const dist = Math.abs(needlePos - targetPos.current);
    let accuracy = 0;
    if (dist < targetSize / 2) accuracy = 1.0;
    else if (dist < targetSize) accuracy = 0.5;
    else accuracy = 0.1;

    const newResults = [...results, accuracy];
    setResults(newResults);

    if (navigator.vibrate) {
        if (accuracy === 1.0) navigator.vibrate(50);
        else if (accuracy === 0.5) navigator.vibrate(20);
        else navigator.vibrate([30, 30]);
    }

    setTimeout(() => {
      if (round < totalRounds) {
        setRound(prev => prev + 1);
        setIsStopped(false);
        setNeedlePos(0);
        direction.current = 1;
        targetPos.current = 20 + Math.random() * 60;
      } else {
        const avgAccuracy = newResults.reduce((a, b) => a + b, 0) / totalRounds;
        // Scaled multiplier
        const multiplier = (0.5 + avgAccuracy * 2.5) * (0.9 + scaling * 0.1);
        onComplete(multiplier);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-transparent space-y-6 w-full mx-auto overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,red_0%,transparent_70%)]" />

      <div className="text-center z-10">
        <h2 className="text-2xl font-black text-red-500 italic uppercase tracking-tighter mb-1">PLASMA DONATION <span className="text-white text-xs">L{level}</span></h2>
        <div className="flex justify-center gap-2">
            {[...Array(totalRounds)].map((_, i) => (
                <div key={i} className={`w-8 h-1 rounded-full ${i + 1 < round ? 'bg-red-500' : i + 1 === round ? 'bg-white animate-pulse' : 'bg-slate-800'}`} />
            ))}
        </div>
      </div>

      <div className="relative w-full h-12 bg-slate-900 rounded-full border-2 border-slate-800 overflow-hidden z-10 shadow-inner">
        {/* Target Zone */}
        <div
          className="absolute top-0 bottom-0 bg-red-600/30 border-x border-red-500/50"
          style={{ left: `${targetPos.current - targetSize / 2}%`, width: `${targetSize}%` }}
        >
            <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-full h-full bg-red-500/20"
            />
        </div>

        {/* Needle */}
        <motion.div
          className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_15px_white] z-20"
          style={{ left: `${needlePos}%` }}
        />
      </div>

      <button
        onPointerDown={handleStop}
        disabled={isStopped}
        className={`w-full py-6 rounded-2xl font-black text-xl transition-all active:scale-95 border-b-8 z-10 uppercase italic ${
          isStopped ? 'bg-slate-800 text-slate-500 border-slate-950' : 'bg-red-600 text-white border-red-800 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
        }`}
      >
        {isStopped ? 'DRAWING...' : 'STRIKE VEIN'}
      </button>

      <div className="text-center opacity-40 z-10">
        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">VEIN STABILITY</div>
        <div className="text-xs font-mono font-black text-white">ROUND {round} / {totalRounds}</div>
      </div>
    </div>
  );
};
