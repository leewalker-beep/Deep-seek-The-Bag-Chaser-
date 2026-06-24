import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface SlotMachineProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

const SYMBOLS = ['💰', '💎', '🎰', '📈', '🔥', '🃏', '👑', '💸'];

export const SlotMachine: React.FC<SlotMachineProps> = ({
    onComplete,
    level = 1,
    tier = 'MUD'
}) => {
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'jackpot' | 'win' | 'lose' | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  const [spinsLeft, setSpinsLeft] = useState(Math.max(1, 4 - Math.floor(scaling * 0.5)));

  // Difficulty scaling: more symbols make it harder to match
  const activeSymbols = useMemo(() => SYMBOLS.slice(0, Math.min(SYMBOLS.length, 4 + Math.floor(scaling))), [scaling]);
  const jackpotMultiplier = useMemo(() => 8.0 + scaling * 2.5, [scaling]);
  const bigWinMultiplier = useMemo(() => 2.5 + scaling * 0.8, [scaling]);

  const requestPermission = async () => {
    const startAction = () => {
        setPermissionGranted(true);
        setGameActive(true);
    };

    const DeviceOrientation = (window.DeviceOrientationEvent as unknown) as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          startAction();
        } else {
          setPermissionGranted(false);
          setGameActive(true);
        }
      } catch {
        setPermissionGranted(false);
        setGameActive(true);
      }
    } else {
      startAction();
    }
  };

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
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)],
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)],
        activeSymbols[Math.floor(Math.random() * activeSymbols.length)],
      ]);
      spinCount++;
      if (navigator.vibrate && spinCount % 2 === 0) navigator.vibrate(5);

      if (spinCount > 30) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 60);
  }, [isSpinning, spinsLeft, activeSymbols]);

  useEffect(() => {
    if (!gameActive || permissionGranted === false) return;

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
  }, [isSpinning, spinsLeft, spin, gameActive, permissionGranted]);

  useEffect(() => {
    if (!isSpinning && result === null && feedback === null) {
      // Check if we actually spun (spinsLeft decreased)
      // This is a bit tricky with the initial state, but we only show result if we've spun.
    }
  }, [isSpinning, reels, spinsLeft, jackpotMultiplier, bigWinMultiplier]);

  // Handle result logic after a spin completes
  useEffect(() => {
      if (!isSpinning && gameActive) {
          if (reels[0] === reels[1] && reels[1] === reels[2]) {
            setResult(`JACKPOT! ${jackpotMultiplier.toFixed(1)}x`);
            setFeedback('jackpot');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
          } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            setResult(`BIG WIN! ${bigWinMultiplier.toFixed(1)}x`);
            setFeedback('win');
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
          } else {
            setResult('Small Win 1.0x');
            setFeedback('lose');
            if (navigator.vibrate) navigator.vibrate(30);
          }
      }
  }, [isSpinning, gameActive]);

  const handleFinish = () => {
    let multiplier = 1.0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) multiplier = jackpotMultiplier;
    else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) multiplier = bigWinMultiplier;

    onComplete(multiplier);
  };

  return (
    <div className={`transition-colors duration-500 bg-slate-950 p-6 rounded-[2rem] border-4 shadow-2xl text-center max-w-sm mx-auto font-mono relative overflow-hidden ${
        feedback === 'jackpot' ? 'border-yellow-400 bg-yellow-950/20' :
        feedback === 'win' ? 'border-emerald-500 bg-emerald-950/20' :
        'border-yellow-600'
    }`}>
      {!gameActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6">
          <button
            onClick={requestPermission}
            className="w-full px-8 py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black text-lg transition-all active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.4)] border-b-8 border-yellow-700 mb-6"
          >
            ACTIVATE MOTION
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameActive(true);
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Click Only)
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 px-4">
        <motion.div animate={isSpinning ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500 text-2xl">🎰</motion.div>
        <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter italic">MUSIC FESTIVAL <span className="text-white text-xs">L{level}</span></h2>
        <motion.div animate={isSpinning ? { rotate: -360 } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500 text-2xl">🎰</motion.div>
      </div>

      <div className="bg-black border-4 border-yellow-900/50 rounded-2xl p-6 mb-8 relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-500/10 z-0" />

        <div className="flex justify-center gap-3 relative z-10">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              animate={isSpinning ? {
                y: [0, -80, 80, 0],
                filter: ['blur(0px)', 'blur(10px)', 'blur(0px)']
              } : {
                scale: feedback === 'jackpot' ? [1, 1.1, 1] : 1
              }}
              transition={isSpinning ? { repeat: Infinity, duration: 0.08, delay: i * 0.05 } : { repeat: Infinity, duration: 0.5 }}
              className={`w-20 h-32 bg-gradient-to-b from-slate-900 to-black border-2 rounded-2xl flex items-center justify-center text-5xl shadow-2xl transition-colors duration-300 ${
                  feedback === 'jackpot' ? 'border-yellow-400' : 'border-slate-800'
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
                    RANDOMIZING REELS...
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
          {isSpinning ? 'SPINNING...' : `PULL LEVER (${spinsLeft} LEFT)`}
        </button>

        <AnimatePresence>
            {spinsLeft === 0 && !isSpinning && (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleFinish}
                className="py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.4)] border-b-4 border-emerald-800 uppercase tracking-widest italic"
            >
                FINALIZE RESULTS
            </motion.button>
            )}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2">
        <div className="border-2 border-slate-800 p-2 rounded-xl bg-slate-900/50">
            <div className="text-[8px] text-yellow-500 font-black mb-1">JACKPOT</div>
            <div className="text-[12px] text-white font-bold">{jackpotMultiplier.toFixed(1)}x</div>
        </div>
        <div className="border-2 border-slate-800 p-2 rounded-xl bg-slate-900/50">
            <div className="text-[8px] text-emerald-500 font-black mb-1">BIG WIN</div>
            <div className="text-[12px] text-white font-bold">{bigWinMultiplier.toFixed(1)}x</div>
        </div>
        <div className="border-2 border-slate-800 p-2 rounded-xl bg-slate-900/50">
            <div className="text-[8px] text-slate-500 font-black mb-1">ENTRY</div>
            <div className="text-[12px] text-white font-bold">1.0x</div>
        </div>
      </div>
    </div>
  );
};
