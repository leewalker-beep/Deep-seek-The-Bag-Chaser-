import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface StreetwearMatchProps {
  level?: number;
  tier?: Tier;
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

const PARTS_LIST = ['Hat', 'Shirt', 'Pants', 'Shoes', 'Hoodie'];

export const StreetwearMatch: React.FC<StreetwearMatchProps> = ({ level = 1, tier = 'MUD', onComplete }) => {
  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: more parts and mistakes tracked at higher difficulty
  const partsCount = Math.min(PARTS_LIST.length, Math.max(2, Math.floor(1 + (level * 0.8) * (1 + (scaling * 0.05)))));
  const parts = PARTS_LIST.slice(0, partsCount);

  const [targetColors, setTargetColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<(string | null)[]>(new Array(partsCount).fill(null));
  const [mistakes, setMistakes] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'match' | null>(null);

  useEffect(() => {
    // Generate random target colors
    const targets = parts.map(() => COLORS[Math.floor(Math.random() * COLORS.length)].hex);
    setTargetColors(targets);
  }, [level, partsCount]);

  const handleSelectColor = (partIndex: number, colorHex: string) => {
    if (!gameActive) return;
    const next = [...selectedColors];
    next[partIndex] = colorHex;
    setSelectedColors(next);

    if (colorHex === targetColors[partIndex]) {
        setFeedback('match');
        setTimeout(() => setFeedback(null), 200);
        if (navigator.vibrate) navigator.vibrate(20);
    } else {
        // Track mistakes if above a certain difficulty threshold
        if (scaling > 2.0 || level >= 4) {
            setMistakes(m => m + 1);
        }
    }
  };

  const handleFinish = () => {
    setGameActive(false);
    let currentMistakes = mistakes;
    selectedColors.forEach((color, i) => {
      if (color !== targetColors[i]) {
          if (scaling <= 2.0 && level < 4) currentMistakes++;
      }
    });

    let multiplier = 0.5;
    if (currentMistakes === 0) multiplier = 3.0;
    else if (currentMistakes === 1) multiplier = 2.0;
    else if (currentMistakes === 2) multiplier = 1.0;
    else multiplier = 0.5;

    if (navigator.vibrate) navigator.vibrate(currentMistakes === 0 ? 100 : 50);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  const allSelected = selectedColors.every(c => c !== null);

  return (
    <div className={`fixed inset-0 transition-colors duration-300 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'match' ? 'bg-emerald-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center w-full px-8">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">STREETWEAR DESIGN</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-slate-500">🎨</motion.span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Match the target outfit colors!</p>
        </div>
      </div>

      <div className="flex gap-12 mb-12 bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-800">
        {/* Target Outfit */}
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">TARGET LOOK</div>
          <div className="space-y-4">
            {targetColors.map((color, i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                    className="w-10 h-10 rounded-xl border-2 border-white/20 shadow-lg"
                    style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-slate-400 uppercase font-black">{parts[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-800 self-stretch" />

        {/* Your Design */}
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">YOUR BRAND</div>
          <div className="space-y-4">
            {parts.map((part, i) => (
              <div key={part} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 ${
                    selectedColors[i] === targetColors[i] ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                    selectedColors[i] ? 'border-white' : 'border-dashed border-slate-700'
                  }`}
                  style={{ backgroundColor: selectedColors[i] || 'transparent' }}
                />
                <span className={`text-[10px] uppercase font-black ${selectedColors[i] === targetColors[i] ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {part}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameActive && (
        <div className="w-full max-w-sm px-6">
          {(scaling > 2.0 || level >= 4) && (
            <div className="text-center mb-4">
                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">PENALTY MODE: MISTAKES TRACKED</div>
                <div className="text-2xl font-black text-red-600">{mistakes}</div>
            </div>
          )}
          <div className={`grid ${partsCount > 3 ? 'grid-cols-5' : 'grid-cols-3'} gap-4 mb-10`}>
            {parts.map((part, partIndex) => (
              <div key={part} className="flex flex-col items-center gap-3">
                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{part}</div>
                <div className="grid grid-cols-2 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color.hex}
                      onClick={() => handleSelectColor(partIndex, color.hex)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all active:scale-90 ${
                        selectedColors[partIndex] === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'
                      }`}
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
            className={`w-full py-5 rounded-2xl font-black text-sm transition-all active:scale-95 border-b-4 ${
              allSelected ? 'bg-emerald-600 text-white border-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-600 border-slate-900'
            }`}
          >
            APPROVE COLLECTION
          </button>
        </div>
      )}

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-7xl mb-6">✨</div>
            <div className="text-3xl font-black text-white uppercase italic tracking-tighter">Collection Finalized</div>
            <div className="text-emerald-500 font-black text-sm uppercase tracking-widest mt-2">
                {selectedColors.filter((c, i) => c === targetColors[i]).length}/{partsCount} MATCHED
                {(scaling > 2.0 || level >= 4) && ` • ${mistakes} PENALTIES`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
