import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface BalanceScaleProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [balance, setBalance] = useState(50); // 0 to 100, 50 is perfectly balanced
  const [timeLeft, setTimeLeft] = useState(10);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<'left' | 'right' | null>(null);
  const requestRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: base drift and acceleration increase with level and tier
  const baseDrift = (0.4 + (level - 1) * 0.2) * Math.sqrt(scaling);
  const driftAcceleration = (0.005 + (level - 1) * 0.002) * Math.sqrt(scaling);
  const correctionPower = Math.max(5, (12 - (level - 1)) / Math.sqrt(scaling));

  const driftRef = useRef(Math.random() > 0.5 ? baseDrift : -baseDrift);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const animate = () => {
      setBalance(prev => {
        const newBalance = prev + driftRef.current;
        if (newBalance <= 0 || newBalance >= 100) {
          setFailed(true);
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
          return newBalance <= 0 ? 0 : 100;
        }
        // Increase drift over time
        driftRef.current += (prev - 50) * driftAcceleration;
        return newBalance;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(timer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [driftAcceleration]);

  useEffect(() => {
    if (timeLeft === 0 && !failed) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const score = 1 - Math.abs(50 - balance) / 50;
      const multiplier = 1.0 + score * 3.0;
      if (navigator.vibrate) navigator.vibrate(100);
      onCompleteRef.current(multiplier);
    }
  }, [timeLeft, failed, balance]);

  const handleCorrect = (amount: number) => {
    if (failed) return;
    setBalance(prev => Math.max(0, Math.min(100, prev + amount)));
    setFeedback(amount < 0 ? 'left' : 'right');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  if (failed) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-5xl mb-4 animate-pulse">📉</div>
        <h2 className="text-2xl font-black text-red-500 mb-2 italic tracking-tighter uppercase">MARKET CRASH</h2>
        <p className="text-slate-400 mb-6 font-bold uppercase tracking-widest text-[10px]">You lost control of the assets</p>
        <button
          onClick={() => onCompleteRef.current(0.2)}
          className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          LIQUIDATE POSITION
        </button>
      </div>
    );
  }

  const deviation = Math.abs(50 - balance);
  const statusColor = deviation > 30 ? 'text-red-500' : deviation > 15 ? 'text-yellow-500' : 'text-emerald-500';

  return (
    <div className={`w-full transition-colors duration-200 flex flex-col items-center justify-center p-2 overflow-hidden ${
        deviation > 30 ? 'bg-red-950/10' : deviation > 15 ? 'bg-yellow-950/10' : 'bg-emerald-950/10'
    }`}>
      <div className="mb-10 text-center w-full">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">ASSET BALANCE <span className="text-yellow-500 text-sm">L{level}</span></h2>
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-white/5">
            <div className="text-left flex flex-col">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">STABILITY</span>
                <span className={`text-2xl font-black font-mono tabular-nums ${statusColor}`}>
                    {Math.max(0, 100 - Math.floor(deviation * 2))}%
                </span>
            </div>
            <div className="text-right flex flex-col">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TIME</span>
                <span className="text-2xl font-black font-mono text-white tabular-nums">{timeLeft}s</span>
            </div>
        </div>
      </div>

      <div className="w-full h-12 bg-black rounded-2xl relative mb-12 border-2 border-slate-800 shadow-inner flex items-center">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2 z-0" />
        <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-emerald-500/10 z-0" />

        <motion.div
          animate={{ left: `${balance}%` }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, bounce: 0 }}
          className={`absolute w-12 h-12 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center border-2 ${
              deviation > 30 ? 'bg-red-500 border-red-300' : deviation > 15 ? 'bg-yellow-500 border-yellow-300' : 'bg-emerald-500 border-emerald-300'
          }`}
          style={{ x: '-50%' }}
        >
            <div className="text-2xl">💰</div>
        </motion.div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onPointerDown={() => handleCorrect(-correctionPower)}
          className={`flex-1 py-6 rounded-2xl active:scale-95 transition-all text-4xl border-b-8 ${
              feedback === 'left' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-slate-800 border-slate-900 text-slate-400'
          }`}
        >
          ⬅️
        </button>
        <button
          onPointerDown={() => handleCorrect(correctionPower)}
          className={`flex-1 py-6 rounded-2xl active:scale-95 transition-all text-4xl border-b-8 ${
              feedback === 'right' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-slate-800 border-slate-900 text-slate-400'
          }`}
        >
          ➡️
        </button>
      </div>
    </div>
  );
};
