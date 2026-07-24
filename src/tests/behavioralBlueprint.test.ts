import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateAveragePace, analyzeBehavior } from '../utils/personalityAnalyzer';
import { getInitialStats } from '../store/initialState';
import type { PlayerStats, GameAction } from '../types/game';

describe('Behavioral Blueprint - Personality Analyzer Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Pace Calculation (with AFK Clipping)', () => {
    it('returns standard fallback of 5s if actions count is less than 2', () => {
      const actions: GameAction[] = [];
      expect(calculateAveragePace(actions)).toBe(5.0);

      const singleAction: GameAction[] = [
        { id: '1', timestamp: 1000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
      ];
      expect(calculateAveragePace(singleAction)).toBe(5.0);
    });

    it('correctly calculates average pace with normal intervals', () => {
      // 3 actions, interval 1: 4s (4000ms), interval 2: 8s (8000ms). Average = (4 + 8) / 2 = 6s.
      const actions: GameAction[] = [
        { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '2', timestamp: 14000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '3', timestamp: 22000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
      ];

      expect(calculateAveragePace(actions)).toBe(6.0);
    });

    it('clips single long interval to 60 seconds to avoid AFK distortion', () => {
      // 3 actions, interval 1: 5s (5000ms), interval 2: 5 hours (very long).
      // Interval 2 should be clipped to 60s. Average = (5 + 60) / 2 = 32.5s.
      const actions: GameAction[] = [
        { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '2', timestamp: 15000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '3', timestamp: 15000 + 1000 * 60 * 60 * 5, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
      ];

      expect(calculateAveragePace(actions)).toBe(32.5);
    });
  });

  describe('Advice Compliance & Setback Response Analysis', () => {
    it('accurately computes metrics from PlayerStats', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        adviceGivenCount: 10,
        adviceFollowedCount: 6, // 60% compliance
        escalationCount: 3,
        retreatCount: 1, // 25% setbacks recovery (retreats)
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 15000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
        ]
      };

      const result = analyzeBehavior(pl);
      expect(result.adviceGiven).toBe(10);
      expect(result.adviceFollowed).toBe(6);
      expect(result.adviceRatio).toBe(0.6);
      expect(result.setbackEscalations).toBe(3);
      expect(result.setbackRetreats).toBe(1);
      expect(result.setbackRatio).toBe(0.25);
    });
  });

  describe('Color Quadrant Assignment (Across Synthetic Playstyles)', () => {
    it('assigns CRIMSON to fast, self-focused playstyles', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        adviceGivenCount: 5,
        adviceFollowedCount: 0, // 0% compliance
        escalationCount: 5,
        retreatCount: 0, // 0% setbacks recovery (pure escalations)
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_delivery', hustleName: 'Delivery', level: 1, branchId: 'l1', branchName: 'Delivery', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true, heatHit: 5 },
          { id: '2', timestamp: 14000, month: 1, tier: 'MUD', hustleId: 'r_delivery', hustleName: 'Delivery', level: 1, branchId: 'l1', branchName: 'Delivery', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true, heatHit: 5 },
        ] // 4s intervals (Fast)
      };
      pl.narrativeFlags = {
        publicReputation: 'The Crime Boss' // High power-focused rep
      };

      const result = analyzeBehavior(pl);
      expect(result.paceSeconds).toBeLessThanOrEqual(6.0);
      expect(result.paceLabel).toBe('Fast');
      expect(result.orientationScore).toBeLessThan(0);
      expect(result.orientationLabel).toBe('Power & Self');
      expect(result.primaryColor).toBe('CRIMSON');
    });

    it('assigns GOLD to slow, principle-focused playstyles', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        adviceGivenCount: 10,
        adviceFollowedCount: 9, // 90% compliance
        escalationCount: 0,
        retreatCount: 5, // 100% setbacks recovery (pure retreats)
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 20000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        ] // 10s intervals (Deliberate)
      };
      pl.narrativeFlags = {
        publicReputation: 'The Philanthropist' // Clean others-focused rep
      };

      const result = analyzeBehavior(pl);
      expect(result.paceSeconds).toBeGreaterThan(6.0);
      expect(result.paceLabel).toBe('Deliberate');
      expect(result.orientationScore).toBeGreaterThanOrEqual(0);
      expect(result.orientationLabel).toBe('Others & Principles');
      expect(result.primaryColor).toBe('GOLD');
    });

    it('assigns COBALT to slow, self-focused playstyles', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        adviceGivenCount: 10,
        adviceFollowedCount: 2, // 20% compliance
        escalationCount: 4,
        retreatCount: 1, // 20% retreats
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_labor', hustleName: 'Labor', level: 1, branchId: 'l1', branchName: 'Labor', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true },
          { id: '2', timestamp: 18000, month: 1, tier: 'MUD', hustleId: 'r_labor', hustleName: 'Labor', level: 1, branchId: 'l1', branchName: 'Labor', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true },
        ] // 8s intervals (Deliberate)
      };
      pl.narrativeFlags = {
        publicReputation: 'The Investor'
      };

      const result = analyzeBehavior(pl);
      expect(result.paceSeconds).toBeGreaterThan(6.0);
      expect(result.paceLabel).toBe('Deliberate');
      expect(result.orientationScore).toBeLessThan(0);
      expect(result.primaryColor).toBe('COBALT');
    });

    it('assigns VIOLET to fast, principle-focused playstyles', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        adviceGivenCount: 10,
        adviceFollowedCount: 8, // 80% compliance
        escalationCount: 1,
        retreatCount: 3, // 75% retreats
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 15000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        ] // 5s intervals (Fast)
      };
      pl.narrativeFlags = {
        publicReputation: 'The People\'s Champion'
      };

      const result = analyzeBehavior(pl);
      expect(result.paceSeconds).toBeLessThanOrEqual(6.0);
      expect(result.paceLabel).toBe('Fast');
      expect(result.orientationScore).toBeGreaterThanOrEqual(0);
      expect(result.primaryColor).toBe('VIOLET');
    });
  });

  describe('Loyalty Axis (Roster Retention & Churn)', () => {
    it('accurately computes High Retention / High Loyalty', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        rolodex: [
          { id: '1', name: 'Celeb 1', avatar: '', relationshipScore: 90, isUnlocked: true },
          { id: '2', name: 'Celeb 2', avatar: '', relationshipScore: 80, isUnlocked: true }
        ],
        artists: [
          { id: 'a1', name: 'Artist 1', avatar: '', tier: 'local', royaltyRate: 1000, monthsActive: 24, hasReleased: true, contractMonthsLeft: 12, monthlyRetainer: 100, monthlyRevenue: 1000, hypeFactor: 1.0, isTargetedByRival: false }
        ],
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 15500, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
        ] // 5.5s pace (normally Fast, but high loyalty skew should add +1.5s -> 7.0s Deliberate)
      };

      const result = analyzeBehavior(pl);
      expect(result.loyaltyLabel).toBe('Loyal/Retentive');
      expect(result.loyaltyScore).toBeGreaterThanOrEqual(70);
      expect(result.paceLabel).toBe('Deliberate'); // Skewed!
      expect(result.primaryColor).toBe('GOLD'); // Normally would be VIOLET
    });

    it('accurately computes High Churn / Low Loyalty', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        rolodex: [
          { id: '1', name: 'Celeb 1', avatar: '', relationshipScore: 20, isUnlocked: true }
        ],
        artists: [
          { id: 'a1', name: 'Artist 1', avatar: '', tier: 'local', royaltyRate: 1000, monthsActive: 1, hasReleased: false, contractMonthsLeft: 12, monthlyRetainer: 100, monthlyRevenue: 1000, hypeFactor: 1.0, isTargetedByRival: false }
        ],
        actionLog: [
          { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
          { id: '2', timestamp: 16500, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
        ] // 6.5s pace (normally Deliberate, but high churn skew should subtract -1.5s -> 5.0s Fast)
      };

      const result = analyzeBehavior(pl);
      expect(result.loyaltyLabel).toBe('High Churn');
      expect(result.loyaltyScore).toBeLessThanOrEqual(40);
      expect(result.paceLabel).toBe('Fast'); // Skewed!
      expect(result.primaryColor).toBe('VIOLET'); // Normally would be GOLD
    });

    it('accurately computes Mixed / Balanced Loyalty', () => {
      const pl: PlayerStats = {
        ...getInitialStats(3),
        rolodex: [
          { id: '1', name: 'Celeb 1', avatar: '', relationshipScore: 50, isUnlocked: true }
        ],
        artists: [
          { id: 'a1', name: 'Artist 1', avatar: '', tier: 'local', royaltyRate: 1000, monthsActive: 4, hasReleased: false, contractMonthsLeft: 12, monthlyRetainer: 100, monthlyRevenue: 1000, hypeFactor: 1.0, isTargetedByRival: false }
        ]
      };

      const result = analyzeBehavior(pl);
      expect(result.loyaltyLabel).toBe('Balanced');
      expect(result.loyaltyScore).toBeGreaterThan(40);
      expect(result.loyaltyScore).toBeLessThan(70);
    });
  });
});
