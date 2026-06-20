import type { StateCreator } from 'zustand';
import type { GameState, Tier } from '../../types/game';

export interface UISlice {
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE';
  activeTab: Tier | 'FLEX' | 'PRESIDENCY';
  activeHustleView: string | null;
  activeTierBadge: string | null;
  activeNarrative: string | null | undefined;
  deathBadge: string | null;
  fatalCause: string | null;

  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  setActiveTab: (tab: Tier | 'FLEX' | 'PRESIDENCY') => void;
  setActiveHustleView: (hustleId: string | null) => void;
  setActiveTierBadge: (badge: string | null) => void;
  dismissNarrative: () => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set) => ({
  ph: 'PROLOGUE',
  activeTab: 'MUD',
  activeHustleView: null,
  activeTierBadge: null,
  activeNarrative: null,
  deathBadge: null,
  fatalCause: null,

  setPh: (ph) => set({ ph }),
  setActiveTab: (tab) => set({ activeTab: tab, activeHustleView: null }),
  setActiveHustleView: (hustleId) => set({ activeHustleView: hustleId }),
  setActiveTierBadge: (badge) => set({ activeTierBadge: badge }),
  dismissNarrative: () => set({ activeNarrative: null }),
});
