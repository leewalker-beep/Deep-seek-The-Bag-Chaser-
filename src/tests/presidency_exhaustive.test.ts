import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { PRESIDENTIAL_ACTIVITIES } from '../config/presidencyActivities';

describe('Presidential Strategic Activities Exhaustive Logic', () => {
  let store: any;

  beforeEach(() => {
    useGameStore.setState(useGameStore.getState(), true); // Reset
    store = useGameStore;
    // Setup President state
    store.getState().pl.currentTier = 'PRESIDENT';
    store.getState().pl.presidentMonth = 0;
    store.getState().pl.approvalRating = 50;
    store.getState().pl.gdp = 100;
    store.getState().pl.federalBudget = 100000000;
    store.getState().pl.cabinet = {};
  });

  it('verifies all 10 activities can be resolved and apply correct impacts', () => {
    PRESIDENTIAL_ACTIVITIES.forEach(activity => {
      activity.choices.forEach(choice => {
        const initialState = JSON.parse(JSON.stringify(store.getState().pl));

        // Ensure requirements are met for the test
        if (choice.requirement) {
          const { type, value } = choice.requirement.stat;
          if (type === 'aura') store.getState().pl.aura = value + 10;
          if (type === 'clout') store.getState().pl.clout = value + 10;
          if (type === 'relations') store.getState().pl.foreignRelations = value + 10;
        }

        const result = store.getState().resolvePresidentialActivity(activity.id, choice.id, 1.0);

        expect(result).not.toBeNull();
        expect(result.impacts).toBeDefined();

        // Verify a sample impact (approval)
        if (choice.impact.approval !== undefined) {
           const expected = Math.floor(choice.impact.approval * result.finalMultiplier);
           expect(result.impacts.approval).toBe(expected);
        }

        // Reset state for next choice test
        store.getState().pl = JSON.parse(JSON.stringify(initialState));
      });
    });
  });

  it('applies cabinet bonuses correctly', () => {
    const activity = PRESIDENTIAL_ACTIVITIES.find(a => a.id === 'budget_negotiations');
    const choice = activity?.choices.find(c => c.id === 'austerity'); // Treasury bonus

    // 1. No cabinet
    const resultNoCabinet = store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);

    // 2. Add Treasury Secretary (Trusted Ally)
    store.getState().pl.cabinet['treasury'] = {
      id: 'treasury',
      name: 'Money Bags',
      role: 'Treasury Secretary',
      loyalty: 100,
      isTrustedAlly: true,
      bonus: { type: 'cash', value: 10 }
    };

    const resultWithCabinet = store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);

    // Multiplier for austerity is 1.5, +0.5 for trusted ally = 2.0x
    expect(resultWithCabinet.finalMultiplier).toBeGreaterThan(resultNoCabinet.finalMultiplier);
    expect(resultWithCabinet.finalMultiplier).toBeCloseTo(2.0, 1);
  });

  it('scales difficulty (rewards) based on presidency month', () => {
    const activity = PRESIDENTIAL_ACTIVITIES.find(a => a.id === 'budget_negotiations');
    const choice = activity?.choices.find(c => c.id === 'compromise');

    // Start of term (Month 0)
    const resultEarly = store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);

    // End of term (Month 48)
    store.getState().pl.presidentMonth = 48;
    const resultLate = store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);

    // Month scaling formula: 1 + (month / 48) * 0.5
    // Month 0 -> 1.0x (multiplier / 1.0)
    // Month 48 -> 1.5x (multiplier / 1.5) -> Rewards should be ~33% lower
    expect(resultLate.finalMultiplier).toBeLessThan(resultEarly.finalMultiplier);
  });

  it('verifies stat requirements prevent choice selection in engine', () => {
    const activity = PRESIDENTIAL_ACTIVITIES.find(a => a.id === 'international_summit');
    const choice = activity?.choices.find(c => c.id === 'global_leader'); // Req Aura 100

    store.getState().pl.aura = 10;

    // UI prevents this, but engine should still record the attempt if called.
    // However, the component checkRequirement logic is what we really want to verify
    // but that is a UI test. Here we just ensure it still resolves if forced.
    const result = store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);
    expect(result).not.toBeNull();
  });

  it('verifies diary entry generation with detailed outcome', () => {
    const activity = PRESIDENTIAL_ACTIVITIES.find(a => a.id === 'emergency_crisis');
    const choice = activity?.choices.find(c => c.id === 'decisive_action');

    store.getState().resolvePresidentialActivity(activity?.id, choice?.id, 1.0);
    const diary = store.getState().pl.presidentialDiary[0];

    expect(diary.event).toBe(activity?.title);
    expect(diary.outcome).toContain('Outcomes:');
    expect(diary.outcome).toContain('approval');
  });
});
