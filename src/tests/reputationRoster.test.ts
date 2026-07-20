import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { calculateReputationScores, evaluateReputationTick } from '../engine/reputationEngine';
import type { PlayerStats } from '../types/game';

describe('Roster-to-Reputation Vector Integration Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should push points to The Celebrity and Controversial Tycoon when Rolodex celebrities are signed', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      rolodex: [
        { id: 'cel_1', name: 'Alpha Creator', avatar: 'av1', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_2', name: 'Beta Creator', avatar: 'av2', relationshipScore: 80, isUnlocked: true } // Relationship >= 75
      ]
    };

    const scores = calculateReputationScores(pl);

    // Each unlocked celebrity should add +15 to The Celebrity, +15 to Controversial Tycoon, +10 to Crime Boss
    // High relationship celebrity should add +5 to People's Champion
    expect(scores["The Celebrity"]).toBe(initialScores["The Celebrity"] + 30);
    expect(scores["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 30);
    expect(scores["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 20);
    expect(scores["The People's Champion"]).toBe(initialScores["The People's Champion"] + 5);
  });

  it('should push points to The Investor/Philanthropist vs Controversial Tycoon based on founder ethics', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      foundersBacked: [
        {
          id: 'f1',
          name: 'Ethical Eve',
          avatar: 'av_eve',
          companyName: 'GoodCo',
          pitchIdea: 'Sustain',
          stats: { execution: 70, vision: 60, burnDiscipline: 80 } // burnDiscipline >= 60 (Ethical)
        },
        {
          id: 'f2',
          name: 'Reckless Rick',
          avatar: 'av_rick',
          companyName: 'MoveFastCo',
          pitchIdea: 'Disrupt',
          stats: { execution: 80, vision: 90, burnDiscipline: 20 } // burnDiscipline < 40 & vision >= 60 (Disruptive)
        }
      ]
    };

    const scores = calculateReputationScores(pl);

    // Ethical Eve: +15 to Investor, +10 to Philanthropist, +10 to Reformer (burnDiscipline >= 70)
    expect(scores["The Investor"]).toBe(initialScores["The Investor"] + 15);
    expect(scores["The Philanthropist"]).toBe(initialScores["The Philanthropist"] + 10);
    expect(scores["The Reformer"]).toBe(initialScores["The Reformer"] + 10);

    // Reckless Rick: +15 (existing) + 10 (new) to Controversial Tycoon, +10 to Shadow Broker
    expect(scores["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 25);
    expect(scores["The Shadow Broker"]).toBe(initialScores["The Shadow Broker"] + 10);
  });

  it('should push points based on record label artist contracts and Grammy wins', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      artists: [
        {
          id: 'art_1',
          name: 'Exploited Star',
          avatar: 'av_star',
          tier: 'regional',
          royaltyRate: 10, // <= 15% (Exploitative)
          monthsActive: 12,
          hasReleased: true,
          contractMonthsLeft: 36,
          monthlyRetainer: 100,
          monthlyRevenue: 1000,
          hypeFactor: 5,
          isTargetedByRival: false
        },
        {
          id: 'art_2',
          name: 'Highly Paid Legend',
          avatar: 'av_legend',
          tier: 'global',
          royaltyRate: 45, // >= 40% (Artist-friendly) and Grammy Winner
          monthsActive: 24,
          hasReleased: true,
          contractMonthsLeft: 24,
          monthlyRetainer: 200,
          monthlyRevenue: 5000,
          hypeFactor: 9,
          isTargetedByRival: false,
          isGrammyWinner: true
        }
      ]
    };

    const scores = calculateReputationScores(pl);

    // Both artists add +15 to The Celebrity (Total +30)
    // art_2 is a Grammy winner, adding +20 to The Celebrity and +10 to Media Emperor
    expect(scores["The Celebrity"]).toBe(initialScores["The Celebrity"] + 30 + 20);
    expect(scores["The Media Emperor"]).toBe(initialScores["The Media Emperor"] + 10);

    // Exploited Star adds +15 to Controversial Tycoon
    expect(scores["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 15);

    // Highly Paid Legend adds +10 to Reformer and +10 to People's Champion
    expect(scores["The Reformer"]).toBe(initialScores["The Reformer"] + 10);
    expect(scores["The People's Champion"]).toBe(initialScores["The People's Champion"] + 10);
  });

  it('should adjust Reformer/Crime Boss scores according to Cabinet integrity', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    // High integrity cabinet
    const plHigh: PlayerStats = {
      ...basePl,
      cabinet: {
        treasury: {
          id: 'treasury',
          name: 'Honest Abe',
          role: 'Treasury Secretary',
          loyalty: 80,
          integrity: 90,
          strengths: [],
          weaknesses: [],
          politicalAlignment: 'center',
          impacts: {},
          bonus: { type: 'cash', value: 1.1 }
        },
        state: {
          id: 'state',
          name: 'Fair Fiona',
          role: 'Secretary of State',
          loyalty: 85,
          integrity: 80,
          strengths: [],
          weaknesses: [],
          politicalAlignment: 'center',
          impacts: {},
          bonus: { type: 'approval', value: 1.1 }
        }
      }
    };

    const scoresHigh = calculateReputationScores(plHigh);
    expect(scoresHigh["The Reformer"]).toBe(initialScores["The Reformer"] + 30);

    // Corrupt cabinet
    const plCorrupt: PlayerStats = {
      ...basePl,
      cabinet: {
        treasury: {
          id: 'treasury',
          name: 'Shady Sam',
          role: 'Treasury Secretary',
          loyalty: 60,
          integrity: 30,
          strengths: [],
          weaknesses: [],
          politicalAlignment: 'center',
          impacts: {},
          bonus: { type: 'cash', value: 1.1 }
        },
        state: {
          id: 'state',
          name: 'Greedy George',
          role: 'Secretary of State',
          loyalty: 50,
          integrity: 40,
          strengths: [],
          weaknesses: [],
          politicalAlignment: 'center',
          impacts: {},
          bonus: { type: 'approval', value: 1.1 }
        }
      }
    };

    const scoresCorrupt = calculateReputationScores(plCorrupt);
    expect(scoresCorrupt["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 20);
    expect(scoresCorrupt["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 20);
  });

  it('should adjust Mogul/Investor and Controversial Tycoon/Crime Boss scores based on CEO traits', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      conglomerateCEOs: {
        na_tech: {
          id: 'ceo_wild',
          name: 'Reckless Roy',
          competence: 50,
          loyalty: 60,
          riskTolerance: 80, // >= 70 (Aggressive)
        },
        eu_mfg: {
          id: 'ceo_steady',
          name: 'Steady Susan',
          competence: 85, // >= 70
          loyalty: 90,
          riskTolerance: 30, // <= 40 (Disciplined)
        }
      }
    };

    const scores = calculateReputationScores(pl);

    // Reckless Roy: +10 to Controversial Tycoon, +10 to Crime Boss
    expect(scores["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 10);
    expect(scores["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 10);

    // Steady Susan: +15 to Mogul, +10 to Investor, +10 to Kingmaker (loyalty >= 70)
    expect(scores["The Mogul"]).toBe(initialScores["The Mogul"] + 15);
    expect(scores["The Investor"]).toBe(initialScores["The Investor"] + 10);
    expect(scores["The Kingmaker"]).toBe(initialScores["The Kingmaker"] + 10);
  });

  it('should construct the custom reputationWhy explanation upon a persona lock-in', () => {
    let pl = useGameStore.getState().pl;

    // Build a state that will trigger a lock-in of "The Celebrity"
    pl.currentTier = 'STARTUP'; // Removes the +50 Hustler starting tier bonus
    pl.clout = 600;
    pl.aura = 60;
    pl.narrativeFlags = {
      publicReputation: "The Hustler",
      reputationCandidate: "The Celebrity",
      reputationSustainedMonths: 2 // Next tick will lock in!
    };

    pl.rolodex = [
      { id: 'cel_1', name: 'Alpha Creator', avatar: 'av1', relationshipScore: 80, isUnlocked: true }
    ];
    pl.artists = [
      {
        id: 'art_1',
        name: 'Vocal Prodigy',
        avatar: 'av_prod',
        tier: 'regional',
        royaltyRate: 25,
        monthsActive: 12,
        hasReleased: true,
        contractMonthsLeft: 36,
        monthlyRetainer: 100,
        monthlyRevenue: 1000,
        hypeFactor: 5,
        isTargetedByRival: false
      }
    ];

    const result = evaluateReputationTick(pl);
    const updatedPl = result.newPl;

    expect(updatedPl.narrativeFlags.publicReputation).toBe("The Celebrity");

    const whyString = updatedPl.narrativeFlags.reputationWhy as string;
    expect(whyString).toBeDefined();
    expect(whyString).toContain("Your rise as a Celebrity is heavily driven by");
    expect(whyString).toContain("Alpha Creator");
    expect(whyString).toContain("Vocal Prodigy");
    console.log("GENERATED CELEBRITY WHY:", whyString);
  });

  it('should enforce +75 cap on Talent Agency signings contribution', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      rolodex: [
        { id: 'cel_1', name: 'Creator 1', avatar: 'av', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_2', name: 'Creator 2', avatar: 'av', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_3', name: 'Creator 3', avatar: 'av', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_4', name: 'Creator 4', avatar: 'av', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_5', name: 'Creator 5', avatar: 'av', relationshipScore: 50, isUnlocked: true },
        { id: 'cel_6', name: 'Creator 6', avatar: 'av', relationshipScore: 50, isUnlocked: true }
      ]
    };

    const scores = calculateReputationScores(pl);

    // Stop counting after 5 signings.
    // Controversial Tycoon receives +15 * 5 = +75 (not +90)
    // Crime Boss receives +10 * 5 = +50 (not +60)
    expect(scores["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 75);
    expect(scores["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 50);
  });

  it('should enforce +75 cap on VC Founders backed category contributions', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      foundersBacked: Array.from({ length: 8 }, (_, i) => ({
        id: `f_${i}`,
        name: `Founder ${i}`,
        avatar: 'av',
        companyName: `Co ${i}`,
        pitchIdea: 'Idea',
        stats: { execution: 50, vision: 50, burnDiscipline: 80 } // burnDiscipline >= 70 (Reformer)
      }))
    };

    const scores = calculateReputationScores(pl);

    // Reformer receives 10 * 8 = 80 capped at +75
    expect(scores["The Reformer"]).toBe(initialScores["The Reformer"] + 75);

    // Let's also check Controversial Tycoon VC cap
    const plTycoon: PlayerStats = {
      ...basePl,
      foundersBacked: Array.from({ length: 8 }, (_, i) => ({
        id: `f_${i}`,
        name: `Founder ${i}`,
        avatar: 'av',
        companyName: `Co ${i}`,
        pitchIdea: 'Idea',
        stats: { execution: 50, vision: 50, burnDiscipline: 20 } // burnDiscipline < 30 (Tycoon)
      }))
    };

    const scoresTycoon = calculateReputationScores(plTycoon);
    // Capped at +75 from burnDiscipline < 30. (Note: Rick rule burnDiscipline < 40 and vision >= 60 does not trigger here since vision is 50)
    expect(scoresTycoon["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 75);
  });

  it('should enforce +75 cap on Regional CEO appointments category contributions', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const ceosLoyal: Record<string, any> = {};
    for (let i = 0; i < 8; i++) {
      ceosLoyal[`ceo_${i}`] = {
        id: `ceo_${i}`,
        name: `CEO ${i}`,
        competence: 50,
        loyalty: 80, // >= 70 (Kingmaker)
        riskTolerance: 50
      };
    }

    const pl: PlayerStats = {
      ...basePl,
      conglomerateCEOs: ceosLoyal
    };

    const scores = calculateReputationScores(pl);
    // Kingmaker receives 10 * 8 = 80 capped at +75
    expect(scores["The Kingmaker"]).toBe(initialScores["The Kingmaker"] + 75);

    // Let's also check riskTolerance CEO cap
    const ceosRisk: Record<string, any> = {};
    for (let i = 0; i < 8; i++) {
      ceosRisk[`ceo_${i}`] = {
        id: `ceo_${i}`,
        name: `CEO ${i}`,
        competence: 50,
        loyalty: 50,
        riskTolerance: 80 // >= 70 (Tycoon)
      };
    }

    const plRisk: PlayerStats = {
      ...basePl,
      conglomerateCEOs: ceosRisk
    };

    const scoresRisk = calculateReputationScores(plRisk);
    // Controversial Tycoon receives 10 * 8 = 80 capped at +75
    expect(scoresRisk["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 75);
  });

  it('should apply Cabinet appointments corruptionRisk correctly and respect +75 cap', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    // High corruption risk cabinet
    const plCorrupt: PlayerStats = {
      ...basePl,
      cabinet: {
        c1: { id: 'c1', name: 'C1', role: 'Role', loyalty: 50, integrity: 50, corruptionRisk: 60, strengths: [], weaknesses: [], politicalAlignment: 'center', impacts: {}, bonus: { type: 'cash', value: 1.0 } },
        c2: { id: 'c2', name: 'C2', role: 'Role', loyalty: 50, integrity: 50, corruptionRisk: 65, strengths: [], weaknesses: [], politicalAlignment: 'center', impacts: {}, bonus: { type: 'cash', value: 1.0 } }
      }
    };

    const scoresCorrupt = calculateReputationScores(plCorrupt);
    // Crime Boss: +10 * 2 = +20, Controversial Tycoon: +10 * 2 = +20
    expect(scoresCorrupt["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 20);
    expect(scoresCorrupt["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 20);

    // Test +75 cap by adding more corrupt cabinet members
    const plSuperCorrupt: PlayerStats = { ...basePl, cabinet: {} };
    for (let i = 0; i < 9; i++) {
      plSuperCorrupt.cabinet![`c_${i}`] = {
        id: `c_${i}`,
        name: `C_${i}`,
        role: 'Role',
        loyalty: 50,
        integrity: 50,
        corruptionRisk: 70, // >= 50
        strengths: [],
        weaknesses: [],
        politicalAlignment: 'center',
        impacts: {},
        bonus: { type: 'cash', value: 1.0 }
      } as any;
    }

    const scoresSuperCorrupt = calculateReputationScores(plSuperCorrupt);
    // 9 * 10 = 90 capped at +75
    expect(scoresSuperCorrupt["The Crime Boss"]).toBe(initialScores["The Crime Boss"] + 75);
    expect(scoresSuperCorrupt["The Controversial Tycoon"]).toBe(initialScores["The Controversial Tycoon"] + 75);
  });

  it('should apply Rival recruitment points to The Reformer flat and uncapped', () => {
    const basePl = useGameStore.getState().pl;
    const initialScores = calculateReputationScores(basePl);

    const pl: PlayerStats = {
      ...basePl,
      rivals: [
        { id: 'r1', name: 'R1', currentBid: 0, netWorth: 100, relationshipWithPlayer: 50, sabotageCount: 0, helpedCount: 0, status: 'ally' as any, tier: 'MUD', preferredIndustries: [] },
        { id: 'r2', name: 'R2', currentBid: 0, netWorth: 100, relationshipWithPlayer: 50, sabotageCount: 0, helpedCount: 0, status: 'ally' as any, tier: 'MUD', preferredIndustries: [] }
      ]
    };

    const scores = calculateReputationScores(pl);
    // Two recruited rivals add +40 to Reformer
    expect(scores["The Reformer"]).toBe(initialScores["The Reformer"] + 40);
  });

  it('should generate the custom brief category why string upon a lock-in driven by roster actions', () => {
    let pl = useGameStore.getState().pl;

    // Build a state that will trigger a lock-in of "The Reformer"
    pl.currentTier = 'STARTUP';
    pl.clout = 100;
    pl.aura = 60;
    pl.hustleLevels = {};
    pl.hustleBranchIds = {};
    pl.philanthropyDonation = 0;
    pl.narrativeFlags = {
      publicReputation: "The Hustler",
      reputationCandidate: "The Reformer",
      reputationSustainedMonths: 2 // Next tick will lock in!
    };

    // Recruited rivals are the highest roster action category contributing to The Reformer (8 * 20 = 160)
    pl.rivals = Array.from({ length: 8 }, (_, i) => ({
      id: `r_${i}`,
      name: `Rival ${i}`,
      currentBid: 0,
      netWorth: 100,
      relationshipWithPlayer: 50,
      sabotageCount: 0,
      helpedCount: 0,
      status: 'ally' as any,
      tier: 'MUD',
      preferredIndustries: []
    }));

    const tempScores = calculateReputationScores(pl);
    console.log("TEMP SCORES FOR REFORMER:", tempScores);

    const result = evaluateReputationTick(pl);
    const updatedPl = result.newPl;

    expect(updatedPl.narrativeFlags.publicReputation).toBe("The Reformer");

    const whyString = updatedPl.narrativeFlags.reputationWhy as string;
    expect(whyString).toBeDefined();
    expect(whyString).toBe("Your transition to The Reformer is primarily driven by your Rival recruitment.");
    console.log("GENERATED REFORMER WHY:", whyString);
  });
});
