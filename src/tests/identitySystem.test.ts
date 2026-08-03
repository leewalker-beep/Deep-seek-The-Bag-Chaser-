import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialStats } from '../store/initialState';
import type { PlayerStats } from '../types/game';
import {
  evaluateIdentityDimensions,
  determineDominantIdentityArchetype,
  detectIdentityEvolution,
  generatePeriodicReflection,
  compileIdentityProfile,
  getIdentityAlignedBillionaireTone
} from '../utils/identitySystem';
import { compileBiographyChapters } from '../utils/biographyCompiler';

describe('Life Trajectory & Identity Reflection System Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('evaluateIdentityDimensions', () => {
    it('accurately computes default dimensions for initial player state', () => {
      const pl = getInitialStats(3); // Grinder difficulty
      const dim = evaluateIdentityDimensions(pl);

      expect(dim.compassion).toBeDefined();
      expect(dim.integrity).toBeDefined();
      expect(dim.ambition).toBeDefined();
      expect(dim.patience).toBeDefined();
      expect(dim.riskTaking).toBeDefined();
      expect(dim.leadership).toBeDefined();
      expect(dim.fameSeeking).toBeDefined();
      expect(dim.resilience).toBeDefined();
    });

    it('reacts dynamically to high charity choices', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        charity_choices_count: 5
      };

      const dim = evaluateIdentityDimensions(pl);
      expect(dim.compassion).toBeGreaterThan(50);
      expect(dim.integrity).toBeGreaterThan(50);
    });

    it('reacts dynamically to high unethical choices', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        unethical_choices_count: 4
      };

      const dim = evaluateIdentityDimensions(pl);
      expect(dim.integrity).toBeLessThan(50);
      expect(dim.riskTaking).toBeGreaterThan(30);
    });
  });

  describe('determineDominantIdentityArchetype', () => {
    it('returns "The Statesman" if the player is President', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'PRESIDENT';

      const archetype = determineDominantIdentityArchetype(pl);
      expect(archetype).toBe('The Statesman');
    });

    it('returns "The Survivor" if the player rebounded from bankruptcy', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        rebounded_bankruptcy_millionaire: true
      };
      pl.masteredHustles = ['the_phoenix'];

      const archetype = determineDominantIdentityArchetype(pl);
      expect(archetype).toBe('The Survivor');
    });

    it('returns "The Builder" for a highly patient, deliberate player', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        education_choices_count: 5,
        publicReputation: 'The Investor'
      };
      pl.adviceGivenCount = 10;
      pl.adviceFollowedCount = 10; // 100% compliance
      pl.actionLog = [
        { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '2', timestamp: 20000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
      ]; // Deliberate pace

      const archetype = determineDominantIdentityArchetype(pl);
      expect(archetype).toBe('The Builder');
    });
  });

  describe('detectIdentityEvolution (Trajectories)', () => {
    it('detects Redemption trajectory', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        unethical_choices_count: 4,
        charity_choices_count: 3
      };

      const traj = detectIdentityEvolution(pl);
      expect(traj).toContain('Redemption');
    });

    it('detects Corruption trajectory', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        charity_choices_count: 3,
        unethical_choices_count: 3
      };
      pl.heat = 70;

      const traj = detectIdentityEvolution(pl);
      expect(traj).toContain('Corruption');
    });

    it('detects Maturity trajectory', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        education_choices_count: 4,
        unethical_choices_count: 1
      };
      pl.adviceGivenCount = 10;
      pl.adviceFollowedCount = 8;
      pl.actionLog = [
        { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_delivery', hustleName: 'Delivery', level: 1, branchId: 'l1', branchName: 'Delivery', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true, heatHit: 5 },
        { id: '2', timestamp: 18000, month: 1, tier: 'MUD', hustleId: 'r_delivery', hustleName: 'Delivery', level: 1, branchId: 'l1', branchName: 'Delivery', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true, heatHit: 5 }
      ]; // Deliberate pace (8s) with some risky action logs

      const traj = detectIdentityEvolution(pl);
      expect(traj).toContain('Maturity');
    });
  });

  describe('generatePeriodicReflection', () => {
    it('provides a patience-aligned reflection', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        education_choices_count: 4
      };
      pl.adviceGivenCount = 10;
      pl.adviceFollowedCount = 10;
      pl.actionLog = [
        { id: '1', timestamp: 10000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true },
        { id: '2', timestamp: 20000, month: 1, tier: 'MUD', hustleId: 'r_sleep', hustleName: 'Rest', level: 1, branchId: 'l1', branchName: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: 0, success: true }
      ];

      const ref = generatePeriodicReflection(pl);
      expect(ref).toBe("You have consistently chosen long-term investments over quick profits.");
    });

    it('provides a relationship transactional warning reflection', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        employee_exploit_choices_count: 3
      };
      pl.bag = 20000000;
      pl.rolodex = [
        { id: '1', name: 'Celeb 1', avatar: '', relationshipScore: 20, isUnlocked: true }
      ];

      const ref = generatePeriodicReflection(pl);
      expect(ref).toBe("Your empire has grown rapidly, but your relationships have become increasingly transactional.");
    });
  });

  describe('Biography Chapter Title Emergence', () => {
    it('renders dominant identity archetype directly as Chapter 3 title', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'STARTUP';
      pl.narrativeFlags = {
        charity_choices_count: 5,
        publicReputation: "The Philanthropist"
      };

      const chapters = compileBiographyChapters(pl);
      const empireChapter = chapters.find(c => c.id === 'building_empire');
      expect(empireChapter).toBeDefined();
      expect(empireChapter?.title).toBe('The Protector');
    });
  });

  describe('getIdentityAlignedBillionaireTone', () => {
    it('returns compassionate description for charitable players', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        charity_choices_count: 5,
        publicReputation: "The Philanthropist"
      };

      const tone = getIdentityAlignedBillionaireTone(pl);
      expect(tone).toContain('compassionate billionaire');
    });

    it('returns feared description for aggressive, crime boss players', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = {
        unethical_choices_count: 5,
        publicReputation: "The Crime Boss"
      };

      const tone = getIdentityAlignedBillionaireTone(pl);
      expect(tone).toContain('feared billionaire');
    });

    it('returns forgotten description for inactive players', () => {
      const pl = getInitialStats(3);
      pl.monthsSinceLastHustle = 12;

      const tone = getIdentityAlignedBillionaireTone(pl);
      expect(tone).toContain('forgotten billionaire');
    });
  });
});
