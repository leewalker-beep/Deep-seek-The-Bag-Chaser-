import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';

interface DataAnalyticsPanelProps {
  hustle: Hustle;
}

export const DataAnalyticsPanel: React.FC<DataAnalyticsPanelProps> = ({ hustle }) => {
  const { pl, setDataAnalyticsChoice, executeHustle, setActiveHustleView } = useGameStore();
  const currentChoice = pl.dataAnalyticsChoice || 'consumer';
  const currentLevel = pl.hustleLevels[hustle.id] || 1;

  const options = [
    { id: 'consumer', name: 'Consumer Data', desc: 'Predict buying habits', rewards: '+$100k, +50 Clout, Low Heat (+5)' },
    { id: 'financial', name: 'Financial Data', desc: 'Market prediction models', rewards: '+$500k, Med Heat (+10)' },
    { id: 'social', name: 'Social Dynamics', desc: 'Influence and trends', rewards: '+$50k, +100 Aura, Low Heat (+5)' },
    {
      id: 'all',
      name: 'Omniscient Package',
      desc: 'All data combined',
      rewards: '+$1M, +150 Clout/Aura, High Heat (+30)',
      req: 'Level 3 Required',
      disabled: currentLevel < 3,
      risk: '10% Breach Risk (-100 Clout, +50 Heat)'
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
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={opt.disabled}
            onClick={() => setDataAnalyticsChoice(opt.id as 'consumer' | 'financial' | 'social' | 'all')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              currentChoice === opt.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : opt.disabled
                  ? 'border-slate-800 bg-slate-950/50 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-black text-white uppercase tracking-tighter">{opt.name}</span>
              {opt.req && <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase">{opt.req}</span>}
            </div>
            <p className="text-xs text-slate-400 mb-2">{opt.desc}</p>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
              {opt.rewards}
            </div>
            {opt.risk && (
              <div className="text-[9px] font-bold text-orange-400 uppercase mt-1">
                ⚠️ RISK: {opt.risk}
              </div>
            )}
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
        Extract Insights
      </button>
    </div>
  );
};
