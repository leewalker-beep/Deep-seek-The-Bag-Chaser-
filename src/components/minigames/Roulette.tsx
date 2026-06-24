import React, { useState, useRef, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface RouletteProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

type BetType = 'RED' | 'BLACK' | 'ODD' | 'EVEN' | 'NUMBER';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export const Roulette: React.FC<RouletteProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [selectedBet, setSelectedBet] = useState<{ type: BetType; value?: number } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: Higher tiers pay more but have higher stakes
  const bonusMultiplier = useMemo(() => 0.8 + scaling * 0.4, [scaling]);

  const handleBet = (type: BetType, value?: number) => {
    if (isSpinning || outcome) return;
    setSelectedBet({ type, value });
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const spin = async () => {
    if (!selectedBet || isSpinning || outcome) return;

    setIsSpinning(true);
    setResult(null);
    setOutcome(null);

    const winningIndex = Math.floor(Math.random() * 37);
    const winningNumber = WHEEL_ORDER[winningIndex];

    const segmentAngle = 360 / 37;
    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = (extraSpins * 360) + (winningIndex * segmentAngle);

    await controls.start({
      rotate: -finalRotation,
      transition: { duration: 4, ease: [0.1, 0, 0.1, 1] }
    });

    setResult(winningNumber);
    setIsSpinning(false);

    let won = false;
    let multiplier = 0.5;

    if (selectedBet.type === 'RED' && RED_NUMBERS.includes(winningNumber)) won = true;
    else if (selectedBet.type === 'BLACK' && winningNumber !== 0 && !RED_NUMBERS.includes(winningNumber)) won = true;
    else if (selectedBet.type === 'ODD' && winningNumber !== 0 && winningNumber % 2 !== 0) won = true;
    else if (selectedBet.type === 'EVEN' && winningNumber !== 0 && winningNumber % 2 === 0) won = true;
    else if (selectedBet.type === 'NUMBER' && selectedBet.value === winningNumber) won = true;

    if (won) {
      multiplier = selectedBet.type === 'NUMBER' ? (36.0 * bonusMultiplier) : (2.0 * bonusMultiplier);
      setOutcome('win');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
      setOutcome('lose');
      if (navigator.vibrate) navigator.vibrate(50);
    }

    setTimeout(() => {
      onComplete(multiplier);
    }, 2000);
  };

  const getColor = (num: number) => {
    if (num === 0) return 'bg-emerald-500';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-slate-900';
  };

  return (
    <div className={`transition-colors duration-500 bg-slate-950 p-6 rounded-3xl border-4 shadow-2xl text-center max-w-sm mx-auto font-mono ${
        outcome === 'win' ? 'border-emerald-500 bg-emerald-950/20' :
        outcome === 'lose' ? 'border-red-500 bg-red-950/20' :
        'border-yellow-600'
    }`}>
      <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic">ROULETTE <span className="text-white text-xs">L{level}</span></h2>
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-6">WIN MULTIPLIER: {bonusMultiplier.toFixed(1)}x</p>

      <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 z-10 w-2 h-10 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-slate-400" />

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          animate={controls}
          className="w-full h-full rounded-full border-8 border-slate-800 relative overflow-hidden bg-slate-950 shadow-2xl"
          style={{ transformOrigin: 'center' }}
        >
          {WHEEL_ORDER.map((num, i) => (
            <div
              key={i}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1/2 origin-bottom border-x border-black/10 ${getColor(num)}`}
              style={{ transform: `rotate(${i * (360 / 37)}deg)` }}
            >
              <span className="text-[8px] font-black text-white pt-1 block">{num}</span>
            </div>
          ))}
          <div className="absolute inset-8 rounded-full bg-slate-900 border-4 border-slate-800 shadow-inner" />
        </motion.div>

        <AnimatePresence>
            {result !== null && (
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`absolute z-20 w-20 h-20 rounded-full flex flex-col items-center justify-center text-3xl font-black text-white border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] ${getColor(result)}`}
            >
                {result}
                <div className="text-[8px] uppercase tracking-widest mt-1">
                    {result === 0 ? 'ZERO' : RED_NUMBERS.includes(result) ? 'RED' : 'BLACK'}
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['RED', 'BLACK', 'ODD', 'EVEN'] as BetType[]).map(type => (
            <button
                key={type}
                onClick={() => handleBet(type)}
                disabled={isSpinning || !!outcome}
                className={`py-3 rounded-xl font-black border-2 transition-all active:scale-95 ${
                    selectedBet?.type === type ?
                    'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' :
                    'bg-slate-800 border-slate-700 text-slate-400 hover:border-white/20'
                } uppercase text-[10px] tracking-tighter`}
            >
                {type} ({(2 * bonusMultiplier).toFixed(1)}X)
            </button>
        ))}
      </div>

      <div className="mb-8">
         <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">SINGLE NUMBER ({(36 * bonusMultiplier).toFixed(1)}X)</div>
         <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
            {WHEEL_ORDER.map(n => (
              <button
                key={n}
                onClick={() => handleBet('NUMBER', n)}
                disabled={isSpinning || !!outcome}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${
                    selectedBet?.type === 'NUMBER' && selectedBet.value === n ?
                    'border-white bg-white text-black scale-110' :
                    `border-slate-800 ${getColor(n)} text-white/80 hover:border-white/20`
                }`}
              >
                {n}
              </button>
            ))}
         </div>
      </div>

      <button
        onClick={spin}
        disabled={!selectedBet || isSpinning || !!outcome}
        className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 border-b-8 ${
            !selectedBet || isSpinning || !!outcome ?
            'bg-slate-800 text-slate-600 border-slate-900' :
            'bg-yellow-500 text-black border-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
        } uppercase italic tracking-tighter text-xl`}
      >
        {isSpinning ? 'SPINNING...' : outcome ? 'ROUND ENDED' : selectedBet ? 'SPIN THE WHEEL' : 'PLACE YOUR BET'}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
        <div className="h-px bg-slate-800 flex-1" />
        <p className="text-[8px] text-slate-500 uppercase font-black tracking-[0.3em]">Corporate Casino</p>
        <div className="h-px bg-slate-800 flex-1" />
      </div>
    </div>
  );
};
