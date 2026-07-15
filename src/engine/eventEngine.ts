import type { PersistentNPC } from '../types/game';

export const triggerMonthlyNarrativeEvent = (player: any) => {
  const npcs: PersistentNPC[] = player.npcs || [];

  // 1. Scan for high-consequence entities in the active Zustand store
  const activeRival = npcs.find(n => n.disposition <= -40);
  const activeAlly = npcs.find(n => n.currentRole === 'POLITICAL_RUNNING_MATE' && n.disposition >= 75);

  // 2. Intercept Event Pool if narrative triggers are satisfied
  if (activeRival && player.currentTier === 'CORPORATE') {
    return {
      id: `evt_rival_attack_${Date.now()}`,
      title: "🚨 CORPORATE SABOTAGE",
      description: `${activeRival.name} (${activeRival.avatar}), who remembers your humble beginnings back at the ${activeRival.originHustleId === 'music_label_studio' ? 'studio' : 'streets'}, has leaked altered financial books to short-sellers!`,
      effect: (state: any) => {
        // Adjust values directly against your clean Zustand state mutators
        state.updateBag(-75000);
        state.updateHeat(20);
      }
    };
  }

  if (activeAlly && player.currentTier === 'ELITE') {
    const reputation = player.narrativeFlags?.publicReputation || "The Hustler";
    return {
      id: `evt_campaign_boost_${Date.now()}`,
      title: "🗳️ THE TICKET IS LOCKED",
      description: `Your longtime partner ${activeAlly.name} (${activeAlly.avatar}) addresses the press: "I watched this ${reputation.toLowerCase()} balance cash registers at age ${activeAlly.originAge}. There is no one else I trust to run this city." Clout multipliers surging!`,
      effect: (state: any) => {
        state.updateClout(5000);
        state.updateAura(500);
      }
    };
  }

  // 3. Fallback to standard generic baseline events if no deep story blocks match
  return {
    id: `evt_generic_market_${Date.now()}`,
    title: "📈 MARKET CORRECTION",
    description: "Standard macroeconomic cyclical adjustments apply to your active retail holdings.",
    effect: (state: any) => {
      state.updateBag(15000);
    }
  };
};
