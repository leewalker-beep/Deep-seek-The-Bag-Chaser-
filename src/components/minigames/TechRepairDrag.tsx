import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TechRepairDragProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

interface Part {
  id: string;
  name: string;
  icon: string;
  color: string;
  glow: string;
}

const ALL_PARTS: Part[] = [
  { id: 'cpu', name: 'CPU', icon: '🔲', color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
  { id: 'ram', name: 'RAM', icon: '📟', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
  { id: 'gpu', name: 'GPU', icon: '📼', color: 'bg-purple-500', glow: 'shadow-purple-500/50' },
  { id: 'ssd', name: 'SSD', icon: '💾', color: 'bg-orange-500', glow: 'shadow-orange-500/50' },
  { id: 'fan', name: 'FAN', icon: '⚙️', color: 'bg-cyan-500', glow: 'shadow-cyan-500/50' },
  { id: 'bat', name: 'BATTERY', icon: '🔋', color: 'bg-red-500', glow: 'shadow-red-500/50' },
];

export const TechRepairDrag: React.FC<TechRepairDragProps> = ({ onComplete, level = 1 }) => {
  const [startTime] = useState(() => Date.now());
  const [assembled, setAssembled] = useState<string[]>([]);
  const [activePart, setActivePart] = useState<Part | null>(null);
  const [feedback, setFeedback] = useState<'success' | null>(null);

  // Difficulty scaling: more parts required at higher levels
  const partsToAssemble = ALL_PARTS.slice(0, Math.min(ALL_PARTS.length, 3 + level));

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

          if (newAssembled.length === partsToAssemble.length) {
            const elapsed = (Date.now() - startTime) / 1000;
            const targetTime = partsToAssemble.length * 1.5;
            let multiplier = 0.5;
            if (elapsed < targetTime * 0.8) multiplier = 4.0;
            else if (elapsed < targetTime * 1.5) multiplier = 2.5;
            else if (elapsed < targetTime * 2.5) multiplier = 1.2;

            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => onComplete(multiplier), 1000);
          }
        }
      }
    }
    setActivePart(null);
  };

  return (
    <div className={`h-[550px] w-full transition-colors duration-300 border-4 rounded-3xl flex flex-col items-center p-6 relative overflow-hidden ${
        assembled.length === partsToAssemble.length ? 'bg-blue-900/20 border-emerald-500' : 'bg-slate-950 border-blue-900'
    }`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-blue-400 italic tracking-tighter uppercase drop-shadow-lg">TECH REPAIR <span className="text-white text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500">🖱️</motion.span>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Snap {partsToAssemble.length} parts to the socket</p>
        </div>
      </div>

      <div
        id="socket-target"
        className={`w-64 h-64 rounded-3xl border-4 border-dashed transition-all duration-300 flex items-center justify-center relative ${
          activePart ? 'border-blue-400 bg-blue-400/20 scale-105' :
          feedback === 'success' ? 'border-emerald-500 bg-emerald-500/20' :
          'border-slate-800 bg-slate-900/50'
        }`}
      >
        <div className="text-7xl opacity-5">🔌</div>
        <div className="absolute inset-0 grid grid-cols-2 p-4 gap-2">
          {partsToAssemble.map(part => (
            <AnimatePresence key={part.id}>
              {assembled.includes(part.id) && (
                <motion.div
                  initial={{ scale: 0, rotate: -45, y: 20 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  className={`rounded-xl ${part.color} flex flex-col items-center justify-center shadow-xl border-t-2 border-white/20`}
                >
                  <span className="text-3xl">{part.icon}</span>
                  <span className="text-[8px] font-black text-white/80 uppercase">{part.name}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      <div className="mt-auto mb-6 flex flex-wrap justify-center gap-3 px-2">
        {partsToAssemble.map(part => (
          !assembled.includes(part.id) && (
            <motion.div
              key={part.id}
              drag
              dragSnapToOrigin
              onDragStart={() => setActivePart(part)}
              onDragEnd={(_, info) => handleDragEnd(part.id, info)}
              className={`w-20 h-20 rounded-2xl ${part.color} flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl z-50 border-t-2 border-white/20`}
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.3, zIndex: 100, rotate: 10 }}
            >
              <span className="text-3xl">{part.icon}</span>
              <span className="text-[8px] font-black text-white mt-1 uppercase tracking-tighter">{part.name}</span>
            </motion.div>
          )
        ))}
      </div>

      <AnimatePresence>
        {assembled.length === partsToAssemble.length && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-[110] p-8 text-center"
          >
            <div className="text-8xl mb-6 drop-shadow-2xl">🔧</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">HARDWARE RESTORED</div>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-4">SUCCESSFUL REPAIR</div>
          </motion.div>
        )}
      </AnimatePresence>

      {activePart && (
        <div className="absolute bottom-32 text-center w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]"
            >
                SNAP {activePart.name} INTO PLACE
            </motion.div>
        </div>
      )}
    </div>
  );
};
