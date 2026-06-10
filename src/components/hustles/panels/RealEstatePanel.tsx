import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';
import { MARKET_CONFIGS } from '../../../config/marketConfig';

interface RealEstatePanelProps {
  hustle: Hustle;
}

export const RealEstatePanel: React.FC<RealEstatePanelProps> = ({ hustle }) => {
  const { pl, currentMarket, setRealEstateChoices, executeHustle, setActiveHustleView } = useGameStore();

  const type = pl.realEstateType;
  const leverage = pl.realEstateLeverage;
  const strategy = pl.realEstateStrategy;

  const market = MARKET_CONFIGS[currentMarket];

  const typeMult = { residential: 1.0, commercial: 1.5, industrial: 2.0 }[type];
  const leverageMult = leverage === 0 ? 1.0 : (leverage === 50 ? 1.5 : 2.5);
  const cycle = pl.marketCycle.realEstate;
  const cycleMult = cycle === 'boom' ? 1.5 : (cycle === 'bust' ? 0.6 : 1.0);

  const baseYield = 1000000;
  const totalCost = 5000000 * market.expenseMultiplier;
  const projectedProfit = baseYield * typeMult * leverageMult * cycleMult * market.yieldMultiplier;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 text-white">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{hustle.icon}</div>
        <div>
          <h3 className="text-2xl font-black uppercase italic">{hustle.name}</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{hustle.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Property Type */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Property Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['residential', 'commercial', 'industrial'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRealEstateChoices(t, leverage, strategy)}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  type === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Leverage Level</label>
          <div className="grid grid-cols-3 gap-2">
            {([0, 50, 80] as const).map((l) => (
              <button
                key={l}
                onClick={() => setRealEstateChoices(type, l, strategy)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  leverage === l ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {l}%
              </button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Exit Strategy</label>
          <div className="grid grid-cols-2 gap-2">
            {(['hold', 'flip'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setRealEstateChoices(type, leverage, s)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  strategy === s ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Cost</span>
          <span className="text-red-400">${totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Market Cycle</span>
          <span className={cycle === 'boom' ? 'text-emerald-400' : (cycle === 'bust' ? 'text-red-400' : 'text-blue-400')}>
            {cycle.toUpperCase()} (x{cycleMult})
          </span>
        </div>
        <div className="pt-2 border-t border-slate-900">
          <div className="flex justify-between text-sm font-black italic">
            <span className="uppercase">Projected {strategy === 'hold' ? 'Passive' : 'Flip'} Profit</span>
            <span className="text-emerald-400">
              ${Math.floor(strategy === 'hold' ? projectedProfit * 0.5 : projectedProfit).toLocaleString()}{strategy === 'hold' ? '/mo' : ''}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const res = executeHustle(hustle.id);
          if (res.success) setActiveHustleView(null);
        }}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl transition-all active:scale-95 italic"
      >
        Acquire Property
      </button>
    </div>
  );
};
