import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface DragScaleProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const DragScale: React.FC<DragScaleProps> = ({ onComplete, level = 1 }) => {
  const [capacity, setCapacity] = useState(20);
  const [load, setLoad] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isDeployed, setIsDeployed] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [uptime, setUptime] = useState(100);
  const [burn, setBurn] = useState(0);

  const loadInterval = useRef<number | null>(null);

  // Difficulty scaling
  const loadGrowthSpeed = 0.5 + (level - 1) * 0.3;
  const maxLoad = 80 + (level - 1) * 5;

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleFinish();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    loadInterval.current = window.setInterval(() => {
      setLoad(prev => {
        const next = prev + (Math.random() * loadGrowthSpeed);
        return Math.min(maxLoad, next);
      });
    }, 100);

    return () => {
      clearInterval(timer);
      if (loadInterval.current) clearInterval(loadInterval.current);
    };
  }, [gameActive, loadGrowthSpeed, maxLoad]);

  useEffect(() => {
    if (!gameActive) return;

    const engine = setInterval(() => {
        // Calculate Uptime: if Capacity < Load, uptime drops
        if (capacity < load) {
            setUptime(prev => Math.max(0, prev - 1.5));
        } else {
            setUptime(prev => Math.min(100, prev + 0.5));
        }

        // Calculate Burn: if Capacity >> Load, burn increases
        const excess = Math.max(0, capacity - load);
        setBurn(prev => prev + (excess / 100));
    }, 100);

    return () => clearInterval(engine);
  }, [gameActive, capacity, load]);

  const handleFinish = () => {
    if (!gameActive) return;
    setGameActive(false);
    setIsDeployed(true);

    // Multiplier logic:
    // Base 1.0
    // + Uptime bonus (up to +2.0)
    // - Burn penalty (up to -1.0)
    // * Scale bonus (load / 25)

    const uptimeMult = (uptime / 100) * 2;
    const burnPenalty = Math.min(1.5, burn / 10);
    const scaleBonus = load / 30;

    const multiplier = Math.max(0.1, (1.0 + uptimeMult - burnPenalty) * (1.0 + scaleBonus));

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(multiplier), 1500);
  };

  return (
    <div className={`transition-colors duration-500 bg-slate-900 p-6 rounded-3xl border-4 text-center select-none touch-none h-[450px] flex flex-col items-center relative ${
        !gameActive ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800'
    }`}>
      <div className="absolute top-6 text-center w-full z-10">
        <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-widest italic">SAAS MVP <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">MATCH CAPACITY TO USER LOAD</div>
      </div>

      <div className="w-full mt-20 space-y-8 z-10">
        <div className="relative h-24 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-end px-4 gap-2">
            {/* Capacity Bar */}
            <motion.div
                animate={{ height: `${capacity}%` }}
                className="flex-1 bg-emerald-500/40 border-t-4 border-emerald-400 rounded-t-lg relative"
            >
                <span className="absolute -top-6 left-0 right-0 text-[8px] font-black text-emerald-400">CAPACITY</span>
            </motion.div>

            {/* Load Bar */}
            <motion.div
                animate={{ height: `${load}%` }}
                className={`flex-1 border-t-4 rounded-t-lg relative transition-colors ${
                    capacity < load ? 'bg-red-500/40 border-red-400' : 'bg-blue-500/40 border-blue-400'
                }`}
            >
                <span className="absolute -top-6 left-0 right-0 text-[8px] font-black text-blue-400 uppercase">Load</span>
                {capacity < load && (
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="absolute inset-0 bg-red-500/20"
                    />
                )}
            </motion.div>
        </div>

        <div className="relative pt-1 flex flex-col items-center">
          <input
            type="range"
            min="1"
            max="100"
            value={capacity}
            disabled={!gameActive}
            onChange={(e) => {
                setCapacity(parseInt(e.target.value));
                if (navigator.vibrate) navigator.vibrate(5);
            }}
            className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 border-2 border-slate-700"
          />
          <div className="flex justify-between w-full text-[10px] text-slate-500 font-black uppercase mt-3 tracking-widest">
            <span>MVP</span>
            <span className="text-emerald-400 text-sm font-mono tracking-tighter">SERVER CAPACITY: {capacity}%</span>
            <span>HYPER-SCALE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 rounded-xl border transition-colors ${uptime < 50 ? 'bg-red-950/40 border-red-500' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">UPTIME</div>
            <div className={`font-black text-xl ${uptime < 50 ? 'text-red-400' : 'text-emerald-400'}`}>{uptime.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">CASH BURN</div>
            <div className="text-red-400 font-black text-xl">-${burn.toFixed(0)}k</div>
          </div>
        </div>

        <div className="w-full">
            <ProgressBar
                value={timeLeft}
                max={10}
                label={`TIME TO NEXT ROUND: ${timeLeft.toFixed(1)}s`}
                colorClass={timeLeft < 3 ? 'bg-red-500' : 'bg-slate-600'}
            />
        </div>
      </div>

      <AnimatePresence>
        {isDeployed && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
            >
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">ROUND COMPLETE</div>
                <div className="text-emerald-500 font-black font-mono text-xl mt-2">UPTIME: {uptime.toFixed(1)}%</div>
                <div className="text-blue-400 font-black font-mono text-sm uppercase mt-1">PEAK LOAD: {load.toFixed(1)}%</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
