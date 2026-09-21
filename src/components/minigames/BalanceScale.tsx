import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface BalanceScaleProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instructions?: string;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title,
  instructions
}) => {
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

  const displayTitle = title || (tier === 'PRESIDENT' ? 'CENTRAL BANK MONETARY POLICY' : 'PHILANTHROPY ALLOCATION BALANCE');
  const displayInstructions = instructions || 'Maintain equilibrium between inflation and growth targets';

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
          if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            window.navigator.vibrate([50, 30, 50]);
          }
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
      const multiplier = Math.max(0.5, Number((1.0 + score * 3.0).toFixed(2)));
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(100);
      }
      onCompleteRef.current(multiplier);
    }
  }, [timeLeft, failed, balance]);

  const handleCorrect = (amount: number, e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (failed) return;
    setBalance(prev => Math.max(0, Math.min(100, prev + amount)));
    setFeedback(amount < 0 ? 'left' : 'right');
    setTimeout(() => setFeedback(null), 100);
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  if (failed) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 text-center min-h-[380px]">
        <div className="text-5xl mb-3 animate-pulse">📉</div>
        <h2 className="text-2xl font-black text-red-500 mb-1 italic tracking-tighter uppercase">MARKET UNBALANCED</h2>
        <p className="text-slate-400 mb-4 font-bold uppercase tracking-widest text-[10px]">Asset equilibrium collapsed</p>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-xs text-left mb-6">
          <div className="text-[9px] text-red-400 font-black uppercase tracking-wider mb-1">FAILURE CAUSE:</div>
          <p className="text-[10px] text-slate-300 leading-tight">Extreme drift toward {balance <= 0 ? 'deflation/undersupply' : 'overheating/inflation'}.</p>
          <div className="text-[9px] text-indigo-300 font-bold mt-2">
            💡 NEXT ATTEMPT: Apply quick tap corrections rather than long delays.
          </div>
        </div>

        <button
          onClick={() => onCompleteRef.current(0.2)}
          onTouchStart={() => onCompleteRef.current(0.2)}
          className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          LIQUIDATE POSITION (0.20x YIELD)
        </button>
      </div>
    );
  }

  const deviation = Math.abs(50 - balance);
  const statusColor = deviation > 30 ? 'text-red-500' : deviation > 15 ? 'text-yellow-500' : 'text-emerald-500';

  return (
    <div
      className={`w-full transition-colors duration-200 flex flex-col items-center justify-center p-2 overflow-hidden min-h-[380px] ${
        deviation > 30 ? 'bg-red-950/10' : deviation > 15 ? 'bg-yellow-950/10' : 'bg-emerald-950/10'
      }`}
    >
      <div className="mb-6 text-center w-full">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">
          {displayTitle} <span className="text-yellow-500 text-xs">L{level}</span>
        </h2>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">{displayInstructions}</p>

        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-2xl border border-white/5">
          <div className="text-left flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">STABILITY</span>
            <span className={`text-xl font-black font-mono tabular-nums ${statusColor}`}>
              {Math.max(0, 100 - Math.floor(deviation * 2))}%
            </span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TIME</span>
            <span className="text-xl font-black font-mono text-white tabular-nums">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="w-full h-12 bg-black rounded-2xl relative mb-8 border-2 border-slate-800 shadow-inner flex items-center">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2 z-0" />
        <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-emerald-500/10 z-0" />

        <motion.div
          animate={{ left: `${balance}%` }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, bounce: 0 }}
          className={`absolute w-12 h-12 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center border-2 ${
            deviation > 30
              ? 'bg-red-500 border-red-300'
              : deviation > 15
              ? 'bg-yellow-500 border-yellow-300'
              : 'bg-emerald-500 border-emerald-300'
          }`}
          style={{ x: '-50%' }}
        >
          <div className="text-2xl">💰</div>
        </motion.div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onPointerDown={(e) => handleCorrect(-correctionPower, e)}
          onTouchStart={(e) => handleCorrect(-correctionPower, e)}
          className={`flex-1 py-5 rounded-2xl active:scale-95 transition-all text-3xl border-b-8 touch-manipulation ${
            feedback === 'left' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-slate-800 border-slate-900 text-slate-400'
          }`}
        >
          ⬅️ LEAN LEFT
        </button>
        <button
          onPointerDown={(e) => handleCorrect(correctionPower, e)}
          onTouchStart={(e) => handleCorrect(correctionPower, e)}
          className={`flex-1 py-5 rounded-2xl active:scale-95 transition-all text-3xl border-b-8 touch-manipulation ${
            feedback === 'right' ? 'bg-blue-500 border-blue-700 text-white' : 'bg-slate-800 border-slate-900 text-slate-400'
          }`}
        >
          RIGHT ➡️
        </button>
      </div>
    </div>
  );
};
