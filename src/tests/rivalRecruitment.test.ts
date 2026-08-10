import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { isRivalEligibleForRecruit } from '../utils/rivalUtils';
import { simulateRivals } from '../engine/rivalSimEngine';
import { advanceMonth } from '../engine/advancementEngine';

describe('Rival Recruitment System', () => {
  beforeEach(() => {
    // Reset game and ensure we are in a clean state
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should enforce recruit eligibility gating correctly', () => {
    const state = useGameStore.getState();
    const rival = state.pl.rivals.find(r => r.id === 'rival_mud')!;

    // Initial state: not eligible
    expect(isRivalEligibleForRecruit(rival)).toBe(false);

    // Case 1: High relationshipWithPlayer >= 40
    const highRelRival = { ...rival, relationshipWithPlayer: 40 };
    expect(isRivalEligibleForRecruit(highRelRival)).toBe(true);

    // Case 2: Sufficiently sabotaged count >= 3
    const highSabRival = { ...rival, sabotagedCount: 3 };
    expect(isRivalEligibleForRecruit(highSabRival)).toBe(true);

    // Case 3: Sufficiently helped count >= 3
    const highHelpRival = { ...rival, helpedCount: 3 };
    expect(isRivalEligibleForRecruit(highHelpRival)).toBe(true);

    // Case 4: Already recruited (status === 'ally') - should not be recruitable again
    const alreadyRecruitedRival = { ...rival, relationshipWithPlayer: 50, status: 'ally' as any };
    expect(isRivalEligibleForRecruit(alreadyRecruitedRival)).toBe(false);
  });

  it('should transition status to ally and log a biography entry upon recruitment', () => {
    const rivalId = 'rival_mud';
    // Make eligible via helpedCount
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, helpedCount: 3 } : r)
      }
    }));

    const beforeRival = useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!;
    expect(isRivalEligibleForRecruit(beforeRival)).toBe(true);

    // Recruit
    const success = useGameStore.getState().recruitRival!(rivalId);
    expect(success).toBe(true);

    const afterRival = useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!;
    expect(afterRival.status).toBe('ally');

    // Biography check
    const biography = useGameStore.getState().pl.biography;
    expect(biography.some(entry => entry.includes('Turned longtime rival Marcus into a business partner'))).toBe(true);
  });

  it('should place recruited low-tier rival in foundersBacked (Founder) roster', () => {
    const rivalId = 'rival_mud'; // MUD tier
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, relationshipWithPlayer: 50 } : r)
      }
    }));

    const success = useGameStore.getState().recruitRival!(rivalId);
    expect(success).toBe(true);

    const founders = useGameStore.getState().pl.foundersBacked;
    expect(founders.some(f => f.id === `founder_${rivalId}`)).toBe(true);

    const founder = founders.find(f => f.id === `founder_${rivalId}`)!;
    expect(founder.name).toBe('Marcus');
    expect(founder.companyName).toBe('Marcus Ventures');
    expect(founder.stats.execution).toBeDefined();
    expect(founder.stats.vision).toBeDefined();
    expect(founder.stats.burnDiscipline).toBeDefined();
  });

  it('should place recruited high-tier rival in conglomerateCandidates (RegionalExecutive) roster', () => {
    const rivalId = 'rival_corp'; // CORPORATE tier
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, relationshipWithPlayer: 50 } : r)
      }
    }));

    const success = useGameStore.getState().recruitRival!(rivalId);
    expect(success).toBe(true);

    const candidates = useGameStore.getState().pl.conglomerateCandidates;
    expect(candidates?.some(c => c.id === `exec_${rivalId}`)).toBe(true);

    const exec = candidates?.find(c => c.id === `exec_${rivalId}`)!;
    expect(exec.name).toBe('Emily');
    expect(exec.competence).toBeDefined();
    expect(exec.loyalty).toBeDefined();
    expect(exec.riskTolerance).toBeDefined();
  });

  it('should preserve properties from CHARACTERS database if characterId is linked', () => {
    const rivalId = 'rival_corp'; // has characterId 'char_victor' linked
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, characterId: 'char_victor', relationshipWithPlayer: 50 } : r)
      }
    }));

    const success = useGameStore.getState().recruitRival!(rivalId);
    expect(success).toBe(true);

    const candidates = useGameStore.getState().pl.conglomerateCandidates;
    const exec = candidates?.find(c => c.id === `exec_${rivalId}`)!;

    expect(exec.name).toBe('Victor Kane');
    expect(exec.avatarId).toBe('p_elite_1');
    expect(exec.bio).toContain('The apex predator of the corporate world');
  });

  it('should ensure allied rivals do not behave as active competitive rivals post-recruitment', () => {
    const rivalId = 'rival_mud';
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, relationshipWithPlayer: 60 } : r)
      }
    }));

    // Recruit
    useGameStore.getState().recruitRival!(rivalId);

    const recruitedPl = useGameStore.getState().pl;
    const rival = recruitedPl.rivals.find(r => r.id === rivalId)!;
    expect(rival.status).toBe('ally');

    // 1. Simulate month and verify they don't bid or sabotage
    // Mock math.random to try triggering bid or hostile actions
    vi.spyOn(Math, 'random').mockReturnValue(0.01);

    const simResult = simulateRivals(recruitedPl, 'NORMAL');
    const updatedRival = simResult.updatedRivals.find(r => r.id === rivalId)!;

    // Allied rival current bid is forced to 0
    expect(updatedRival.currentBid).toBe(0);

    // No retaliations or direct sabotages logged in news for Marcus
    const marcusNews = simResult.news.filter(n => n.includes('Marcus'));
    expect(marcusNews.some(n => n.includes('RETALIATION') || n.includes('SABOTAGE'))).toBe(false);

    // 2. Verify monthly advancement does not evaluate threat / trigger challenge from ally
    // Give player very low bag, normally Marcus (5000) would be > 2x player bag (10) and trigger threat
    const poorPl = {
      ...recruitedPl,
      bag: 10,
      activeChallenges: []
    };

    const adv = advanceMonth(poorPl, 'NORMAL', [], true);

    // Allied rival tier does not register as RIVAL_DOMINANT or trigger challenge
    expect(adv.newPl.rivalThreats[rival.tier]).not.toBe('RIVAL_DOMINANT');
    expect(adv.newPl.activeChallenges.length).toBe(0);
  });
});
