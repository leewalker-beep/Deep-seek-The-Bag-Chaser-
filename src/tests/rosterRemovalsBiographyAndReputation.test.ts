import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { calculateReputationScores } from '../engine/reputationEngine';
import { processEntertainmentTimelineTick } from '../engine/advancementEngine';

describe('Roster Removals Biography and Reputation Integrations', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  describe('1. Dropping an Artist (dropArtist)', () => {
    it('should log a biography entry and NOT apply reputation penalty for a standard, non-high-performing, non-tenured artist', () => {
      const store = useGameStore.getState();
      const mockArtist = {
        id: 'artist_standard',
        name: 'John Standard',
        avatar: '🎤',
        tier: 'local' as const,
        monthlyRevenue: 1000,
        hypeFactor: 1.0,
        contractMonthsLeft: 115, // signed recently, contract starts at 120
        royaltyRate: 20, // not high performing
        isGrammyWinner: false
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          artists: [mockArtist],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().dropArtist('artist_standard');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.artists.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('John Standard');
      // Verify it mentions record label or contract or ties or representation
      expect(stateAfter.pl.biography[0]).toMatch(/contract|ties|representation|label/);

      // Reputation penalty should be 0
      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(0);
    });

    it('should log biography and apply a reputation penalty for a long-tenured artist', () => {
      const store = useGameStore.getState();
      const mockArtist = {
        id: 'artist_tenured',
        name: 'Billy Legend',
        avatar: '🎤',
        tier: 'local' as const,
        monthlyRevenue: 1000,
        hypeFactor: 1.0,
        contractMonthsLeft: 100, // signed for 20 months (<= 108 is long-tenured)
        royaltyRate: 20,
        isGrammyWinner: false
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          artists: [mockArtist],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().dropArtist('artist_tenured');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.artists.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Billy Legend');

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });

    it('should log biography and apply a reputation penalty for a high-performing artist (Grammy Winner)', () => {
      const store = useGameStore.getState();
      const mockArtist = {
        id: 'artist_grammy',
        name: 'Grammy Queen',
        avatar: '🎤',
        tier: 'global' as const,
        monthlyRevenue: 5000,
        hypeFactor: 2.0,
        contractMonthsLeft: 119, // recent
        royaltyRate: 15,
        isGrammyWinner: true // high performing
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          artists: [mockArtist],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().dropArtist('artist_grammy');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.artists.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Grammy Queen');

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });
  });

  describe('2. Regional CEO Dismissal and Replacement', () => {
    it('should log biography and NOT apply penalty for a non-high-performing CEO', () => {
      const store = useGameStore.getState();
      const mockExec = {
        id: 'ceo_low',
        name: 'Bob Slacker',
        avatar: '👔',
        competence: 40,
        loyalty: 40,
        riskTolerance: 50,
        bio: 'Just getting by'
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          conglomerateCEOs: {
            'na_tech': mockExec
          },
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().fireConglomerateCEO('na_tech');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.conglomerateCEOs?.['na_tech']).toBeUndefined();
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Bob Slacker');
      expect(stateAfter.pl.biography[0]).toMatch(/Relieved|dismiss|removal|Terminated/i);

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(0);
    });

    it('should log biography and apply penalty for a high-competence CEO on fireConglomerateCEO', () => {
      const store = useGameStore.getState();
      const mockExec = {
        id: 'ceo_high',
        name: 'Sarah Smart',
        avatar: '👔',
        competence: 85, // high competence (>= 70)
        loyalty: 50,
        riskTolerance: 50,
        bio: 'Outstanding leader'
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          conglomerateCEOs: {
            'na_tech': mockExec
          },
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().fireConglomerateCEO('na_tech');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.conglomerateCEOs?.['na_tech']).toBeUndefined();
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Sarah Smart');

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });

    it('should log CEO replacement (dismissal and appointment) and apply penalty if the replaced CEO was high-performing', () => {
      const store = useGameStore.getState();
      const previousCEO = {
        id: 'ceo_high_loyalty',
        name: 'Sarah Loyal',
        avatar: '👔',
        competence: 50,
        loyalty: 90, // high loyalty (>= 70)
        riskTolerance: 50,
        bio: 'Loyal exec'
      };

      const newCEO = {
        id: 'ceo_new',
        name: 'Victor New',
        avatar: '👔',
        competence: 60,
        loyalty: 60,
        riskTolerance: 60,
        bio: 'New hire'
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          conglomerateCEOs: {
            'na_tech': previousCEO
          },
          conglomerateCandidates: [newCEO],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().appointConglomerateCEO('na_tech', newCEO);

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.conglomerateCEOs?.['na_tech'].name).toBe('Victor New');

      // Should have 2 biography entries: 1 for dismissal of previous, 1 for appointment of new
      expect(stateAfter.pl.biography.length).toBe(2);
      expect(stateAfter.pl.biography.some(b => b.includes('Sarah Loyal') && (b.includes('Relieved') || b.includes('Terminated') || b.includes('removal')))).toBe(true);
      expect(stateAfter.pl.biography.some(b => b.includes('Victor New') && b.includes('Appointed'))).toBe(true);

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });
  });

  describe('3. Founder Company Collapse', () => {
    it('should log biography and NOT apply penalty for a non-high-performing founder company collapse', () => {
      const store = useGameStore.getState();
      const mockFounder = {
        id: 'founder_low',
        name: 'Sam Novice',
        avatar: '💼',
        companyName: 'Novice Tech',
        pitchIdea: 'Nothing special',
        stats: { execution: 40, vision: 40, burnDiscipline: 40 } // not high performing
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          foundersBacked: [mockFounder],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().collapseFounderCompany('founder_low');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.foundersBacked.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Sam Novice');
      expect(stateAfter.pl.biography[0]).toContain('Novice Tech');
      expect(stateAfter.pl.biography[0]).toMatch(/collapse|shut down|failure/i);

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(0);
    });

    it('should log biography and apply penalty for a high-performing founder company collapse (high burnDiscipline)', () => {
      const store = useGameStore.getState();
      const mockFounder = {
        id: 'founder_high',
        name: 'Elena Smart',
        avatar: '💼',
        companyName: 'Elena AI',
        pitchIdea: 'Smarter bots',
        stats: { execution: 50, vision: 50, burnDiscipline: 80 } // high burnDiscipline (>= 70)
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          foundersBacked: [mockFounder],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().collapseFounderCompany('founder_high');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.foundersBacked.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Elena Smart');
      expect(stateAfter.pl.biography[0]).toContain('Elena AI');

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });
  });

  describe('4. Rolodex Relationship End / Lapse', () => {
    it('should log biography and NOT apply penalty for a standard celebrity relationship lapse', () => {
      const store = useGameStore.getState();
      const mockCeleb = {
        id: 'celeb_low',
        name: 'Dan Star',
        avatar: '🎬',
        relationshipScore: 40, // standard (not high performing)
        isUnlocked: true
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          rolodex: [mockCeleb],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().lapseRolodexRelationship('celeb_low');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.rolodex.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Dan Star');
      expect(stateAfter.pl.biography[0]).toMatch(/lapse|cold|ended/i);

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(0);
    });

    it('should log biography and apply penalty for a high-relationship celebrity relationship lapse', () => {
      const store = useGameStore.getState();
      const mockCeleb = {
        id: 'celeb_high',
        name: 'Gwen Superstar',
        avatar: '🎬',
        relationshipScore: 90, // high performing (>= 75)
        isUnlocked: true
      };

      useGameStore.setState({
        pl: {
          ...store.pl,
          rolodex: [mockCeleb],
          biography: [],
          recordedBioKeys: []
        }
      });

      useGameStore.getState().lapseRolodexRelationship('celeb_high');

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pl.rolodex.length).toBe(0);
      expect(stateAfter.pl.biography.length).toBe(1);
      expect(stateAfter.pl.biography[0]).toContain('Gwen Superstar');

      const loyaltyPenalty = Number(stateAfter.pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });
  });

  describe('5. Monthly Timeline Tick Collapses and Lapses', () => {
    it('should trigger founder collapse on timeline tick when burnDiscipline <= 10', () => {
      const pl = {
        ...useGameStore.getState().pl,
        foundersBacked: [
          {
            id: 'founder_tick_collapse',
            name: 'Crash Founder',
            avatar: '💼',
            companyName: 'Explosion Inc',
            pitchIdea: 'Fiery rockets',
            stats: { execution: 80, vision: 60, burnDiscipline: 10 } // high-performing execution (80) & low burnDiscipline (10)
          }
        ],
        biography: [],
        recordedBioKeys: [],
        narrativeFlags: {}
      };

      const newsFeed: string[] = [];

      // Mock random to force collapse check to pass:
      // first call (random < 0.05 for crisis): fail at 0.06
      // second call (random < 0.05 for poaching): fail at 0.06
      // third call (collapse check: Math.random() < 0.20): pass at 0.05
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.06; // skip crisis
        if (callCount === 2) return 0.06; // skip poaching
        return 0.05; // trigger collapse (0.05 < 0.20)
      };

      processEntertainmentTimelineTick(pl, newsFeed);

      expect(pl.foundersBacked.length).toBe(0);
      expect(newsFeed[0]).toContain('Explosion Inc');
      expect(newsFeed[0]).toContain('went bankrupt');
      expect(pl.biography.length).toBe(1);
      expect(pl.biography[0]).toContain('Crash Founder');

      // Re-calculate should show reputation penalty is applied because execution was 80
      const loyaltyPenalty = Number(pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(15);
    });

    it('should trigger celebrity lapse on timeline tick when relationshipScore < 20', () => {
      const pl = {
        ...useGameStore.getState().pl,
        rolodex: [
          {
            id: 'celeb_tick_lapse',
            name: 'Distant Star',
            avatar: '🎬',
            relationshipScore: 15, // < 20
            isUnlocked: true
          }
        ],
        biography: [],
        recordedBioKeys: [],
        narrativeFlags: {
          reputationLoyaltyPenalty: 0
        }
      };

      const newsFeed: string[] = [];

      // Mock random to bypass tabloid check (random < 0.08: fail at 0.10)
      Math.random = () => 0.10;

      processEntertainmentTimelineTick(pl, newsFeed);

      expect(pl.rolodex.length).toBe(0);
      expect(newsFeed[0]).toContain('Distant Star');
      expect(newsFeed[0]).toContain('ended');
      expect(pl.biography.length).toBe(1);
      expect(pl.biography[0]).toContain('Distant Star');

      // Penalty should be 0 because relationshipScore was 15 (< 75)
      const loyaltyPenalty = Number(pl.narrativeFlags?.reputationLoyaltyPenalty || 0);
      expect(loyaltyPenalty).toBe(0);
    });
  });

  describe('6. Reputation Clamping Score Caps', () => {
    it('should respect score caps and clamp "The Reformer" score at 0 even with massive loyalty penalties', () => {
      const pl = {
        ...useGameStore.getState().pl,
        narrativeFlags: {
          reputationLoyaltyPenalty: 5000 // massive penalty
        }
      };

      const scores = calculateReputationScores(pl);
      expect(scores['The Reformer']).toBe(0); // clamps at 0, no negative scores
    });
  });
});
