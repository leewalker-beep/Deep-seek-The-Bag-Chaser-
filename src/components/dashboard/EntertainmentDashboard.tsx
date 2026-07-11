import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export const EntertainmentDashboard: React.FC = () => {
  const store = useGameStore();
  const { artists, bag } = store.pl;

  // Local state to track which specific artists are selected for the upcoming show
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

  const toggleArtistSelection = (id: string) => {
    setSelectedArtistIds(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const triggerLiveGigWithLineup = (gigLevel: number, requiredCount: number, baseCost: number) => {
    if (selectedArtistIds.length !== requiredCount) return;

    const marketingDiscount = store.pl.synergyPool?.grassrootsMarketing || 0;
    const finalizedBookingCost = Math.max(500, baseCost - marketingDiscount);

    if (bag < finalizedBookingCost) return;

    useGameStore.setState((state: any) => {
      const startingHypeCushion = 50 + (state.pl.synergyPool?.logisticsBonus || 0);

      const updatedSynergyPool = state.pl.synergyPool ? {
        ...state.pl.synergyPool,
        grassrootsMarketing: 0,
        logisticsBonus: 0
      } : undefined;

      return {
        pl: {
          ...state.pl,
          bag: state.pl.bag - finalizedBookingCost,
          activeMinigame: {
            panelType: 'CONCERT_JAM_GAME',
            level: gigLevel,
            initialHype: Math.min(95, startingHypeCushion),
            performingArtistIds: selectedArtistIds
          },
          synergyPool: updatedSynergyPool
        }
      };
    });

    setSelectedArtistIds([]);
  };

  return (
    <div className="p-4 bg-zinc-950 rounded-xl space-y-4 border border-zinc-900 text-white max-w-md mx-auto select-none font-sans">
      <div className="border-b border-zinc-800 pb-2">
        <h2 className="text-xs font-black tracking-widest text-purple-500 uppercase">💿 ENTERTAINMENT AGENCY PANEL</h2>
        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">LINEUP MANAGEMENT & ARENA ROUTING</p>
      </div>

      {/* Roster Management Container with Checkbox Toggles */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase text-zinc-400 font-mono font-bold tracking-wider">Select Lineup For Next Gig</h3>
        {!artists || artists.length === 0 ? (
          <p className="text-[9px] text-zinc-600 italic p-3 bg-zinc-900/20 border border-zinc-900 rounded-lg">No active artists signed to contract.</p>
        ) : (
          <div className="space-y-1.5">
            {artists.map((artist: any) => {
              const isSelected = selectedArtistIds.includes(artist.id);
              return (
                <div
                  key={artist.id}
                  onClick={() => toggleArtistSelection(artist.id)}
                  className={`p-2 border rounded-xl flex justify-between items-center text-xs cursor-pointer transition-all ${
                    isSelected ? 'bg-purple-950/30 border-purple-500 shadow-glow' : 'bg-zinc-900 border-zinc-800/80 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-bold ${isSelected ? 'bg-purple-600 border-purple-400 text-black' : 'border-zinc-700 bg-zinc-950'}`}>
                      {isSelected && '✓'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200">{artist.avatar || '🎤'} {artist.name}</p>
                      <p className="text-[8px] text-zinc-500 font-mono">Hype factor: {artist.hypeFactor?.toFixed(2) || '1.00'}x</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">+${artist.monthlyRevenue}/mo</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Venue Matrix */}
      <div className="pt-2 border-t border-zinc-900 space-y-1.5">
        <h3 className="text-[10px] uppercase text-purple-400 font-mono font-bold tracking-wider">Book Venue Schedule</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={selectedArtistIds.length !== 1 || bag < 1000}
            onClick={() => triggerLiveGigWithLineup(1, 1, 1000)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 disabled:opacity-30 rounded-xl text-center text-[10px] font-mono font-bold transition-all"
          >
            🎤 CLUB TOUR GIG
            <p className="text-[7px] text-zinc-500 mt-0.5 font-normal">Requires EXACTLY 1 Selected Artist</p>
          </button>
          <button
            disabled={selectedArtistIds.length !== 3 || bag < 5000}
            onClick={() => triggerLiveGigWithLineup(2, 3, 5000)}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 disabled:opacity-30 rounded-xl text-center text-[10px] font-mono font-bold transition-all"
          >
            🎪 HEADLINE STADIUM
            <p className="text-[7px] text-zinc-500 mt-0.5 font-normal">Requires EXACTLY 3 Selected Artists</p>
          </button>
        </div>
        <p className="text-[8px] text-center text-zinc-600 font-mono">Selected line-up size: {selectedArtistIds.length} artists</p>
      </div>
    </div>
  );
};
