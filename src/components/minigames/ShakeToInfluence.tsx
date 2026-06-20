import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShakeToInfluenceProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const ShakeToInfluence: React.FC<ShakeToInfluenceProps> = ({ onComplete, level = 1 }) => {
  const [hype, setHype] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [gameActive, setGameActive] = useState(false);
  const [_permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const lastShake = useRef(0);

  // Difficulty scaling
  const targetHype = 50 + (level - 1) * 20;
  const decayRate = 0.5 + (level - 1) * 0.3;

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setGameActive(true);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          setPermissionGranted(false);
          setGameActive(true);
        }
      } catch {
        setPermissionGranted(false);
        setGameActive(true);
      }
    } else {
      setPermissionGranted(true);
      setGameActive(true);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const handleMotion = (e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);

    if (total > 20 && Date.now() - lastShake.current > 100) {
      lastShake.current = Date.now();
      handleInfluence();
    }
  };

  useEffect(() => {
    if (!gameActive) return;

    // Fallback for desktop: Mouse movement or click
    const handleAction = () => {
      if (Date.now() - lastShake.current > 100) {
        lastShake.current = Date.now();
        handleInfluence();
      }
    };
    window.addEventListener('mousedown', handleAction);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });

      setHype(prev => Math.max(0, prev - decayRate));
    }, 100);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('mousedown', handleAction);
      clearInterval(timer);
    };
  }, [gameActive, decayRate]);

  const handleInfluence = () => {
    setHype(prev => Math.min(targetHype * 1.5, prev + 5));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const endGame = () => {
    setGameActive(false);
    const score = hype / targetHype;
    let multiplier = 0.5;
    if (score >= 1.2) multiplier = 4.0;
    else if (score >= 0.9) multiplier = 2.5;
    else if (score >= 0.6) multiplier = 1.5;
    else if (score >= 0.3) multiplier = 1.0;

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-300 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        hype > targetHype ? 'bg-purple-950/40' : 'bg-slate-950'
    }`}>
      {!gameActive && (
        <div className="flex flex-col gap-6 z-20 items-center text-center">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">SHAKE FOR HYPE</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Influence the masses L{level}</p>
          <button
            onClick={requestPermission}
            className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_0_50px_rgba(168,85,247,0.4)] border-b-8 border-purple-800"
          >
            START HYPE ENGINE
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
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">HYPE ENGINE <span className="text-purple-400 text-sm">L{level}</span></h2>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">SHAKE OR TAP REPEATEDLY!</p>
          </div>

          <div className="relative flex flex-col items-center">
            <motion.div
              animate={{
                scale: 0.8 + (hype / targetHype) * 0.5,
                rotate: [0, 5, -5, 0],
                y: [0, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-[120px] mb-8 filter drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              📣
            </motion.div>

            <div className="w-64 h-4 bg-slate-900 rounded-full overflow-hidden border-2 border-slate-800 shadow-inner relative">
               <motion.div
                 className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                 animate={{ width: `${Math.min(100, (hype / targetHype) * 100)}%` }}
               />
               <div
                 className="absolute top-0 bottom-0 border-l-2 border-white/50 w-px"
                 style={{ left: '90%' }}
               />
            </div>
            <div className="flex justify-between w-64 mt-2">
                <span className="text-[10px] text-slate-500 font-black uppercase">0%</span>
                <span className="text-[10px] text-purple-400 font-black uppercase">HYPE GOAL</span>
                <span className="text-[10px] text-slate-500 font-black uppercase">MAX</span>
            </div>
          </div>

          <div className="absolute bottom-12 w-full max-w-[320px] px-6">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SESSION ENDING</span>
                <span className="text-white font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-white" animate={{ width: `${(timeLeft / 8) * 100}%` }} />
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {!gameActive && timeLeft === 0 && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[110] p-8 text-center"
            >
                <div className="text-8xl mb-6">📈</div>
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">INFLUENCE<br/>SECURED</div>
                <div className="text-purple-400 font-black font-mono text-3xl mt-6">{(hype / targetHype * 2.5).toFixed(2)}X YIELD</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
