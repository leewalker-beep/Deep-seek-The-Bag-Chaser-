import React, { useState } from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';
import { RosterSelectList } from '../../ui/RosterSelectList';
import type { Founder } from '../../../types/game';
import { getCharacterCallbackLine } from '../../../utils/rivalUtils';

interface VCPanelProps {
  hustle: Hustle;
  onExecute: (selectedFounder?: any) => void;
}

export const VCPanel: React.FC<VCPanelProps> = ({ hustle, onExecute }) => {
  const { pl, setVCChoices, updatePl, addTickerMessage } = useGameStore();
  const [selectedFounderId, setSelectedFounderId] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);

  const stage = pl.vcStage;
  const sector = pl.vcSector;
  const investment = pl.vcInvestment;

  const sectorCycle = pl.marketCycle.vc[sector];
  const sectorMult = sectorCycle === 'boom' ? 1.4 : (sectorCycle === 'bust' ? 0.7 : 1.0);

  const stageData = {
    seed: { multRange: '10-50x', failRate: '70%' },
    seriesA: { multRange: '5-20x', failRate: '50%' },
    growth: { multRange: '2-5x', failRate: '30%' },
  }[stage as 'seed' | 'seriesA' | 'growth'];

  const portfolio = pl.foundersBacked || [];
  const selectedFounder = portfolio.find(f => f.id === selectedFounderId) || null;

  const handleFollowOn = (founder: Founder) => {
    const fee = 5000000;
    if (pl.bag < fee) return;

    const currentExecution = founder.stats.execution;
    const currentVision = founder.stats.vision;
    const currentBurn = founder.stats.burnDiscipline;
    const currentFollowOnCount = founder.followOnCount || 0;

    if (currentFollowOnCount >= 3) {
      addTickerMessage?.("Founder has reached maximum follow-on investment capacity (3/3)!", "text-yellow-400");
      return;
    }

    if (currentExecution >= 100 && currentVision >= 100 && currentBurn >= 100) {
      addTickerMessage?.("Founder stats are already at absolute peak performance!", "text-yellow-400");
      return;
    }

    setIsFunding(true);

    setTimeout(() => {
      const updatedFounders = portfolio.map(f => {
        if (f.id === founder.id) {
          return {
            ...f,
            followOnCount: currentFollowOnCount + 1,
            stats: {
              execution: Math.min(100, currentExecution + 10),
              vision: Math.min(100, currentVision + 10),
              burnDiscipline: Math.min(100, currentBurn + 10),
            }
          };
        }
        return f;
      });

      updatePl({
        bag: pl.bag - fee,
        foundersBacked: updatedFounders
      });

      const roundName = currentFollowOnCount === 0 ? 'Series A' : currentFollowOnCount === 1 ? 'Series B' : 'Series C';
      addTickerMessage?.(`🚀 FOLLOW-ON: Injected $5M ${roundName} funding into ${founder.companyName}! Stats boosted!`, 'text-emerald-400 font-bold');
      setIsFunding(false);
    }, 1200);
  };

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
        onClick={() => onExecute(selectedFounder)}
        disabled={pl.bag < investment * 1000000}
        className={`w-full py-4 font-black uppercase rounded-xl transition-all active:scale-95 italic ${
          pl.bag < investment * 1000000 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        Deploy Capital
      </button>

      {/* Selected Founder Detail Panel */}
      {selectedFounder && (
        <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/50 space-y-3 font-mono">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl" data-testid="selected-founder-avatar">{selectedFounder.avatar || '💼'}</span>
              <div>
                <h4 className="text-sm font-black text-white uppercase" data-testid="selected-founder-name">{selectedFounder.name}</h4>
                <p className="text-[10px] text-blue-400 font-bold uppercase">{selectedFounder.companyName}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFounderId(null)}
              className="text-xs font-bold text-slate-500 hover:text-white uppercase"
            >
              Close
            </button>
          </div>
          <p className="text-[10px] text-slate-400 italic">"{selectedFounder.pitchIdea}"</p>
          {selectedFounder.characterId && getCharacterCallbackLine(pl, selectedFounder.characterId) && (
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">
              💡 {getCharacterCallbackLine(pl, selectedFounder.characterId)}
            </p>
          )}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
            <span>Funding Round:</span>
            <span className={selectedFounder.followOnCount !== undefined && selectedFounder.followOnCount >= 3 ? 'text-red-400 font-black' : 'text-blue-400 font-black'}>
              {selectedFounder.followOnCount === 1 ? 'Series A (1/3)' :
               selectedFounder.followOnCount === 2 ? 'Series B (2/3)' :
               selectedFounder.followOnCount !== undefined && selectedFounder.followOnCount >= 3 ? 'Series C (3/3) - MAXED' :
               'Seed (0/3)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Execution</span>
              <span className="text-blue-400 font-black text-sm">{selectedFounder.stats.execution}/100</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Vision</span>
              <span className="text-purple-400 font-black text-sm">{selectedFounder.stats.vision}/100</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold mb-0.5">Burn Disc</span>
              <span className="text-red-400 font-black text-sm">{selectedFounder.stats.burnDiscipline}/100</span>
            </div>
          </div>

          {isFunding ? (
            <div className="flex flex-col items-center gap-2 py-4 animate-pulse bg-slate-900/50 rounded-lg border border-slate-800" data-testid="vc-funding-progress">
              <div className="text-5xl animate-bounce">{selectedFounder.avatar || '💼'}</div>
              <p className="text-xs font-black text-blue-400">DISPATCHING CAPITAL TO {selectedFounder.name.toUpperCase()}...</p>
              <span className="text-[10px] text-slate-500 font-mono">WIRING $5,000,000 FUNDS 💸</span>
            </div>
          ) : (
            <button
              onClick={() => handleFollowOn(selectedFounder)}
              disabled={pl.bag < 5000000 || (selectedFounder.followOnCount !== undefined && selectedFounder.followOnCount >= 3) || (selectedFounder.stats.execution >= 100 && selectedFounder.stats.vision >= 100 && selectedFounder.stats.burnDiscipline >= 100)}
              className={`w-full py-2.5 text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 italic ${
                pl.bag < 5000000 || (selectedFounder.followOnCount !== undefined && selectedFounder.followOnCount >= 3) || (selectedFounder.stats.execution >= 100 && selectedFounder.stats.vision >= 100 && selectedFounder.stats.burnDiscipline >= 100)
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
              }`}
            >
              {selectedFounder.followOnCount !== undefined && selectedFounder.followOnCount >= 3
                ? 'MAX FUNDING REACHED'
                : `Inject Series ${selectedFounder.followOnCount === 1 ? 'B' : selectedFounder.followOnCount === 2 ? 'C' : 'A'} Capital ($5,000,000)`}
            </button>
          )}
        </div>
      )}

      {/* Portfolio Companies Section */}
      <div className="border-t border-slate-800 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Portfolio Companies
          </h4>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Total Backed: {portfolio.length}
          </span>
        </div>

        {portfolio.length === 0 ? (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-500 text-[10px] font-mono uppercase leading-relaxed">
            No backed founders yet.<br />Close a VC deal to seed your first startup portfolio!
          </div>
        ) : (
          <RosterSelectList
            roster={portfolio}
            onSelect={(founder) => setSelectedFounderId(founder.id)}
            getDisplayProps={(founder) => {
              const returns = (founder.stats.execution * 100) + (founder.stats.vision * 150) + (founder.stats.burnDiscipline * 50);
              const stageText = founder.followOnCount === 1 ? 'Series A' :
                                founder.followOnCount === 2 ? 'Series B' :
                                founder.followOnCount !== undefined && founder.followOnCount >= 3 ? 'Series C' :
                                'Seed';
              const historyLine = founder.characterId ? getCharacterCallbackLine(pl, founder.characterId) : null;
              const subtitleText = `${founder.companyName} (${stageText}) — "${founder.pitchIdea.substring(0, 30)}..."` + (historyLine ? ` [💡 ${historyLine}]` : '');
              return {
                name: founder.name,
                avatar: founder.avatar,
                subtitle: subtitleText,
                statLine: (
                  <div className="text-[10px] space-y-1 text-right font-mono">
                    <div className="flex gap-2 justify-end text-slate-400">
                      <span>EXE: <strong className="text-blue-400">{founder.stats.execution}</strong></span>
                      <span>VIS: <strong className="text-purple-400">{founder.stats.vision}</strong></span>
                      <span>BURN: <strong className="text-red-400">{founder.stats.burnDiscipline}</strong></span>
                    </div>
                    <div className="text-emerald-400 font-black">
                      +${returns.toLocaleString()}/mo
                    </div>
                  </div>
                )
              };
            }}
          />
        )}
      </div>
    </div>
  );
};