import { describe, it, expect, beforeEach } from 'vitest';
import { getImmediateGoal } from '../utils/goalUtils';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import { getInitialStats } from '../store/initialState';
import type { PlayerStats } from '../types/game';
import { useGameStore } from '../store/gameStore';

describe('Onboarding & Immediate Goal Guidance System', () => {
  let basePlayer: PlayerStats;

  beforeEach(() => {
    basePlayer = getInitialStats('The Hustler', 1, []);
  });

  describe('Immediate Goal Layer (getImmediateGoal)', () => {
    it('returns RECOVER goal when Mental Health is dangerously low (<= 30%)', () => {
      basePlayer.mentalHealth = 25;
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('RECOVER');
      expect(goal.label).toBe('RECOVER');
      expect(goal.message).toContain('Rest before your next major hustle');
    });

    it('returns RISK goal when Heat is high (>= 75%)', () => {
      basePlayer.heat = 80;
      basePlayer.mentalHealth = 100;
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('RISK');
      expect(goal.label).toBe('RISK');
      expect(goal.message).toContain('Heat is approaching the arrest zone');
    });

    it('returns RISK goal when player is incarcerated', () => {
      basePlayer.inJail = true;
      basePlayer.jailSentenceMonths = 3;
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('RISK');
      expect(goal.label).toBe('INCARCERATED');
      expect(goal.message).toContain('Serve your sentence');
    });

    it('returns CROWN goal for 0 crowns early in game', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.bag = 100;
      basePlayer.masteredHustles = [];
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('CROWN');
      expect(goal.message).toBe('Earn your first Crown');
    });

    it('returns CROWN goal when missing crowns for tier advancement', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.bag = 100000;
      basePlayer.clout = 200;
      basePlayer.aura = 200;
      basePlayer.masteredHustles = ['r_delivery']; // 1 crown, but STREET requires 3
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('CROWN');
      expect(goal.message).toBe('Master 2 more hustles');
    });

    it('returns ADVANCE goal when all next tier requirements are met', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.bag = 100000; // STREET cash = 50k
      basePlayer.clout = 200;  // STREET clout = 100
      basePlayer.aura = 200;   // STREET aura = 100
      basePlayer.masteredHustles = ['r_delivery', 'r_labor', 'r_scrap']; // 3 crowns
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('ADVANCE');
      expect(goal.message).toContain('You meet all requirements for STREET tier');
    });

    it('returns GOAL for missing cash when crowns are met', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.bag = 10000; // Need 50k for STREET
      basePlayer.clout = 200;
      basePlayer.aura = 200;
      basePlayer.masteredHustles = ['r_delivery', 'r_labor', 'r_scrap'];
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('GOAL');
      expect(goal.message).toContain('Earn $40,000 more');
    });

    it('returns EMPIRE goal when passive income is active and tier crowns are met', () => {
      basePlayer.currentTier = 'STREET'; // STARTUP requires 5 crowns
      basePlayer.passiveIncome = 1500;
      basePlayer.bag = 50000;
      basePlayer.masteredHustles = ['r_delivery', 'r_labor', 'r_scrap', 'cc', 'pod']; // 5 crowns
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('EMPIRE');
      expect(goal.message).toBe('Your assets now generate monthly income');
    });

    it('returns PRIORITY goal in President tier', () => {
      basePlayer.currentTier = 'PRESIDENT';
      basePlayer.approvalRating = 65;
      basePlayer.inflation = 3.2;
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('PRIORITY');
      expect(goal.message).toBe('Stabilize the current national situation');
    });

    it('returns LEGACY goal in OPEN tier', () => {
      basePlayer.currentTier = 'OPEN';
      const goal = getImmediateGoal(basePlayer);
      expect(goal.type).toBe('LEGACY');
      expect(goal.message).toBe('Your career is now unrestricted');
    });
  });

  describe('First Crown Moment', () => {
    it('sets pendingFirstCrown when the very first Crown is mastered', () => {
      const store = useGameStore.getState();
      expect(store.pendingFirstCrown).toBeNull();

      store.setPendingFirstCrown({ hustleId: 'r_delivery', hustleName: 'Delivery Gigs' });
      expect(useGameStore.getState().pendingFirstCrown).toEqual({
        hustleId: 'r_delivery',
        hustleName: 'Delivery Gigs'
      });

      store.setPendingFirstCrown(null);
      expect(useGameStore.getState().pendingFirstCrown).toBeNull();
    });
  });

  describe('Advisor Directives (generateStrategicAdvice)', () => {
    it('surfaces Heat danger directive when Heat is >= 75%', () => {
      basePlayer.heat = 85;
      const advice = generateStrategicAdvice(basePlayer, 'NORMAL');
      expect(advice.primaryDirective).toBe('Your Heat is becoming dangerous. Feds are closing in.');
    });

    it('surfaces Mental Health depleted directive when mental health <= 30%', () => {
      basePlayer.mentalHealth = 20;
      const advice = generateStrategicAdvice(basePlayer, 'NORMAL');
      expect(advice.primaryDirective).toBe('Your mental health is depleted. Rest before burnout strikes.');
    });

    it('surfaces Crowns requirement directive when crowns are missing', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.masteredHustles = ['r_delivery']; // 1/3 crowns
      const advice = generateStrategicAdvice(basePlayer, 'NORMAL');
      expect(advice.primaryDirective).toBe('You need 2 more Crowns.');
    });

    it('surfaces Aura weakness directive when cash is strong but Aura is low', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.bag = 100000;
      basePlayer.masteredHustles = ['r_delivery', 'r_labor', 'r_scrap']; // 3 crowns met
      basePlayer.clout = 200;
      basePlayer.aura = 10; // STREET requires 100
      const advice = generateStrategicAdvice(basePlayer, 'NORMAL');
      expect(advice.primaryDirective).toBe('You are strong financially but weak in Aura.');
    });

    it('surfaces passive income coverage directive when passive income covers upkeep', () => {
      basePlayer.currentTier = 'MUD';
      basePlayer.masteredHustles = ['r_delivery', 'r_labor', 'r_scrap'];
      basePlayer.bag = 10000;
      basePlayer.clout = 200;
      basePlayer.aura = 200;
      basePlayer.passiveIncome = 1000; // Exceeds MUD rent/upkeep
      const advice = generateStrategicAdvice(basePlayer, 'NORMAL');
      expect(advice.primaryDirective).toBe('Your passive income now covers your monthly obligations.');
    });
  });
});
