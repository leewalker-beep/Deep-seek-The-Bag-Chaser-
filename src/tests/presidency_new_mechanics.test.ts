
import { describe, it, expect, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('Presidency New Mechanics', () => {
  it('verifies Federal Budget, Macro-stats, and Midterm Elections', () => {
    const store = useGameStore;

    // Setup President State
    store.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 100000000, // 100M personal
        federalBudget: 50000000, // 50M federal
        clout: 2000,
        aura: 2000,
        currentTier: 'PRESIDENT',
        approvalRating: 50,
        gdp: 100,
        inflation: 2,
        nationalDebt: 60,
        congressSupport: 50,
        presidentMonth: 0,
        activeCrises: [],
        presidentialDiary: [],
      },
      ph: 'PLAYING',
      activeTab: 'PRESIDENCY'
    }));

    const getState = () => store.getState();

    // 1. Test Federal Budget vs Personal Bag
    // Infrastructure Bill costs 10M cash
    getState().issueExecutiveOrder('infrastructure');
    expect(getState().pl.federalBudget).toBe(40000000);
    expect(getState().pl.bag).toBe(100000000); // Personal bag should not change

    // 2. Test Invest Personal Funds
    getState().investPersonalFunds(50000000);
    expect(getState().pl.bag).toBe(50000000);
    expect(getState().pl.federalBudget).toBe(90000000);

    // 3. Test Clout Cost Scaling
    // Initial Congress Support is 50. Clout cost multiplier = 1 + (100-50)/100 = 1.5
    // Tax Cut base clout cost is 50. Scaled should be 75.
    const cloutBefore = getState().pl.clout;
    getState().issueExecutiveOrder('tax_cut');
    expect(cloutBefore - getState().pl.clout).toBe(75);

    // 4. Test Macro-stat updates
    // Infrastructure bill added +10 GDP, +0.5 Inflation, +5 Debt
    // Tax cut added +5 GDP, +1 Inflation, +2 Debt
    expect(getState().pl.gdp).toBe(115);
    expect(getState().pl.inflation).toBe(3.5);
    expect(getState().pl.nationalDebt).toBe(67);

    // 5. Test Midterm Elections (Month 24)
    // Fast forward to month 23
    store.setState((state) => ({ pl: { ...state.pl, presidentMonth: 23, approvalRating: 65 } }));
    getState().advancePresidentialMonth(); // Now month 24
    expect(getState().pl.congressSupport).toBe(70); // High approval midterm
    expect(getState().pl.presidentialDiary[0].event).toBe('MIDTERM ELECTIONS');

    // 6. Test Inflation Feedback Loop
    // Set inflation > 5
    store.setState((state) => ({ pl: { ...state.pl, inflation: 6, approvalRating: 50 } }));
    getState().advancePresidentialMonth();
    expect(getState().pl.approvalRating).toBeLessThan(50); // Should have hit -2 approval decay

    // 7. Test GDP Tax Penalty
    // Set GDP < 80
    store.setState((state) => ({ pl: { ...state.pl, gdp: 70 } }));
    const approvalBeforeTax = getState().pl.approvalRating;
    getState().issueExecutiveOrder('tax_cut');
    // Tax cut base approval is 10. With 50% penalty it should be 5.
    expect(getState().pl.approvalRating - approvalBeforeTax).toBe(5);
  });
});
