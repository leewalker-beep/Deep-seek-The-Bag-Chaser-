import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';

interface SpaceInvestmentPanelProps {
  hustle: Hustle;
}

export const SpaceInvestmentPanel: React.FC<SpaceInvestmentPanelProps> = ({ hustle }) => {
  const { pl, setSpaceCompany, executeHustle, setActiveHustleView } = useGameStore();
  const company = pl.spaceCompany || 'asteroid';

  const companyData = {
    asteroid: { name: 'Asteroid Mining Co.', risk: '70% failure', reward: '3x success, 10x moon' },
    tourism: { name: 'Orbital Tourism', risk: '60% failure', reward: '2x success, 8x moon' },
    mining: { name: 'Lunar Mining', risk: '80% failure', reward: '4x success, 15x moon' }
  };

  const handleInvest = () => {
    const roll = Math.random();
    let multiplier: number;

    if (company === 'asteroid') {
      if (roll < 0.7) multiplier = 0.5;
      else if (roll < 0.9) multiplier = 3.0;
      else multiplier = 10.0;
    } else if (company === 'tourism') {
      if (roll < 0.6) multiplier = 0.5;
      else if (roll < 0.9) multiplier = 2.0;
      else multiplier = 8.0;
    } else {
      if (roll < 0.8) multiplier = 0.5;
      else if (roll < 0.95) multiplier = 4.0;
      else multiplier = 15.0;
    }

    const result = executeHustle(hustle.id, multiplier);
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

      <div className="grid gap-3">
        {(['asteroid', 'tourism', 'mining'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setSpaceCompany(opt)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${company === opt ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950'}`}
          >
            <div className="font-black text-white uppercase tracking-tighter">{companyData[opt].name}</div>
            <div className="text-[10px] text-slate-400 mt-1">Risk: {companyData[opt].risk}</div>
            <div className="text-[10px] text-emerald-400">Reward: {companyData[opt].reward}</div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
        <div className="text-[10px] text-slate-500 uppercase">🚀 TO THE MOON OR TO ZERO 🚀</div>
      </div>

      <button onClick={handleInvest} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase rounded-xl transition-all active:scale-95">
        INVEST $100M
      </button>
    </div>
  );
};
