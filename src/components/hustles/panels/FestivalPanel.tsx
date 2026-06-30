import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';
import { MARKET_CONFIGS } from '../../../config/marketConfig';

interface FestivalPanelProps {
  hustle: Hustle;
}

export const FestivalPanel: React.FC<FestivalPanelProps> = ({ hustle }) => {
  const { pl, currentMarket, setFestivalChoices, executeHustle, setActiveHustleView } = useGameStore();
  const choices = pl.festivalChoices || {
    headliner: 'budget',
    venue: 'small',
    marketing: 'basic',
    insurance: false,
  };

  const market = MARKET_CONFIGS[currentMarket];

  const headlinerData = {
    budget: { cost: 50000, mult: 1.0 },
    premium: { cost: 200000, mult: 1.5 },
    luxury: { cost: 500000, mult: 2.5 },
  };

  const venueData = {
    small: { cap: 5000, mult: 1.0 },
    medium: { cap: 20000, mult: 1.8 },
    large: { cap: 50000, mult: 3.0 },
  };

  const marketingData = {
    basic: { cost: 10000, mult: 1.0 },
    standard: { cost: 50000, mult: 1.5 },
    aggressive: { cost: 100000, mult: 2.5 },
  };

  const insuranceCost = choices.insurance ? 50000 : 0;
  const totalCost = (headlinerData[choices.headliner].cost + marketingData[choices.marketing].cost + insuranceCost) * market.expenseMultiplier;

  const ticketPrice = 50;
  const estYield = Math.floor(
    ticketPrice *
    venueData[choices.venue].cap *
    headlinerData[choices.headliner].mult *
    marketingData[choices.marketing].mult *
    market.yieldMultiplier
  );

  const estProfit = estYield - totalCost;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{hustle.icon}</div>
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic">{hustle.name}</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{hustle.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Headliner */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Headliner</label>
          <select
            value={choices.headliner}
            onChange={(e) => setFestivalChoices({ ...choices, headliner: e.target.value as 'budget' | 'premium' | 'luxury' })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-bold text-white"
          >
            <option value="budget">Budget Artist ($50k)</option>
            <option value="premium">Premium Star ($200k)</option>
            <option value="luxury">Global Icon ($500k)</option>
          </select>
        </div>

        {/* Venue */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Venue Size</label>
          <select
            value={choices.venue}
            onChange={(e) => setFestivalChoices({ ...choices, venue: e.target.value as 'small' | 'medium' | 'large' })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-bold text-white"
          >
            <option value="small">Club (5k Cap)</option>
            <option value="medium">Arena (20k Cap)</option>
            <option value="large">Stadium (50k Cap)</option>
          </select>
        </div>

        {/* Marketing */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Marketing Campaign</label>
          <select
            value={choices.marketing}
            onChange={(e) => setFestivalChoices({ ...choices, marketing: e.target.value as 'basic' | 'standard' | 'aggressive' })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm font-bold text-white"
          >
            <option value="basic">Social Media ($10k)</option>
            <option value="standard">TV & Billboards ($50k)</option>
            <option value="aggressive">Global Blitz ($100k)</option>
          </select>
        </div>

        {/* Insurance */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white">Event Insurance ($50k)</div>
            <div className="text-[10px] text-slate-500">Protects against rain events (15% chance)</div>
          </div>
          <input
            type="checkbox"
            checked={choices.insurance}
            onChange={(e) => setFestivalChoices({ ...choices, insurance: e.target.checked })}
            className="w-5 h-5 rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Est. Cost</span>
          <span className="text-red-400">${totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Est. Yield</span>
          <span className="text-emerald-400">${estYield.toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-900 flex justify-between text-sm font-black">
          <span className="text-white uppercase">Projected Profit</span>
          <span className={estProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            ${estProfit.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          executeHustle(hustle.id);
          setActiveHustleView(null);
        }}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all active:scale-95"
      >
        Run Festival
      </button>
    </div>
  );
};
