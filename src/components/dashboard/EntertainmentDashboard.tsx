import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const EntertainmentDashboard: React.FC = () => {
  const pl = useGameStore(state => state.pl);
  const { artists, scoutedTalentPool, bag } = pl;

  const handleSignArtist = (scoutedArtistId: string) => {
    useGameStore.setState((state) => {
      const target = state.pl.scoutedTalentPool.find((a: any) => a.id === scoutedArtistId);
      if (!target) return state;
      return {
        pl: {
          ...state.pl,
          scoutedTalentPool: state.pl.scoutedTalentPool.filter((a: any) => a.id !== scoutedArtistId),
          artists: [
            ...state.pl.artists,
            {
              ...target,
              contractMonthsLeft: 120, // 10-year lock-in
              monthlyRetainer: 400,
              monthlyRevenue: 150
            }
          ]
        }
      };
    });
  };

  const handleReleaseAlbum = (artistId: string) => {
    if (bag < 2000) return;
    useGameStore.setState((state) => {
      const artist = state.pl.artists.find((a: any) => a.id === artistId);
      if (!artist) return state;
      return {
        pl: {
          ...state.pl,
          bag: state.pl.bag - 2000,
          artists: state.pl.artists.map((a: any) => {
            if (a.id === artistId) {
              return {
                ...a,
                monthlyRevenue: a.monthlyRevenue + Math.floor(450 * a.hypeFactor)
              };
            }
            return a;
          })
        }
      };
    });
  };

  const triggerLiveGig = (gigLevel: number, cost: number) => {
    if (bag < cost) return;
    useGameStore.setState((state) => {
      return {
        pl: {
          ...state.pl,
          bag: state.pl.bag - cost,
          activeMinigame: {
            panelType: 'CONCERT_JAM_GAME',
            level: gigLevel
          }
        }
      };
    });
  };

  return (
    <div className="p-4 bg-zinc-950 rounded-xl space-y-4 border border-zinc-900 text-white max-w-md mx-auto select-none font-sans">
      <div className="border-b border-zinc-800 pb-2">
        <h2 className="text-xs font-black tracking-widest text-purple-500 uppercase">💿 ENTERTAINMENT AGENCY PANEL</h2>
        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">MANAGE CONTRACT REVENUE & LIVE VENUES</p>
      </div>

      {/* Active Music Roster Renders */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase text-zinc-400 font-mono font-bold tracking-wider">Active Roster ({artists?.length || 0})</h3>
        {!artists || artists.length === 0 ? (
          <p className="text-[9px] text-zinc-600 italic p-3 bg-zinc-900/20 border border-zinc-900 rounded-lg">No active creator contracts signed. Review talent pool listings below.</p>
        ) : (
          artists.map((artist: any) => (
            <div key={artist.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold flex items-center gap-1.5 text-zinc-200">
                  <span>{artist.avatar || '🎤'}</span> {artist.name}
                </p>
                <p className="text-[8px] text-zinc-500 font-mono mt-0.5">CONTRACT CLOCK: {artist.contractMonthsLeft}m remaining</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[9px] text-emerald-400 font-mono font-bold">+${artist.monthlyRevenue}/mo</span>
                <button
                  onClick={() => handleReleaseAlbum(artist.id)}
                  disabled={bag < 2000}
                  className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded text-[8px] font-mono font-bold uppercase transition-all"
                >
                  DROP SINGLE (-$2k)
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scouting Lobby Room */}
      <div className="space-y-2 pt-2 border-t border-zinc-900">
        <h3 className="text-[10px] uppercase text-amber-500 font-mono font-bold tracking-wider">Available Talent Pool</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {!scoutedTalentPool || scoutedTalentPool.length === 0 ? (
            <p className="text-[9px] text-zinc-600 italic">Scouting pipeline clearing... Check back next quarter.</p>
          ) : (
            scoutedTalentPool.map((talent: any) => (
              <div key={talent.id} className="p-2 bg-zinc-900/40 border border-zinc-900 rounded-lg flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">{talent.avatar || '⭐️'} {talent.name} (Multiplier: {talent.hypeFactor?.toFixed(1) || '1.0'}x)</span>
                <button
                  onClick={() => handleSignArtist(talent.id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[9px] font-mono font-bold uppercase transition-all"
                >
                  SIGN CONTRACT
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Live Shows Gated Matrix */}
      <div className="pt-2 border-t border-zinc-900 space-y-1.5">
        <h3 className="text-[10px] uppercase text-purple-400 font-mono font-bold tracking-wider">Book Venue Performances</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={!artists || artists.length < 1 || bag < 1000}
            onClick={() => triggerLiveGig(1, 1000)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 disabled:opacity-30 rounded-xl text-center text-[10px] font-mono font-bold transition-all"
          >
            🎤 CLUB TOUR SHOW
            <p className="text-[7px] text-zinc-500 mt-0.5 font-normal">Costs: $1,000 / Requires 1 Artist</p>
          </button>
          <button
            disabled={!artists || artists.length < 3 || bag < 5000}
            onClick={() => triggerLiveGig(2, 5000)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 disabled:opacity-30 rounded-xl text-center text-[10px] font-mono font-bold transition-all"
          >
            🎪 HEADLINE ARENA
            <p className="text-[7px] text-zinc-500 mt-0.5 font-normal">Costs: $5,000 / Requires 3 Artists</p>
          </button>
        </div>
      </div>
    </div>
  );
};
