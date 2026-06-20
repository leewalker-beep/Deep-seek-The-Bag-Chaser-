import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragScaleProps {
  onComplete: (multiplier: number) => void;
}

export const DragScale: React.FC<DragScaleProps> = ({ onComplete }) => {
  const [scale, setScale] = useState(50);
  const [marketDemand, setMarketDemand] = useState(50);
  const [stability, setStability] = useState(100);
  const [isDeployed, setIsDeployed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Market demand fluctuates
    const demandInterval = setInterval(() => {
        setMarketDemand(prev => {
            const drift = (Math.random() - 0.5) * 15;
            return Math.max(10, Math.min(90, prev + drift));
        });
    }, 1500);

    // Stability logic
    const stabilityInterval = setInterval(() => {
        setStability(prev => {
            const imbalance = Math.abs(scale - marketDemand);
            if (imbalance > 20) {
                return Math.max(0, prev - (imbalance / 10));
            }
            return Math.min(100, prev + 2);
        });
    }, 100);

    // Timer
    timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 0.1) {
                handleFinish();
                return 0;
            }
            return prev - 0.1;
        });
    }, 100);

    return () => {
        clearInterval(demandInterval);
        clearInterval(stabilityInterval);
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scale, marketDemand]);

  const handleFinish = () => {
    if (isDeployed) return;
    setIsDeployed(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalStability = stability / 100;
    const finalScale = scale / 50;
    const multiplier = Math.max(0.5, finalScale * finalStability * 2);

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  const getStatusColor = () => {
    if (stability > 70) return 'text-emerald-400';
    if (stability > 30) return 'text-yellow-400';
    return 'text-red-500 animate-pulse';
  };

  return (
    <div className={`transition-colors duration-500 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none min-h-[450px] flex flex-col justify-center items-center relative overflow-hidden ${
        stability < 30 ? 'border-red-900/50' : isDeployed ? 'border-emerald-500 bg-emerald-950/20' : 'border-blue-900/30'
    }`}>
      <div className="absolute top-6 text-center w-full z-20">
        <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest italic">SaaS INFRASTRUCTURE</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">BALANCE CAPACITY WITH MARKET DEMAND</div>
      </div>

      <div className="w-full max-w-xs space-y-8 relative z-10 mt-12">
        {/* Stability Meter */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase">SYSTEM STABILITY</span>
                <span className={`text-xl font-mono font-black ${getStatusColor()}`}>{Math.round(stability)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    animate={{ width: `${stability}%` }}
                    className={`h-full ${stability > 70 ? 'bg-emerald-500' : stability > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
            </div>
        </div>

        {/* The Balance Display */}
        <div className="relative h-32 bg-slate-950 rounded-2xl border-2 border-slate-800 flex items-center px-4 overflow-hidden">
            {/* Demand Indicator */}
            <motion.div
                animate={{ left: `${marketDemand}%` }}
                className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-0"
                style={{ transform: 'translateX(-50%)' }}
            >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-400 whitespace-nowrap uppercase tracking-widest">
                    MARKET DEMAND
                </div>
            </motion.div>

            {/* Capacity Slider Visual */}
            <motion.div
                animate={{ left: `${scale}%` }}
                className={`absolute w-12 h-12 rounded-xl shadow-2xl z-10 flex items-center justify-center border-2 transition-colors ${Math.abs(scale - marketDemand) < 15 ? 'bg-emerald-500 border-emerald-300' : 'bg-slate-800 border-slate-600'}`}
                style={{ transform: 'translateX(-50%)' }}
            >
                <div className="text-2xl">🚀</div>
            </motion.div>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="100"
            value={scale}
            onChange={(e) => {
                setScale(parseInt(e.target.value));
                if (navigator.vibrate) navigator.vibrate(5);
            }}
            className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 border-2 border-slate-700"
          />
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase px-1">
            <span>LOW CAPACITY</span>
            <span className="text-blue-400 text-sm font-mono">INFRA SCALE: {scale}%</span>
            <span>HYPER-SCALE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-inner">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">PROFIT MULT</div>
            <div className="text-emerald-400 font-black text-lg">{(scale / 50).toFixed(2)}x</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-inner">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">STABILITY PENALTY</div>
            <div className="text-red-400 font-black text-lg">{(Math.abs(scale - marketDemand) / 10).toFixed(1)}x</div>
          </div>
        </div>

        <div className="pt-2">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-2 italic">DEPLOYMENT WINDOW: {timeLeft.toFixed(1)}s</div>
            <button
            onClick={handleFinish}
            disabled={isDeployed || stability <= 0}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all active:scale-95 border-b-4 ${
                stability <= 0 ? 'bg-red-900 text-red-500 border-red-950 cursor-not-allowed' :
                isDeployed ? 'bg-slate-800 text-slate-600 border-slate-900' :
                'bg-blue-600 text-white border-blue-800 shadow-lg'
            }`}
            >
            {stability <= 0 ? 'SYSTEM CRASHED' : isDeployed ? 'DEPLOYING...' : 'FINALIZE DEPLOYMENT'}
            </button>
        </div>
      </div>

      <AnimatePresence>
        {(isDeployed || stability <= 0) && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[100] p-8"
            >
                <div className="text-8xl mb-6">{stability <= 0 ? '💥' : '📈'}</div>
                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {stability <= 0 ? 'SERVER MELTDOWN' : 'DEPLOYMENT SUCCESS'}
                </div>
                <div className={`font-black font-mono text-xl mt-4 ${stability <= 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    {stability <= 0 ? '0.2X YIELD' : `${((scale / 50) * (stability / 100) * 2).toFixed(2)}X YIELD`}
                </div>
                <p className="text-slate-500 text-[10px] uppercase font-black mt-4 tracking-widest">
                    STABILITY: {Math.round(stability)}% • CAPACITY: {scale}%
                </p>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
