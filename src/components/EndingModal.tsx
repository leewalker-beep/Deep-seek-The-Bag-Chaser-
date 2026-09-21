import React, { useEffect } from 'react';
import { getEnding } from '../config/endings';
import { useGameStore } from '../store/gameStore';
import { getDominantStat } from '../utils/endingUtils';
import { HERO_ARTWORK } from '../config/heroArtwork';
import { analyzeBehavior } from '../utils/personalityAnalyzer';
import { getMasteryCount } from '../utils/masteryUtils';

interface EndingModalProps {
  onClose: () => void;
  onNewGamePlus: () => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({ onClose, onNewGamePlus }) => {
  const { pl, triggerTransition } = useGameStore();

  useEffect(() => {
    triggerTransition(HERO_ARTWORK.ENDING);
  }, [triggerTransition]);

  const finalStat = getDominantStat(pl);
  const legacyScore = pl.legacyScore || pl.legacyPoints || 0;
  const ending = getEnding(legacyScore, finalStat);
  const behavior = analyzeBehavior(pl);
  const crownCount = getMasteryCount(pl);

  const alliedRivalsCount = pl.rivals?.filter(r => r.status === 'ally').length || 0;
  const totalRosterAllies = (pl.foundersBacked?.length || 0) + (pl.rolodex?.length || 0) + alliedRivalsCount;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border-2 border-purple-500/40 p-6 md:p-8 max-w-xl w-full text-center shadow-[0_0_50px_rgba(168,85,247,0.2)] my-8">
        <div className="text-5xl mb-2 animate-bounce">🏆</div>
        <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest bg-purple-950/80 border border-purple-500/30 rounded px-2.5 py-1 inline-block mb-3">
          WHAT KIND OF BAG CHASER WERE YOU?
        </span>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{ending.title}</h2>
        <p className="text-slate-300 text-xs mb-6 leading-relaxed max-w-lg mx-auto">{ending.description}</p>

        {/* Behavioral Archetype Dossier Badge */}
        <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CAREER DOSSIER</span>
            <span
              className="text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider"
              style={{ backgroundColor: `${behavior.colorHex}20`, color: behavior.colorHex, border: `1px solid ${behavior.colorHex}40` }}
            >
              {behavior.primaryColor} • {behavior.dominantPersona}
            </span>
          </div>
          <p className="text-slate-300 text-xs italic font-medium leading-relaxed mb-3">
            "{behavior.synthesisLines[0] || behavior.colorDescription}"
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[9px] font-mono text-slate-500 uppercase">NET WORTH</div>
              <div className="text-sm font-black text-emerald-400">${pl.bag.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[9px] font-mono text-slate-500 uppercase">CLOUT / AURA</div>
              <div className="text-sm font-black text-blue-400">{pl.clout} / {pl.aura}</div>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[9px] font-mono text-slate-500 uppercase">CROWNS</div>
              <div className="text-sm font-black text-yellow-400">👑 {crownCount}</div>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[9px] font-mono text-slate-500 uppercase">NETWORK ALLIES</div>
              <div className="text-sm font-black text-purple-400">🤝 {totalRosterAllies}</div>
            </div>
          </div>
        </div>

        {/* Legacy Score Banner */}
        <div className="bg-gradient-to-r from-purple-900/40 via-slate-800 to-purple-900/40 rounded-2xl p-4 mb-6 border border-purple-500/30 flex items-center justify-between px-6">
          <div className="text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">FINAL LEGACY SCORE</div>
            <div className="text-2xl font-black text-purple-300">{legacyScore.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">HIGHEST TIER</div>
            <div className="text-xl font-black text-emerald-400">{pl.currentTier}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onNewGamePlus} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl transition-all uppercase tracking-wider text-xs shadow-lg shadow-emerald-900/30">
            NEW GAME+
          </button>
          <button onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold rounded-xl transition-all uppercase tracking-wider text-xs border border-slate-700">
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
};
