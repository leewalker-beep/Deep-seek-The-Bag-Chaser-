import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreetwearDesignProps {
  onComplete: (multiplier: number) => void;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
];

const PARTS = ['Hat', 'Shirt', 'Pants'];

export const StreetwearDesign: React.FC<StreetwearDesignProps> = ({ onComplete }) => {
  const [targetColors, setTargetColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<(string | null)[]>([null, null, null]);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    // Generate random target colors
    const targets = PARTS.map(() => COLORS[Math.floor(Math.random() * COLORS.length)].hex);
    setTargetColors(targets);
  }, []);

  const handleSelectColor = (partIndex: number, colorHex: string) => {
    const next = [...selectedColors];
    next[partIndex] = colorHex;
    setSelectedColors(next);
  };

  const handleFinish = () => {
    setGameActive(false);
    let matches = 0;
    selectedColors.forEach((color, i) => {
      if (color === targetColors[i]) matches++;
    });

    let multiplier = 0.5;
    if (matches === 3) multiplier = 3.0;
    else if (matches === 2) multiplier = 1.5;
    else if (matches === 1) multiplier = 1.0;

    setTimeout(() => onComplete(multiplier), 1000);
  };

  const allSelected = selectedColors.every(c => c !== null);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">STREETWEAR DESIGN</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Match the target outfit colors!</p>
      </div>

      <div className="flex gap-8 mb-12">
        {/* Target Outfit */}
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Target</div>
          <div className="space-y-2">
            {targetColors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-slate-700" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-slate-400 uppercase font-bold">{PARTS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Design */}
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Your Brand</div>
          <div className="space-y-2">
            {PARTS.map((part, i) => (
              <div key={part} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 ${selectedColors[i] ? 'border-white' : 'border-dashed border-slate-700'}`}
                  style={{ backgroundColor: selectedColors[i] || 'transparent' }}
                />
                <span className="text-[10px] text-slate-400 uppercase font-bold">{part}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameActive && (
        <div className="w-full max-w-sm">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {PARTS.map((part, partIndex) => (
              <div key={part} className="flex flex-col items-center gap-2">
                <div className="text-[8px] text-slate-500 uppercase font-bold">{part}</div>
                <div className="grid grid-cols-2 gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => handleSelectColor(partIndex, color.hex)}
                      className={`w-6 h-6 rounded-md border ${selectedColors[partIndex] === color.hex ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleFinish}
            disabled={!allSelected}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
              allSelected ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-600'
            }`}
          >
            APPROVE COLLECTION
          </button>
        </div>
      )}

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-5xl mb-4">✨</div>
            <div className="text-2xl font-black text-white uppercase italic tracking-tighter">Collection Finalized</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
