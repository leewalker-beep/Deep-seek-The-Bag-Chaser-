import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { advanceMonth } from '../engine/advancementEngine';
import {
  calculateMonthlyUpkeep,
  calculateMonthlyDebtService,
  calculateDetailedMonthlyUpkeep
} from '../utils/financialObligationsUtils';

describe('Financial Obligations & Opportunity Cost System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useGameStore.getState().resetGame('sk_scrap');
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        narrativeFlags: {
          ...useGameStore.getState().pl.narrativeFlags,
          upkeep_active: true
        }
      }
    });
  });

  describe('Upkeep Calculations', () => {
    it('should calculate base property upkeep correctly', () => {
      const store = useGameStore.getState();
      const plEmpty = {
        ...store.pl,
        rentalCount: 0,
        rentPortfolioCount: 0,
        hustleLevels: {},
        flexAssets: {},
        narrativeFlags: { upkeep_active: true }
      };

      expect(calculateMonthlyUpkeep(plEmpty)).toBe(0);

      const plProperties = {
        ...plEmpty,
        rentalCount: 4, // 4 * $300 = $1,200
        rentPortfolioCount: 2 // 2 * $1,500 = $3,000
      };

      const breakdown = calculateDetailedMonthlyUpkeep(plProperties);
      expect(breakdown.propertyUpkeep).toBe(4200);
      expect(breakdown.total).toBe(4200);
    });

    it('should calculate business operating upkeeps correctly based on active levels', () => {
      const store = useGameStore.getState();
      const plBusinesses = {
        ...store.pl,
        hustleLevels: {
          r_labor: 2,         // MUD tier = $0
          cc: 3,              // STREET tier = 3 * $100 = $300
          saas_mvp: 2,        // STARTUP tier = 2 * $500 = $1,000
          global_franchise: 1 // CORPORATE tier = 1 * $2,500 = $2,500
        },
        narrativeFlags: { upkeep_active: true }
      };

      const breakdown = calculateDetailedMonthlyUpkeep(plBusinesses);
      expect(breakdown.businessUpkeep).toBe(3800); // 300 + 1000 + 2500
      expect(breakdown.total).toBe(3800);
    });

    it('should calculate luxury lifestyle upkeep for flex assets', () => {
      const store = useGameStore.getState();
      const plLuxury = {
        ...store.pl,
        flexAssets: {
          yacht: 1, // $500,000 cost * 0.5% = $2,500
          penthouse: 2 // $1,000,000 cost * 0.5% = $5,000 * 2 = $10,000
        },
        narrativeFlags: { upkeep_active: true }
      };

      const breakdown = calculateDetailedMonthlyUpkeep(plLuxury);
      expect(breakdown.luxuryUpkeep).toBe(12500); // 2500 + 10000
      expect(breakdown.total).toBe(12500);
    });
  });

  describe('Optional Strategic Debt (Store Actions)', () => {
    it('should allow borrowing Student Loans and verify interest, term and monthly payment', () => {
      const store = useGameStore.getState();

      // Let's ensure they are in a tier that is allowed (MUD allows STUDENT and EMERGENCY)
      useGameStore.setState({
        pl: {
          ...store.pl,
          currentTier: 'MUD',
          bag: 1000,
          financialDebts: [],
          narrativeFlags: { upkeep_active: true }
        }
      });

      const success = useGameStore.getState().takeLoan('STUDENT');
      expect(success).toBe(true);

      const updatedPl = useGameStore.getState().pl;
      expect(updatedPl.bag).toBe(16000); // 1000 original + 15000 principal
      expect(updatedPl.financialDebts?.length).toBe(1);

      const loan = updatedPl.financialDebts![0];
      expect(loan.loanType).toBe('STUDENT');
      expect(loan.principal).toBe(15000);
      expect(loan.remainingTerm).toBe(24);
      // Payment: Math.round(15000 * 1.04 / 24) = Math.round(15600 / 24) = 650
      expect(loan.monthlyPayment).toBe(650);
    });

    it('should enforce career tier gates for high-tier loans', () => {
      const store = useGameStore.getState();
      useGameStore.setState({
        pl: {
          ...store.pl,
          currentTier: 'MUD',
          bag: 1000,
          financialDebts: [],
          narrativeFlags: { upkeep_active: true }
        }
      });

      // BUSINESS loan requires STARTUP tier
      const success = useGameStore.getState().takeLoan('BUSINESS');
      expect(success).toBe(false);
      expect(useGameStore.getState().pl.financialDebts?.length).toBe(0);

      // Advance to STARTUP and retry
      useGameStore.setState({
        pl: {
          ...store.pl,
          currentTier: 'STARTUP',
          bag: 1000,
          financialDebts: [],
          narrativeFlags: { upkeep_active: true }
        }
      });
      const success2 = useGameStore.getState().takeLoan('BUSINESS');
      expect(success2).toBe(true);
      expect(useGameStore.getState().pl.financialDebts?.length).toBe(1);
    });

    it('should enforce the maximum limit of 3 concurrent active loans', () => {
      const store = useGameStore.getState();
      useGameStore.setState({
        pl: {
          ...store.pl,
          currentTier: 'CORPORATE',
          bag: 1000000,
          financialDebts: [],
          narrativeFlags: { upkeep_active: true }
        }
      });

      expect(useGameStore.getState().takeLoan('STUDENT')).toBe(true);
      expect(useGameStore.getState().takeLoan('EMERGENCY')).toBe(true);
      expect(useGameStore.getState().takeLoan('EQUIPMENT')).toBe(true);

      // 4th loan should be denied due to debt ceiling
      expect(useGameStore.getState().takeLoan('BUSINESS')).toBe(false);
      expect(useGameStore.getState().pl.financialDebts?.length).toBe(3);
    });

    it('should process early repayment of loans and retire the liability completely', () => {
      const store = useGameStore.getState();
      useGameStore.setState({
        pl: {
          ...store.pl,
          currentTier: 'MUD',
          bag: 5000,
          financialDebts: [],
          narrativeFlags: { upkeep_active: true }
        }
      });

      useGameStore.getState().takeLoan('STUDENT'); // adds $15k principal, bag is now 20000
      const debts = useGameStore.getState().pl.financialDebts!;
      expect(debts.length).toBe(1);

      const loan = debts[0];
      const payoffCost = loan.monthlyPayment * loan.remainingTerm; // 650 * 24 = 15600

      // Try with insufficient funds
      useGameStore.setState({
        pl: {
          ...useGameStore.getState().pl,
          bag: 5000,
          narrativeFlags: { upkeep_active: true }
        }
      });
      const repayFail = useGameStore.getState().repayLoan(loan.id);
      expect(repayFail).toBe(false);
      expect(useGameStore.getState().pl.financialDebts?.length).toBe(1);

      // Repay with sufficient funds
      useGameStore.setState({
        pl: {
          ...useGameStore.getState().pl,
          bag: 20000,
          narrativeFlags: { upkeep_active: true }
        }
      });
      const repaySuccess = useGameStore.getState().repayLoan(loan.id);
      expect(repaySuccess).toBe(true);
      expect(useGameStore.getState().pl.financialDebts?.length).toBe(0);
      expect(useGameStore.getState().pl.bag).toBe(4400);
    });
  });

  describe('advanceMonth Integration', () => {
    it('should deduct upkeep and monthly payments from bag and decrement remaining terms', () => {
      const store = useGameStore.getState();
      const plWithObligations = {
        ...store.pl,
        bag: 100000,
        rentPortfolioCount: 5, // Upkeep: 5 * 1500 = $7,500
        currentTier: 'STREET' as const,
        financialDebts: [
          {
            id: 'loan_1',
            loanType: 'STUDENT' as const,
            principal: 15000,
            interestRate: 0.04,
            remainingTerm: 12,
            monthlyPayment: 650,
            totalTerm: 24
          }
        ],
        narrativeFlags: { upkeep_active: true }
      };

      const result = advanceMonth(plWithObligations, 'NORMAL', [], true);
      // Expected deductions: Rent $1,000 (NORMAL economy multiplier is 1.0) + Upkeep $7,500 + Debt payment $650 = $9,150
      // Expected net change: bag + passive income - 9150
      // In plWithObligations, there's no passive income, so bag becomes 100000 - 9150 = 90850
      expect(result.newPl.bag).toBe(90850);
      expect(result.newPl.financialDebts?.length).toBe(1);
      expect(result.newPl.financialDebts![0].remainingTerm).toBe(11);
    });

    it('should trigger warnings on low liquidity and apply severe penalties on overdraft/negative cash', () => {
      const store = useGameStore.getState();
      const plNearBankruptcy = {
        ...store.pl,
        bag: 500, // barely enough
        currentTier: 'STREET' as const,
        rentPortfolioCount: 1, // Upkeep: $1,500
        heat: 10,
        mentalHealth: 100,
        narrativeFlags: { upkeep_active: true }
      };

      // Total deductions: Rent $1000 + Upkeep $1500 = $2,500
      // Resulting bag: 500 - 2500 = -2000 (which is clamped to 0)
      // Heat: 10 + 5 (penalty) = 15. Passive decay -10 = 5.
      const result = advanceMonth(plNearBankruptcy, 'NORMAL', [], true);

      expect(result.newPl.bag).toBe(0);
      expect(result.newPl.heat).toBe(5); // +5 Heat penalty, decayed by -10
      expect(result.newPl.mentalHealth).toBe(95); // -5 Mental Health penalty

      const containsLiquidityCrunch = result.news.some(m => m.text.includes('LIQUIDITY CRUNCH'));
      expect(containsLiquidityCrunch).toBe(true);
    });
  });
});
