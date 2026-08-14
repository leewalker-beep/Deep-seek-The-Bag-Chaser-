import type { StateCreator } from 'zustand';
import type { GameState, AppTab } from '../../types/game';
import { type HeroArtwork } from '../../config/heroArtwork';

export interface UISlice {
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE' | 'LEGACY_SHOP';
  activeTab: AppTab;
  activeHustleView: string | null;
  activeTierBadge: string | null;
  activeNarrative: string | null | undefined;
  showMinigame: boolean;
  deathBadge: string | null;
  fatalCause: string | null;
  pendingSpecialization: boolean;
  tutorialStep: number;
  isTutorialSkipped: boolean;
  activeTransition: HeroArtwork | null;
  transitionQueue: HeroArtwork[];
  focusedRivalId: string | null;

  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE' | 'LEGACY_SHOP') => void;
  setActiveTab: (tab: AppTab) => void;
  setActiveHustleView: (hustleId: string | null) => void;
  setActiveTierBadge: (badge: string | null) => void;
  setShowMinigame: (show: boolean) => void;
  dismissNarrative: () => void;
  dismissLiveEvent: () => void;
  setTutorialStep: (step: number) => void;
  setTutorialSkipped: (skipped: boolean) => void;
  setPendingSpecialization: (pending: boolean) => void;
  triggerTransition: (artwork: HeroArtwork) => void;
  clearTransition: () => void;
  setFocusedRivalId: (id: string | null) => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set, get) => ({
  ph: 'PROLOGUE',
  activeTab: 'MUD',
  activeHustleView: null,
  activeTierBadge: null,
  activeNarrative: null,
  showMinigame: false,
  deathBadge: null,
  fatalCause: null,
  pendingSpecialization: false,
  tutorialStep: 0,
  isTutorialSkipped: false,
  activeTransition: null,
  transitionQueue: [],
  focusedRivalId: null,

  setPh: (ph) => set({ ph }),
  setActiveTab: (tab) => set({ activeTab: tab, activeHustleView: null }),
  setActiveHustleView: (hustleId) => set({ activeHustleView: hustleId }),
  setActiveTierBadge: (badge) => set({ activeTierBadge: badge }),
  setShowMinigame: (show) => set({ showMinigame: show }),
  dismissNarrative: () => set({ activeNarrative: null }),
  dismissLiveEvent: () => set((state) => ({
    pl: { ...state.pl, activeLiveEvent: null }
  })),
  setTutorialStep: (step) => set((state) => ({
    tutorialStep: step,
    pl: { ...state.pl, tutorialStep: step }
  })),
  setPendingSpecialization: (pending) => set({ pendingSpecialization: pending }),
  setFocusedRivalId: (id) => set({ focusedRivalId: id }),
  setTutorialSkipped: (skipped) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    }
    set((state) => ({
      isTutorialSkipped: skipped,
      pl: { ...state.pl, isTutorialSkipped: skipped }
    }));
  },
  triggerTransition: (artwork) => {
    const { activeTransition, transitionQueue } = get();
    if (activeTransition) {
      set({ transitionQueue: [...transitionQueue, artwork] });
    } else {
      set({ activeTransition: artwork });
    }
  },
  clearTransition: () => {
    const { transitionQueue } = get();
    if (transitionQueue.length > 0) {
      const [next, ...rest] = transitionQueue;
      set({ activeTransition: next, transitionQueue: rest });
    } else {
      set({ activeTransition: null });
    }
  },
});
