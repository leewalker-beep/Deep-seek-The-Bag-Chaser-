import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface RouletteProps {
  onComplete: (multiplier: number) => void;
}

type BetType = 'RED' | 'BLACK' | 'ODD' | 'EVEN' | 'NUMBER';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export const Roulette: React.FC<RouletteProps> = ({ onComplete }) => {
  const [selectedBet, setSelectedBet] = useState<{ type: BetType; value?: number } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleBet = (type: BetType, value?: number) => {
    if (isSpinning) return;
    setSelectedBet({ type, value });
  };

  const spin = async () => {
    if (!selectedBet || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const winningIndex = Math.floor(Math.random() * 37);
    const winningNumber = WHEEL_ORDER[winningIndex];

    // Calculate rotation
    // Each segment is 360 / 37 degrees
    const segmentAngle = 360 / 37;
    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = (extraSpins * 360) + (winningIndex * segmentAngle);

    await controls.start({
      rotate: -finalRotation,
      transition: { duration: 4, ease: [0.1, 0, 0.1, 1] }
    });

    setResult(winningNumber);
    setIsSpinning(false);

    // Calculate win
    let won = false;
    let multiplier = 0.5;

    if (selectedBet.type === 'RED' && RED_NUMBERS.includes(winningNumber)) won = true;
    else if (selectedBet.type === 'BLACK' && winningNumber !== 0 && !RED_NUMBERS.includes(winningNumber)) won = true;
    else if (selectedBet.type === 'ODD' && winningNumber !== 0 && winningNumber % 2 !== 0) won = true;
    else if (selectedBet.type === 'EVEN' && winningNumber !== 0 && winningNumber % 2 === 0) won = true;
    else if (selectedBet.type === 'NUMBER' && selectedBet.value === winningNumber) won = true;

    if (won) {
      multiplier = selectedBet.type === 'NUMBER' ? 36.0 : 2.0;
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
    <div className="bg-slate-900 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl text-center max-w-sm mx-auto font-mono">
      <h2 className="text-2xl font-black text-yellow-500 mb-6 uppercase tracking-tighter">Roulette</h2>

      <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 z-10 w-1 h-8 bg-white rounded-full shadow-lg" />

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          animate={controls}
          className="w-full h-full rounded-full border-4 border-slate-800 relative overflow-hidden bg-slate-950"
          style={{ transformOrigin: 'center' }}
        >
          {WHEEL_ORDER.map((num, i) => (
            <div
              key={i}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1/2 origin-bottom ${getColor(num)}`}
              style={{ transform: `rotate(${i * (360 / 37)}deg)` }}
            >
              <span className="text-[8px] font-bold text-white pt-1 block">{num}</span>
            </div>
          ))}
          <div className="absolute inset-4 rounded-full bg-slate-900 border-2 border-slate-800 shadow-inner" />
        </motion.div>

        {result !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute z-20 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow-2xl ${getColor(result)}`}
          >
            {result}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => handleBet('RED')}
          className={`py-3 rounded-lg font-bold border-2 transition-all ${selectedBet?.type === 'RED' ? 'bg-red-600 border-white text-white' : 'bg-slate-800 border-red-600 text-red-500'}`}
        >
          RED (2x)
        </button>
        <button
          onClick={() => handleBet('BLACK')}
          className={`py-3 rounded-lg font-bold border-2 transition-all ${selectedBet?.type === 'BLACK' ? 'bg-slate-950 border-white text-white' : 'bg-slate-800 border-slate-400 text-slate-400'}`}
        >
          BLACK (2x)
        </button>
        <button
          onClick={() => handleBet('ODD')}
          className={`py-3 rounded-lg font-bold border-2 transition-all ${selectedBet?.type === 'ODD' ? 'bg-blue-600 border-white text-white' : 'bg-slate-800 border-blue-600 text-blue-500'}`}
        >
          ODD (2x)
        </button>
        <button
          onClick={() => handleBet('EVEN')}
          className={`py-3 rounded-lg font-bold border-2 transition-all ${selectedBet?.type === 'EVEN' ? 'bg-purple-600 border-white text-white' : 'bg-slate-800 border-purple-600 text-purple-500'}`}
        >
          EVEN (2x)
        </button>
      </div>

      <div className="mb-6">
         <div className="text-[10px] text-slate-500 uppercase mb-2">Or pick a number (36x)</div>
         <div className="flex overflow-x-auto gap-1 pb-2 no-scrollbar">
            {WHEEL_ORDER.map(n => (
              <button
                key={n}
                onClick={() => handleBet('NUMBER', n)}
                className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold border ${selectedBet?.type === 'NUMBER' && selectedBet.value === n ? 'border-white scale-110' : 'border-transparent'} ${getColor(n)} text-white`}
              >
                {n}
              </button>
            ))}
         </div>
      </div>

      <button
        onClick={spin}
        disabled={!selectedBet || isSpinning}
        className={`w-full py-4 rounded-xl font-black transition-all ${!selectedBet || isSpinning ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 text-black shadow-[0_5px_0_rgb(161,98,7)] active:translate-y-1'}`}
      >
        {isSpinning ? 'SPINNING...' : selectedBet ? 'SPIN WHEEL' : 'SELECT A BET'}
      </button>

      <p className="mt-4 text-[8px] text-slate-500 uppercase tracking-widest">Place your bets • High stakes</p>
    </div>
  );
};
