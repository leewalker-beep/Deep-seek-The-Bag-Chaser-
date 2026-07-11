import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Cloud {
  id: number;
  text: string;
  x: number;
  y: number;
}

const BURNOUT_STRESSORS = [
  "Unread Slack Pings", "IRS Audit Scares", "Lawrence Chen's Glare",
  "Synergy Check-ins", "Q3 Deliverable Decks", "Overdue Rent Notices"
];

export const ThoughtClouds: React.FC<{ onComplete: (success: boolean) => void }> = ({ onComplete }) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    const initialClouds = Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      text: BURNOUT_STRESSORS[Math.floor(Math.random() * BURNOUT_STRESSORS.length)],
      x: 10 + i * 28 + Math.random() * 5,
      y: 25 + Math.random() * 35,
    }));
    setClouds(initialClouds);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(timer);
          onComplete(false); // Graceful timeout safety fallback
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  const dismissCloud = (id: number) => {
    const updated = clouds.filter(c => c.id !== id);
    setClouds(updated);
    if (updated.length === 0) {
      setTimeout(() => onComplete(true), 400); // Cleared all bubbles: Full Bonus!
    }
  };

  return (
    <div className="w-full h-64 bg-zinc-950 rounded-xl relative overflow-hidden border border-zinc-900 flex flex-col justify-between p-3 select-none">
      <div className="w-full flex justify-between items-center text-[9px] text-blue-400 font-mono tracking-wider uppercase font-bold">
        <span>☁️ Dissolve Your Stressors</span>
        <span>{timeLeft.toFixed(1)}s</span>
      </div>

      <div className="w-full h-44 relative">
        <AnimatePresence>
          {clouds.map(cloud => (
            <motion.div
              key={cloud.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.85, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3, filter: 'blur(6px)' }}
              onClick={() => dismissCloud(cloud.id)}
              className="absolute bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl shadow-lg cursor-pointer text-[10px] text-slate-300 font-medium text-center backdrop-blur-xs whitespace-nowrap active:scale-95 transition-transform"
              style={{ left: `${cloud.x}%`, top: `${cloud.y}%` }}
            >
              💨 {cloud.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[9px] text-zinc-600 text-center italic">Tap thoughts smoothly to clear Dan's working memory footprint.</p>
    </div>
  );
};
