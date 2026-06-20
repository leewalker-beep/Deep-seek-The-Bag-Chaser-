import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapAssignProps {
  level?: number;
  onComplete: (multiplier: number) => void;
}

const CATEGORIES = [
  { id: 'tech', icon: '💻', color: 'bg-blue-500' },
  { id: 'creative', icon: '🎨', color: 'bg-purple-500' },
  { id: 'legal', icon: '⚖️', color: 'bg-emerald-500' },
  { id: 'finance', icon: '💰', color: 'bg-orange-500' },
  { id: 'hr', icon: '🤝', color: 'bg-pink-500' },
  { id: 'sales', icon: '📈', color: 'bg-red-500' },
];

export const TapAssign: React.FC<TapAssignProps> = ({ level = 1, onComplete }) => {
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Scaling: Level 1-5 maps to 4-10 tasks
  const totalTasks = 3 + level;

  const [initialData] = useState(() => {
    const shuffledCats = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, Math.min(6, totalTasks));
    // Fill up to totalTasks if cats are fewer
    const catsToUse = Array.from({ length: totalTasks }, (_, i) => shuffledCats[i % shuffledCats.length]);

    const s = catsToUse.map((cat, i) => ({ id: i, type: 'STAFF', color: cat.color, category: cat.id, icon: cat.icon }));
    const c = [...s]
      .map(item => ({ ...item, type: 'CLIENT' }))
      .sort(() => Math.random() - 0.5);
    return { s, c };
  });

  const [staff, setStaff] = useState<any[]>(initialData.s);
  const [clients, setClients] = useState<any[]>(initialData.c);
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
    // Time goals scale with task count
    const baseTime = totalTasks * 1.2;
    if (t > baseTime * 1.5) return 0.5;
    if (t > baseTime) return 1.2;
    if (t > baseTime * 0.7) return 2.0;
    return 4.0;
  }, [totalTasks]);

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

      if (nextMatches === totalTasks) {
        isComplete.current = true;
        const finalElapsed = (Date.now() - startTime) / 1000;
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
    <div className={`transition-colors duration-300 p-6 rounded-3xl border-4 text-center select-none touch-none min-h-[500px] flex flex-col justify-between items-center relative overflow-hidden ${
        feedback === 'correct' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'wrong' ? 'border-red-500 bg-red-950/20' :
        'border-slate-800 bg-slate-900'
    }`}>
      <div className="absolute top-6 text-center w-full z-10">
        <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest italic">AGENCY FULFILLMENT</h2>
        <div className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-tighter">ASSIGN STAFF TO SPECIALIZED TICKETS</div>
      </div>

      <div className="w-full flex justify-between px-4 mt-12 mb-4 z-10">
          <div className="text-left">
              <div className="text-[8px] text-slate-500 font-black uppercase">COMPLETED</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{matches}/{totalTasks}</div>
          </div>
          <div className="text-right">
              <div className="text-[8px] text-slate-500 font-black uppercase">TIME ELAPSED</div>
              <div className="text-xl font-black text-blue-400 font-mono">{elapsed.toFixed(1)}s</div>
          </div>
      </div>

      <div className="w-full space-y-8 z-10">
        {/* Clients Row */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">OPEN TICKETS (CLIENTS)</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence>
                {clients.map(c => (
                <motion.button
                    key={c.id}
                    layout
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 50 }}
                    onClick={() => handleClientClick(c.id)}
                    className={`aspect-square rounded-xl ${c.color} shadow-xl flex flex-col items-center justify-center transition-all active:scale-90 border-2 border-white/10`}
                >
                    <span className="text-2xl">{c.icon}</span>
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
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence>
                {staff.map(s => (
                <motion.button
                    key={s.id}
                    layout
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleStaffClick(s.id)}
                    className={`aspect-square rounded-xl ${s.color} shadow-xl flex flex-col items-center justify-center transition-all active:scale-90 border-2 ${selectedStaff === s.id ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)] ring-2 ring-white/50' : 'border-white/10'}`}
                >
                    <span className="text-2xl">👩‍💼</span>
                    <div className="text-[7px] font-black text-white/50 absolute bottom-1 uppercase">{s.category}</div>
                </motion.button>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 z-10">
          <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse">
            SPEED IS EVERYTHING IN STARTUPS
          </div>
          <div className="text-[8px] text-slate-600 font-bold uppercase">
            Match Staff Skill to Client Category
          </div>
      </div>

      <AnimatePresence>
        {isComplete.current && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[100] p-6 text-center"
            >
                <div className="text-8xl mb-6">🏆</div>
                <div className="text-3xl font-black text-white italic uppercase tracking-tighter">OPERATIONAL EXCELLENCE</div>
                <div className="text-emerald-500 font-black font-mono text-xl mt-4">SCALED IN {elapsed.toFixed(1)}s</div>
                <div className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mt-4">
                    {getMultiplier(elapsed).toFixed(1)}X YIELD MULTIPLIER
                </div>
                <p className="text-slate-500 text-[9px] uppercase font-bold mt-6 tracking-widest leading-relaxed">
                    ALL {totalTasks} TICKETS RESOLVED<br/>BY SPECIALIZED AGENTS
                </p>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
