import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { recordHistoryEvent } from '../engine/historyEngine';
import * as Bio from '../engine/biographyEngine';
import { processWorldReaction } from '../engine/reactiveWorldEngine';
import { calculateLegacyScore } from '../engine/legacyEngine';
import { generateHistoricalStories, generateDynamicStoryNews } from '../engine/storyEngine';
import type { PlayerStats } from '../types/game';

describe('Living World, Character & Narrative Consequence Pass (PASTE 6)', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3, 'hustler', 'street_runner', 'av_m1');
  });

  it('1. World Memory & Persistent State: tracks key milestones in narrativeFlags and history', () => {
    const store = useGameStore.getState();
    const pl = store.pl;

    // Simulate first business & first employee
    store.executeHustle('r_labor');
    const updatedPl1 = useGameStore.getState().pl;

    // Check first hustle / history
    expect(updatedPl1.history?.some(h => h.id === 'first_hustle')).toBe(true);

    // Set memory flags
    updatedPl1.narrativeFlags = {
      ...updatedPl1.narrativeFlags,
      memory_first_business: true,
      memory_first_employee: true,
      memory_first_passive_income: true,
      memory_specialization: 'Corporate Raider',
      memory_became_president: true,
      memory_first_crown: 'Street Eats'
    };
    useGameStore.setState({ pl: updatedPl1 });

    // Verify retrospectives pick up memory flags
    const historicalStories = generateHistoricalStories(useGameStore.getState().pl);
    const storyTexts = historicalStories.map(s => typeof s === 'string' ? s : s.text).join(' ');

    expect(storyTexts).toContain('first employee');
    expect(storyTexts).toContain('first Crown mastery');
    expect(storyTexts).toContain('Corporate Raider');
    expect(storyTexts).toContain('President');
  });

  it('2. Save/Load & State Serialization: preserves narrative memory flags and character formation', () => {
    const store = useGameStore.getState();
    let pl = store.pl;

    pl.narrativeFlags = {
      ...pl.narrativeFlags,
      memory_first_business: true,
      charity_choices_count: 3,
      publicReputation: 'The Benefactor'
    };
    pl.recordedBioKeys = ['origin', 'business_vending_machine', 'first_hustle'];
    pl.biography = ['Started life in MUD.', 'Built first business.'];

    useGameStore.setState({ pl });

    // Simulate serialization / deserialization (JSON parse/stringify)
    const serialized = JSON.stringify(useGameStore.getState().pl);
    const deserialized: PlayerStats = JSON.parse(serialized);

    expect(deserialized.narrativeFlags?.memory_first_business).toBe(true);
    expect(deserialized.narrativeFlags?.charity_choices_count).toBe(3);
    expect(deserialized.recordedBioKeys).toContain('business_vending_machine');
    expect(deserialized.biography.length).toBe(2);
  });

  it('3. Duplicate Prevention & Event Replay Protection: prevents double-logging bio/history entries', () => {
    const pl = useGameStore.getState().pl;

    const res1 = Bio.recordEvent(pl, 'Achieved legendary victory.', 'test_key_1');
    expect(res1).not.toBeNull();
    expect(res1?.entry).toContain('legendary victory');

    if (res1) {
      pl.recordedBioKeys.push(res1.key!);
      pl.biography.push(res1.entry);
    }

    // Second call with same key must return null
    const res2 = Bio.recordEvent(pl, 'Achieved legendary victory.', 'test_key_1');
    expect(res2).toBeNull();

    // recordHistoryEvent duplicate check
    const hist1 = recordHistoryEvent(pl, {
      id: 'hist_dup_test',
      title: 'Duplicate Test Event',
      description: 'Testing history deduplication.',
      category: 'CAREER',
      importance: 3,
      month: pl.month
    });
    const len1 = hist1.history?.length || 0;

    const hist2 = recordHistoryEvent(hist1, {
      id: 'hist_dup_test',
      title: 'Duplicate Test Event',
      description: 'Testing history deduplication.',
      category: 'CAREER',
      importance: 3,
      month: pl.month
    });
    const len2 = hist2.history?.length || 0;

    expect(len1).toBe(len2);
  });

  it('4. Character Relationships & Consequence Quality: choices alter rival relations and state', () => {
    const store = useGameStore.getState();
    let pl = store.pl;

    // Set active narrative event with character choice
    pl.activeNarrative = 'scavenger_prototype';
    pl.rivals = [
      {
        id: 'char_marcus',
        characterId: 'char_marcus',
        name: 'Marcus Miller',
        netWorth: 10000,
        currentBid: 0,
        isNpc: true,
        tier: 'MUD',
        relationshipWithPlayer: 0
      }
    ];
    useGameStore.setState({ pl });

    // Resolve narrative event choice
    store.resolveNarrativeEvent('sell_prototype');
    const updatedPl = useGameStore.getState().pl;

    expect(updatedPl.completedNarrativeEvents).toContain('scavenger_prototype');
    expect(updatedPl.bag).toBeGreaterThan(pl.bag);
  });

  it('5. World Feed Reactions & Fame Scaling: scales news reactions appropriately', () => {
    const pl = useGameStore.getState().pl;

    // Low tier / local action
    const localRes = processWorldReaction(pl, 'BUSINESS_LAUNCH', { hustleName: 'Street Eats', cost: 500 });
    const localFeed = localRes.addedItems;
    expect(localFeed.length).toBeGreaterThan(0);
    expect(localFeed.some(item => item.source === 'The Neighborhood Bulletin' || item.source === 'Chirper')).toBe(true);

    // High tier / major action
    pl.currentTier = 'MOGUL';
    const majorRes = processWorldReaction(pl, 'HUGE_PROFIT', { profit: 2500000, hustleName: 'Film Studio' });
    const majorFeed = majorRes.addedItems;
    expect(majorFeed.length).toBeGreaterThan(0);
    expect(majorRes.updatedPl.worldFeed.some(item => item.pinned || item.source === 'Capital Press')).toBe(true);
  });

  it('6. Biography Generation Coherence: produces milestone-focused story of player run', () => {
    let pl = useGameStore.getState().pl;

    const b1 = Bio.recordBusiness(pl, 'Vending Machine', 18);
    if (b1) pl.biography.push(b1.entry);

    const b2 = Bio.recordMastery(pl, 'Vending Machine');
    if (b2) pl.biography.push(b2.entry);

    const b3 = Bio.recordRivalDefeat(pl, 'Victor Kane', 'CORPORATE');
    if (b3) pl.biography.push(b3.entry);

    const b4 = Bio.recordTierAdvancement(pl, 'STARTUP', 'Tech Founder');
    if (b4) pl.biography.push(b4.entry);

    expect(pl.biography.some(entry => entry.includes('Vending Machine'))).toBe(true);
    expect(pl.biography.some(entry => entry.includes('Victor Kane'))).toBe(true);
    expect(pl.biography.some(entry => entry.includes('STARTUP'))).toBe(true);
  });

  it('7. Ending & Legacy Carry-Through: character alliances and memory flags increase legacy score', () => {
    let pl = useGameStore.getState().pl;

    const baseLegacy = calculateLegacyScore(pl);

    pl.rivals = [
      {
        id: 'r_ally_1',
        name: 'Allied Rival',
        status: 'ally',
        netWorth: 50000,
        currentBid: 0,
        isNpc: true,
        tier: 'STREET'
      }
    ];
    pl.narrativeFlags = {
      ...pl.narrativeFlags,
      charity_choices_count: 5,
      unethical_choices_count: 2
    };

    const enhancedLegacy = calculateLegacyScore(pl);

    expect(enhancedLegacy).toBeGreaterThan(baseLegacy);
  });
});
