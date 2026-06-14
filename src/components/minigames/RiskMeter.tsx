import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskMeterProps {
  onComplete: (multiplier: number) => void;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ onComplete }) => {
  const [position, setPosition] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const direction = useRef(1);
  const requestRef = useRef<number>(null);

  const animate = (_time: number) => {
    if (!isStopped) {
      setPosition((prev) => {
        let next = prev + direction.current * 2;
        if (next > 100) {
          next = 100;
          direction.current = -1;
        } else if (next < 0) {
          next = 0;
          direction.current = 1;
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStopped]);

  const handleStop = () => {
    if (isStopped) return;
    setIsStopped(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Multiplier logic:
    // 0-40: Low (0.5x - 1.0x)
    // 40-70: Medium (1.0x - 1.5x)
    // 70-90: High (1.5x - 2.5x)
    // 90-100: JACKPOT (3.0x)
    let multiplier = 1.0;
    if (position < 40) multiplier = 0.5 + (position / 40) * 0.5;
    else if (position < 70) multiplier = 1.0 + ((position - 40) / 30) * 0.5;
    else if (position < 90) multiplier = 1.5 + ((position - 70) / 20) * 1.0;
    else multiplier = 3.0;

    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl border border-yellow-500/30 shadow-2xl space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-yellow-500 italic uppercase tracking-tighter">RISK METER</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Stop the needle in the gold zone</p>
      </div>

      <div className="relative w-64 h-32 bg-slate-800 rounded-t-full border-x border-t border-slate-700 overflow-hidden">
        {/* Zones */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-emerald-500/20" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-yellow-500/30" /> {/* Gold zone */}
        <div className="absolute right-0 top-0 bottom-0 w-1/12 bg-yellow-400" /> {/* Jackpot zone */}

        {/* Needle Container */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom z-10"
          style={{ rotate: (position - 50) * 1.6 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-700 rounded-t-full border border-slate-600" />
      </div>

      <button
        onClick={handleStop}
        disabled={isStopped}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 ${
          isStopped ? 'bg-slate-800 text-slate-500' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
        }`}
      >
        {isStopped ? 'STOPPED!' : 'STOP NEEDLE'}
      </button>

      <AnimatePresence>
        {isStopped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Multiplier</div>
            <div className="text-4xl font-black text-yellow-500 font-mono">
              {((position < 40 ? 0.5 + (position / 40) * 0.5 : position < 70 ? 1.0 + ((position - 40) / 30) * 0.5 : position < 90 ? 1.5 + ((position - 70) / 20) * 1.0 : 3.0)).toFixed(2)}x
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
