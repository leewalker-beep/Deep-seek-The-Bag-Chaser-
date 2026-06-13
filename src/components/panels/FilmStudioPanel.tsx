import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';

interface FilmStudioPanelProps {
  hustle: Hustle;
}

export const FilmStudioPanel: React.FC<FilmStudioPanelProps> = ({ hustle }) => {
  const { pl, setFilmChoices, executeHustle, setActiveHustleView } = useGameStore();

  const genre = pl.filmGenre || 'action';
  const budget = pl.filmBudget || 'medium';

  const genreMultiplier = { action: 1.2, comedy: 1.0, drama: 0.8 };
  const budgetMultiplier = { low: 0.7, medium: 1.0, high: 1.5 };
  const baseCost = 25000000;
  const totalCost = baseCost * budgetMultiplier[budget];

  const handleProduce = () => {
    const outcome = Math.random();
    let multiplier: number;

    if (outcome < 0.3) multiplier = 0.3;
    else if (outcome < 0.7) multiplier = 1.5;
    else if (outcome < 0.9) multiplier = 3.0;
    else multiplier = 5.0;

    const finalMultiplier = multiplier * genreMultiplier[genre];
    const result = executeHustle(hustle.id, finalMultiplier);
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

      <div className="grid gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Genre</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setFilmChoices('action', budget)} className={`py-2 rounded-lg text-xs font-bold border-2 ${genre === 'action' ? 'bg-red-600 border-red-500' : 'bg-slate-800 border-slate-700'}`}>ACTION</button>
            <button onClick={() => setFilmChoices('comedy', budget)} className={`py-2 rounded-lg text-xs font-bold border-2 ${genre === 'comedy' ? 'bg-yellow-600 border-yellow-500' : 'bg-slate-800 border-slate-700'}`}>COMEDY</button>
            <button onClick={() => setFilmChoices('drama', budget)} className={`py-2 rounded-lg text-xs font-bold border-2 ${genre === 'drama' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>DRAMA</button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Budget</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setFilmChoices(genre, 'low')} className={`py-2 rounded-lg text-xs font-bold border-2 ${budget === 'low' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>LOW ($17.5M)</button>
            <button onClick={() => setFilmChoices(genre, 'medium')} className={`py-2 rounded-lg text-xs font-bold border-2 ${budget === 'medium' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>MEDIUM ($25M)</button>
            <button onClick={() => setFilmChoices(genre, 'high')} className={`py-2 rounded-lg text-xs font-bold border-2 ${budget === 'high' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>HIGH ($37.5M)</button>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Total Cost</span>
          <span className="text-red-400">${totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase">Potential Return</span>
          <span className="text-emerald-400">Up to 5x</span>
        </div>
      </div>

      <button onClick={handleProduce} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition-all active:scale-95">
        GREENLIGHT MOVIE
      </button>
    </div>
  );
};
