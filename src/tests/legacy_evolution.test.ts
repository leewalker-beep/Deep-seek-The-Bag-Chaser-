import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getInitialStats } from '../store/initialState';
import { LEGACY_UPGRADES } from '../config/legacyUpgrades';

// Mocking useGameStore.getState() is tricky with Zustand,
// but we can just use the store directly and reset it.

describe('Legacy Evolution System', () => {
  beforeEach(() => {
    useGameStore.setState({
      bankedLegacyPoints: 0,
      unlockedLegacyUpgradeIds: [],
      ph: 'PROLOGUE'
    });
  });

  it('allows banking points upon game over', () => {
    const { executeHustle } = useGameStore.getState();

    // Simulate some legacy score
    useGameStore.setState({
        pl: {
            ...useGameStore.getState().pl,
            legacyScore: 1000
        }
    });

    // We need to trigger a death. Low mental health is easiest.
    useGameStore.setState({
        pl: {
            ...useGameStore.getState().pl,
            mentalHealth: 1,
            isTutorialSkipped: true,
            tutorialStep: 10
        }
    });

    // Execute a hustle that hits mental health
    // r_plasma hits -10 mental
    executeHustle('r_plasma');

    expect(useGameStore.getState().ph).toBe('POST_MORTEM');
    expect(useGameStore.getState().bankedLegacyPoints).toBeGreaterThan(0);
  });

  it('allows purchasing upgrades from the shop', () => {
    useGameStore.setState({ bankedLegacyPoints: 10000 });

    const { unlockLegacyUpgrade } = useGameStore.getState();
    const upgrade = LEGACY_UPGRADES[0]; // Silver Spoon, 2500 points

    unlockLegacyUpgrade(upgrade.id);

    expect(useGameStore.getState().unlockedLegacyUpgradeIds).toContain(upgrade.id);
    expect(useGameStore.getState().bankedLegacyPoints).toBe(7500);
  });

  it('applies purchased upgrades to new runs', () => {
    const upgrades = ['extra_cash', 'extra_clout', 'early_vending'];
    useGameStore.setState({
        unlockedLegacyUpgradeIds: upgrades
    });

    // In actual game, resetGame passes these from state
    const stats = getInitialStats(3, undefined, undefined, undefined, upgrades);

    // Default Grinder: bag 1000, clout 5, aura 5
    // Silver Spoon: +5000 bag
    // Street Cred: +50 clout
    // Vending Legacy: +1 vending machine

    expect(stats.bag).toBe(6000);
    expect(stats.clout).toBe(55);
    expect(stats.vendingCount).toBe(1);
  });

  it('prevents purchasing if insufficient points', () => {
    useGameStore.setState({ bankedLegacyPoints: 100 });

    const { unlockLegacyUpgrade } = useGameStore.getState();
    const upgrade = LEGACY_UPGRADES[0]; // 2500 points

    unlockLegacyUpgrade(upgrade.id);

    expect(useGameStore.getState().unlockedLegacyUpgradeIds).not.toContain(upgrade.id);
    expect(useGameStore.getState().bankedLegacyPoints).toBe(100);
  });
});
