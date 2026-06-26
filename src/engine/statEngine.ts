import type { PlayerStats } from '../types/game';
import { getTierMax } from '../config/tiers';

export const enforceStatCaps = (pl: PlayerStats): PlayerStats => {
  const { clout: maxClout, aura: maxAura } = getTierMax(pl.currentTier);
  const maxMental = 100;
  const maxHeat = 100;

  // Emergency recovery for corrupted aura
  let currentAura = pl.aura;
  if (currentAura > 1000000) {
    currentAura = maxAura;
  }

  const excessClout = Math.max(0, pl.clout - maxClout);
  const excessAura = Math.max(0, currentAura - maxAura);
  const overflowBagBonus = Math.floor((excessClout + excessAura) * 0.1);

  // Ensure rival system fields exist for save compatibility
  const rivals = pl.rivals || [];
  const rivalThreats = pl.rivalThreats || {};
  const activeChallenges = pl.activeChallenges || [];
  const marketLeaderTiers = pl.marketLeaderTiers || [];

  const finalClout = Math.floor(Math.max(0, Math.min(pl.clout, maxClout)));
  const finalAura = Math.floor(Math.max(0, Math.min(currentAura, maxAura)));
  return {
    ...pl,
    rivals,
    rivalThreats,
    activeChallenges,
    marketLeaderTiers,
    bag: pl.bag + overflowBagBonus,
    clout: finalClout,
    aura: finalAura,
    congressSupport: Math.max(0, Math.min(100, pl.congressSupport || 0)),
    approvalRating: Math.max(pl.approvalFloor || 0, Math.min(100, pl.approvalRating)),
    mentalHealth: Math.floor(Math.max(0, Math.min(pl.mentalHealth, maxMental))),
    heat: Math.floor(Math.max(0, Math.min(pl.heat, maxHeat))),
    mentalShieldTurns: Math.floor(Math.max(0, pl.mentalShieldTurns || 0)),
  };
};
