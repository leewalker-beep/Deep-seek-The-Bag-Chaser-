import { describe, it, expect, vi } from 'vitest';
import { evolveWorldNPCs } from '../utils/narrativeEngine';
import type { PersistentNPC } from '../types/game';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';

describe('Lifespan Evolution Engine (evolveWorldNPCs)', () => {
  it('should naturally drift relationship disposition and reputation over time', () => {
    const npcs: PersistentNPC[] = [
      {
        id: 'npc_1',
        name: 'Angry Bob',
        avatar: '👺',
        reputation: 50,
        disposition: -30, // hostile grudge should deepen
        currentRole: 'CREATOR',
        interactionLog: []
      },
      {
        id: 'npc_2',
        name: 'Lovely Alice',
        avatar: '🌟',
        reputation: 50,
        disposition: 60, // friendly loyalty should stabilize (increase)
        currentRole: 'CREATOR',
        interactionLog: []
      },
      {
        id: 'npc_3',
        name: 'Neutral Charlie',
        avatar: '😐',
        reputation: 50,
        disposition: 10, // neutral should remain same
        currentRole: 'CREATOR',
        interactionLog: []
      }
    ];

    const evolved = evolveWorldNPCs(npcs, '18Y 1M', 'STREET');

    // Bob: disposition < -20, so disposition should decrease (deepen grudge)
    expect(evolved[0].disposition).toBeLessThan(-30);
    expect(evolved[0].disposition).toBeGreaterThanOrEqual(-100);

    // Alice: disposition > 50, so disposition should increase (stabilize)
    expect(evolved[1].disposition).toBeGreaterThan(60);
    expect(evolved[1].disposition).toBeLessThanOrEqual(100);

    // Charlie: disposition is between -20 and 50, so it remains unchanged
    expect(evolved[2].disposition).toBe(10);
  });

  it('should evolve STREET_INTERN to CREATOR', () => {
    const npcs: PersistentNPC[] = [
      {
        id: 'intern_1',
        name: 'Sam Intern',
        avatar: '☕',
        reputation: 10,
        disposition: 20,
        currentRole: 'STREET_INTERN',
        interactionLog: []
      }
    ];

    // Force Math.random() to trigger the >0.85 chance (e.g. return 0.9)
    const originalRandom = Math.random;
    Math.random = () => 0.9;

    try {
      const evolved = evolveWorldNPCs(npcs, '18Y 1M', 'STREET');
      expect(evolved[0].currentRole).toBe('CREATOR');
      expect(evolved[0].interactionLog[0]).toContain('EVOLVED_TO_CREATOR_AT_18Y 1M');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('should evolve CREATOR to BOARD_DIRECTOR when player reaches CORPORATE tier and disposition is high', () => {
    const npcs: PersistentNPC[] = [
      {
        id: 'creator_1',
        name: 'Vibe Master',
        avatar: '🎧',
        reputation: 40,
        disposition: 50, // > 40
        currentRole: 'CREATOR',
        interactionLog: []
      }
    ];

    const evolved = evolveWorldNPCs(npcs, '18Y 1M', 'CORPORATE');
    expect(evolved[0].currentRole).toBe('BOARD_DIRECTOR');
    expect(evolved[0].interactionLog[0]).toContain('EVOLVED_TO_BOARD_DIRECTOR_AT_18Y 1M');
  });

  it('should evolve BOARD_DIRECTOR to POLITICAL_RUNNING_MATE when player reaches ELITE tier and disposition is very high', () => {
    const npcs: PersistentNPC[] = [
      {
        id: 'director_1',
        name: 'CEO Sterling Jr',
        avatar: '👓',
        reputation: 70,
        disposition: 80, // > 75
        currentRole: 'BOARD_DIRECTOR',
        interactionLog: []
      }
    ];

    const evolved = evolveWorldNPCs(npcs, '18Y 1M', 'ELITE');
    expect(evolved[0].currentRole).toBe('POLITICAL_RUNNING_MATE');
    expect(evolved[0].interactionLog[0]).toContain('EVOLVED_TO_RUNNING_MATE_AT_18Y 1M');
  });

  it('should evolve CREATOR to RIVAL if disposition is very hostile', () => {
    const npcs: PersistentNPC[] = [
      {
        id: 'creator_2',
        name: 'Cody Copycat',
        avatar: '🦊',
        reputation: 30,
        disposition: -50, // < -40
        currentRole: 'CREATOR',
        interactionLog: []
      }
    ];

    // Force Math.random() to trigger the >0.9 chance for rival threat evolution (e.g. return 0.95)
    const originalRandom = Math.random;
    Math.random = () => 0.95;

    try {
      const evolved = evolveWorldNPCs(npcs, '18Y 1M', 'STREET');
      expect(evolved[0].currentRole).toBe('RIVAL');
      expect(evolved[0].interactionLog[0]).toContain('EVOLVED_TO_RIVAL_THREAT_AT_18Y 1M');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('should successfully hook into advanceMonth and evolve NPCs', () => {
    const basePl = getInitialStats(3, undefined, undefined, undefined, []);
    basePl.npcs = [
      {
        id: 'npc_test',
        name: 'Bob Intern',
        avatar: '☕',
        reputation: 20,
        disposition: 80, // > 50 so it drifts up
        currentRole: 'STREET_INTERN',
        interactionLog: []
      }
    ];

    const result = advanceMonth(basePl, 'NORMAL');
    expect(result.newPl.npcs).toBeDefined();
    expect(result.newPl.npcs![0].disposition).toBe(81); // disposition 80 should drift up to 81
  });
});
