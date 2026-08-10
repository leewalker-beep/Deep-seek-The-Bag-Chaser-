import React, { useState } from 'react';
import { generateGlobalNPC } from '../../config/world/npcRegistry';
import type { NPCCharacter } from '../../config/world/npcRegistry';
import { useGameStore } from '../../store/gameStore';
import type { PersistentNPC } from '../../types/game';
import Avatar from '../Avatar';

export interface PodcastDashboardProps {
  onSelectGuest?: (guestId: string) => void;
  onStartSession?: (guest: NPCCharacter | null) => void;
  level?: number;
}

export const PodcastDashboard: React.FC<PodcastDashboardProps> = ({
  onSelectGuest,
  onStartSession,
}) => {
  const [activeGuest, setActiveGuest] = useState<NPCCharacter | null>(null);
  const { pl, updatePl } = useGameStore();

  const rollNewGuestBooking = () => {
    // 70% chance of a creator guest, 30% chance a rival crashes the studio line
    const selectedRole = Math.random() > 0.3 ? 'CREATOR' : 'RIVAL';
    const guest = generateGlobalNPC(selectedRole);
    setActiveGuest(guest);

    // Track the generated NPC in the global npc registry state
    const currentNpcs = pl.npcs || [];
    if (!currentNpcs.some(n => n.id === guest.id)) {
      const persistentGuest: PersistentNPC = {
        id: guest.id,
        name: guest.name,
        avatar: guest.avatar,
        avatarId: guest.avatarId,
        reputation: guest.reputation,
        disposition: guest.disposition,
        currentRole: guest.role === 'INTERN' ? 'STREET_INTERN' : guest.role,
        interactionLog: ['GUEST_ON_PODCAST'],
        currentHustleId: guest.currentHustleId
      };
      updatePl({
        npcs: [...currentNpcs, persistentGuest]
      });
    }

    if (onSelectGuest) {
      onSelectGuest(guest.id);
    }
  };

  return (
    <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl font-sans text-white text-xs space-y-3">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
        <div>
          <h3 className="font-black tracking-widest text-blue-500 uppercase">🎙️ BROADCAST STUDIO CONSOLE</h3>
          <p className="text-[8px] text-zinc-500 font-mono font-bold uppercase mt-0.5">Live Audience Grid Distribution</p>
        </div>
        <button
          onClick={rollNewGuestBooking}
          className="px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:border-blue-400 font-mono font-bold text-[10px] rounded-lg transition-all active:scale-95"
        >
          🛰️ SCOUT GUEST LINE
        </button>
      </div>

      {activeGuest ? (
        <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3 transition-all animate-fadeIn">
          {/* Linked Unified Avatar Frame */}
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl relative shrink-0 shadow-inner overflow-hidden">
            <Avatar avatarId={activeGuest.avatarId || activeGuest.avatar} size={48} className="rounded-xl" />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-950 z-20 ${activeGuest.role === 'RIVAL' ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-black text-zinc-100 truncate text-sm">{activeGuest.name}</p>
              <span className={`text-[7px] font-mono px-1 py-0.5 rounded font-bold uppercase tracking-wider border ${
                activeGuest.role === 'RIVAL' ? 'bg-red-950/40 text-red-400 border-red-500/20' : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
              }`}>
                {activeGuest.role}
              </span>
            </div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
              {activeGuest.role === 'RIVAL'
                ? "⚠️ Warning: Guest is hostile. Highly volatile engagement ratings."
                : `🔥 Network Reach: ${(activeGuest.reputation * 3.5).toFixed(0)}k Projected Listeners`}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-900/30 border border-zinc-900/60 rounded-xl text-center text-zinc-600 font-mono text-[9px] italic">
          No talent currently mic'd up. Scan the lines to route an interview link.
        </div>
      )}

      {onStartSession && (
        <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
          {activeGuest ? (
            <button
              onClick={() => onStartSession(activeGuest)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              🎙️ START BROADCAST WITH {activeGuest.name.toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onStartSession(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-xs rounded-lg transition-all active:scale-95 border border-zinc-750"
            >
              🎙️ START SOLO BROADCAST SESSION
            </button>
          )}
        </div>
      )}
    </div>
  );
};
