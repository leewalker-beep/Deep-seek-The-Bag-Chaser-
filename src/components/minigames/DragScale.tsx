import React, { useState } from 'react';

interface DragScaleProps {
  onComplete: (multiplier: number) => void;
}

export const DragScale: React.FC<DragScaleProps> = ({ onComplete }) => {
  const [scale, setScale] = useState(50);

  const handleFinish = () => {
    // Multiplier is based on scale (1-100%)
    // Base is 1.0 at 50%. Max is 2.0 at 100%. Min is 0.2 at 1%.
    const multiplier = scale / 50;
    onComplete(multiplier);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none h-64 flex flex-col justify-center items-center relative">
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
        DRAG TO SCALE YOUR SAAS
      </div>

      <div className="w-full max-w-xs space-y-8">
        <div className="relative pt-1">
          <input
            type="range"
            min="1"
            max="100"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>MVP</span>
            <span className="text-emerald-400 font-bold">SCALE: {scale}%</span>
            <span>ENTERPRISE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
            <div className="text-[8px] text-slate-500 uppercase">Est. Yield</div>
            <div className="text-emerald-400 font-bold">{(scale / 50).toFixed(1)}x</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
            <div className="text-[8px] text-slate-500 uppercase">Mental Hit</div>
            <div className="text-red-400 font-bold">{(scale / 50).toFixed(1)}x</div>
          </div>
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95"
        >
          DEPLOY PRODUCT
        </button>
      </div>

      <div className="mt-4 text-[10px] text-slate-500 italic">
        "Growth at all costs... even your sanity."
      </div>
    </div>
  );
};
