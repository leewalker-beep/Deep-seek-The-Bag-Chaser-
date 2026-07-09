
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Final Audit: Store-Level Verification', () => {

  beforeEach(() => {
    // Initialize standard mocks
    if (typeof (global as any).localStorage === 'undefined') {
        (global as any).localStorage = {
            setItem: () => {},
            getItem: () => null,
            removeItem: () => {},
            clear: () => {}
        };
    }

    const { resetGame } = useGameStore.getState();
    resetGame('sk_ghost', 3);

    // Force set a clean state for every test to prevent cross-contamination
    useGameStore.setState({
      ph: 'PLAYING',
      isTutorialSkipped: true,
      currentMarket: 'NORMAL',
      dailyChallenges: [],
      achievements: useGameStore.getState().achievements.map(a => ({ ...a, isUnlocked: true })), // Mock all as unlocked to prevent rewards
      pl: {
        ...useGameStore.getState().pl,
        bag: 1000,
        clout: 100,
        aura: 100,
        mentalHealth: 100,
        heat: 0,
        events: [],
        masteredHustles: [],
        tierBadges: [],
        flexAssets: {},
        vendingCount: 0,
        hustleBranchIds: {},
        hustleLevels: {},
        artists: [],
        dynamicPassives: {},
        rentalCount: 0,
        rentPortfolioCount: 0,
        flipCount: 0,
        activeChallenges: [],
        legacyPoints: 0,
        currentTier: 'MUD',
        congressSupport: 100,
        approvalFloor: 0,
        scandalRiskBonus: 0,
        pendingPresidentialImpacts: [],
        activeCrises: [],
        presidentialDiary: [],
        month: 0,
        presidentMonth: 0,
        federalBudget: 0,
        unlockedAchievements: [],
        collectedDeathBadges: [],
        loginStreak: 0,
        totalChallengesCompleted: 0
      }
    });
  });

  it('Hustle Execution Audit (Points 1-5, 12)', () => {
    const { executeHustle } = useGameStore.getState();

    // Mock random to avoid rival interference
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // Execute r_labor (Manual Labor)
    // Math: yieldCash: 2000, yieldClout: 2, yieldAura: 2, mentalHit: -8 (x1.5 = -12), heatHit: 5
    // Street Kid Origin Bonus: +15% Cash (multiplier 1.15)
    // advanceMonth: Rent -50 (MUD tier), heatDecay -10
    const res = executeHustle('r_labor', 1, true);

    const finalStats = useGameStore.getState().pl;
    const event = finalStats.events.find(e => e.type === 'HUSTLE_COMPLETED');

    expect(res.success).toBe(true);

    // 1. Bag Change: 1000 + (2000 * 1.15) - 50 = 1000 + 2300 - 50 = 3250
    expect(finalStats.bag).toBe(3250);

    // 2-3. Clout/Aura: 100 + 2 = 102
    expect(finalStats.clout).toBe(102);
    expect(finalStats.aura).toBe(102);

    // 4. Mental: 100 - 12 = 88
    expect(finalStats.mentalHealth).toBe(88);

    // 5. Heat: 5 - 10 = 0
    expect(finalStats.heat).toBe(0);

    // 12. Receipts vs Reality
    expect(event!.metadata.profit).toBe(2300); // 2000 * 1.15
    expect(event!.metadata.yieldClout).toBe(2);

    vi.restoreAllMocks();
  });

  it('Upgrades Audit (Point 9)', () => {
    const { upgradeHustle } = useGameStore.getState();

    // Set enough stats for upgrade
    useGameStore.setState(s => ({
      pl: { ...s.pl, bag: 100000, clout: 200, aura: 200, currentTier: 'MUD', events: [] }
    }));

    // Upgrade r_labor to House Flip (l2a). Base cost 5000.
    const success = upgradeHustle('r_labor', 'l2a');
    expect(success).toBe(true);

    const finalStats = useGameStore.getState().pl;
    // Upgrade logs event via logEvent('HUSTLE_COMPLETED', ...)
    const event = finalStats.events[0];

    // Point 9: Is cost deducted correctly?
    // finalStats.bag should be 100000 - 5000 = 95000.
    expect(finalStats.bag).toBe(95000);
    expect(event.metadata.profit).toBe(-5000);
  });

  it('Tier Advancement Audit (Point 8)', () => {
    const { advanceTier, selectSpecialization } = useGameStore.getState();

    // STREET Req: cash 50k, clout 100, aura 100, fee 20k
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'MUD' as const,
        bag: 70000, // 50k + 20k fee
        clout: 100,
        aura: 100,
        unlockedAchievements: [],
        loginStreak: 0,
        events: []
      }
    }));

    // Step 1: Meet requirements and trigger advancement flow
    const success = advanceTier();
    expect(success).toBe(true);

    // Tier shouldn't change yet until specialization is chosen
    let stats = useGameStore.getState().pl;
    expect(stats.currentTier).toBe('MUD');
    expect(useGameStore.getState().pendingSpecialization).toBe(true);

    // Step 2: Select specialization (Institutionalist: 70% retention, 20% fee reduction)
    // Fee reduction: 20k * 0.8 = 16k fee.
    // Remaining bag: 70k - 16k = 54k.
    selectSpecialization('institutional');

    const finalStats = useGameStore.getState().pl;
    expect(finalStats.currentTier).toBe('STREET');
    // Point 8: Fees deducted (with mitigation)
    expect(finalStats.bag).toBe(54000);
    // Point 8: Stat retention (70% of 100 = 70)
    expect(finalStats.clout).toBe(70);
    expect(finalStats.aura).toBe(70);
  });

  it('Passive Income & Rent Audit (Points 6, 7)', () => {
    useGameStore.setState(s => ({
      currentMarket: 'NORMAL',
      pl: {
        ...s.pl,
        currentTier: 'STREET',
        bag: 100000,
        clout: 500,
        aura: 500,
        vendingCount: 10,
        hustleBranchIds: { 'r_vending': 'vending', 'saas_mvp': 'l1' },
        hustleLevels: { 'r_vending': 1, 'saas_mvp': 1 },
        artists: [],
        masteredHustles: [],
        tierBadges: [],
        flexAssets: {},
        dynamicPassives: {}
      }
    }));

    const initialBag = 100000;
    const { executeHustle } = useGameStore.getState();
    const res = executeHustle('cc', 1, true); // base yield 4000, cost 0

    const finalState = useGameStore.getState().pl;
    // Rent STREET: 1000
    // Passive: Vending(150*10 + 500 bonus) + SaaS(2000) = 4000
    // Net Monthly: +3000
    // finalBag = initialBag + yieldHustle - costHustle + passive - rent
    const netHustle = res.yieldCash - res.cost;
    const netMonthly = 3000;

    expect(finalState.bag).toBe(initialBag + netHustle + netMonthly);
  });

  it('President Tier Audit (Point 11)', () => {
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            currentTier: 'PRESIDENT' as const,
            federalBudget: 100000000,
            gdp: 110,
            inflation: 2,
            clout: 1000,
            aura: 1000,
            congressSupport: 100,
            presidentialDiary: [],
            activeCrises: [],
            pendingPresidentialImpacts: [],
            cabinet: {},
            masteredHustles: [],
            artists: [],
            dynamicPassives: {},
            rentalCount: 0,
            vendingCount: 0,
            unlockedAchievements: [],
            loginStreak: 0
        }
    }));

    const { issueExecutiveOrder, advancePresidentialMonth } = useGameStore.getState();

    // Infrastructure cost: 10M Cash, 100 Clout
    issueExecutiveOrder('infrastructure');

    let state = useGameStore.getState().pl;
    expect(state.federalBudget).toBe(90000000);
    expect(state.clout).toBe(900);

    // Tax revenue advance
    advancePresidentialMonth();
    state = useGameStore.getState().pl;
    // Tax: 10M base + 2M GDP bonus = 12M.
    expect(state.federalBudget).toBe(102000000);
  });

  it('Flex Assets Audit (Point 10)', () => {
    // Force STREET tier so we can execute 'cc'
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            currentTier: 'STREET',
            bag: 1000000,
            clout: 500,
            aura: 500,
            flexAssets: { 'yacht': 1, 'tech_conglomerate': 1 }
        }
    }));

    const { executeHustle } = useGameStore.getState();
    // Yacht gives 5% allGainsBonus. Tech Conglomerate boosts IT (the 5%) by 10% (multiplier 1.1x)
    // bonusScale = count (1) * flexBonusMultiplier (1.1) = 1.1
    // cashBonus = 5 * 1.1 = 5.5%
    // Street Kid Origin Bonus: +15% Cash (multiplier 1.15)

    const res = executeHustle('cc', 1, true);
    // cc base yieldCash = 4000.
    // Applied: 4000 * 1.15 (origin) * 1.055 (flex) = 4853
    expect(res.yieldCash).toBe(4853);
  });
});
