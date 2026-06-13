import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';

interface PhilanthropyPanelProps {
  hustle: Hustle;
}

export const PhilanthropyPanel: React.FC<PhilanthropyPanelProps> = ({ hustle }) => {
  const { pl, setPhilanthropyDonation, executeHustle, setActiveHustleView } = useGameStore();
  const donation = pl.philanthropyDonation || 10000000;

  const handleDonate = () => {
    const result = executeHustle(hustle.id, donation / 50000000);
    if (result.success) setActiveHustleView(null);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{hustle.icon}</div>
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic">{hustle.name}</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{hustle.description}</p>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="text-[10px] text-slate-500 uppercase mb-2">Legacy Points: {pl.legacyPoints || 0}</div>
        <div className="text-[8px] text-slate-600">Each point increases ALL future earnings by 0.1%</div>
      </div>

      <div className="grid gap-3">
        <button onClick={() => setPhilanthropyDonation(10000000)} className={`py-3 rounded-lg border-2 ${donation === 10000000 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
          DONATE $10M → +20 Legacy Points
        </button>
        <button onClick={() => setPhilanthropyDonation(50000000)} className={`py-3 rounded-lg border-2 ${donation === 50000000 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
          DONATE $50M → +100 Legacy Points
        </button>
        <button onClick={() => setPhilanthropyDonation(100000000)} className={`py-3 rounded-lg border-2 ${donation === 100000000 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
          DONATE $100M → +200 Legacy Points
        </button>
      </div>

      <button onClick={handleDonate} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all active:scale-95">
        MAKE DONATION
      </button>
    </div>
  );
};
