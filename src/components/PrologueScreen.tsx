import React, { useState } from 'react';

interface PrologueScreenProps {
  onStart: (name: string, difficulty: 1 | 2 | 3) => void;
}

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(3);

  const handleStart = () => {
    if (name.trim()) {
      onStart(name.toUpperCase(), difficulty);
    }
  };

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

      <div className="grid grid-cols-1 gap-3 w-full max-w-xs mb-8">
        <button
          onClick={() => setDifficulty(1)}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            difficulty === 1 ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="font-bold text-yellow-500">TRUST FUND</div>
          <div className="text-[10px] text-slate-400">Start with $25k, all hustles unlocked</div>
        </button>

        <button
          onClick={() => setDifficulty(2)}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            difficulty === 2 ? 'border-slate-400 bg-slate-400/10' : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="font-bold text-slate-300">MIDDLE GRIND</div>
          <div className="text-[10px] text-slate-400">Start with $5k, 6 hustles unlocked</div>
        </button>

        <button
          onClick={() => setDifficulty(3)}
          className={`p-4 rounded-xl text-left transition-all border-2 ${
            difficulty === 3 ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-900'
          }`}
        >
          <div className="font-bold text-red-500">GRINDER</div>
          <div className="text-[10px] text-slate-400">Start with $1k, 3 manual hustles</div>
        </button>
      </div>

      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className={`w-full max-w-xs py-4 rounded-xl font-black uppercase tracking-wider transition-all ${
          name.trim() ? 'bg-emerald-600 text-white active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        BEGIN THE GRIND
      </button>
    </div>
  );
};
