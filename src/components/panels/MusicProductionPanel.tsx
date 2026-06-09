import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';

interface MusicProductionPanelProps {
  hustle: Hustle;
  onExecute: () => void;
}

export const MusicProductionPanel: React.FC<MusicProductionPanelProps> = ({ onExecute }) => {
  const { pl, scoutArtist, dropArtist } = useGameStore();

  const handleScout = () => {
    const result = scoutArtist();
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 transition-all hover:border-slate-700">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
            🎹
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">Music Roster</h3>
            <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Global Label Management</p>
          </div>
        </div>
        <button
          onClick={handleScout}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
        >
          SCOUT ARTIST (-$5,000)
        </button>
      </div>

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {pl.artistRoster.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            <div className="text-2xl mb-2 opacity-30">🎙️</div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No artists signed yet</div>
          </div>
        ) : (
          pl.artistRoster.map(artist => (
            <div key={artist.id} className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/50 flex justify-between items-center group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{artist.name}</span>
                  {artist.isGrammyWinner && <span className="text-[10px]">🏆</span>}
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Talent</span>
                    <span className="text-[10px] text-blue-400 font-mono font-bold">{artist.talent}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Hype</span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold">{artist.hype}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Monthly</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">${artist.monthlyEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dropArtist(artist.id)}
                className="opacity-0 group-hover:opacity-100 text-[8px] font-black text-red-500 uppercase hover:underline transition-opacity px-2"
              >
                Drop
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-800 pt-6">
        <div className="text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest text-center">Studio Session</div>
        <button
          onClick={onExecute}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex flex-col items-center justify-center gap-1"
        >
          <span className="text-sm">DROP A SINGLE</span>
          <span className="text-[9px] opacity-70">TRIGGERS RHYTHM MINIGAME</span>
        </button>
      </div>
    </div>
  );
};
