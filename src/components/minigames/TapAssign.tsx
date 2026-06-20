import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapAssignProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

interface Item {
  id: number;
  type: string; // 'STAFF' or 'CLIENT'
  color: string;
}

const COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
    'bg-cyan-500', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500'
];

export const TapAssign: React.FC<TapAssignProps> = ({ onComplete, level = 1 }) => {
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Difficulty scaling: more matches required at higher levels
  const matchesRequired = 6 + (level - 1) * 2;
  const gridCols = matchesRequired > 9 ? 4 : 3;

  const [initialData] = useState(() => {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5).slice(0, matchesRequired);
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
    // Target time depends on complexity
    const baseTarget = matchesRequired * 1.2;
    if (t > baseTarget * 1.5) return 0.5;
    if (t > baseTarget * 1.2) return 1.2;
    if (t > baseTarget) return 2.0;
    return 4.0;
  }, [matchesRequired]);

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

      if (nextMatches === matchesRequired) {
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
    <div className={`transition-colors duration-300 p-6 rounded-3xl border-4 text-center select-none touch-none min-h-[500px] flex flex-col justify-between items-center relative ${
        feedback === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'wrong' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800 bg-slate-950'
    }`}>
      <div className="absolute top-6 text-center w-full z-10 px-4">
        <h2 className="text-2xl font-black text-blue-400 uppercase tracking-tighter italic">AGENCY SCALE <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">ASSIGN STAFF TO CLIENT TICKETS</div>
      </div>

      <div className="w-full flex justify-between px-4 mt-20 mb-4 z-10 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
          <div className="text-left flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">FULFILLED</span>
              <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{matches}/{matchesRequired}</span>
          </div>
          <div className="text-right flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">TIME</span>
              <span className="text-2xl font-black text-blue-400 font-mono tabular-nums">{elapsed.toFixed(1)}s</span>
          </div>
      </div>

      <div className="w-full space-y-8 z-10">
        {/* Clients Row */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">OPEN TICKETS (CLIENTS)</span>
          </div>
          <div className={`grid gap-3 ${gridCols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <AnimatePresence>
                {clients.map(c => (
                <motion.button
                    key={c.id}
                    layout
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 20 }}
                    onClick={() => handleClientClick(c.id)}
                    className={`h-14 rounded-xl ${c.color} shadow-lg flex flex-col items-center justify-center transition-all active:scale-90 border-4 border-white/20`}
                >
                    <span className="text-xl">👤</span>
                </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Staff Row */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">AVAILABLE AGENTS (STAFF)</span>
          </div>
          <div className={`grid gap-3 ${gridCols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <AnimatePresence>
                {staff.map(s => (
                <motion.button
                    key={s.id}
                    layout
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: -20 }}
                    onClick={() => handleStaffClick(s.id)}
                    className={`h-14 rounded-xl ${s.color} shadow-lg flex flex-col items-center justify-center transition-all active:scale-90 border-4 ${selectedStaff === s.id ? 'border-white scale-110 shadow-[0_0_25px_rgba(255,255,255,0.5)]' : 'border-white/10'}`}
                >
                    <span className="text-xl">👨‍💻</span>
                </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 z-10">
          <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse">
            MAXIMIZE OPERATIONAL EFFICIENCY
          </div>
          <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
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
                <div className="text-8xl mb-6 drop-shadow-2xl">📈</div>
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">AGENCY SCALED</div>
                <div className="text-emerald-500 font-black font-mono text-3xl mt-4 drop-shadow-xl">{elapsed.toFixed(1)}s</div>
                <div className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] mt-6 border-y border-blue-500/30 py-2">
                    {getMultiplier(elapsed).toFixed(1)}X YIELD MULTIPLIER
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
