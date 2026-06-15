import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskMeterProps {
  onComplete: (multiplier: number) => void;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ onComplete }) => {
  const [position, setPosition] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const direction = useRef(1);
  const requestRef = useRef<number | null>(null);

  const animate = (_time: number) => {
    if (!isStopped) {
      setPosition((prev) => {
        let next = prev + direction.current * 2.5; // Slightly faster for Elite
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

    let multiplier = 1.0;
    if (position < 40) {
        multiplier = 0.5 + (position / 40) * 0.5;
        setFeedback('fail');
        if (navigator.vibrate) navigator.vibrate(30);
    }
    else if (position < 70) {
        multiplier = 1.0 + ((position - 40) / 30) * 0.5;
        setFeedback('fail');
        if (navigator.vibrate) navigator.vibrate(50);
    }
    else if (position < 90) {
        multiplier = 1.5 + ((position - 70) / 20) * 1.0;
        setFeedback('success');
        if (navigator.vibrate) navigator.vibrate(70);
    }
    else {
        multiplier = 3.5; // Increased elite jackpot
        setFeedback('success');
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
    }

    setTimeout(() => onComplete(multiplier), 1500);
  };

  return (
    <div className={`transition-colors duration-500 flex flex-col items-center justify-center p-10 bg-slate-900 rounded-3xl border-4 shadow-2xl space-y-10 max-w-sm mx-auto ${
        feedback === 'success' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'fail' ? 'border-red-500 bg-red-950/20' :
        'border-yellow-600'
    }`}>
      <div className="text-center w-full">
        <h2 className="text-2xl font-black text-yellow-500 italic uppercase tracking-tighter">ELITE RISK ASSESSMENT</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
             <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500">🎯</motion.span>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Stop needle in the GOLD ZONE</p>
        </div>
      </div>

      <div className="relative w-72 h-36 bg-slate-950 rounded-t-full border-x-4 border-t-4 border-slate-800 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
        {/* Zones */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-yellow-500/10 to-emerald-500/10" />

        {/* High Zone */}
        <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-yellow-600/20 border-l border-yellow-500/30" />

        {/* Jackpot Zone */}
        <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute right-0 top-0 bottom-0 w-[10%] bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] z-0"
        />

        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />

        {/* Needle Container */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-1.5 h-32 bg-white origin-bottom z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={{ rotate: (position - 50) * 1.7 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]" />
        </motion.div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-slate-800 rounded-t-full border-2 border-slate-700 z-20 shadow-xl" />
      </div>

      <button
        onClick={handleStop}
        onPointerDown={(e) => { e.preventDefault(); handleStop(); }}
        disabled={isStopped}
        className={`w-full py-6 rounded-2xl font-black text-xl transition-all active:scale-95 border-b-8 ${
          isStopped ? 'bg-slate-800 text-slate-500 border-slate-950' :
          'bg-yellow-500 text-black border-yellow-700 shadow-[0_0_40px_rgba(234,179,8,0.2)]'
        } uppercase italic tracking-tighter`}
      >
        {isStopped ? 'LOCKED IN' : 'EXECUTE STOP'}
      </button>

      <div className="h-16 flex items-center justify-center w-full">
        <AnimatePresence>
            {isStopped && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-center"
            >
                <div className={`text-5xl font-black font-mono italic tracking-tighter ${feedback === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(position < 40 ? 0.5 + (position / 40) * 0.5 : position < 70 ? 1.0 + ((position - 40) / 30) * 0.5 : position < 90 ? 1.5 + ((position - 70) / 20) * 1.0 : 3.5).toFixed(2)}X
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">YIELD MULTIPLIER</div>
            </motion.div>
            )}
            {!isStopped && (
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="text-[8px] text-slate-600 font-bold uppercase">SAFE</div>
                        <div className="w-8 h-1 bg-red-500/40 rounded-full" />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[8px] text-slate-600 font-bold uppercase">RISK</div>
                        <div className="w-12 h-1 bg-yellow-500/40 rounded-full" />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-[8px] text-slate-600 font-bold uppercase">GOLD</div>
                        <div className="w-8 h-1 bg-yellow-400 rounded-full" />
                    </div>
                </div>
            )}
        </AnimatePresence>
      </div>

      <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] text-center opacity-40">
          Elite Tier Protocol • High Latency Compensation Active
      </p>
    </div>
  );
};
