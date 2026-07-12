import type { PersistentNPC, Tier } from '../types/game';

/**
 * Simulates characters climbing their own career ladders alongside the player
 * and updates relationship metrics over time.
 */
export const evolveWorldNPCs = (
  npcs: PersistentNPC[],
  playerAge: string,
  playerTier: Tier
): PersistentNPC[] => {
  return npcs.map(npc => {
    let newDisposition = npc.disposition;
    let newReputation = npc.reputation;
    let newRole = npc.currentRole;

    // Create a new copy of the interaction log to avoid direct state mutation
    const newInteractionLog = [...(npc.interactionLog || [])];

    // 1. Natural Relationship Drift
    // If they hate you, their grudge deepens. If they love you, loyalty stabilizes.
    if (npc.disposition < -20) newDisposition = Math.max(-100, npc.disposition - 1);
    if (npc.disposition > 50) newDisposition = Math.min(100, npc.disposition + 1);

    // 2. City Reputation Scaling
    if (Math.random() > 0.75) {
      newReputation = Math.min(100, npc.reputation + 1);
    }

    // 3. Career Path Evolution Matrices
    if (npc.currentRole === 'STREET_INTERN' && Math.random() > 0.85) {
      // An old deli helper or street contact strikes out on their own
      newRole = 'CREATOR';
      newInteractionLog.push(`EVOLVED_TO_CREATOR_AT_${playerAge}`);
    } else if (npc.currentRole === 'CREATOR' && (playerTier === 'CORPORATE' || playerTier === 'ELITE' || playerTier === 'MOGUL' || playerTier === 'PRESIDENT') && npc.disposition > 40) {
      // A friendly podcaster guest leverages your clout to enter the corporate world
      newRole = 'BOARD_DIRECTOR';
      newInteractionLog.push(`EVOLVED_TO_BOARD_DIRECTOR_AT_${playerAge}`);
    } else if (npc.currentRole === 'BOARD_DIRECTOR' && (playerTier === 'ELITE' || playerTier === 'MOGUL' || playerTier === 'PRESIDENT') && npc.disposition > 75) {
      // Your closest high-tier ally scales up to become a potential running mate
      newRole = 'POLITICAL_RUNNING_MATE';
      newInteractionLog.push(`EVOLVED_TO_RUNNING_MATE_AT_${playerAge}`);
    } else if (npc.currentRole === 'CREATOR' && npc.disposition < -40 && Math.random() > 0.9) {
      // A bitter podcast rival scales up into a systemic corporate threat
      newRole = 'RIVAL';
      newInteractionLog.push(`EVOLVED_TO_RIVAL_THREAT_AT_${playerAge}`);
    }

    return {
      ...npc,
      disposition: newDisposition,
      reputation: newReputation,
      currentRole: newRole,
      interactionLog: newInteractionLog
    };
  });
};
