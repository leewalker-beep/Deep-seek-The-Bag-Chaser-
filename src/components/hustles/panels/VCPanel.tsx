import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';
// import { MARKET_CONFIGS } from '../../../config/marketConfig';

interface VCPanelProps {
  hustle: Hustle;
}

export const VCPanel: React.FC<VCPanelProps> = ({ hustle }) => {
  const { pl, setVCChoices, executeHustle, setActiveHustleView } = useGameStore();

  const stage = pl.vcStage;
  const sector = pl.vcSector;
  const investment = pl.vcInvestment;

  // const market = MARKET_CONFIGS[currentMarket];
  const sectorCycle = pl.marketCycle.vc[sector];
  const sectorMult = sectorCycle === 'boom' ? 1.4 : (sectorCycle === 'bust' ? 0.7 : 1.0);

  const stageData = {
    seed: { multRange: '10-50x', failRate: '70%' },
    seriesA: { multRange: '5-20x', failRate: '50%' },
    growth: { multRange: '2-5x', failRate: '30%' },
  }[stage as 'seed' | 'seriesA' | 'growth'];

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
        {/* Stage */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Investment Stage</label>
          <div className="grid grid-cols-3 gap-2">
            {(['seed', 'seriesA', 'growth'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setVCChoices(s, sector, investment)}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  stage === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sector */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Sector Focus</label>
          <div className="grid grid-cols-3 gap-2">
            {(['tech', 'biotech', 'energy'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setVCChoices(stage, s, investment)}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  sector === s ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Investment Size */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Investment ($M)</label>
          <div className="grid grid-cols-3 gap-2">
            {([1, 10, 50] as const).map((i) => (
              <button
                key={i}
                onClick={() => setVCChoices(stage, sector, i)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  investment === i ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ${i}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Capital Call</span>
          <span className="text-red-400">${(investment * 1000000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Risk (Fail Rate)</span>
          <span className="text-orange-400">{stageData.failRate}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Potential Return</span>
          <span className="text-emerald-400">{stageData.multRange}</span>
        </div>
        <div className="flex justify-between text-xs font-bold border-t border-slate-900 pt-2">
          <span className="text-slate-500 uppercase">{sector.toUpperCase()} Cycle</span>
          <span className={sectorCycle === 'boom' ? 'text-emerald-400' : (sectorCycle === 'bust' ? 'text-red-400' : 'text-blue-400')}>
            {sectorCycle.toUpperCase()} (x{sectorMult})
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          const result = executeHustle(hustle.id);
          if (result.success) setActiveHustleView(null);
        }}
        disabled={pl.bag < investment * 1000000}
        className={`w-full py-4 font-black uppercase rounded-xl transition-all active:scale-95 italic ${
          pl.bag < investment * 1000000 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        Deploy Capital
      </button>
    </div>
  );
};
