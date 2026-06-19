import React, { useState } from 'react';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import type { Background } from '../config/backgrounds';

interface PrologueScreenProps {
  onStart: (name: string, backgroundId: string, categoryId: string, variationId: string) => void;
}

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [assignedVariation, setAssignedVariation] = useState<Background | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const selectedCat = BACKGROUND_CATEGORIES.find(c => c.id === selectedCatId);

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
  };

  const handleReveal = () => {
    if (selectedCat) {
      const variations = selectedCat.variations;
      const randomVar = variations[Math.floor(Math.random() * variations.length)];
      setAssignedVariation(randomVar);
      setShowReveal(true);
    }
  };

  const handleStart = () => {
    if (name.trim() && selectedCatId && assignedVariation) {
      onStart(name.toUpperCase(), assignedVariation.id, selectedCatId, assignedVariation.id);
    }
  };

  if (showReveal && assignedVariation && selectedCat) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="max-w-xs w-full">
          <div className="text-emerald-500 font-mono text-xs uppercase mb-2 tracking-widest">Variation Assigned</div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic leading-none">{assignedVariation.name}</h2>
          <div className="text-slate-500 text-[10px] uppercase font-bold mb-6 tracking-tighter">Category: {selectedCat.name}</div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
            <p className="text-lg text-white font-serif italic leading-relaxed mb-6">
              "{assignedVariation.flavor}"
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Starting Bag</div>
                <div className="text-emerald-400 font-black">${assignedVariation.starterBag.toLocaleString()}</div>
              </div>
              {assignedVariation.starterClout > 0 && (
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Clout</div>
                  <div className="text-blue-400 font-black">+{assignedVariation.starterClout}</div>
                </div>
              )}
              {assignedVariation.starterAura > 0 && (
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Aura</div>
                  <div className="text-purple-400 font-black">+{assignedVariation.starterAura}</div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
          >
            ENTER THE WORLD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-10">
        <h1 className="text-5xl font-black mb-2 tracking-tighter italic text-emerald-500">BAG CHASER</h1>
        <p className="text-slate-400 max-w-xs mx-auto text-sm">Escape the mud. Build the empire. Don't lose your soul.</p>
      </div>

      <div className="w-full max-w-xs space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Identity</label>
          <input
            type="text"
            placeholder="ENTER YOUR ALIAS"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-center focus:outline-none focus:border-emerald-500 transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Choose Category</label>
          <div className="grid grid-cols-1 gap-2">
            {BACKGROUND_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-4 rounded-xl text-left transition-all border-2 relative overflow-hidden group ${
                  selectedCatId === cat.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="relative z-10">
                  <div className="font-bold text-white uppercase text-sm">{cat.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{cat.description}</div>
                </div>
                {selectedCatId === cat.id && (
                  <div className="absolute top-2 right-2 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleReveal}
          disabled={!name.trim() || !selectedCatId}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all shadow-xl ${
            name.trim() && selectedCatId
              ? 'bg-emerald-600 text-white active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          GENERATE DESTINY
        </button>
      </div>
    </div>
  );
};
