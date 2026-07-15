import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { calculateReputationScores, evaluateReputationTick } from '../engine/reputationEngine';
import { calculateHustleStatsAdditive } from '../engine/mathEngine';
import { HUSTLES } from '../config/hustles/base';
import type { PlayerStats } from '../types/game';

describe('Dynamic Reputation Engine', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should calculate initial scores and identify starting reputation as The Hustler', () => {
    const pl = useGameStore.getState().pl;
    const scores = calculateReputationScores(pl);
    console.log("INITIAL SCORES:", scores);

    expect(scores["The Hustler"]).toBeGreaterThan(0);
    expect(scores["The Billionaire"]).toBe(0);
    expect(scores["The Crime Boss"]).toBe(0);
  });

  it('should correctly score and identify The Billionaire under extreme wealth', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      bag: 1500000000 // 1.5 Billion
    };

    const scores = calculateReputationScores(pl);
    console.log("BILLIONAIRE SCORES:", scores);
    expect(scores["The Billionaire"]).toBeGreaterThan(800);

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    expect(sorted[0][0]).toBe("The Billionaire");
  });

  it('should correctly score and identify The Crime Boss under high heat and arrest history', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      heat: 85,
      arrestCount: 2
    };

    const scores = calculateReputationScores(pl);
    console.log("CRIME BOSS SCORES:", scores);
    expect(scores["The Crime Boss"]).toBeGreaterThan(100);
  });

  it('should enforce a 3-month sustained trend window to prevent rapid oscillation', () => {
    let pl = useGameStore.getState().pl;

    pl.narrativeFlags = {
      publicReputation: "The Hustler",
      reputationCandidate: "",
      reputationSustainedMonths: 0
    };

    pl.bag = 2000000000; // 2 Billion

    // Month 1 of trend
    let result = evaluateReputationTick(pl);
    pl = result.newPl;
    console.log("SUSTAINED MONTH 1 CANDIDATE:", pl.narrativeFlags.reputationCandidate);
    expect(pl.narrativeFlags.publicReputation).toBe("The Hustler");
    expect(pl.narrativeFlags.reputationCandidate).toBe("The Billionaire");
    expect(pl.narrativeFlags.reputationSustainedMonths).toBe(1);

    // Month 2 of trend
    result = evaluateReputationTick(pl);
    pl = result.newPl;
    expect(pl.narrativeFlags.publicReputation).toBe("The Hustler");
    expect(pl.narrativeFlags.reputationCandidate).toBe("The Billionaire");
    expect(pl.narrativeFlags.reputationSustainedMonths).toBe(2);

    // Month 3 of trend
    result = evaluateReputationTick(pl);
    pl = result.newPl;
    expect(pl.narrativeFlags.publicReputation).toBe("The Billionaire");
    expect(pl.narrativeFlags.reputationCandidate).toBe("");
    expect(pl.narrativeFlags.reputationSustainedMonths).toBe(0);
  });

  it('should reset transition countdown if highest-scoring candidate changes during the window', () => {
    let pl = useGameStore.getState().pl;
    pl.narrativeFlags = {
      publicReputation: "The Hustler",
      reputationCandidate: "",
      reputationSustainedMonths: 0
    };

    // Trigger state changes that favor "The Billionaire"
    pl.bag = 2000000000;

    // Month 1 of Billionaire trend
    let result = evaluateReputationTick(pl);
    pl = result.newPl;
    console.log("RESET TEST M1 CANDIDATE:", pl.narrativeFlags.reputationCandidate);
    expect(pl.narrativeFlags.reputationCandidate).toBe("The Billionaire");
    expect(pl.narrativeFlags.reputationSustainedMonths).toBe(1);

    // Now, lose all wealth and gain massive Heat/Arrests to favor "The Crime Boss"
    pl.bag = 1000;
    pl.heat = 95;
    pl.arrestCount = 3;

    // Print calculated scores here
    const scores = calculateReputationScores(pl);
    console.log("SCORES BEFORE M2 TICK:", scores);

    // Month 2: evaluate should detect "The Crime Boss" as the new candidate and reset sustained count
    result = evaluateReputationTick(pl);
    pl = result.newPl;
    console.log("RESET TEST M2 CANDIDATE:", pl.narrativeFlags.reputationCandidate);
    expect(pl.narrativeFlags.publicReputation).toBe("The Hustler");
    expect(pl.narrativeFlags.reputationCandidate).toBe("The Crime Boss");
    expect(pl.narrativeFlags.reputationSustainedMonths).toBe(1);
  });

  it('should accurately apply math multipliers based on active reputation', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      narrativeFlags: {
        publicReputation: "The Celebrity"
      }
    };

    const hustleId = 'cc'; // Content Creation
    const levelData = HUSTLES[hustleId].branches['l1'];
    const initialResult = {
      cost: 0,
      yieldCash: 1000,
      yieldClout: 10,
      yieldAura: 10,
      mentalHit: -5,
      heatHit: 10,
      shieldTurns: 0
    };

    const additiveResult = calculateHustleStatsAdditive(hustleId, levelData, pl, 1, initialResult);

    expect(additiveResult.heatHit).toBe(12);
    expect(additiveResult.yieldCash).toBeGreaterThan(1000);
  });
});
