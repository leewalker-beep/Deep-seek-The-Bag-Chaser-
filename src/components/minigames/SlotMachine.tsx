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

  useEffect(() => {
    let lastShake = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      if (isSpinning || spinsLeft <= 0) return;
      const accel = e.accelerationIncludingGravity;
      if (!accel) return;
      const total = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2);
      if (total > 25 && Date.now() - lastShake > 1000) {
        lastShake = Date.now();
        spin();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isSpinning, spinsLeft, spin]);

  const spin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);
    setResult(null);

    let spinCount = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      spinCount++;

      if (spinCount > 30) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 60);
  }, [isSpinning, spinsLeft]);

  useEffect(() => {
    if (!isSpinning && spinsLeft < 3) {
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        setResult('JACKPOT! 10.0x');
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        setResult('BIG WIN! 3.0x');
      } else {
        setResult('Small Win 1.0x');
      }
    }
  }, [isSpinning, reels, spinsLeft]);

  const handleFinish = () => {
    let multiplier = 1.0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) multiplier = 10.0;
    else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) multiplier = 3.0;

    onComplete(multiplier);
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center max-w-sm mx-auto font-mono">
      <div className="flex justify-between items-center mb-6">
        <div className="text-yellow-500 text-2xl">🎰</div>
        <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">SLOT MACHINE</h2>
        <div className="text-yellow-500 text-2xl">🎰</div>
      </div>

      <div className="bg-black border-2 border-yellow-500/30 rounded-2xl p-4 mb-8 relative">
        {/* Decorative lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/20 z-0" />

        <div className="flex justify-center gap-2 relative z-10">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              animate={isSpinning ? {
                y: [0, -40, 40, 0],
                filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
              } : {}}
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="w-20 h-28 bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-5xl shadow-inner"
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {result && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-emerald-400 mb-6 drop-shadow-lg italic"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <button
          onClick={spin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`py-5 rounded-xl font-black text-xl transition-all ${
            isSpinning || spinsLeft <= 0
              ? 'bg-slate-800 text-slate-600'
              : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95 shadow-[0_6px_0_rgb(161,98,7)]'
          }`}
        >
          {isSpinning ? 'SPINNING...' : `PULL LEVER (${spinsLeft})`}
        </button>

        {spinsLeft === 0 && !isSpinning && (
          <button
            onClick={handleFinish}
            className="py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 animate-pulse shadow-lg"
          >
            COLLECT PAYOUT
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1 text-[8px] text-slate-500 uppercase font-black">
        <div className="border border-slate-800 p-1">3 MATCH: 10x</div>
        <div className="border border-slate-800 p-1">2 MATCH: 3x</div>
        <div className="border border-slate-800 p-1">OTHER: 1x</div>
      </div>
    </div>
  );
};
