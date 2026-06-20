import React, { useState, useEffect } from 'react';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';

const ALL_LOGOS = ['💎', '👜', '👗', '⌚', '👠', '👒', '🕶️', '💄', '💍', '🧣'];

interface DragMergeProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

interface MergeItem {
  id: number;
  icon: string;
  x: number;
  y: number;
}

export const DragMerge: React.FC<DragMergeProps> = ({ onComplete, level = 1 }) => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [mergedCount, setMergedCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [lastMergeIcon, setLastMergeIcon] = useState<string | null>(null);

  // Difficulty scaling: more logos and pairs at higher levels
  const pairsRequired = 4 + (level - 1);
  const logosToUse = ALL_LOGOS.slice(0, pairsRequired);

  useEffect(() => {
    const initialItems: MergeItem[] = [];
    // Create required pairs
    for (let i = 0; i < pairsRequired * 2; i++) {
      initialItems.push({
        id: i,
        icon: logosToUse[i % pairsRequired],
        x: Math.random() * 260 - 130,
        y: Math.random() * 280 - 140,
      });
    }
    setItems(initialItems);
  }, [pairsRequired, logosToUse]);

  const handleDragEnd = (id: number, info: PanInfo) => {
    const container = document.getElementById('merge-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dist = Math.sqrt(Math.pow(info.point.x - centerX, 2) + Math.pow(info.point.y - centerY, 2));

    if (dist < 80) {
      setItems(prevItems => {
        const draggedItem = prevItems.find(it => it.id === id);
        if (!draggedItem) return prevItems;

        const match = prevItems.find(it => it.icon === draggedItem.icon && it.id !== id);

        if (match) {
          const newItems = prevItems.filter(it => it.id !== id && it.id !== match.id);

          setMergedCount(c => {
            const nextCount = c + 1;
            setLastMergeIcon(draggedItem.icon);
            setTimeout(() => setLastMergeIcon(null), 500);

            if (nextCount >= pairsRequired) {
              const timeTaken = (Date.now() - startTime) / 1000;
              const targetTime = pairsRequired * 2.5;
              const multiplier = Math.max(0.5, 4.0 - (timeTaken / targetTime) * 2);
              onComplete(multiplier);
            }
            return nextCount;
          });

          if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
          return newItems;
        }
        return prevItems;
      });
    }
  };

  return (
    <div id="merge-container" className="relative w-full h-[500px] bg-slate-950 rounded-3xl border-4 border-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />

      <div className="absolute top-6 text-center z-10 w-full px-6">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">LUXURY CONGLOMERATE <span className="text-emerald-500 text-sm">L{level}</span></h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">MERGE ALL BRANDS AT CENTER</p>
      </div>

      {/* Target Zone */}
      <div className="w-40 h-40 rounded-full border-8 border-emerald-500/20 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-full" />
        <span className="text-emerald-400 font-black text-4xl z-10 drop-shadow-lg font-mono">{mergedCount}/{pairsRequired}</span>
        <AnimatePresence>
          {lastMergeIcon && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 2.5, opacity: 1, rotate: 0 }}
              exit={{ scale: 3.5, opacity: 0, rotate: 20 }}
              className="absolute text-6xl pointer-events-none z-20"
            >
              {lastMergeIcon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            drag
            dragMomentum={false}
            layoutId={`item-${item.id}`}
            onDragEnd={(_, info) => handleDragEnd(item.id, info)}
            initial={{ x: item.x, y: item.y, scale: 0, opacity: 0 }}
            animate={{ x: item.x, y: item.y, scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            className="absolute w-20 h-20 bg-slate-900 border-4 border-slate-800 rounded-3xl flex items-center justify-center text-5xl cursor-grab active:cursor-grabbing shadow-2xl z-20 hover:border-emerald-500/40 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, zIndex: 100, borderColor: '#10b981', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}
          >
            {item.icon}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-6 flex flex-wrap justify-center gap-3 px-8 opacity-20">
        {logosToUse.map(l => (
          <div key={l} className="text-xl grayscale">{l}</div>
        ))}
      </div>
    </div>
  );
};
