import React from 'react';
import { getEnding } from '../config/endings';
import { useGameStore } from '../store/gameStore';
import { getDominantStat } from '../utils/endingUtils';

interface EndingModalProps {
  onClose: () => void;
  onNewGamePlus: () => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({ onClose, onNewGamePlus }) => {
  const { pl } = useGameStore();

  const finalStat = getDominantStat(pl);
  const ending = getEnding(pl.legacyPoints || 0, finalStat);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-purple-500 p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-purple-400 mb-2">{ending.title}</h2>
        <p className="text-slate-300 text-sm mb-6">{ending.description}</p>

        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="text-[10px] text-slate-500 uppercase mb-2">Your Legacy Score</div>
          <div className="text-3xl font-bold text-emerald-400">{pl.legacyPoints || 0}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={onNewGamePlus} className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl">NEW GAME+</button>
          <button onClick={onClose} className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl">CLOSE</button>
        </div>
      </div>
    </div>
  );
};
