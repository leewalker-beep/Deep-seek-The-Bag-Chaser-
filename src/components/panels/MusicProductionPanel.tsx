import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';
import { RosterSelectList } from '../ui/RosterSelectList';

interface MusicProductionPanelProps {
  hustle: Hustle;
  onExecute: () => void;
}

export const MusicProductionPanel: React.FC<MusicProductionPanelProps> = ({ hustle, onExecute }) => {
  const { pl, scoutArtist, signScoutedArtist, dropArtist, executeBranch } = useGameStore();
  const currentLevel = pl.hustleLevels[hustle.id] || 1;

  const currentBranchId = pl.hustleBranchIds[hustle.id] || hustle.startBranchId;
  const currentBranch = hustle.branches?.[currentBranchId!];
  const nextBranches = currentBranch?.nextBranches || [];
  const availableBranches = nextBranches
    .map(id => hustle.branches![id])
    .filter(b => b !== undefined);

  const handleScout = (tier: 'local' | 'regional' | 'global') => {
    const result = scoutArtist(tier);
    if (!result.success && result.message !== 'Scouting failed') {
      alert(result.message);
    }
  };

  const totalRoyalties = pl.artists.reduce((sum, a) => sum + a.royaltyRate, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 transition-all hover:border-slate-700">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shadow-inner">
            🎹
          </div>
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">Music Roster ({pl.artists.length}/10)</h3>
            <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Total Royalties: ${totalRoyalties.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {currentLevel >= 2 ? (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => handleScout('local')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            LOCAL (-$10k)
          </button>
          <button
            onClick={() => handleScout('regional')}
            className="bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-900/20"
          >
            REGIONAL (-$50k)
          </button>
          <button
            onClick={() => handleScout('global')}
            className="bg-yellow-600 hover:bg-yellow-500 text-white text-[9px] font-black py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
          >
            GLOBAL (-$200k)
          </button>
        </div>
      ) : (
        <div className="mb-6 py-3 px-4 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reach Level 2 to scout talent</p>
        </div>
      )}

      {pl.scoutedTalentPool && pl.scoutedTalentPool.length > 0 && (
        <div className="mb-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-purple-400 text-xs uppercase tracking-wider">Scouted Candidates</h4>
              <p className="text-[9px] text-slate-400 leading-tight">Select one candidate to sign (unpicked will clear)</p>
            </div>
            <button
              onClick={() => {
                useGameStore.setState((state) => ({
                  pl: { ...state.pl, scoutedTalentPool: [] }
                }));
              }}
              className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-wider"
            >
              Discard All
            </button>
          </div>

          <RosterSelectList
            roster={pl.scoutedTalentPool}
            onSelect={(artist) => {
              signScoutedArtist(artist.id);
            }}
            getDisplayProps={(artist) => ({
              name: artist.name,
              avatar: artist.avatar,
              subtitle: `${artist.tier.toUpperCase()} Artist`,
              statLine: (
                <div className="text-right">
                  <span className="block text-[8px] text-slate-500 uppercase font-black">ROYALTIES</span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">${artist.royaltyRate.toLocaleString()}/mo</span>
                </div>
              )
            })}
          />
        </div>
      )}

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {pl.artists.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            <div className="text-2xl mb-2 opacity-30">🎙️</div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No artists signed yet</div>
          </div>
        ) : (
          pl.artists.map(artist => (
            <div key={artist.id} className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3 transition-all group">
              {/* Character Face Container */}
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl shadow-inner relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                <span>{artist.avatar || '🎤'}</span>
              </div>

              {/* Existing Identity & Stats Stack */}
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-black text-sm text-zinc-100">{artist.name}</span>
                  <span className="text-[7px] px-1.5 py-0.5 bg-purple-900/30 text-purple-400 border border-purple-500/20 font-mono font-bold rounded uppercase tracking-wider">
                    {artist.status === 'IN STUDIO' ? 'REGIONAL' : artist.tier}
                  </span>
                  {artist.isGrammyWinner && <span className="text-[10px]">🏆</span>}
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Royalties</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">${artist.royaltyRate.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-bold">Status</span>
                    <span className={`text-[10px] font-bold uppercase ${artist.hasReleased ? 'text-blue-400' : 'text-slate-600'}`}>
                      {artist.hasReleased ? 'Active' : 'In Studio'}
                    </span>
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

      <div className="border-t border-slate-800 pt-6 space-y-4">
        <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-widest text-center">Studio Session</div>
        <button
          onClick={onExecute}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex flex-col items-center justify-center gap-1"
        >
          <span className="text-sm">PRODUCE TRACK</span>
          <span className="text-[9px] opacity-70">TRIGGERS RHYTHM MINIGAME</span>
        </button>

        {availableBranches.length > 0 && (
          <div className="pt-2">
            <div className="text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest text-center">Label Upgrades</div>
            <div className="space-y-2">
              {availableBranches.map(branch => {
                const canAfford = pl.bag >= branch.cost && pl.clout >= branch.cloutReq && pl.aura >= branch.auraReq;
                return (
                  <button
                    key={branch.id}
                    onClick={() => executeBranch(hustle.id, branch.id!)}
                    disabled={!canAfford}
                    className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all ${
                      canAfford
                        ? 'bg-slate-800 border-purple-500/50 hover:bg-slate-700'
                        : 'bg-slate-900 border-slate-800 opacity-50 grayscale cursor-not-allowed'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold text-white uppercase">{branch.name}</div>
                      <div className="text-[9px] text-slate-400">Req: {branch.cloutReq} Clout / {branch.auraReq} Aura</div>
                    </div>
                    <div className="text-purple-400 font-mono font-bold text-xs">-${branch.cost.toLocaleString()}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
