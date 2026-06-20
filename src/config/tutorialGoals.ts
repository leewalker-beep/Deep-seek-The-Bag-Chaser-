export interface TutorialGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  statType: 'bag' | 'clout' | 'aura' | 'mentalHealth' | 'currentTier';
  explanationTitle: string;
  explanationContent: string;
  recommendHustleId?: string;
}

export const TUTORIAL_GOALS: TutorialGoal[] = [
  {
    id: 'first_bag',
    title: 'The First Dollar',
    description: 'Hustle Delivery Gigs to earn your first $100.',
    targetValue: 100,
    statType: 'bag',
    explanationTitle: 'Bag Explained',
    explanationContent: "This is your BAG. It represents your liquid cash. Use it to buy upgrades, purchase assets, and fund your rise to power. Be careful—running out of cash while having high debt or expenses can end your run.",
    recommendHustleId: 'r_delivery',
  },
  {
    id: 'clout_basics',
    title: 'Building Reputation',
    description: 'Use Content Creation to reach 10 Clout.',
    targetValue: 10,
    statType: 'clout',
    explanationTitle: 'Clout Explained',
    explanationContent: "CLOUT is your social standing and influence. High clout unlocks more lucrative hustles and is required to advance to higher tiers. In the later game, clout becomes your primary political capital.",
    recommendHustleId: 'cc',
  },
  {
    id: 'aura_vibe',
    title: 'The Vibe Check',
    description: 'Enter Ghost Mode to earn 5 Aura.',
    targetValue: 5,
    statType: 'aura',
    explanationTitle: 'Aura Explained',
    explanationContent: "AURA represents your street cred and intangible 'vibe.' Some operations require a high aura to even attempt. It acts as a gatekeeper for the more specialized or high-stakes paths in the game.",
    recommendHustleId: 'r_ghost_mode',
  },
  {
    id: 'mental_health',
    title: 'Mental Fortitude',
    description: 'The grind takes a toll. Use Rest & Recover to reach 100% Mental Health.',
    targetValue: 100,
    statType: 'mentalHealth',
    explanationTitle: 'Health & Heat',
    explanationContent: "MENTAL HEALTH is your most vital resource. If it hits 0%, you burn out and the game ends. HEAT represents police attention—keep it low to avoid raids. Balance the grind with rest to survive.",
    recommendHustleId: 'r_sleep',
  },
  {
    id: 'advance_mud',
    title: 'Leaving the Mud',
    description: 'Accumulate $500 and Advance to the STREET tier.',
    targetValue: 1, // Represents index in PROGRESSION_ORDER (STREET)
    statType: 'currentTier',
    explanationTitle: 'Tiers & Progression',
    explanationContent: "Advancing to a new TIER resets some stats but unlocks a whole new world of opportunities. Each tier brings higher risks and much higher rewards. You're now on your way to becoming a Mogul.",
  },
];
