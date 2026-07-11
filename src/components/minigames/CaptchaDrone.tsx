import React, { useState, useEffect } from 'react';

const ASSET_IMAGES = ['🚗', '🚲', '🚦', '🛑', '🌴', '🏢'];

export const CaptchaDrone: React.FC<{ level: number; onComplete: (win: boolean) => void }> = ({ level, onComplete }) => {
  const [targetAsset, setTargetAsset] = useState('🚗');
  const [grid, setGrid] = useState<string[]>([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);

  const totalRequired = 3 + level;

  const generateMatrix = () => {
    const target = ASSET_IMAGES[Math.floor(Math.random() * 3)];
    setTargetAsset(target);
    const matrixSize = 9; // Standard 3x3 layout
    const newGrid = Array.from({ length: matrixSize }).map(() =>
      Math.random() > 0.4 ? target : ASSET_IMAGES[Math.floor(Math.random() * ASSET_IMAGES.length)]
    );
    if (!newGrid.includes(target)) newGrid[Math.floor(Math.random() * matrixSize)] = target;
    setGrid(newGrid);
  };

  useEffect(() => { generateMatrix(); }, []);

  useEffect(() => {
    if (timeLeft <= 0) { onComplete(false); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleCellClick = (cellItem: string) => {
    if (cellItem === targetAsset) {
      const updatedScore = solvedCount + 1;
      setSolvedCount(updatedScore);
      if (updatedScore >= totalRequired) onComplete(true); else generateMatrix();
    } else {
      setTimeLeft(t => Math.max(0, t - 1.5)); // Misclick time penalty
    }
  };

  return (
    <div className="flex flex-col items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 text-center text-white font-mono select-none">
      <div className="w-full flex justify-between text-[9px] text-zinc-400">
        <span>🤖 CAPTCHA DRONE OVERLAY</span>
        <span>VERIFIED: {solvedCount}/{totalRequired}</span>
        <span className="text-red-400 font-bold">{timeLeft.toFixed(1)}s</span>
      </div>
      <p className="text-[11px] font-medium text-slate-200">Select all cells containing: <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400 font-bold">{targetAsset}</span></p>
      <div className="grid grid-cols-3 gap-1.5 w-48 h-48">
        {grid.map((cell, idx) => (
          <button key={idx} onClick={() => handleCellClick(cell)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-xl transition-transform active:scale-90">{cell}</button>
        ))}
      </div>
    </div>
  );
};
