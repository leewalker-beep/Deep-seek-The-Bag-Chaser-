import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';
import { getMasteryCount } from '../utils/masteryUtils';
import type { Tier, PlayerStats } from '../types/game';

const ALL_MASTERY_HUSTLE_IDS = [
  'r_labor', 'r_delivery', 'r_plasma', 'r_vending', 'r_ghost_mode', 'r_scrap', 'street_eats',
  'cleaning', 'cc', 'pod', 'techFlip', 'sw', 'drop', 'h_talent_agent', 'vintage', 'r_pr_campaign',
  'unique_hustle_deli', 'saas_mvp', 'ecom_brand', 'meme', 'audio', 'agency_scale', 'smm',
  'h_review_farm', 'gig', 'real_estate_empire', 'venture_capital', 'data_analytics', 'festival'
];

describe('Full Career Boundary & Progression Test Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3);
  });

  const boundaryTransitions: { from: Tier; to: Tier }[] = [
    { from: 'MUD', to: 'STREET' },
    { from: 'STREET', to: 'STARTUP' },
    { from: 'STARTUP', to: 'CORPORATE' },
    { from: 'CORPORATE', to: 'ELITE' },
    { from: 'ELITE', to: 'MOGUL' },
    { from: 'MOGUL', to: 'PRESIDENT' },
    { from: 'PRESIDENT', to: 'OPEN' },
  ];

  boundaryTransitions.forEach(({ from, to }) => {
    describe(`Transition: ${from} → ${to}`, () => {
      const req = TIER_REQUIREMENTS[to];

      const setupPlayerStateAtBoundary = (
        crownCount: number,
        cash: number,
        clout: number,
        aura: number
      ) => {
        const store = useGameStore.getState();
        const mastered = ALL_MASTERY_HUSTLE_IDS.slice(0, crownCount);
        // Ensure bag covers both cash requirement and advancement fee
        const effectiveBag = Math.max(cash, req.fee);

        store.updatePl({
          currentTier: from,
          bag: effectiveBag,
          clout: clout,
          aura: aura,
          masteredHustles: mastered,
          inJail: false,
          isIncarcerated: false,
          isTutorialSkipped: true,
        });

        useGameStore.setState({
          isTutorialSkipped: true,
          pendingSpecialization: false,
        });
      };

      it(`exact threshold: allows advancement from ${from} to ${to}`, () => {
        setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura);

        const store = useGameStore.getState();
        expect(store.pl.currentTier).toBe(from);
        expect(getMasteryCount(store.pl)).toBe(req.crowns);

        const success = store.advanceTier();
        expect(success).toBe(true);
        expect(useGameStore.getState().pendingSpecialization).toBe(true);
      });

      it(`one below crown threshold: blocks advancement from ${from} to ${to}`, () => {
        if (req.crowns > 0) {
          setupPlayerStateAtBoundary(req.crowns - 1, req.cash, req.clout, req.aura);
          const store = useGameStore.getState();

          const success = store.advanceTier();
          expect(success).toBe(false);
          expect(useGameStore.getState().pendingSpecialization).toBe(false);
          expect(useGameStore.getState().pl.currentTier).toBe(from);
        }
      });

      it(`one below cash threshold: blocks advancement from ${from} to ${to}`, () => {
        if (req.cash > 0) {
          setupPlayerStateAtBoundary(req.crowns, req.cash - 1, req.clout, req.aura);
          const store = useGameStore.getState();

          const success = store.advanceTier();
          expect(success).toBe(false);
          expect(useGameStore.getState().pendingSpecialization).toBe(false);
          expect(useGameStore.getState().pl.currentTier).toBe(from);
        }
      });

      it(`one below clout threshold: blocks advancement from ${from} to ${to}`, () => {
        if (req.clout > 0) {
          setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout - 1, req.aura);
          const store = useGameStore.getState();

          const success = store.advanceTier();
          expect(success).toBe(false);
          expect(useGameStore.getState().pendingSpecialization).toBe(false);
          expect(useGameStore.getState().pl.currentTier).toBe(from);
        }
      });

      it(`one below aura threshold: blocks advancement from ${from} to ${to}`, () => {
        if (req.aura > 0) {
          setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura - 1);
          const store = useGameStore.getState();

          const success = store.advanceTier();
          expect(success).toBe(false);
          expect(useGameStore.getState().pendingSpecialization).toBe(false);
          expect(useGameStore.getState().pl.currentTier).toBe(from);
        }
      });

      it(`one above threshold: allows advancement from ${from} to ${to}`, () => {
        setupPlayerStateAtBoundary(req.crowns + 1, req.cash + 10000, req.clout + 50, req.aura + 50);
        const store = useGameStore.getState();

        const success = store.advanceTier();
        expect(success).toBe(true);
        expect(useGameStore.getState().pendingSpecialization).toBe(true);
      });

      it(`saves and loads state immediately BEFORE transition (${from} → ${to})`, () => {
        setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura);

        // Simulate save
        const savedPlayerState = JSON.stringify(useGameStore.getState().pl);

        // Reset store state
        useGameStore.getState().resetGame('street_kid', 3);

        // Load saved player state
        const loadedPl: PlayerStats = JSON.parse(savedPlayerState);
        useGameStore.getState().updatePl(loadedPl);
        useGameStore.setState({ isTutorialSkipped: true });

        // Advance tier after load
        const success = useGameStore.getState().advanceTier();
        expect(success).toBe(true);
        expect(useGameStore.getState().pendingSpecialization).toBe(true);
      });

      it(`saves and loads state immediately AFTER transition (${from} → ${to})`, () => {
        setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura);

        const store = useGameStore.getState();
        store.advanceTier();
        store.selectSpecialization('institutional');

        expect(useGameStore.getState().pl.currentTier).toBe(to);

        // Simulate save
        const savedPlayerState = JSON.stringify(useGameStore.getState().pl);

        // Reset store state
        useGameStore.getState().resetGame('street_kid', 3);

        // Load saved player state
        const loadedPl: PlayerStats = JSON.parse(savedPlayerState);
        useGameStore.getState().updatePl(loadedPl);

        expect(useGameStore.getState().pl.currentTier).toBe(to);
      });

      it(`verifies Crowns are NOT consumed during advancement (${from} → ${to})`, () => {
        setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura);

        const initialCrowns = getMasteryCount(useGameStore.getState().pl);
        const initialMasteredList = [...useGameStore.getState().pl.masteredHustles];

        const store = useGameStore.getState();
        store.advanceTier();
        store.selectSpecialization('institutional');

        const postCrowns = getMasteryCount(useGameStore.getState().pl);
        const postMasteredList = useGameStore.getState().pl.masteredHustles;

        expect(postCrowns).toBe(initialCrowns);
        expect(postMasteredList).toEqual(initialMasteredList);
      });

      it(`applies specialization exactly once per transition (${from} → ${to})`, () => {
        setupPlayerStateAtBoundary(req.crowns, req.cash, req.clout, req.aura);

        const store = useGameStore.getState();
        store.advanceTier();
        expect(useGameStore.getState().pendingSpecialization).toBe(true);

        const initialHistoryLength = useGameStore.getState().pl.specializationHistory.length;

        store.selectSpecialization('institutional');

        expect(useGameStore.getState().pendingSpecialization).toBe(false);
        expect(useGameStore.getState().pl.currentTier).toBe(to);
        expect(useGameStore.getState().pl.activeSpecializationId).toBe('institutional');
        expect(useGameStore.getState().pl.specializationHistory.length).toBe(initialHistoryLength + 1);
      });
    });
  });
});
