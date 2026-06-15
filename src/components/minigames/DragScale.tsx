import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragScaleProps {
  onComplete: (multiplier: number) => void;
}

export const DragScale: React.FC<DragScaleProps> = ({ onComplete }) => {
  const [scale, setScale] = useState(50);
  const [isDeployed, setIsDeployed] = useState(false);

  const handleFinish = () => {
    setIsDeployed(true);
    const multiplier = scale / 50;
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className={`transition-colors duration-500 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative ${
        isDeployed ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800'
    }`}>
      <div className="absolute top-6 text-center w-full">
        <h2 className="text-xl font-black text-emerald-500 uppercase tracking-widest italic">SAAS SCALING</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">DRAG TO SCALE YOUR INFRASTRUCTURE</div>
      </div>

      <div className="w-full max-w-xs space-y-10">
        <div className="relative pt-1 flex flex-col items-center">
          <input
            type="range"
            min="1"
            max="100"
            value={scale}
            onChange={(e) => {
                setScale(parseInt(e.target.value));
                if (navigator.vibrate) navigator.vibrate(5);
            }}
            className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 border border-slate-700"
          />
          <div className="flex justify-between w-full text-[10px] text-slate-500 font-black uppercase mt-3 tracking-widest">
            <span>MVP</span>
            <span className="text-emerald-400 text-sm font-mono tracking-tighter">CAPACITY: {scale}%</span>
            <span>HYPER-SCALE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700 shadow-inner">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">PROFIT SCALING</div>
            <div className="text-emerald-400 font-black text-lg">{(scale / 50).toFixed(2)}x</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700 shadow-inner">
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">BURN RATE</div>
            <div className="text-red-400 font-black text-lg">{(scale / 50).toFixed(2)}x</div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          disabled={isDeployed}
          className={`w-full py-5 rounded-2xl font-black text-sm transition-all active:scale-95 border-b-4 ${
            isDeployed ? 'bg-slate-800 text-slate-600 border-slate-900' : 'bg-emerald-600 text-white border-emerald-800 shadow-lg'
          }`}
        >
          {isDeployed ? 'DEPLOYING...' : 'SHIP TO PRODUCTION'}
        </button>
      </div>

      <AnimatePresence>
        {isDeployed && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-10 p-6"
            >
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">PRODUCT DEPLOYED</div>
                <div className="text-emerald-500 font-black font-mono text-xl mt-2">CAPACITY AT {scale}%</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
