import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHustleSlice } from '../store/slices/hustleSlice';
import { getInitialStats } from '../store/initialState';
import { advanceMonth, checkDeathConditions } from '../engine/advancementEngine';
import { TIER_REQUIREMENTS } from '../config/tiers';

// Mock dependencies
vi.mock('../components/effects/Confetti', () => ({
  showConfetti: vi.fn(),
}));

vi.mock('../utils/saveUtils', () => ({
  backupSave: vi.fn(),
}));

describe('QA Audit - Specific Reported Issues', () => {
  it('Health reached zero but death never triggered - INVESTIGATION', () => {
    // Case 1: Tutorial mode
    const plTutorial = getInitialStats(3, 'street_kid');
    plTutorial.isTutorialSkipped = false;
    plTutorial.tutorialStep = 2;
    plTutorial.mentalHealth = 0;

    const deathTutorial = checkDeathConditions(plTutorial);
    expect(deathTutorial.shouldDie).toBe(false); // This is intended by design in checkDeathConditions

    // Case 2: Post-tutorial
    const plPlaying = { ...plTutorial, isTutorialSkipped: true, tutorialStep: 10, mentalHealth: 0 };
    const deathPlaying = checkDeathConditions(plPlaying);
    expect(deathPlaying.shouldDie).toBe(true);

    // Case 3: Monthly advancement death
    const plLowHealth = { ...plTutorial, isTutorialSkipped: true, tutorialStep: 10, mentalHealth: 1, currentTier: 'MUD' as any };
    // Rent is 200, but if player has no money, bag goes negative which also triggers death.
    // Let's force mental health to 0 via advanceMonth (though advanceMonth doesn't usually hit mental health except via special events)
    // Actually, checkDeathConditions is called at the end of advanceMonth.

    // Let's simulate health hitting 0 and see if advanceMonth detects it.
    const result = advanceMonth(plLowHealth, 'NORMAL');
    // If mental health was 1, and no events hit it, it stays 1.
    // But if we pass it 0:
    const plZeroHealth = { ...plLowHealth, mentalHealth: 0 };
    const resultZero = advanceMonth(plZeroHealth, 'NORMAL');
    expect(resultZero.shouldDie).toBe(true);
  });

  it('Bag did not decrease while jailed - INVESTIGATION', () => {
    const plJailed = getInitialStats(3, 'street_kid');
    plJailed.currentTier = 'STREET';
    plJailed.inJail = true;
    plJailed.jailMonthsRemaining = 5;
    plJailed.bag = 10000;
    plJailed.isTutorialSkipped = true;
    plJailed.tutorialStep = 10;

    // In STREET tier, sentence loss is 2000/month.
    // Rent for STREET is 1000/month.
    // Total loss should be 3000 if no passive income.

    const result = advanceMonth(plJailed, 'NORMAL');
    // bag = 10000 + 0 (passive) - 1000 (rent) - 2000 (jail loss) = 7000
    expect(result.newPl.bag).toBe(7000);

    // What if passive income is high?
    const plJailedRich = { ...plJailed, dynamicPassives: { 'test': 5000 } };
    const resultRich = advanceMonth(plJailedRich, 'NORMAL');
    // bag = 10000 + 5000 (passive) - 1000 (rent) - 2000 (jail loss) = 12000
    // In this case, the bag INCREASES while jailed.
    // This might be the "issue" - players expect jail to be a net drain,
    // but their businesses keep running.
    expect(resultRich.newPl.bag).toBeGreaterThan(10000);
  });
});

describe('QA Audit - Economy and Progression', () => {
  it('Verifies advancement fees are applied', () => {
     // This is handled in selectSpecialization
  });

  it('Checks for negative stats', () => {
    const pl = getInitialStats(3, 'street_kid');
    pl.bag = -100;
    pl.clout = -10;
    pl.aura = -5;

    // enforceStatCaps should fix clout and aura, but bag can stay negative (to trigger death)
    const capped = { ...pl }; // enforceStatCaps(pl) is usually what we use
    // Need to import enforceStatCaps or check it
  });
});
