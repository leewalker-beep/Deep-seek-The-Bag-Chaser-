import { describe, it, expect, vi } from 'vitest';
import { evolveWorldNPCs } from '../utils/narrativeEngine';
import type { PersistentNPC } from '../types/game';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { triggerMonthlyNarrativeEvent } from '../engine/eventEngine';
import { useGameStore } from '../store/gameStore';

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

  describe('Patch 34: triggerMonthlyNarrativeEvent', () => {
    it('should trigger corporate sabotage if rival is present and player is in CORPORATE tier', () => {
      const player = getInitialStats(3, undefined, undefined, undefined, []);
      player.currentTier = 'CORPORATE';
      player.npcs = [
        {
          id: 'rival_1',
          name: 'Bitter Enemy',
          avatar: '👺',
          reputation: 50,
          disposition: -45, // <= -40
          currentRole: 'RIVAL',
          interactionLog: [],
          originHustleId: 'music_label_studio'
        }
      ];

      const event = triggerMonthlyNarrativeEvent(player);
      expect(event.title).toBe("🚨 CORPORATE SABOTAGE");
      expect(event.description).toContain("Bitter Enemy");
      expect(event.description).toContain("studio");

      // Test effect
      let cash = player.bag;
      let heat = player.heat;
      const mockState = {
        updateCash: (amount: number) => { cash += amount; },
        updateHeat: (amount: number) => { heat += amount; }
      };
      event.effect(mockState);
      expect(cash).toBe(player.bag - 75000);
      expect(heat).toBe(player.heat + 20);
    });

    it('should trigger campaign boost if political ally is present and player is in ELITE tier', () => {
      const player = getInitialStats(3, undefined, undefined, undefined, []);
      player.currentTier = 'ELITE';
      player.npcs = [
        {
          id: 'ally_1',
          name: 'Loyal Companion',
          avatar: '🌟',
          reputation: 80,
          disposition: 85, // >= 75
          currentRole: 'POLITICAL_RUNNING_MATE',
          interactionLog: [],
          originAge: 18
        }
      ];

      const event = triggerMonthlyNarrativeEvent(player);
      expect(event.title).toBe("🗳️ THE TICKET IS LOCKED");
      expect(event.description).toContain("Loyal Companion");
      expect(event.description).toContain("age 18");

      // Test effect
      let clout = player.clout;
      let aura = player.aura;
      const mockState = {
        updateClout: (amount: number) => { clout += amount; },
        updateAura: (amount: number) => { aura += amount; }
      };
      event.effect(mockState);
      expect(clout).toBe(player.clout + 5000);
      expect(aura).toBe(player.aura + 500);
    });

    it('should fall back to market correction under generic conditions', () => {
      const player = getInitialStats(3, undefined, undefined, undefined, []);
      player.currentTier = 'STREET';
      player.npcs = [];

      const event = triggerMonthlyNarrativeEvent(player);
      expect(event.title).toBe("📈 MARKET CORRECTION");

      // Test effect
      let cash = player.bag;
      const mockState = {
        updateCash: (amount: number) => { cash += amount; }
      };
      event.effect(mockState);
      expect(cash).toBe(player.bag + 15000);
    });

    it('should integrate with advanceMonth and apply effects to player state', () => {
      const player = getInitialStats(3, undefined, undefined, undefined, []);
      player.currentTier = 'CORPORATE';
      player.npcs = [
        {
          id: 'rival_1',
          name: 'Bitter Enemy',
          avatar: '👺',
          reputation: 50,
          disposition: -50,
          currentRole: 'RIVAL',
          interactionLog: [],
          originHustleId: 'music_label_studio'
        }
      ];
      player.bag = 100000;
      player.heat = 10;

      const result = advanceMonth(player, 'NORMAL');

      // Since it's corporate sabotage, player should lose $75k and gain 20 heat.
      // Note: Rent for CORPORATE tier is $20000. So final bag should reflect both rent and corporate sabotage.
      // Starting bag: 100000
      // Sabotage: -75000
      // Rent: -20000
      // Passive: 0
      // Expected bag: 100000 - 75000 - 20000 = 5000
      expect(result.newPl.bag).toBe(5000);
      expect(result.newPl.heat).toBe(20); // 10 starting + 20 from sabotage - 10 heat decay

      const newsTexts = result.news.map(n => typeof n === 'string' ? n : n.text);
      expect(newsTexts.some(text => text.includes("🚨 CORPORATE SABOTAGE"))).toBe(true);
    });

    describe('Patch 35: advanceMonthAction', () => {
      it('should execute advanceMonthAction to trigger narrative events directly on game state and populate UI feeds', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const player = getInitialStats(3, undefined, undefined, undefined, []);
        player.currentTier = 'CORPORATE';
        player.npcs = [
          {
            id: 'rival_1',
            name: 'Bitter Enemy',
            avatar: '👺',
            reputation: 50,
            disposition: -50,
            currentRole: 'RIVAL',
            interactionLog: [],
            originHustleId: 'music_label_studio'
          }
        ];
        player.bag = 200000;
        player.heat = 10;
        player.month = 12;

        useGameStore.setState({
          pl: player,
          player: player,
          currentMarket: 'NORMAL',
          news: [],
          newsFeed: []
        });

        const { advanceMonthAction } = useGameStore.getState();
        expect(advanceMonthAction).toBeDefined();

        advanceMonthAction();

        const updatedPl = useGameStore.getState().pl;
        const updatedPlayer = useGameStore.getState().player;
        const newsFeed = useGameStore.getState().newsFeed;
        const activeModalEvent = useGameStore.getState().activeModalEvent;

        // Sabotage event: -$75,000 cash, +20 heat
        // Corporate Tier Rent: -$20,000
        // Net cash: 200000 - 75000 - 20000 = 105000
        // Net heat: 10 + 20 - 10 heat decay = 20
        expect(updatedPl.bag).toBe(105000);
        expect(updatedPl.heat).toBe(20);

        // Verify player and pl are kept in sync
        expect(updatedPlayer).toBeDefined();
        expect(updatedPlayer?.bag).toBe(105000);
        expect(updatedPlayer?.cash).toBe(105000);

        // Verify UI notification feed
        expect(newsFeed).toBeDefined();
        expect(newsFeed!.length).toBeGreaterThan(0);
        expect(newsFeed![0].title).toBe("🚨 CORPORATE SABOTAGE");
        expect(newsFeed![0].text).toContain("Bitter Enemy");
        expect(newsFeed![0].type).toBe("ALERT");
        expect(newsFeed![0].timestamp).toBe("19Y 1M");

        // Verify modal state is populated
        expect(activeModalEvent).toBeDefined();
        expect(activeModalEvent?.title).toBe("🚨 CORPORATE SABOTAGE");

        randomSpy.mockRestore();
      });
    });
  });
});
