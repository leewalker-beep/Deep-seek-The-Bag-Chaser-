import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';

interface CryptoMiningPanelProps {
  hustle: Hustle;
}

export const CryptoMiningPanel: React.FC<CryptoMiningPanelProps> = ({ hustle }) => {
  const { pl, setCryptoStrategy, executeHustle, setActiveHustleView } = useGameStore();
  const currentStrategy = pl.cryptoStrategy || 'solo';
  const currentLevel = pl.hustleLevels[hustle.id] || 1;

  const strategies = [
    { id: 'solo', name: 'Solo Mining', desc: 'Go it alone', yield: '$50k', risk: '0%', heat: '+5' },
    { id: 'pool', name: 'Pool Mining', desc: 'Join a collective', yield: '$200k', risk: '5%', heat: '+10' },
    { id: 'cloud', name: 'Cloud Mining', desc: 'Rent hash power', yield: '$500k', risk: '20% Scam', heat: '+20' },
    {
      id: 'asic',
      name: 'ASIC Farm',
      desc: 'Industrial hardware',
      yield: '$2M',
      risk: '10% Failure',
      heat: '+30',
      req: 'Level 3 Required',
      disabled: currentLevel < 3
    },
  ];

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
        {strategies.map((strat) => (
          <button
            key={strat.id}
            disabled={strat.disabled}
            onClick={() => setCryptoStrategy(strat.id as 'solo' | 'pool' | 'cloud' | 'asic')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              currentStrategy === strat.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : strat.disabled
                  ? 'border-slate-800 bg-slate-950/50 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-black text-white uppercase tracking-tighter">{strat.name}</span>
              {strat.req && <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase">{strat.req}</span>}
            </div>
            <p className="text-xs text-slate-400 mb-2">{strat.desc}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Yield: {strat.yield}</div>
              <div className="text-[10px] font-bold text-orange-400 uppercase text-center">Risk: {strat.risk}</div>
              <div className="text-[10px] font-bold text-red-400 uppercase text-right">Heat: {strat.heat}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          executeHustle(hustle.id);
          setActiveHustleView(null);
        }}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all active:scale-95"
      >
        Start Mining
      </button>
    </div>
  );
};
