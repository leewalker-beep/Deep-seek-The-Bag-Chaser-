import React, { useState } from 'react';
import { BACKGROUNDS } from '../config/backgrounds';

interface PrologueScreenProps {
  onStart: (name: string, backgroundId: string) => void;
}

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedBgId, setSelectedBgId] = useState<string | null>(null);
  const [showFlavor, setShowFlavor] = useState(false);

  const selectedBg = BACKGROUNDS.find(b => b.id === selectedBgId);

  const handleStart = () => {
    if (name.trim() && selectedBgId) {
      onStart(name.toUpperCase(), selectedBgId);
    }
  };

  if (showFlavor && selectedBg) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="max-w-xs">
          <h2 className="text-2xl font-black text-emerald-500 mb-6 uppercase italic">{selectedBg.name}</h2>
          <p className="text-xl text-white font-serif italic leading-relaxed mb-12">
            "{selectedBg.flavor}"
          </p>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            ENTER THE WORLD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-black mb-4 tracking-tighter italic text-emerald-500">BAG CHASER</h1>
      <p className="text-slate-400 mb-12 max-w-xs">Escape the mud. Build the empire. Don't lose your soul.</p>

      <input
        type="text"
        placeholder="ENTER YOUR ALIAS"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-center mb-6 focus:outline-none focus:border-emerald-500"
        autoFocus
      />

      <div className="grid grid-cols-1 gap-3 w-full max-w-xs mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setSelectedBgId(bg.id)}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              selectedBgId === bg.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <div className="font-bold text-white uppercase flex justify-between items-center">
              {bg.name}
              <span className="text-[10px] text-emerald-400 font-mono">
                +${bg.starterBag.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 leading-tight">{bg.description}</div>
            {(bg.starterClout > 0 || bg.starterAura > 0) && (
              <div className="text-[9px] text-blue-400 mt-2 font-bold uppercase flex gap-2">
                {bg.starterClout > 0 && <span>+{bg.starterClout} Clout</span>}
                {bg.starterAura > 0 && <span>+{bg.starterAura} Aura</span>}
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowFlavor(true)}
        disabled={!name.trim() || !selectedBgId}
        className={`w-full max-w-xs py-4 rounded-xl font-black uppercase tracking-wider transition-all ${
          name.trim() && selectedBgId ? 'bg-emerald-600 text-white active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        SELECT BACKGROUND
      </button>
    </div>
  );
};
