import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface MemeCoinPumpProps {
  onComplete: (multiplier: number) => void;
}

export const MemeCoinPump: React.FC<MemeCoinPumpProps> = ({ onComplete }) => {
  const [value, setValue] = useState(1.0);
  const [isDumping, setIsDumping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'pump' | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const lastShake = useRef(0);

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

    if (total > 20 && Date.now() - lastShake.current > 100) {
      lastShake.current = Date.now();
      handlePump();
    }
  };

  useEffect(() => {
    if (!gameActive) return;

    // Fallback for desktop: Mouse movement
    const handleMouse = () => {
      if (Date.now() - lastShake.current > 100) {
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
    if (isDumping) return;
    setValue(prev => prev + 0.1);
    setFeedback('pump');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (timeLeft <= 0 || isDumping) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleDump();
          return 0;
        }
        return prev - 0.1;
      });
      // Natural decay
      setValue(prev => Math.max(0.1, prev - 0.02));
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, isDumping]);

  const handleDump = () => {
    if (isDumping) return;
    setIsDumping(true);

    let multiplier = value;
    // Cap and scale multiplier
    if (multiplier > 5) multiplier = 5;
    if (multiplier < 0.5) multiplier = 0.5;

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback ? 'bg-emerald-950/20' : 'bg-slate-950'
    }`}>
      {!gameActive && (
        <div className="flex flex-col gap-4 z-20">
          <button
            onClick={requestPermission}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)] border-b-4 border-emerald-800"
          >
            ACTIVATE SENSORS
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameActive(true);
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Click/Slider)
          </button>
        </div>
      )}

      <div className="absolute top-12 text-center pointer-events-none w-full px-8">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase">MEME COIN PUMP</h2>
        <div className="flex items-center justify-center gap-4 mt-1">
            <motion.span animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-500 text-2xl">📱</motion.span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Shake phone (or click) to pump!</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{
            scale: 1 + (value * 0.1),
            rotate: isDumping ? [0, 10, -10, 0] : feedback ? [0, 5, -5, 0] : 0,
            y: feedback ? -20 : 0
          }}
          className="text-[120px] mb-4 filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          🪙
        </motion.div>

        <div className="text-5xl font-black text-emerald-400 font-mono italic flex items-center gap-1">
          <span className="text-2xl">$</span>
          {value.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">CURRENT MARKET VALUE</div>
      </div>

      <div className="w-full max-w-xs mt-12 space-y-4">
        {gameActive && (
          <>
            {permissionGranted === false && (
              <input
                type="range"
                min="1"
                max="100"
                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-600 border border-slate-700 mb-4"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > (value - 1) * 10) {
                     handlePump();
                  }
                }}
              />
            )}
            <button
              onClick={handleDump}
              disabled={isDumping}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all active:scale-95 disabled:opacity-50 border-b-4 border-red-800"
            >
              {isDumping ? 'DUMPING...' : 'EXIT POSITION (DUMP)'}
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-6">
        <ProgressBar
          value={timeLeft}
          max={10}
          label={`RUG PULL IN: ${timeLeft.toFixed(1)}s`}
          colorClass={timeLeft < 3 ? 'bg-red-500' : 'bg-slate-500'}
        />
        <div className="mt-2 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Don't get caught holding the bag!
        </div>
      </div>

      <AnimatePresence>
        {isDumping && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20"
            >
                <div className="text-6xl mb-4">📉</div>
                <div className="text-3xl font-black text-white italic">POSITION CLOSED</div>
                <div className="text-emerald-500 font-black font-mono text-2xl mt-2">{(value).toFixed(2)}X YIELD</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
