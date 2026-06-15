import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TechRepairDragProps {
  onComplete: (multiplier: number) => void;
}

interface Part {
  id: string;
  name: string;
  icon: string;
  color: string;
  glow: string;
}

const PARTS: Part[] = [
  { id: 'cpu', name: 'CPU', icon: '🔲', color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
  { id: 'ram', name: 'RAM', icon: '📟', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
  { id: 'gpu', name: 'GPU', icon: '📼', color: 'bg-purple-500', glow: 'shadow-purple-500/50' },
  { id: 'ssd', name: 'SSD', icon: '💾', color: 'bg-orange-500', glow: 'shadow-orange-500/50' },
];

export const TechRepairDrag: React.FC<TechRepairDragProps> = ({ onComplete }) => {
  const [assembled, setAssembled] = useState<string[]>([]);
  const [activePart, setActivePart] = useState<Part | null>(null);
  const [feedback, setFeedback] = useState<'success' | null>(null);

  const handleDragEnd = (partId: string, info: any) => {
    const target = document.getElementById('socket-target');
    if (target) {
      const rect = target.getBoundingClientRect();
      const dropX = info.point.x;
      const dropY = info.point.y;

      if (
        dropX >= rect.left &&
        dropX <= rect.right &&
        dropY >= rect.top &&
        dropY <= rect.bottom
      ) {
        if (!assembled.includes(partId)) {
          const newAssembled = [...assembled, partId];
          setAssembled(newAssembled);
          setFeedback('success');
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate(20);

          if (newAssembled.length === PARTS.length) {
            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => onComplete(3.0), 1000);
          }
        }
      }
    }
    setActivePart(null);
  };

  return (
    <div className={`h-[500px] w-full transition-colors duration-300 border-4 rounded-3xl flex flex-col items-center p-6 relative overflow-hidden ${
        assembled.length === PARTS.length ? 'bg-blue-900/20 border-emerald-500' : 'bg-slate-950 border-blue-900'
    }`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-blue-400 italic tracking-tighter">TECH ASSEMBLY</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500">🖱️</motion.span>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Drag parts to the socket</p>
        </div>
      </div>

      <div
        id="socket-target"
        className={`w-56 h-56 rounded-3xl border-4 border-dashed transition-all duration-300 flex items-center justify-center relative ${
          activePart ? 'border-blue-400 bg-blue-400/20 scale-105' :
          feedback === 'success' ? 'border-emerald-500 bg-emerald-500/20' :
          'border-slate-800 bg-slate-900/50'
        }`}
      >
        <div className="text-6xl opacity-10">🔌</div>
        <div className="absolute inset-0 grid grid-cols-2 p-6 gap-3">
          {PARTS.map(part => (
            <AnimatePresence key={part.id}>
              {assembled.includes(part.id) && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={`rounded-xl ${part.color} flex flex-col items-center justify-center shadow-xl border-t-2 border-white/20`}
                >
                  <span className="text-2xl">{part.icon}</span>
                  <span className="text-[8px] font-black text-white/80 uppercase">{part.name}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      <div className="mt-auto mb-6 flex flex-wrap justify-center gap-4 px-4">
        {PARTS.map(part => (
          !assembled.includes(part.id) && (
            <motion.div
              key={part.id}
              drag
              dragSnapToOrigin
              onDragStart={() => setActivePart(part)}
              onDragEnd={(_, info) => handleDragEnd(part.id, info)}
              className={`w-16 h-16 rounded-2xl ${part.color} flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl z-50 border-t-2 border-white/20`}
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.3, zIndex: 100, rotate: 5 }}
            >
              <span className="text-2xl">{part.icon}</span>
              <span className="text-[8px] font-black text-white mt-1 uppercase tracking-tighter">{part.name}</span>
            </motion.div>
          )
        ))}
      </div>

      <AnimatePresence>
        {assembled.length === PARTS.length && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-10 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black shadow-[0_0_30px_rgba(16,185,129,0.5)] italic tracking-tighter text-xl border-b-4 border-emerald-700"
          >
            REPAIR COMPLETE!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePart && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-28 text-center text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]"
          >
            SNAP {activePart.name} INTO PLACE
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
        <div className="text-[40px] font-black italic">V2</div>
      </div>
    </div>
  );
};
