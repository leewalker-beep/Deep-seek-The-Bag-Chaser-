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
  tutorialStep: number;
  isTutorialSkipped: boolean;

  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  setActiveTab: (tab: Tier | 'FLEX' | 'PRESIDENCY') => void;
  setActiveHustleView: (hustleId: string | null) => void;
  setActiveTierBadge: (badge: string | null) => void;
  dismissNarrative: () => void;
  setTutorialStep: (step: number) => void;
  setTutorialSkipped: (skipped: boolean) => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set) => ({
  ph: 'PROLOGUE',
  activeTab: 'MUD',
  activeHustleView: null,
  activeTierBadge: null,
  activeNarrative: null,
  deathBadge: null,
  fatalCause: null,
  tutorialStep: 0,
  isTutorialSkipped: false,

  setPh: (ph) => set({ ph }),
  setActiveTab: (tab) => set({ activeTab: tab, activeHustleView: null }),
  setActiveHustleView: (hustleId) => set({ activeHustleView: hustleId }),
  setActiveTierBadge: (badge) => set({ activeTierBadge: badge }),
  dismissNarrative: () => set({ activeNarrative: null }),
  setTutorialStep: (step) => set({ tutorialStep: step }),
  setTutorialSkipped: (skipped) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    }
    set({ isTutorialSkipped: skipped });
  },
});
