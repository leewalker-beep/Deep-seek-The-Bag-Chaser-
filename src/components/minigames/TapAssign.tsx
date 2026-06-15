import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapAssignProps {
  onComplete: (multiplier: number) => void;
}

interface Item {
  id: number;
  type: string; // 'STAFF' or 'CLIENT'
  color: string;
}

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'];

export const TapAssign: React.FC<TapAssignProps> = ({ onComplete }) => {
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  const [initialData] = useState(() => {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const s = shuffledColors.map((color, i) => ({ id: i, type: 'STAFF', color }));
    const c = [...s]
      .map(item => ({ ...item, type: 'CLIENT' }))
      .sort(() => Math.random() - 0.5);
    return { s, c };
  });

  const [staff, setStaff] = useState<Item[]>(initialData.s);
  const [clients, setClients] = useState<Item[]>(initialData.c);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const isComplete = useRef(false);

  useEffect(() => {
    if (isComplete.current) return;
    const interval = setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleStaffClick = (id: number) => {
    if (isComplete.current) return;
    setSelectedStaff(id);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const getMultiplier = useCallback((t: number) => {
    if (t >= 9) return 0.5;
    if (t >= 8) return 1.25;
    if (t >= 7) return 1.5;
    if (t >= 6) return 2.0;
    return 4.0;
  }, []);

  const handleClientClick = (id: number) => {
    if (selectedStaff === null || isComplete.current) return;

    if (selectedStaff === id) {
      const nextMatches = matches + 1;
      setMatches(nextMatches);
      setStaff(prev => prev.filter(s => s.id !== id));
      setClients(prev => prev.filter(c => c.id !== id));
      setSelectedStaff(null);
      setFeedback('correct');
      if (navigator.vibrate) navigator.vibrate(20);

      if (nextMatches === 6) {
        isComplete.current = true;
        const now = Date.now();
        const finalElapsed = (now - startTime) / 1000;
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => onComplete(getMultiplier(finalElapsed)), 1000);
      }
    } else {
      setFeedback('wrong');
      setSelectedStaff(null);
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTimeout(() => setFeedback(null), 300);
  };

  return (
    <div className={`transition-colors duration-300 p-8 rounded-3xl border-4 text-center select-none touch-none min-h-[450px] flex flex-col justify-between items-center relative ${
        feedback === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'wrong' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800 bg-slate-900'
    }`}>
      <div className="absolute top-6 text-center w-full">
        <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest italic">AGENCY FULFILLMENT</h2>
        <div className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-tighter">ASSIGN STAFF TO CLIENT TICKETS</div>
      </div>

      <div className="w-full flex justify-between px-4 mt-12 mb-4">
          <div className="text-left">
              <div className="text-[8px] text-slate-500 font-black uppercase">COMPLETED</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{matches}/6</div>
          </div>
          <div className="text-right">
              <div className="text-[8px] text-slate-500 font-black uppercase">TIME ELAPSED</div>
              <div className="text-xl font-black text-blue-400 font-mono">{elapsed.toFixed(1)}s</div>
          </div>
      </div>

      <div className="w-full space-y-10">
        {/* Clients Row */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">OPEN TICKETS (CLIENTS)</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
                {clients.map(c => (
                <motion.button
                    key={c.id}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleClientClick(c.id)}
                    className={`h-16 rounded-2xl ${c.color} shadow-2xl flex flex-col items-center justify-center transition-all active:scale-90 border-4 border-white/10`}
                >
                    <span className="text-2xl">👤</span>
                </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Staff Row */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">AVAILABLE AGENTS (STAFF)</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
                {staff.map(s => (
                <motion.button
                    key={s.id}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleStaffClick(s.id)}
                    className={`h-16 rounded-2xl ${s.color} shadow-2xl flex flex-col items-center justify-center transition-all active:scale-90 border-4 ${selectedStaff === s.id ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'border-white/10'}`}
                >
                    <span className="text-2xl">👨‍💻</span>
                </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1">
          <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse">
            SPEED IS EVERYTHING
          </div>
          <div className="text-[8px] text-slate-600 font-bold uppercase">
            Select Staff then Tap Matching Client
          </div>
      </div>

      <AnimatePresence>
        {isComplete.current && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
            >
                <div className="text-6xl mb-4">📈</div>
                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">AGENCY SCALED</div>
                <div className="text-emerald-500 font-black font-mono text-xl mt-2">FULFILLED IN {elapsed.toFixed(1)}s</div>
                <div className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mt-4">{getMultiplier(elapsed).toFixed(1)}X YIELD MULTIPLIER</div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
