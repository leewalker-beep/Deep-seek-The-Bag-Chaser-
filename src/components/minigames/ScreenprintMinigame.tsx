import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenprintMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
];

const PARTS_LIST = ['Shirt Body', 'Sleeve Print', 'Neck Tag'];

export const ScreenprintMinigame: React.FC<ScreenprintMinigameProps> = ({ onComplete, scaling }) => {
  const parts = PARTS_LIST;
  const partsCount = parts.length;

  // Calculate timer based on scaling
  const baseTime = 12.0; // seconds
  const timerFactor = Math.max(0.4, 1.1 - (scaling - 1) * 0.25);
  const initialTime = Number((baseTime * timerFactor).toFixed(1));

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [targetColors, setTargetColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<(string | null)[]>(new Array(partsCount).fill(null));
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'match' | null>(null);

  useEffect(() => {
    // Generate random target colors
    const targets = parts.map(() => COLORS[Math.floor(Math.random() * COLORS.length)].hex);
    setTargetColors(targets);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(interval);
          handleFinish(true); // timed out
          return 0;
        }
        return Number((t - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive, targetColors, selectedColors]);

  const handleSelectColor = (partIndex: number, colorHex: string) => {
    if (!gameActive) return;
    const next = [...selectedColors];
    next[partIndex] = colorHex;
    setSelectedColors(next);

    if (colorHex === targetColors[partIndex]) {
      setFeedback('match');
      setTimeout(() => setFeedback(null), 200);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const handleFinish = (isTimeout = false) => {
    setGameActive(false);

    // Calculate matches
    let matchedCount = 0;
    selectedColors.forEach((color, i) => {
      if (color === targetColors[i]) {
        matchedCount++;
      }
    });

    let multiplier = 0.5;
    if (matchedCount === 3) multiplier = 3.0;
    else if (matchedCount === 1.8) multiplier = 1.8; // Safe fallback/match mapping
    else if (matchedCount === 2) multiplier = 1.8;
    else if (matchedCount === 1) multiplier = 1.0;
    else multiplier = 0.5;

    if (navigator.vibrate) {
      navigator.vibrate(matchedCount === 3 ? 100 : 50);
    }

    setTimeout(() => {
      onComplete(multiplier);
    }, 1500);
  };

  const allSelected = selectedColors.every((c) => c !== null);

  const getEmojiForPart = (part: string) => {
    switch (part) {
      case 'Shirt Body': return '👕';
      case 'Sleeve Print': return '🎨';
      case 'Neck Tag': return '🏷️';
      default: return '👕';
    }
  };

  return (
    <div className={`p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[500px] flex flex-col justify-between transition-colors duration-300 ${
      feedback === 'match' ? 'bg-emerald-950/20 border-emerald-800' : ''
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-black text-emerald-400 tracking-tight italic">SCREENPRINT TEES</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Match all parts/tags before time runs out!</p>
        </div>
        <div className={`text-sm font-mono font-black px-3 py-1 rounded-full border ${
          timeLeft < 4.0 ? 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        }`}>
          ⏱️ {timeLeft.toFixed(1)}s
        </div>
      </div>

      {/* Target Outfit / Your Design Split */}
      <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-4">
        {/* Target look */}
        <div className="text-center border-r border-slate-800 pr-2">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-3 tracking-widest">TARGET LOOK</div>
          <div className="space-y-3">
            {targetColors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-white/10 shadow-md flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {getEmojiForPart(parts[i])}
                </div>
                <span className="text-[10px] text-slate-300 uppercase font-black text-left leading-none">{parts[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your brand look */}
        <div className="text-center pl-2">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-3 tracking-widest">YOUR PRINT</div>
          <div className="space-y-3">
            {parts.map((part, i) => (
              <div key={part} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg shrink-0 transition-all duration-300 ${
                    selectedColors[i] === targetColors[i] ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                    selectedColors[i] ? 'border-white' : 'border-dashed border-slate-700 bg-slate-950'
                  }`}
                  style={{ backgroundColor: selectedColors[i] || 'transparent' }}
                >
                  {getEmojiForPart(part)}
                </div>
                <span className={`text-[10px] uppercase font-black text-left leading-none ${selectedColors[i] === targetColors[i] ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {part}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selector Grid */}
      {gameActive ? (
        <div className="space-y-4">
          <div className="space-y-3 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
            {parts.map((part, partIndex) => (
              <div key={part} className="flex items-center justify-between gap-3">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest shrink-0 w-20">{part}:</span>
                <div className="flex gap-2 justify-end w-full">
                  {COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleSelectColor(partIndex, color.hex)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all active:scale-90 shrink-0 ${
                        selectedColors[partIndex] === color.hex ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleFinish(false)}
            disabled={!allSelected}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-b-4 ${
              allSelected
                ? 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 border-emerald-700 active:translate-y-0.5 active:border-b-0'
                : 'bg-slate-800 text-slate-600 border-slate-950 cursor-not-allowed'
            }`}
          >
            APPROVE PRINT BATCH
          </button>
        </div>
      ) : (
        <div className="text-center py-6 animate-pulse">
          <span className="text-5xl mb-3 block">👕</span>
          <h4 className="text-xl font-black text-emerald-400 italic uppercase">BATCH PRINTED</h4>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Matched {selectedColors.filter((c, i) => c === targetColors[i]).length} / {partsCount} parts
          </p>
        </div>
      )}
    </div>
  );
};
