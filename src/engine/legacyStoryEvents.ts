import type { PersistentNPC } from '../types/game';

export interface EventOption {
  text: string;
  effect: (state: any) => void;
  requirementCheck?: (player: any) => boolean;
}

export interface InteractiveStoryModal {
  id: string;
  title: string;
  avatar: string;
  speaker: string;
  contextMessage: string;
  options: EventOption[];
}

export const checkAndGenerateChoiceModal = (player: any): InteractiveStoryModal | null => {
  const npcs: PersistentNPC[] = player.npcs || [];

  // 1. Target an old contact from your very first street/deli tier who now feels slighted
  const deliGrudgeNPC = npcs.find(n => n.originHustleId === 'unique_hustle_deli' && n.disposition < 0);

  if (deliGrudgeNPC && player.currentTier === 'STARTUP') {
    return {
      id: `choice_deli_blackmail_${Date.now()}`,
      title: "🕵️‍♂️ GHOSTS FROM THE DELI",
      speaker: deliGrudgeNPC.name,
      avatar: deliGrudgeNPC.avatar,
      contextMessage: `"Look at you now, a big-shot tech founder," ${deliGrudgeNPC.name} sneers, turning up at your office lobby. "I remember when you were cleaning bathrooms and dropping greasy sandwich wrappers at the Family Deli back when you were ${deliGrudgeNPC.originAge || 18}. Pay me a $25k consulting fee to keep your 'humble beginnings' out of the tech blogs, or I start talking."`,
      options: [
        {
          text: "💵 Pay the Hush Money (-$25,000, -10 Heat)",
          requirementCheck: (p) => p.cash >= 25000 || p.bag >= 25000,
          effect: (state) => {
            state.updateCash(-25000);
            state.updateHeat(-10);
            // Access the target NPC via store state lookup to settle the score
            const target = state.player.npcs.find((n: any) => n.id === deliGrudgeNPC.id);
            if (target) target.disposition = 20; // Grudge resolved temporarily
          }
        },
        {
          text: "🎙️ Record the Confrontation for Your Podcast (+1,000 Clout, +25 Heat)",
          effect: (state) => {
            state.updateClout(1000);
            state.updateHeat(25);
            const target = state.player.npcs.find((n: any) => n.id === deliGrudgeNPC.id);
            if (target) {
              target.disposition = -100; // Become an arch-nemesis
              target.interactionLog.push('EXPOSED_ON_PODCAST');
            }
          }
        },
        {
          text: "🚪 Have Security Throw Them Out (-100 Aura, No Financial Impact)",
          effect: (state) => {
            state.updateAura(-100);
            const target = state.player.npcs.find((n: any) => n.id === deliGrudgeNPC.id);
            if (target) target.interactionLog.push('THROWN_OUT_BY_SECURITY');
          }
        }
      ]
    };
  }

  return null;
};
