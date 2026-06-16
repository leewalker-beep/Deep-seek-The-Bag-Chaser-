import React, { useState, useEffect } from 'react';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';

const LOGOS = ['💎', '👜', '👗', '⌚', '👠'];

interface DragMergeProps {
  onComplete: (multiplier: number) => void;
}

interface MergeItem {
  id: number;
  icon: string;
  x: number;
  y: number;
}

export const DragMerge: React.FC<DragMergeProps> = ({ onComplete }) => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [mergedCount, setMergedCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [lastMergeIcon, setLastMergeIcon] = useState<string | null>(null);

  useEffect(() => {
    const initialItems: MergeItem[] = [];
    // Create 5 pairs
    for (let i = 0; i < 10; i++) {
      initialItems.push({
        id: i,
        icon: LOGOS[i % LOGOS.length],
        x: Math.random() * 260 - 130, // Spread them out a bit more
        y: Math.random() * 260 - 130,
      });
    }
    setItems(initialItems);
  }, []);

  const handleDragEnd = (id: number, info: PanInfo) => {
    const container = document.getElementById('merge-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dist = Math.sqrt(Math.pow(info.point.x - centerX, 2) + Math.pow(info.point.y - centerY, 2));

    if (dist < 70) {
      setItems(prevItems => {
        const draggedItem = prevItems.find(it => it.id === id);
        if (!draggedItem) return prevItems;

        // Look for any other item with the same icon currently in the list
        const match = prevItems.find(it => it.icon === draggedItem.icon && it.id !== id);

        if (match) {
          // Success! Remove both items
          const newItems = prevItems.filter(it => it.id !== id && it.id !== match.id);

          setMergedCount(c => {
            const nextCount = c + 1;
            setLastMergeIcon(draggedItem.icon);
            setTimeout(() => setLastMergeIcon(null), 500);

            if (nextCount >= 5) {
              const timeTaken = (Date.now() - startTime) / 1000;
              const multiplier = Math.max(1.0, 3.0 - (timeTaken / 12));
              onComplete(multiplier);
            }
            return nextCount;
          });

          if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
          return newItems;
        }

        // No match found yet, item stays where it was dragged or returns?
        // For simplicity, it stays in the list but we can update its position
        return prevItems;
      });
    }
  };

  return (
    <div id="merge-container" className="relative w-full h-[400px] bg-slate-950 rounded-xl border-2 border-slate-800 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-4 text-center z-0">
        <h3 className="text-white font-black text-lg">LUXURY CONGLOMERATE</h3>
        <p className="text-slate-400 text-xs">Drag matching logos to the center to merge</p>
      </div>

      {/* Target Zone */}
      <div className="w-36 h-32 rounded-full border-4 border-dashed border-emerald-500/30 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-full" />
        <span className="text-emerald-400 font-black text-3xl z-10">{mergedCount}/5</span>
        <AnimatePresence>
          {lastMergeIcon && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute text-4xl pointer-events-none"
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
            exit={{ scale: 0, opacity: 0 }}
            className="absolute w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing shadow-2xl z-20 hover:border-emerald-500/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, zIndex: 100, border: '2px solid #10b981' }}
          >
            {item.icon}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 flex gap-4">
        {LOGOS.map(l => (
          <div key={l} className="opacity-10 text-2xl grayscale">{l}</div>
        ))}
      </div>
    </div>
  );
};
