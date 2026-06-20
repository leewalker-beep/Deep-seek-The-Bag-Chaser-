import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface MemeCoinPumpProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const MemeCoinPump: React.FC<MemeCoinPumpProps> = ({ onComplete, level = 1 }) => {
  const [value, setValue] = useState(1.0);
  const [isDumping, setIsDumping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'pump' | null>(null);
  const [_permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const lastShake = useRef(0);

  // Difficulty scaling
  const decayRate = 0.02 + (level - 1) * 0.02;
  const pumpPower = Math.max(0.05, 0.15 - (level - 1) * 0.01);
  const volatility = 0.05 + (level - 1) * 0.05;

  const requestPermission = async () => {
    const startAction = () => {
        setPermissionGranted(true);
        setGameActive(true);
        window.addEventListener('devicemotion', handleMotion);
    };

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
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

  const handleMotion = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);

    if (total > 20 && Date.now() - lastShake.current > 80) {
      lastShake.current = Date.now();
      handlePump();
    }
  };

  useEffect(() => {
    if (!gameActive) return;

    // Fallback for desktop: Click
    const handleMouse = () => {
      if (Date.now() - lastShake.current > 80) {
        lastShake.current = Date.now();
        handlePump();
      }
    };
    window.addEventListener('mousedown', handleMouse);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('mousedown', handleMouse);
    };
  }, [gameActive]);

  const handlePump = () => {
    if (isDumping || !gameActive) return;
    setValue(prev => prev + pumpPower);
    setFeedback('pump');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (timeLeft <= 0 || isDumping || !gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleDump();
          return 0;
        }
        return prev - 0.1;
      });
      // Natural decay + volatility
      setValue(prev => {
          const change = (Math.random() - 0.5) * volatility;
          return Math.max(0.1, prev - decayRate + change);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, isDumping, gameActive, decayRate, volatility]);

  const handleDump = () => {
    if (isDumping || !gameActive) return;
    setIsDumping(true);

    let multiplier = value;
    // Cap and scale multiplier
    if (multiplier > (5 + level)) multiplier = 5 + level;
    if (multiplier < 0.1) multiplier = 0.1;

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback ? 'bg-emerald-950/40' : 'bg-slate-950'
    }`}>
      {!gameActive && (
        <div className="flex flex-col gap-6 z-20 items-center">
           <div className="text-center">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">MEME COIN PUMP</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">High Volatility Trading L{level}</p>
           </div>
          <button
            onClick={requestPermission}
            className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_0_50px_rgba(16,185,129,0.4)] border-b-8 border-emerald-800"
          >
            START TRADING
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameActive(true);
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Click/Tap)
          </button>
        </div>
      )}

      {gameActive && (
        <>
            <div className="absolute top-12 text-center pointer-events-none w-full px-8">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">MOON MISSION <span className="text-emerald-500 text-sm">L{level}</span></h2>
                <div className="flex items-center justify-center gap-4 mt-1">
                    <motion.span animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-400 text-2xl">📱</motion.span>
                    <p className="text-slate-300 text-xs font-black uppercase tracking-widest">SHAKE OR TAP TO PUMP!</p>
                </div>
            </div>

            <div className="relative flex flex-col items-center">
                <motion.div
                animate={{
                    scale: 0.8 + (value * 0.1),
                    rotate: isDumping ? [0, 20, -20, 0] : feedback ? [0, 10, -10, 0] : 0,
                    y: feedback ? -40 : 0
                }}
                className="text-[140px] mb-4 filter drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                >
                🪙
                </motion.div>

                <div className="text-6xl font-black text-emerald-400 font-mono italic flex items-center gap-1 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                <span className="text-3xl">$</span>
                {value.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-4">TOKEN MARKET CAP (YIELD)</div>
            </div>

            <div className="w-full max-w-xs mt-16 space-y-6">
                <button
                onClick={handleDump}
                disabled={isDumping}
                className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all active:scale-95 disabled:opacity-50 border-b-8 border-red-800 uppercase italic tracking-tighter"
                >
                {isDumping ? 'DUMPING...' : 'DUMP IT! (EXIT)'}
                </button>
            </div>

            <div className="absolute bottom-12 w-full max-w-[320px] px-6">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TIME TO RUG PULL</span>
                    <span className="text-red-500 font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
                </div>
                <ProgressBar
                    value={timeLeft}
                    max={10}
                    label=""
                    colorClass={timeLeft < 3 ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}
                />
                <div className="mt-2 text-center text-[8px] text-slate-600 font-black uppercase tracking-widest">
                    Volatilty: {volatility.toFixed(2)} | Decay: {decayRate.toFixed(2)}
                </div>
            </div>
        </>
      )}

      <AnimatePresence>
        {isDumping && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[110]"
            >
                <div className="text-8xl mb-6 drop-shadow-2xl">📉</div>
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">POSITION CLOSED</div>
                <div className="text-emerald-400 font-black font-mono text-4xl mt-4 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">{(value).toFixed(2)}X</div>
                <div className="text-slate-500 text-xs font-black uppercase mt-4 tracking-widest">YIELD SECURED</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
