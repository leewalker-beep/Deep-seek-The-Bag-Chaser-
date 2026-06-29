import React from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  onDismiss: () => void;
}

export const AnnualStatement: React.FC<Props> = ({ onDismiss }) => {
  const { pl } = useGameStore();
  const { annualCashEarned, annualCashSpent, annualHustlesRun, heat, name, currentTier, bag } = pl;

  const netCash = annualCashEarned - annualCashSpent;
  const yearNumber = Math.floor(pl.month / 12);
  const tierColor = 'text-white';

  const verdict = (() => {
    if (netCash >= 0 && heat < 40)
      return { icon:'✅', text:'CLEAN YEAR. Keep the momentum.' };
    if (netCash >= 0 && heat >= 70)
      return { icon:'⚠️', text:'PROFITABLE BUT HOT. Cool it down.' };
    if (netCash < 0 && heat < 40)
      return { icon:'📉', text:'ROUGH YEAR. Reassess your hustle.' };
    return { icon:'🔥',
      text:'BAD YEAR AND HOT. One move from disaster.' };
  })();

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">
                YEAR {yearNumber} ANNUAL REVIEW
              </div>
              <div className="text-3xl font-black text-white mt-2 tracking-tight">
                OPERATOR: {name?.toUpperCase()}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black border ${tierColor} border-current uppercase tracking-widest`}>
              {currentTier}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Financial Performance */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/50">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-3">Financial Performance</div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Earned:</span>
                  <span className="text-emerald-400 font-bold">+${annualCashEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Spent:</span>
                  <span className="text-red-400 font-bold">-${annualCashSpent.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Net:</span>
                  <span className={`font-black ${netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netCash >= 0 ? '+' : ''}${netCash.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-400">Bag now:</span>
                  <span className="text-white font-black">${bag.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Hustle Activity */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/50">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-3">Hustle Activity</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold">Hustles run:</span>
                  <span className="text-white font-black">{annualHustlesRun}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold">Per month avg:</span>
                  <span className="text-white font-black">{(annualHustlesRun/12).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-400 font-bold">Heat level:</span>
                  <span className={`font-black ${heat < 40 ? 'text-emerald-400' : heat < 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {heat}%
                  </span>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="py-4 text-center">
              <div className="text-5xl mb-3">{verdict.icon}</div>
              <div className="text-base font-bold text-white uppercase tracking-wider">
                {verdict.text}
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-sm rounded-xl uppercase tracking-[0.2em] mt-6 transition-all active:scale-95 shadow-lg"
          >
            NOTED — KEEP GRINDING →
          </button>
        </div>
      </div>
    </div>
  );
};
