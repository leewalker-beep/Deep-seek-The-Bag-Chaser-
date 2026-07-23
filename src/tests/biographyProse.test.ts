import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { compileBiographyChapters } from '../utils/biographyCompiler';
import * as Bio from '../engine/biographyEngine';

describe('New Dynamic Chapter-Based Biography & Prose', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('should compile biography entries into appropriate unlocked chapters', () => {
    const store = useGameStore.getState();

    // 1. Initially on reset, we have origin recorded which unlocks 'Humble Beginnings'
    let chapters = compileBiographyChapters(store.pl);
    expect(chapters.some(c => c.id === 'beginnings' && c.isUnlocked)).toBe(true);

    // 2. Add some business and mastery entries to unlock subsequent chapters
    const plWithSuccess = {
      ...store.pl,
      biography: [
        ...store.pl.biography,
        "Built the first Vending Machine at age 18. What once began as a modest grind now marked the definitive beginning of a new chapter where income would increasingly come from ownership rather than raw labour.",
        "Reached absolute mastery in content creation. In a stunning demonstration of dedication, Marcus rose to dominate this sector entirely."
      ]
    };

    chapters = compileBiographyChapters(plWithSuccess);

    const firstSuccessChapter = chapters.find(c => c.id === 'first_success');
    const recognitionChapter = chapters.find(c => c.id === 'public_recognition');

    expect(firstSuccessChapter?.isUnlocked).toBe(true);
    expect(firstSuccessChapter?.entries.length).toBeGreaterThan(0);

    expect(recognitionChapter?.isUnlocked).toBe(true);
    expect(recognitionChapter?.entries.length).toBeGreaterThan(0);
  });

  it('should dynamically inject personalized context and playstyle descriptors in chapter intros', () => {
    const store = useGameStore.getState();

    // Mock an active reputation of 'The Philanthropist' with high aura and low heat
    useGameStore.setState({
      pl: {
        ...store.pl,
        name: 'Sovereign Arthur',
        aura: 95,
        heat: 5,
        categoryId: 'street_kid',
        variationId: 'sk_scrap',
        narrativeFlags: {
          ...store.pl.narrativeFlags,
          publicReputation: 'The Philanthropist'
        }
      }
    });

    const state = useGameStore.getState();
    const chapters = compileBiographyChapters(state.pl);

    const beginningsChapter = chapters.find(c => c.id === 'beginnings');
    expect(beginningsChapter?.intro).toContain('Sovereign Arthur');
    expect(beginningsChapter?.intro).toContain('principled and altruistic'); // Match the philanthropist adjective
  });

  it('should inject correct context for calculated playstyles (COBALT / calculated)', () => {
    const store = useGameStore.getState();

    // Setup Cobalt/calculated playstyle: low heat, Deliberate pace
    useGameStore.setState({
      pl: {
        ...store.pl,
        name: 'Mastermind Elon',
        aura: 50,
        heat: 20,
        actionLog: [
          { id: '1', timestamp: 1000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 20000, month: 2, tier: 'MUD', hustleId: 'r_vending', hustleName: 'Buy Vending Machine', level: 1, branchId: 'vending', branchName: 'Buy Vending Machine', cost: 2000, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: -2000, success: true }
        ],
        narrativeFlags: {
          ...store.pl.narrativeFlags,
          publicReputation: 'The Investor'
        }
      }
    });

    const state = useGameStore.getState();
    const chapters = compileBiographyChapters(state.pl);

    const beginningsChapter = chapters.find(c => c.id === 'beginnings');
    expect(beginningsChapter?.intro).toContain('Mastermind Elon');
    expect(beginningsChapter?.intro).toContain('highly analytical and patient');
  });

  it('should preserve save compatibility for legacy or old raw biography arrays', () => {
    const store = useGameStore.getState();

    // Simulating a save file with old bullet-point strings
    const legacySavePl = {
      ...store.pl,
      biography: [
        "Started life in the MUD tier as a Scrap Collector.",
        "Built first property.",
        "Defeated Test Rival."
      ]
    };

    const chapters = compileBiographyChapters(legacySavePl);

    // Ensure all 3 entries are correctly categorized without crashing or losing data
    const beginnings = chapters.find(c => c.id === 'beginnings');
    const endings = chapters.find(c => c.id === 'legacy');
    const firstSuccess = chapters.find(c => c.id === 'first_success');
    const empire = chapters.find(c => c.id === 'building_empire');

    const totalAssignedEntries = chapters.reduce((sum, ch) => sum + ch.entries.length, 0);
    expect(totalAssignedEntries).toBe(3);
  });
});
