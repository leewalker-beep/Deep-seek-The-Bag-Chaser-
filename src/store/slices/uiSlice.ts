import type { StateCreator } from 'zustand';
import type { GameState, AppTab } from '../../types/game';

export interface UISlice {
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE' | 'LEGACY_SHOP';
  activeTab: AppTab;
  activeHustleView: string | null;
  activeTierBadge: string | null;
  activeNarrative: string | null | undefined;
  deathBadge: string | null;
  fatalCause: string | null;
  pendingSpecialization: boolean;
  tutorialStep: number;
  isTutorialSkipped: boolean;

  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE' | 'LEGACY_SHOP') => void;
  setActiveTab: (tab: AppTab) => void;
  setActiveHustleView: (hustleId: string | null) => void;
  setActiveTierBadge: (badge: string | null) => void;
  dismissNarrative: () => void;
  setTutorialStep: (step: number) => void;
  setTutorialSkipped: (skipped: boolean) => void;
  setPendingSpecialization: (pending: boolean) => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set) => ({
  ph: 'PROLOGUE',
  activeTab: 'MUD',
  activeHustleView: null,
  activeTierBadge: null,
  activeNarrative: null,
  deathBadge: null,
  fatalCause: null,
  pendingSpecialization: false,
  tutorialStep: 0,
  isTutorialSkipped: false,

  setPh: (ph) => set({ ph }),
  setActiveTab: (tab) => set({ activeTab: tab, activeHustleView: null }),
  setActiveHustleView: (hustleId) => set({ activeHustleView: hustleId }),
  setActiveTierBadge: (badge) => set({ activeTierBadge: badge }),
  dismissNarrative: () => set({ activeNarrative: null }),
  setTutorialStep: (step) => set({ tutorialStep: step }),
  setPendingSpecialization: (pending) => set({ pendingSpecialization: pending }),
  setTutorialSkipped: (skipped) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    }
    set({ isTutorialSkipped: skipped });
  },
});
