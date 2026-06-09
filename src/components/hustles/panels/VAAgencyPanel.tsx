import React from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';

interface VAAgencyPanelProps {
  hustle: Hustle;
}

export const VAAgencyPanel: React.FC<VAAgencyPanelProps> = ({ hustle }) => {
  const { pl, setVASettings, executeHustle, setActiveHustleView } = useGameStore();

  const staff = pl.vaStaff || 5;
  const training = pl.vaTraining || 'none';
  const client = pl.vaClient || 'small';

  const staffOptions: (5 | 10 | 20)[] = [5, 10, 20];
  const trainingOptions: ('none' | 'basic' | 'advanced')[] = ['none', 'basic', 'advanced'];
  const clientOptions: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

  const trainingMult = { none: 1.0, basic: 1.3, advanced: 1.6 }[training];
  const successChance = Math.min(1, (staff / 20) * trainingMult);
  const cost = { 5: 10000, 10: 25000, 20: 50000 }[staff];
  const yieldEst = { small: 50000, medium: 200000, large: 1000000 }[client];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{hustle.icon}</div>
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic">{hustle.name}</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{hustle.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Staff */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Team Size</label>
          <div className="grid grid-cols-3 gap-2">
            {staffOptions.map((s) => (
              <button
                key={s}
                onClick={() => setVASettings(s, training, client)}
                className={`py-2 rounded-lg text-xs font-bold uppercase border-2 transition-all ${
                  staff === s ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {s} Staff
              </button>
            ))}
          </div>
        </div>

        {/* Training */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Training Program</label>
          <div className="grid grid-cols-3 gap-2">
            {trainingOptions.map((t) => (
              <button
                key={t}
                onClick={() => setVASettings(staff, t, client)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase border-2 transition-all ${
                  training === t ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Client */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Client Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {clientOptions.map((c) => (
              <button
                key={c}
                onClick={() => setVASettings(staff, training, c)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase border-2 transition-all ${
                  client === c ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Operational Cost</span>
          <span className="text-red-400">${cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Est. Payout</span>
          <span className="text-emerald-400">${yieldEst.toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-900 flex justify-between text-xs font-black">
          <span className="text-white uppercase">Success Chance</span>
          <span className="text-blue-400">{(successChance * 100).toFixed(0)}%</span>
        </div>
      </div>

      <button
        onClick={() => {
          executeHustle(hustle.id);
          setActiveHustleView(null);
        }}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all active:scale-95"
      >
        Sign Contract
      </button>
    </div>
  );
};
