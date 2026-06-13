import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotMachineProps {
  onComplete: (multiplier: number) => void;
}

const SYMBOLS = ['💰', '💎', '🎰', '📈', '🔥', '🃏'];

export const SlotMachine: React.FC<SlotMachineProps> = ({ onComplete }) => {
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [result, setResult] = useState<string | null>(null);

  const spin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);

    let spinCount = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      spinCount++;

      if (spinCount > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 50);
  }, [isSpinning, spinsLeft]);

  useEffect(() => {
    if (!isSpinning && spinsLeft < 3) {
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        setResult('JACKPOT! 4.0x');
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        setResult('BIG WIN! 2.0x');
      } else {
        setResult('Small Win 1.0x');
      }
    }
  }, [isSpinning, reels, spinsLeft]);

  const handleFinish = () => {
    let multiplier = 1.0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) multiplier = 4.0;
    else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) multiplier = 2.0;

    onComplete(multiplier);
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center">
      <h2 className="text-2xl font-black text-yellow-500 mb-6 uppercase tracking-tighter">Corporate Casino</h2>

      <div className="flex justify-center gap-4 mb-8">
        {reels.map((symbol, i) => (
          <motion.div
            key={i}
            animate={isSpinning ? { y: [0, -20, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="w-20 h-28 bg-black border-2 border-slate-700 rounded-xl flex items-center justify-center text-5xl shadow-inner"
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {result && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xl font-bold text-emerald-400 mb-4"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <button
          onClick={spin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`py-4 rounded-xl font-black text-lg transition-all ${
            isSpinning || spinsLeft <= 0
              ? 'bg-slate-800 text-slate-600'
              : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95 shadow-[0_5px_0_rgb(161,98,7)]'
          }`}
        >
          {isSpinning ? 'SPINNING...' : `SPIN REELS (${spinsLeft} LEFT)`}
        </button>

        {spinsLeft === 0 && !isSpinning && (
          <button
            onClick={handleFinish}
            className="py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 animate-pulse"
          >
            COLLECT WINNINGS
          </button>
        )}
      </div>

      <p className="mt-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest">High Stakes • High Reward</p>
    </div>
  );
};
