import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { checkAndGenerateChoiceModal } from '../engine/legacyStoryEvents';
import type { PlayerStats, PersistentNPC } from '../types/game';

describe('Legacy Story Events & Branching Choice Modal (Patch 36)', () => {
  beforeEach(() => {
    // Explicitly restore mocks and clear store state to prevent leakage
    vi.restoreAllMocks();
    useGameStore.getState().resetGame('street_kid', 3, 'street_kid', 'sk_scrap');
  });

  it('should return null if no deli grudge NPC exists or player is not in STARTUP tier', () => {
    const pl = useGameStore.getState().pl;

    // No NPCs, Mud tier
    let modal = checkAndGenerateChoiceModal(pl);
    expect(modal).toBeNull();

    // With NPC, but still Mud tier
    const testNpc: PersistentNPC = {
      id: 'deli_contact_1',
      name: 'Salty Sam',
      avatar: '👨‍🍳',
      reputation: 15,
      disposition: -30,
      currentRole: 'CREATOR',
      originHustleId: 'unique_hustle_deli',
      originAge: 18,
      interactionLog: []
    };

    const updatedPl: PlayerStats = {
      ...pl,
      npcs: [testNpc],
      currentTier: 'MUD'
    };

    modal = checkAndGenerateChoiceModal(updatedPl);
    expect(modal).toBeNull();
  });

  it('should generate a choice modal if a deli grudge NPC exists and player is in STARTUP tier', () => {
    const pl = useGameStore.getState().pl;

    const testNpc: PersistentNPC = {
      id: 'deli_contact_1',
      name: 'Salty Sam',
      avatar: '👨‍🍳',
      reputation: 15,
      disposition: -30,
      currentRole: 'CREATOR',
      originHustleId: 'unique_hustle_deli',
      originAge: 18,
      interactionLog: []
    };

    const updatedPl: PlayerStats = {
      ...pl,
      npcs: [testNpc],
      currentTier: 'STARTUP'
    };

    const modal = checkAndGenerateChoiceModal(updatedPl);
    expect(modal).not.toBeNull();
    expect(modal!.title).toBe("🕵️‍♂️ GHOSTS FROM THE DELI");
    expect(modal!.speaker).toBe("Salty Sam");
    expect(modal!.options.length).toBe(3);
  });

  it('should resolve Option 1 (Pay the Hush Money) successfully', () => {
    // Mock Math.random to prevent random events/heat decay variation/rival behavior
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const pl = useGameStore.getState().pl;
    const testNpc: PersistentNPC = {
      id: 'deli_contact_1',
      name: 'Salty Sam',
      avatar: '👨‍🍳',
      reputation: 15,
      disposition: -30,
      currentRole: 'CREATOR',
      originHustleId: 'unique_hustle_deli',
      originAge: 18,
      interactionLog: []
    };

    const customizedPlayer = {
      ...pl,
      npcs: [testNpc],
      currentTier: 'STARTUP' as const,
      bag: 100000,
      cash: 100000,
      clout: 100,
      aura: 100,
      heat: 20
    };

    useGameStore.setState({
      pl: customizedPlayer,
      player: customizedPlayer
    });

    // Trigger monthly advancement to set the active modal
    const { advanceMonthAction, resolveInteractiveStoryEvent } = useGameStore.getState();
    advanceMonthAction();

    const activeModal = useGameStore.getState().activeModalEvent;
    expect(activeModal).not.toBeNull();
    expect(activeModal.title).toBe("🕵️‍♂️ GHOSTS FROM THE DELI");

    // Resolve Choice index 0 (Pay)
    resolveInteractiveStoryEvent(0);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.bag).toBe(70000); // 100,000 - 25,000 - 5,000 rent
    expect(updatedPl.heat).toBe(0); // 20 - 10 (decay) - 10 (hush pay effect)
    const targetNpc = updatedPl.npcs?.find(n => n.id === 'deli_contact_1');
    expect(targetNpc!.disposition).toBe(20);

    randomSpy.mockRestore();
  });

  it('should resolve Option 2 (Record Confrontation) successfully', () => {
    // Mock Math.random to prevent random events/heat decay variation/rival behavior
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const pl = useGameStore.getState().pl;
    const testNpc: PersistentNPC = {
      id: 'deli_contact_1',
      name: 'Salty Sam',
      avatar: '👨‍🍳',
      reputation: 15,
      disposition: -30,
      currentRole: 'CREATOR',
      originHustleId: 'unique_hustle_deli',
      originAge: 18,
      interactionLog: []
    };

    const customizedPlayer = {
      ...pl,
      npcs: [testNpc],
      currentTier: 'STARTUP' as const,
      bag: 100000,
      cash: 100000,
      clout: 100,
      aura: 100,
      heat: 10
    };

    useGameStore.setState({
      pl: customizedPlayer,
      player: customizedPlayer
    });

    const { advanceMonthAction, resolveInteractiveStoryEvent } = useGameStore.getState();
    advanceMonthAction();

    // Resolve Choice index 1 (Record for Podcast)
    resolveInteractiveStoryEvent(1);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.clout).toBe(1100); // 100 + 1000
    expect(updatedPl.heat).toBe(25); // 10 - 10 (decay) + 25 (podcast effect)
    const targetNpc = updatedPl.npcs?.find(n => n.id === 'deli_contact_1');
    expect(targetNpc!.disposition).toBe(-100);
    expect(targetNpc!.interactionLog).toContain('EXPOSED_ON_PODCAST');

    randomSpy.mockRestore();
  });

  it('should resolve Option 3 (Have Security Throw Them Out) successfully', () => {
    // Mock Math.random to prevent random events/heat decay variation/rival behavior
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const pl = useGameStore.getState().pl;
    const testNpc: PersistentNPC = {
      id: 'deli_contact_1',
      name: 'Salty Sam',
      avatar: '👨‍🍳',
      reputation: 15,
      disposition: -30,
      currentRole: 'CREATOR',
      originHustleId: 'unique_hustle_deli',
      originAge: 18,
      interactionLog: []
    };

    const customizedPlayer = {
      ...pl,
      npcs: [testNpc],
      currentTier: 'STARTUP' as const,
      bag: 100000,
      cash: 100000,
      clout: 100,
      aura: 500,
      heat: 0,
      rivals: [] // Clear rivals to prevent dominant rival Aura erosion
    };

    useGameStore.setState({
      pl: customizedPlayer,
      player: customizedPlayer
    });

    const { advanceMonthAction, resolveInteractiveStoryEvent } = useGameStore.getState();
    advanceMonthAction();

    // Resolve Choice index 2 (Security)
    resolveInteractiveStoryEvent(2);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.aura).toBe(400); // 500 - 100
    const targetNpc = updatedPl.npcs?.find(n => n.id === 'deli_contact_1');
    expect(targetNpc!.interactionLog).toContain('THROWN_OUT_BY_SECURITY');

    randomSpy.mockRestore();
  });
});
