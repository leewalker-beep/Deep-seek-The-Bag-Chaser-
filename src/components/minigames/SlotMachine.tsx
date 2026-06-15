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
  const [feedback, setFeedback] = useState<'jackpot' | 'win' | 'lose' | null>(null);

  const spin = useCallback(() => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);
    setResult(null);
    setFeedback(null);
    if (navigator.vibrate) navigator.vibrate(20);

    let spinCount = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      spinCount++;
      if (navigator.vibrate && spinCount % 2 === 0) navigator.vibrate(5);

      if (spinCount > 30) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 60);
  }, [isSpinning, spinsLeft]);

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

  useEffect(() => {
    if (!isSpinning && spinsLeft < 3) {
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        setResult('JACKPOT! 10.0x');
        setFeedback('jackpot');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        setResult('BIG WIN! 3.0x');
        setFeedback('win');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      } else {
        setResult('Small Win 1.0x');
        setFeedback('lose');
        if (navigator.vibrate) navigator.vibrate(30);
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
    <div className={`transition-colors duration-500 bg-slate-900 p-8 rounded-3xl border-4 shadow-2xl text-center max-w-sm mx-auto font-mono ${
        feedback === 'jackpot' ? 'border-yellow-400 bg-yellow-950/20' :
        feedback === 'win' ? 'border-emerald-500 bg-emerald-950/20' :
        'border-yellow-600'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <motion.div animate={isSpinning ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500 text-2xl">🎰</motion.div>
        <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter italic">SLOT MACHINE</h2>
        <motion.div animate={isSpinning ? { rotate: -360 } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500 text-2xl">🎰</motion.div>
      </div>

      <div className="bg-black border-4 border-yellow-900/50 rounded-2xl p-6 mb-8 relative shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
        {/* Decorative lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/20 z-0" />

        <div className="flex justify-center gap-3 relative z-10">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              animate={isSpinning ? {
                y: [0, -60, 60, 0],
                filter: ['blur(0px)', 'blur(8px)', 'blur(0px)']
              } : {
                scale: feedback === 'jackpot' ? [1, 1.2, 1] : 1
              }}
              transition={isSpinning ? { repeat: Infinity, duration: 0.1, delay: i * 0.05 } : { repeat: Infinity, duration: 0.5 }}
              className={`w-20 h-32 bg-gradient-to-b from-slate-800 to-slate-950 border-2 rounded-2xl flex items-center justify-center text-5xl shadow-2xl transition-colors duration-300 ${
                  feedback === 'jackpot' ? 'border-yellow-400' : 'border-slate-700'
              }`}
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="h-16 mb-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
            {result && !isSpinning && (
            <motion.div
                key={result}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`text-3xl font-black mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] italic uppercase tracking-tighter ${
                    feedback === 'jackpot' ? 'text-yellow-400' :
                    feedback === 'win' ? 'text-emerald-400' :
                    'text-slate-400'
                }`}
            >
                {result}
            </motion.div>
            )}
            {isSpinning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-500 font-black animate-pulse uppercase tracking-[0.3em] text-sm"
                >
                    Spinning...
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={spin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`py-5 rounded-2xl font-black text-xl transition-all active:scale-95 border-b-8 ${
            isSpinning || spinsLeft <= 0
              ? 'bg-slate-800 text-slate-600 border-slate-950'
              : 'bg-yellow-500 text-black border-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.2)]'
          }`}
        >
          {isSpinning ? 'LOCKED' : `PULL LEVER (${spinsLeft})`}
        </button>

        <AnimatePresence>
            {spinsLeft === 0 && !isSpinning && (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleFinish}
                className="py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.4)] border-b-4 border-emerald-800 uppercase tracking-widest italic"
            >
                COLLECT PAYOUT
            </motion.button>
            )}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2">
        <div className="border-2 border-slate-800 p-2 rounded-xl">
            <div className="text-[10px] text-yellow-500 font-black mb-1">JACKPOT</div>
            <div className="text-[12px] text-white font-bold">10x</div>
        </div>
        <div className="border-2 border-slate-800 p-2 rounded-xl">
            <div className="text-[10px] text-emerald-500 font-black mb-1">BIG WIN</div>
            <div className="text-[12px] text-white font-bold">3x</div>
        </div>
        <div className="border-2 border-slate-800 p-2 rounded-xl">
            <div className="text-[10px] text-slate-500 font-black mb-1">ENTRY</div>
            <div className="text-[12px] text-white font-bold">1x</div>
        </div>
      </div>

      <div className="mt-4 text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">
        SHAKE PHONE TO SPIN
      </div>
    </div>
  );
};
