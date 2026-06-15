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
}

const PARTS: Part[] = [
  { id: 'cpu', name: 'CPU', icon: '🔲', color: 'bg-blue-500' },
  { id: 'ram', name: 'RAM', icon: '📟', color: 'bg-emerald-500' },
  { id: 'gpu', name: 'GPU', icon: '📼', color: 'bg-purple-500' },
  { id: 'ssd', name: 'SSD', icon: '💾', color: 'bg-orange-500' },
];

export const TechRepairDrag: React.FC<TechRepairDragProps> = ({ onComplete }) => {
  const [assembled, setAssembled] = useState<string[]>([]);
  const [activePart, setActivePart] = useState<Part | null>(null);

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
          if (newAssembled.length === PARTS.length) {
            setTimeout(() => onComplete(3.0), 800);
          }
        }
      }
    }
    setActivePart(null);
  };

  return (
    <div className="h-[500px] w-full bg-slate-950 border-4 border-blue-900 rounded-3xl flex flex-col items-center p-6 relative overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-blue-400">TECH ASSEMBLY</h2>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Drag parts to the socket</p>
      </div>

      <div
        id="socket-target"
        className={`w-48 h-48 rounded-2xl border-4 border-dashed transition-all duration-300 flex items-center justify-center relative ${
          activePart ? 'border-blue-400 bg-blue-400/10' : 'border-slate-800 bg-slate-900/50'
        }`}
      >
        <div className="text-4xl opacity-20">🔌</div>
        <div className="absolute inset-0 grid grid-cols-2 p-4 gap-2">
          {PARTS.map(part => (
            <AnimatePresence key={part.id}>
              {assembled.includes(part.id) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`rounded-lg ${part.color} flex items-center justify-center text-xl shadow-lg`}
                >
                  {part.icon}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      <div className="mt-auto mb-4 flex gap-4">
        {PARTS.map(part => (
          !assembled.includes(part.id) && (
            <motion.div
              key={part.id}
              drag
              dragSnapToOrigin
              onDragStart={() => setActivePart(part)}
              onDragEnd={(_, info) => handleDragEnd(part.id, info)}
              className={`w-14 h-14 rounded-xl ${part.color} flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-xl z-50`}
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.2, zIndex: 100 }}
            >
              <span className="text-xl">{part.icon}</span>
              <span className="text-[8px] font-black text-white mt-1 uppercase">{part.name}</span>
            </motion.div>
          )
        ))}
      </div>

      {assembled.length === PARTS.length && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-8 bg-emerald-500 text-white px-6 py-2 rounded-full font-black shadow-lg"
        >
          REPAIR COMPLETE!
        </motion.div>
      )}

      {activePart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-0 bottom-32 text-center text-blue-400 font-bold animate-pulse text-xs"
        >
          DROP {activePart.name} IN SOCKET
        </motion.div>
      )}
    </div>
  );
};
