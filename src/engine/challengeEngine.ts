import type { PlayerStats, DailyChallenge, Tier, MarketType } from '../types/game';
import { WORLD_EVENTS } from '../config/worldEvents';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';

export interface ChallengeTemplate {
  id: string;
  type: string;
  descriptionTemplate: string;
  baseTarget: number;
  rewardMult: number;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'hustle_count',
    type: 'hustle_count',
    descriptionTemplate: 'Complete {target} hustles',
    baseTarget: 5,
    rewardMult: 1000,
  },
  {
    id: 'earn_cash',
    type: 'earn_cash',
    descriptionTemplate: 'Earn ${target} in hustle yields',
    baseTarget: 25000,
    rewardMult: 0.2,
  },
  {
    id: 'clout_gain',
    type: 'clout_gain',
    descriptionTemplate: 'Gain {target} Clout',
    baseTarget: 50,
    rewardMult: 100,
  },
  {
    id: 'aura_gain',
    type: 'aura_gain',
    descriptionTemplate: 'Gain {target} Aura',
    baseTarget: 50,
    rewardMult: 100,
  },
  {
    id: 'big_win',
    type: 'big_win',
    descriptionTemplate: 'Get {target} Big Win(s)',
    baseTarget: 1,
    rewardMult: 5000,
  },
];

export const generateDynamicChallenges = (
  pl: PlayerStats,
  currentMarket: MarketType
): DailyChallenge[] => {
  const tierMultiplier = {
    MUD: 1,
    STREET: 5,
    STARTUP: 25,
    CORPORATE: 100,
    ELITE: 500,
    MOGUL: 2500,
    PRESIDENT: 10000,
    OPEN: 5000,
  }[pl.currentTier] || 1;

  // Economy impact on targets
  const market = MARKET_CONFIGS[currentMarket];
  const economyTargetMult = 1 / market.yieldMultiplier;

  // World Event impact
  let worldEventTargetMult = 1;
  if (pl.activeWorldEvent) {
    const event = WORLD_EVENTS.find(e => e.id === pl.activeWorldEvent?.eventId);
    if (event?.id === 'recession') worldEventTargetMult = 1.2;
    if (event?.id === 'economic_boom') worldEventTargetMult = 0.8;
  }

  // Influence challenge weighting based on world state
  const weightedTemplates = [...CHALLENGE_TEMPLATES].map(t => {
    let weight = 1.0;
    if (pl.activeWorldEvent) {
      const eventId = pl.activeWorldEvent.eventId;
      if (eventId === 'ai_bubble' && t.type === 'earn_cash') weight = 2.0;
      if (eventId === 'market_crash' && t.type === 'big_win') weight = 0.5;
      if (eventId === 'election_year' && t.type === 'aura_gain') weight = 2.0;
    }
    if (currentMarket === 'BULL_MARKET' && t.type === 'big_win') weight = 2.0;
    if (currentMarket === 'CRACKDOWN' && t.type === 'hustle_count') weight = 1.5;

    return { ...t, weight };
  });

  const selectedTemplates: ChallengeTemplate[] = [];
  const pool = [...weightedTemplates] as Array<ChallengeTemplate & { weight: number }>;

  for (let i = 0; i < 3; i++) {
    const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    for (let j = 0; j < pool.length; j++) {
      if (random < pool[j].weight) {
        selectedTemplates.push(pool.splice(j, 1)[0]);
        break;
      }
      random -= pool[j].weight;
    }
  }

  return selectedTemplates.map(template => {
    let target = template.baseTarget;

    if (template.type === 'hustle_count') {
      const hustleScales: Record<Tier, number> = {
        MUD: 1, STREET: 1.5, STARTUP: 2, CORPORATE: 3, ELITE: 4, MOGUL: 5, PRESIDENT: 6, OPEN: 4
      };
      target = Math.floor(template.baseTarget * (hustleScales[pl.currentTier] || 1));
    } else if (template.type === 'earn_cash') {
      target *= tierMultiplier;
      target *= economyTargetMult * worldEventTargetMult;
      const netWorthScale = Math.min(10, Math.max(1, Math.log10(Math.max(1000, pl.bag)) - 2));
      target *= netWorthScale;
    } else {
      target *= tierMultiplier;
    }

    target = Math.floor(target);
    if (target === 0) target = 1;

    // Proportional Reward Calculation
    // Target approximately 5–7% of the next tier advancement fee for completing all 3 challenges.
    // Each challenge contributes ~2% to reach ~6% total.
    const nextTier = PROGRESSION_ORDER[PROGRESSION_ORDER.indexOf(pl.currentTier) + 1] || 'OPEN';
    const advancementFee = TIER_REQUIREMENTS[nextTier as Tier]?.fee || TIER_REQUIREMENTS.STREET.fee;
    const baseRewardPool = advancementFee * 0.008;

    let rewardCash = 0;
    if (template.type === 'earn_cash') {
      rewardCash = Math.floor(baseRewardPool * 1.1); // Slightly higher for cash goals
    } else if (template.type === 'hustle_count') {
      rewardCash = Math.floor(baseRewardPool * 1.0);
    } else {
      rewardCash = Math.floor(baseRewardPool * 0.9);
    }

    const estimatedMonthlyIncome = pl.lastPassiveBreakdown?.finalTotal || advancementFee / 20;
    rewardCash = Math.min(rewardCash, estimatedMonthlyIncome * 2);

    return {
      id: `${pl.currentTier.toLowerCase()}_${template.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: template.type,
      description: template.descriptionTemplate.replace('{target}', target.toLocaleString()),
      target,
      current: 0,
      isCompleted: false,
      reward: {
        cash: rewardCash,
        aura: Math.floor(10 * (1 + Math.log10(tierMultiplier))),
      }
    };
  });
};
