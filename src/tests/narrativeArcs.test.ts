import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHustleSlice } from '../store/slices/hustleSlice';
import { getInitialStats } from '../store/initialState';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { enforceStatCaps } from '../engine/statEngine';

// Mock confetti and other external calls
vi.mock('../components/effects/Confetti', () => ({
  showConfetti: vi.fn(),
}));

describe('Narrative Arcs Progression', () => {
  let store: any;
  let currentState: any;

  beforeEach(() => {
    // Basic mock of the Zustand store structure
    currentState = {
      pl: enforceStatCaps(getInitialStats(3)),
      ph: 'PLAYING',
      currentMarket: 'NORMAL',
      news: [],
      unlockedLegacyUpgradeIds: [],
      activeTab: 'MUD',
      logEvent: vi.fn(),
      addTickerMessage: vi.fn(),
      unlockAchievement: vi.fn(),
    };

    const set = (fn: any) => {
      const updates = typeof fn === 'function' ? fn(currentState) : fn;
      Object.assign(currentState, updates);
      // Synchronize the store object with the updated state
      Object.assign(store, currentState);
    };
    const get = () => currentState;

    store = createHustleSlice(set, get, {} as any);
    Object.assign(store, currentState);
  });

  it('should progress through the Business Empire arc and update biography', () => {
    // 1. Accept Architect investment (Chapter 1)
    store.pl.activeNarrative = 'investor_chain_1';
    store.resolveNarrativeEvent('accept_architect');
    expect(store.pl.narrativeFlags.architect_investment).toBe(true);
    expect(store.pl.narrativeFlags.architect_debt).toBe(true);
    expect(store.pl.completedNarrativeEvents).toContain('investor_chain_1');

    // 2. Refuse Architect demand (Chapter 2)
    store.pl.activeNarrative = 'investor_chain_2';
    store.resolveNarrativeEvent('refuse_architect');
    expect(store.pl.narrativeFlags.architect_hostile).toBe(true);
    expect(store.pl.completedNarrativeEvents).toContain('investor_chain_2');

    // 3. Kane's Intervention (Chapter 4 - New)
    store.pl.activeNarrative = 'investor_chain_4';
    store.resolveNarrativeEvent('kane_alliance');
    expect(store.pl.narrativeFlags.kane_ally).toBe(true);
    expect(store.pl.narrativeFlags.architect_defeated).toBe(true);
    expect(store.pl.biography).toContain('Formed a strategic alliance with Victor Kane to dismantle The Architect\'s network.');

    // 4. Final choice (Chapter 6)
    store.pl.activeNarrative = 'investor_chain_6';
    store.resolveNarrativeEvent('philanthropic_legacy');
    expect(store.pl.narrativeFlags.business_arc_complete).toBe('philanthropy');
    expect(store.pl.biography).toContain('Transformed a business empire into a global force for humanitarian progress.');
  });

  it('should handle specialization requirements in narrative choices', () => {
    store.pl.activeSpecializationId = 'institutional';
    store.pl.activeNarrative = 'investor_chain_6';

    // Check if Monopoly choice is available via its requirement
    const event = NARRATIVE_EVENTS.find(e => e.id === 'investor_chain_6');
    const monopolyChoice = event?.choices.find(c => c.id === 'monopolize_market');

    expect(monopolyChoice?.requirement?.specialization).toContain('institutional');

    // Resolve it
    store.resolveNarrativeEvent('monopolize_market');
    expect(store.pl.narrativeFlags.business_arc_complete).toBe('monopoly');
    expect(store.pl.biography).toContain('Established a global monopoly, becoming the undisputed ruler of the markets.');
  });

  it('should progress through the Family arc with rival interference', () => {
    // 1. Fund the Center (Chapter 1)
    store.pl.activeNarrative = 'char_maya_1';
    store.resolveNarrativeEvent('maya_fund_center');
    expect(store.pl.narrativeFlags.community_hero).toBe(true);

    // 2. Defend against Chadwick (Chapter 2 - New)
    store.pl.activeNarrative = 'char_maya_2';
    store.resolveNarrativeEvent('maya_defend_center');
    expect(store.pl.narrativeFlags.chadwick_hostile).toBe(true);
    expect(store.pl.biography).toContain('Successfully defended the community center against Chadwick Holdings\' predatory development plans.');

    // 3. Legacy Conflict (Chapter 4)
    store.pl.activeNarrative = 'char_maya_4';
    store.resolveNarrativeEvent('maya_reform');
    expect(store.pl.narrativeFlags.maya_reformed).toBe(true);
  });

  it('should progress through the Crime arc and integrate Detective Cole', () => {
    // 1. Join Syndicate (Chapter 1)
    store.pl.activeNarrative = 'syndicate_chain_1';
    store.resolveNarrativeEvent('join_syndicate');
    expect(store.pl.narrativeFlags.syndicate_member).toBe(true);

    // 2. Become Informant for Cole (Chapter 3 - New)
    store.pl.activeNarrative = 'syndicate_chain_3';
    store.resolveNarrativeEvent('syndicate_informant');
    expect(store.pl.narrativeFlags.syndicate_informant).toBe(true);
    expect(store.pl.narrativeFlags.rel_cole).toBe(50);
    expect(store.pl.biography).toContain('Began working as a confidential informant for Detective Silas Cole against the Whispering Hand.');

    // 3. Final move (Chapter 6)
    store.pl.activeNarrative = 'syndicate_chain_6';
    store.resolveNarrativeEvent('syndicate_states_witness');
    expect(store.pl.narrativeFlags.crime_arc_complete).toBe('witness');
    expect(store.pl.narrativeFlags.rel_cole).toBe(100);
  });
});
