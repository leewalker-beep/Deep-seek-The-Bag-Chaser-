import type { StateCreator } from 'zustand';
import type { GameState, GameAction, Tier, GameEventType, Challenge, GameEventMetadata, TickerMessage, SpecialEventMetadata, Founder, RegionalExecutive, PlayerStats } from '../../types/game';

const FOUNDER_FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Sam", "Jamie", "Robin", "Drew", "Skyler"];
const FOUNDER_LAST_NAMES = ["Chen", "Smith", "Altman", "Musk", "Jobs", "Wozniak", "Thiel", "Horowitz", "Andreessen", "Page"];
const COMPANY_PREFIXES = ["Quantum", "Cyber", "Bio", "Neuro", "Opti", "Apex", "Synapse", "Aether", "Omni", "Vortex"];
const COMPANY_SUFFIXES = ["AI", "Tech", "Labs", "Systems", "Solutions", "Dynamics", "Networks", "Genetics", "Robotics"];
const PITCH_IDEAS = [
  "Decentralized cloud computing platform for autonomous drones.",
  "AI-powered medical diagnostics utilizing bio-feedback sensors.",
  "Next-generation solid-state battery tech for electric vehicles.",
  "Neuro-link interface for seamless virtual reality immersion.",
  "Algae-based sustainable protein synthesis and distribution.",
  "Predictive quantum algorithms for global supply chain optimization.",
  "Automated micro-retail storefronts utilizing robotic sorting.",
  "Carbon-negative synthetic building materials from atmospheric CO2."
];
const FOUNDER_AVATARS = ["👓", "🧠", "💻", "🚀", "🕶️", "💼", "🤖", "👔"];
import { HUSTLES, type HustleLevel } from '../../config/hustles/base';
import { MARKET_CONFIGS } from '../../config/marketConfig';
import { CHARACTERS } from '../../config/characters';
import { getRivalAvatarId } from '../../config/avatars';
import { getRivalRosterProfile, isRivalEligibleForRecruit } from '../../utils/rivalUtils';
import { calculateHustleMath, calculateFlexBonuses, applyFlexBonuses } from '../../engine/mathEngine';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../../config/tiers';
import { HUSTLE_BADGES } from '../../config/badges';
import { enforceStatCaps } from '../../engine/statEngine';
import { advanceMonth, checkDeathConditions, processEntertainmentTimelineTick } from '../../engine/advancementEngine';
import { DEATH_MESSAGES } from '../../config/deathMessages';
import { checkAndGenerateChoiceModal } from '../../engine/legacyStoryEvents';

export { processEntertainmentTimelineTick };
import { getDominantStat } from '../../utils/endingUtils';
import { getEnding } from '../../config/endings';
import { showConfetti } from '../../components/effects/Confetti';
import { FLEX_ASSETS } from '../../config/flexAssets';
import { getUnlockedHustles, getInitialStats } from '../initialState';
import { executeHustleAction, type HustleExecutionResult } from '../../engine/hustleEngine';
import { checkAchievements } from '../../engine/achievementEngine';
import { recordHistoryEvent } from '../../engine/historyEngine';
import { applyReputationLossScale } from '../../engine/reputationEngine';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import { backupSave } from '../../utils/saveUtils';
import { SPECIALIZATIONS } from '../../config/specializations';
import { GAME_CONSTANTS } from '../../config/gameConstants';
import { NARRATIVE_EVENTS } from '../../config/narrativeEvents';
import * as Bio from '../../engine/biographyEngine';
import { BACKGROUNDS } from '../../config/backgrounds';
import { processWorldReaction } from '../../engine/reactiveWorldEngine';



export interface HustleSlice {
  unlockedHustles: Record<string, boolean>;
  advanceMonthAction?: () => void;

  executeHustle: (hustleId: string, minigameMultiplier?: number, forceSuccess?: boolean) => HustleExecutionResult;
  executeHustleWithTimelineTick: (hustleId: string, branchId: string) => { success: boolean; message: string };
  executeBranch: (hustleId: string, branchId: string) => { success: boolean; message: string };
  upgradeHustle: (hustleId: string, branchId?: string) => boolean;
  advanceTier: () => boolean;
  serveMonth: () => void;
  selectSpecialization: (specializationId: string) => void;
  purchaseFlexAsset: (assetId: string) => boolean;
  retaliateRival: (rivalId: string) => boolean;
  sabotageRival: (rivalId: string) => void;
  counterBid: (rivalId: string) => void;
  recruitRival: (rivalId: string) => boolean;
  resolveNarrativeEvent: (choiceId: string) => void;
  resolveInteractiveStoryEvent: (choiceIndex: number) => void;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  logEvent: (type: GameEventType, metadata?: GameEventMetadata) => void;
  registerAdvice: (insights: any[]) => void;
  triggerSetback: () => void;
  checkMilestones: () => void;
  resetGame: (
    backgroundId?: string,
    difficulty?: 1 | 2 | 3,
    categoryId?: string,
    variationId?: string,
    avatarId?: string,
    prologueStats?: {
      bag: number;
      clout: number;
      aura: number;
      biography: string[];
      recordedBioKeys: string[];
      hustlePlays: Record<string, number>;
      totalHustlesCompleted: number;
      actionLog: any[];
    }
  ) => void;
}

export const createHustleSlice: StateCreator<GameState, [], [], HustleSlice> = (set, get) => ({
  unlockedHustles: getUnlockedHustles(3, []),

  resetGame: (backgroundId, difficulty = 3, categoryId, variationId, avatarId, prologueStats) => {
    const currentState = get();
    const persistentStats = {
      totalChallengesCompleted: currentState.pl.totalChallengesCompleted || 0,
      collectedDeathBadges: currentState.pl.collectedDeathBadges || [],
      deathCount: currentState.pl.deathCount || 0,
      tierBadges: currentState.pl.tierBadges || [],
      tierStats: currentState.pl.tierStats || {},
      hustlePlays: currentState.pl.hustlePlays || {},
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('bag-chaser-save');
    }

    const newPl = enforceStatCaps(getInitialStats(difficulty, backgroundId, categoryId, variationId, currentState.unlockedLegacyUpgradeIds));
    newPl.avatarId = avatarId || 'av_m1';

    if (!newPl.endgameTracks) {
      newPl.endgameTracks = {
        realEstateAcquisitions: [],
        globalFleetCount: 0,
        automatedHustleIds: [],
        techStartupValuation: 1000
      };
    }

    newPl.backgroundId = backgroundId || newPl.backgroundId;
    newPl.categoryId = categoryId || newPl.categoryId;
    newPl.variationId = variationId || newPl.variationId;

    const background = BACKGROUNDS.find(b => b.id === backgroundId);
    if (background) {
      const bioUpdate = Bio.recordOrigin(newPl, background.name, newPl.currentTier);
      if (bioUpdate) {
        newPl.biography = [bioUpdate.entry];
        newPl.recordedBioKeys = [bioUpdate.key!];
      }
    }

    if (prologueStats) {
      newPl.bag += prologueStats.bag;
      newPl.clout += prologueStats.clout;
      newPl.aura += prologueStats.aura;
      newPl.biography = [...(newPl.biography || []), ...prologueStats.biography];
      newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), ...prologueStats.recordedBioKeys];
      newPl.hustlePlays = { ...newPl.hustlePlays, ...prologueStats.hustlePlays };
      newPl.totalHustlesCompleted += prologueStats.totalHustlesCompleted;
      newPl.actionLog = [...prologueStats.actionLog, ...(newPl.actionLog || [])];
      newPl.month = 1;
      newPl.isTutorialSkipped = true;
    }

    newPl.totalChallengesCompleted = persistentStats.totalChallengesCompleted;
    newPl.collectedDeathBadges = persistentStats.collectedDeathBadges;
    newPl.deathCount = persistentStats.deathCount;
    newPl.tierBadges = persistentStats.tierBadges;
    newPl.tierStats = persistentStats.tierStats;
    newPl.hustlePlays = persistentStats.hustlePlays;

    set({
      pl: newPl,
      ph: prologueStats ? 'PLAYING' : 'PROLOGUE',
      isTutorialSkipped: prologueStats ? true : currentState.isTutorialSkipped,
      currentMarket: 'NORMAL',
      news: [prologueStats ? 'Prologue completed! Month 1 has begun.' : 'Game reset. Welcome back.'],
      unlockedHustles: getUnlockedHustles(difficulty, currentState.unlockedLegacyUpgradeIds),
      activeTab: difficulty === 1 ? 'STREET' : 'MUD',
      activeHustleView: null,
      activeNarrative: null,
      deathBadge: null,
      fatalCause: null,
      difficulty,
      chosenBackground: backgroundId,
      chosenBackgroundCategory: categoryId,
      chosenBackgroundVariation: variationId,
    });
  },

  logAction: (action) => {
    const state = get();
    const newAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };

    const pl = { ...state.pl };
    pl.actionLog = [newAction, ...(pl.actionLog || [])].slice(0, GAME_CONSTANTS.ACTION_LOG_MAX_SIZE);

    // --- SETBACK TRACKING ---
    if ((pl.setbackActionsRemaining || 0) > 0) {
      const isSleepOrPR = newAction.hustleId === 'r_sleep' || newAction.hustleId === 'power_nap' || newAction.hustleId === 'r_pr_campaign' || newAction.hustleId === 'therapy_session' || newAction.hustleId === 'wellness_retreat' || newAction.hustleId === 'psychiatrist';
      const isPhilanthropy = newAction.hustleId === 'philanthropy_empire' || newAction.hustleId.includes('philanthropy');
      const isEscalation = (newAction.heatHit && newAction.heatHit > 0) || (newAction.yieldCash > 0 && !isSleepOrPR && !isPhilanthropy);
      const isRetreat = isSleepOrPR || isPhilanthropy || (newAction.heatHit && newAction.heatHit <= 0) || (newAction.yieldCash === 0 && newAction.yieldClout === 0 && newAction.yieldAura === 0);

      if (isEscalation) {
        pl.escalationCount = (pl.escalationCount || 0) + 1;
        pl.setbackActionsRemaining = pl.setbackActionsRemaining! - 1;
      } else if (isRetreat) {
        pl.retreatCount = (pl.retreatCount || 0) + 1;
        pl.setbackActionsRemaining = pl.setbackActionsRemaining! - 1;
      }
    }

    // --- ADVICE COMPLIANCE TRACKING ---
    const activeAdviceTriggers = [...(pl.activeAdviceTriggers || [])];
    let adviceFollowedCount = pl.adviceFollowedCount || 0;

    const updatedTriggers = activeAdviceTriggers.map(trigger => {
      if (trigger.resolved) return trigger;

      const nextChecked = trigger.actionsChecked + 1;
      let isMatched = false;

      // Check specific hustle ID list
      if (trigger.hustleIds && trigger.hustleIds.length > 0) {
        if (trigger.hustleIds.includes(newAction.hustleId)) {
          isMatched = true;
        }
      }

      // Check extra conditions
      if (trigger.extraCondition === 'diversify') {
        let dominantCategory = '';
        let maxPlays = -1;
        const plays = pl.hustlePlays || {};
        for (const [hId, p] of Object.entries(plays)) {
          if (p > maxPlays) {
            maxPlays = p;
            const hObj = HUSTLES[hId];
            if (hObj) dominantCategory = hObj.tier;
          }
        }
        const currentHustleObj = HUSTLES[newAction.hustleId];
        if (currentHustleObj && currentHustleObj.tier !== dominantCategory) {
          isMatched = true;
        }
      } else if (trigger.extraCondition === 'cool_down') {
        if (newAction.hustleId === 'r_ghost_mode' || newAction.hustleId === 'r_sleep' || newAction.hustleId === 'power_nap' || (newAction.heatHit && newAction.heatHit < 0)) {
          isMatched = true;
        }
      } else if (trigger.extraCondition === 'boost_aura') {
        if (newAction.yieldAura > 0 || newAction.hustleId.includes('philanthropy')) {
          isMatched = true;
        }
      } else if (trigger.extraCondition === 'rest_or_recover') {
        const isRest = newAction.hustleId === 'r_sleep' || newAction.hustleId === 'power_nap' || newAction.hustleId === 'therapy_session' || newAction.hustleId === 'wellness_retreat' || newAction.hustleId === 'psychiatrist';
        if (isRest) {
          isMatched = true;
        }
      } else if (trigger.extraCondition === 'legislative_action') {
        if (newAction.hustleId === 'data_monopoly' || newAction.hustleId === 'central_bank_play') {
          isMatched = true;
        }
      }

      if (isMatched) {
        adviceFollowedCount++;
        return { ...trigger, resolved: true, actionsChecked: nextChecked };
      }

      return { ...trigger, actionsChecked: nextChecked };
    }).filter(t => !t.resolved && t.actionsChecked < 3);

    pl.activeAdviceTriggers = updatedTriggers;
    pl.adviceFollowedCount = adviceFollowedCount;

    set({
      pl: enforceStatCaps(pl),
    });
  },

  logEvent: (type, metadata = {} as GameEventMetadata) => {
    let newEvent: any = null;

    set((state) => {
      newEvent = {
        id: Math.random().toString(36).substring(7),
        type,
        timestamp: Date.now(),
        playerStats: {
          bag: state.pl.bag,
          clout: state.pl.clout,
          aura: state.pl.aura,
          mental: state.pl.mentalHealth,
          heat: state.pl.heat,
          tier: state.pl.currentTier,
        },
        metadata,
      };

      const isJailSetback = state.pl.inJail && !state.pl.inJail; // Will be handled on direct property transition, or if metadata says arrest
      const isSetback = type === 'SCANDAL_TRIGGERED' || (type === 'SPECIAL_EVENT' && (metadata as any)?.type === 'RIVAL_SABOTAGE') || isJailSetback;

      const updatedPl = enforceStatCaps({
        ...state.pl,
        setbackActionsRemaining: isSetback ? 2 : state.pl.setbackActionsRemaining,
        events: [newEvent, ...(state.pl.events || [])].slice(0, 1000),
      });
      updatedPl.legacyScore = calculateLegacyScore(updatedPl);

      return {
        pl: updatedPl,
      };
    });

    // Check for achievements after logging the event
    const isAchievementUnlockEvent = type === 'SPECIAL_EVENT' && (metadata as SpecialEventMetadata).type === 'ACHIEVEMENT_UNLOCKED';
    if (!isAchievementUnlockEvent && newEvent) {
      const newlyUnlocked = checkAchievements(get(), newEvent);
      newlyUnlocked.forEach(id => get().unlockAchievement(id));
    }
  },

  triggerSetback: () => {
    set((state) => ({
      pl: {
        ...state.pl,
        setbackActionsRemaining: 2
      }
    }));
  },

  registerAdvice: (insights) => {
    set((state) => {
      const pl = state.pl;
      const activeAdviceTriggers = [...(pl.activeAdviceTriggers || [])];
      let adviceGivenCount = pl.adviceGivenCount || 0;
      let hasChanges = false;

      insights.forEach(ins => {
        const exists = activeAdviceTriggers.some(t => t.id === ins.id);
        if (!exists) {
          hasChanges = true;
          let extraCondition = '';
          let hustleIds: string[] = [];

          if (ins.id === 'passive_dependency_high' || ins.id === 'passive_dependency_single' || ins.id === 'passive_none') {
            extraCondition = 'diversify';
          } else if (ins.id === 'media_lack_politics') {
            hustleIds = ['media_empire', 'film_studio'];
          } else if (ins.id === 'rival_aggressive_bid') {
            extraCondition = 'counter_bid';
          } else if (ins.id === 'rival_dominant_wealth') {
            extraCondition = 'sabotage_or_counter';
          } else if (ins.id === 'heat_critical' || ins.id === 'heat_important') {
            extraCondition = 'cool_down';
          } else if (ins.id === 'aura_critical') {
            extraCondition = 'boost_aura';
          } else if (ins.id === 'mental_health_penalty' || ins.id === 'stress_careless_mistakes') {
            extraCondition = 'rest_or_recover';
          } else if (ins.id === 'politics_integrity_crisis') {
            extraCondition = 'cabinet_integrity';
          } else if (ins.id === 'politics_congress_weak') {
            extraCondition = 'legislative_action';
          }

          activeAdviceTriggers.push({
            id: ins.id,
            extraCondition,
            hustleIds,
            actionsChecked: 0,
            resolved: false
          });
          adviceGivenCount++;
        }
      });

      if (!hasChanges) {
        return {};
      }

      return {
        pl: {
          ...pl,
          activeAdviceTriggers,
          adviceGivenCount
        }
      };
    });
  },

  checkMilestones: () => {
    const state = get();
    const actions = state.pl.actionLog || [];
    const newMilestones = [];

    const vendingCount = actions.filter(a => a.hustleId === 'r_vending').length;
    const houseFlips = actions.filter(a => a.branchId === 'l2a').length;
    const rentals = actions.filter(a => a.branchId === 'l2b').length;
    const totalProfit = actions.reduce((sum, a) => sum + a.netCash, 0);

    if (vendingCount >= 10 && !state.pl.milestones?.some(m => m.id === 'VENDING_KING')) {
      newMilestones.push({ id: 'VENDING_KING', name: 'Vending King', description: 'Own 10 vending machines', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (houseFlips >= 5 && !state.pl.milestones?.some(m => m.id === 'FLIP_MASTER')) {
      newMilestones.push({ id: 'FLIP_MASTER', name: 'Flip Master', description: 'Flip 5 houses', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (rentals >= 5 && !state.pl.milestones?.some(m => m.id === 'LANDLORD')) {
      newMilestones.push({ id: 'LANDLORD', name: 'Landlord', description: 'Own 5 rental properties', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (totalProfit >= 100000 && !state.pl.milestones?.some(m => m.id === 'SIX_FIGURES')) {
      newMilestones.push({ id: 'SIX_FIGURES', name: 'Six Figures', description: 'Earn $100,000 total profit', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (totalProfit >= 1000000 && !state.pl.milestones?.some(m => m.id === 'MILLIONAIRE')) {
      newMilestones.push({ id: 'MILLIONAIRE', name: 'Millionaire', description: 'Earn $1,000,000 total profit', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }

    // Mastery Check
    const masteredHustles = [...(state.pl.masteredHustles || [])];
    const newBiography = [...(state.pl.biography || [])];
    const newBioKeys = [...(state.pl.recordedBioKeys || [])];
    let totalBonusApproval = 0;
    const finalDemographicApproval = { ...(state.pl.demographicApproval || {}) };
    const masteryBoostNews: TickerMessage[] = [];

    Object.keys(HUSTLES).forEach(hId => {
      if (masteredHustles.includes(hId)) return;

      const h = HUSTLES[hId];
      let isMastered = false;

      // Only count as potentially mastered if the player has actually played/unlocked this hustle
      const hasPlayed = state.pl.hustleLevels[hId] !== undefined || state.pl.hustleBranchIds[hId] !== undefined;
      if (!hasPlayed) return;

      // Universal rule: minimum 20 plays required for mastery
      const plays = state.pl.hustlePlays[hId] || 0;
      if (plays >= 20) {
        if (h.levels) {
          const currentLvl = state.pl.hustleLevels[hId] || 1;
          if (currentLvl >= h.levels.length) {
            isMastered = true;
          }
        } else if (h.branches) {
          const nodeId = state.pl.hustleBranchIds[hId] || h.startBranchId;
          const node = nodeId ? h.branches[nodeId] : undefined;

          // Terminal branch check (must have actually selected this branch)
          const isTerminal = node && (!node.nextBranches || node.nextBranches.length === 0);
          const isRepeatableMastery = node?.isRepeatable && (
            (hId === 'r_vending' && state.pl.vendingCount >= 10) ||
            (hId === 'street_eats' && node.level >= 5) ||
            (node.id === 'l2b' && state.pl.rentPortfolioCount >= 10)
          );

          if (isTerminal || isRepeatableMastery) {
            isMastered = true;
          }
        }
      }

      if (isMastered) {
        masteredHustles.push(hId);
        newMilestones.push({
          id: `MASTERED_${hId}`,
          name: `Mastered ${h.name}`,
          description: `You've reached the peak of ${h.name}. Mastery Badge awarded!`,
          achievedAtMonth: state.pl.month,
          tier: state.pl.currentTier
        });
        const bioUpdate = Bio.recordMastery(state.pl, h.name);
        if (bioUpdate) {
          newBiography.push(bioUpdate.entry);
          if (bioUpdate.key) newBioKeys.push(bioUpdate.key);
        }
        get().logEvent('SPECIAL_EVENT', { type: 'HUSTLE_MASTERY', hustleId: hId, hustleName: h.name });

        // Immediate Campaign Impact
        if (state.pl.currentTier === 'PRESIDENT') {
          const masteryCount = masteredHustles.length;
          let bonusApproval = 1.5;
          let demographicBonus = 0;

          if (masteryCount >= 20) demographicBonus = 10;
          else if (masteryCount >= 10) demographicBonus = 5;

          if (demographicBonus > 0) {
            Object.keys(finalDemographicApproval).forEach(key => {
              finalDemographicApproval[key] = Math.min(100, (finalDemographicApproval[key] || 50) + demographicBonus);
            });
            bonusApproval += demographicBonus;
          }
          totalBonusApproval += bonusApproval;
          masteryBoostNews.push({
            text: `Your mastery of ${h.name} has boosted your campaign!`,
            type: 'MASTERY_BOOST',
            colorClass: 'text-yellow-400 font-bold'
          });
        }

        showConfetti();

        // Reveal benefit if already in relevant tier
        const badge = HUSTLE_BADGES[hId];
        if (badge && badge.relevantTier && badge.futureBenefit) {
          const currentTierIdx = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
          const relevantTierIdx = PROGRESSION_ORDER.indexOf(badge.relevantTier);
          if (currentTierIdx >= relevantTierIdx) {
            masteryBoostNews.push({
              text: `Your ${badge.name} is now active: ${badge.futureBenefit}`,
              type: 'BADGE_ACTIVE',
              colorClass: 'text-yellow-400 font-bold'
            });
            get().logEvent('SPECIAL_EVENT', { type: 'BADGE_BENEFIT_ACTIVE', message: badge.futureBenefit });
          }
        }
      }
    });

    // Tier Badge Check
    const newTierBadges = [...(state.pl.tierBadges || [])];
    let newlyEarnedTierBadge = null;

    const tiersToCheck: Tier[] = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT'];
    for (const tier of tiersToCheck) {
      if (newTierBadges.includes(tier)) continue;

      const hustlesInTier = Object.values(HUSTLES).filter(h => h.tier === tier);
      const allMastered = hustlesInTier.every(h => masteredHustles.includes(h.id));

      if (allMastered && hustlesInTier.length > 0) {
        newTierBadges.push(tier);
        newlyEarnedTierBadge = tier;
        newMilestones.push({
          id: `TIER_BADGE_${tier}`,
          name: `${tier} MASTER`,
          description: `You've mastered every hustle in the ${tier} tier!`,
          achievedAtMonth: state.pl.month,
          tier: state.pl.currentTier
        });
        get().logEvent('SPECIAL_EVENT', { type: 'TIER_BADGE_EARNED', tier });
        break; // Only one celebration at a time
      }
    }

    if (newMilestones.length > 0) {
      set({
        pl: enforceStatCaps({
          ...state.pl,
          milestones: [...(state.pl.milestones || []), ...newMilestones],
          masteredHustles,
          tierBadges: newTierBadges,
          approvalRating: Math.min(100, state.pl.approvalRating + totalBonusApproval),
          demographicApproval: finalDemographicApproval,
          biography: newBiography,
          recordedBioKeys: newBioKeys,
        }),
        activeTierBadge: newlyEarnedTierBadge,
        news: [
          ...masteryBoostNews,
          `🏆 MILESTONE: ${newMilestones.map(m => m.name).join(', ')}`,
          ...state.news
        ],
      });
    }
  },

  executeHustleWithTimelineTick: (hustleId, branchId) => {
    const state = get();
    if (state.pl.inJail) return { success: false, message: 'Cannot work while in jail' };
    const hustle = HUSTLES[hustleId];
    const branch = hustle?.branches?.[branchId];

    if (!branch) return { success: false, message: 'Branch not found' };

    if (state.pl.bag < branch.cost) {
      get().addTickerMessage(`Need $${branch.cost.toLocaleString()}`, 'text-red-400');
      return { success: false, message: `Need $${branch.cost.toLocaleString()}` };
    }
    if (state.pl.clout < branch.cloutReq) {
      get().addTickerMessage(`Need ${branch.cloutReq} clout`, 'text-red-400');
      return { success: false, message: `Need ${branch.cloutReq} clout` };
    }
    if (state.pl.aura < branch.auraReq) {
      get().addTickerMessage(`Need ${branch.auraReq} aura`, 'text-red-400');
      return { success: false, message: `Need ${branch.auraReq} aura` };
    }

    if (branch.cost > state.pl.bag * 0.1) {
      backupSave();
    }

    const newBag = state.pl.bag - branch.cost;
    const newClout = state.pl.clout + branch.yieldClout;
    const newAura = state.pl.aura + branch.yieldAura;
    const newShieldTurns = state.pl.mentalShieldTurns + (branch.shieldTurns || 0);

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    newStats.successfulHustles += 1;
    const totalHustlesCompleted = state.pl.totalHustlesCompleted + 1;

    const newHustlePlays = { ...state.pl.hustlePlays };
    newHustlePlays[hustleId] = (newHustlePlays[hustleId] || 0) + 1;

    const newTierStats = { ...state.pl.tierStats };
    const tier = hustle.tier;
    if (!newTierStats[tier]) {
      newTierStats[tier] = { plays: 0, earnings: 0, favoriteHustle: hustle.name };
    }
    newTierStats[tier].plays += 1;

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: newBag,
      clout: newClout,
      aura: newAura,
      mentalShieldTurns: newShieldTurns,
      hustleBranchIds: { ...state.pl.hustleBranchIds, [hustleId]: branchId },
      hustleLevels: { ...state.pl.hustleLevels, [hustleId]: branch.level },
      stats: newStats,
      hustlePlays: newHustlePlays,
      monthsSinceLastHustle: 0, // Reset inactivity tracker on any attempt
      tierStats: newTierStats,
      totalHustlesCompleted,
    });
    nextPl.legacyScore = calculateLegacyScore(nextPl);

    const advancementResult = advanceMonth(
      nextPl,
      state.currentMarket,
      state.unlockedLegacyUpgradeIds
    );

    let finalNextPl = enforceStatCaps(advancementResult.newPl);
    finalNextPl.lastPassiveBreakdown = advancementResult.passiveBreakdown;
    const finalCurrentMarket = advancementResult.newMarket;
    const tickNews = advancementResult.news;

    finalNextPl.legacyScore = calculateLegacyScore(finalNextPl);

    let finalPh = state.ph;
    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (advancementResult.shouldDie) {
      const deathInfo = DEATH_MESSAGES[hustleId] || DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = advancementResult.deathCause;

      finalNextPl.deathContext = {
        mentalHealthAtDeath: Math.floor(finalNextPl.mentalHealth),
        lastHustleMentalHit: 0,
        lastHustleName: branch.name || hustle.name,
        heatAtDeath: Math.floor(finalNextPl.heat),
        monthsPlayed: finalNextPl.month,
        tier: finalNextPl.currentTier,
        fatalStat: advancementResult.fatalStat,
        fatalStatValue: advancementResult.fatalStatValue,
        preStatValue: advancementResult.fatalStat === 'mental' ? nextPl.mentalHealth :
                     advancementResult.fatalStat === 'bag' ? nextPl.bag :
                     advancementResult.fatalStat === 'clout' ? nextPl.clout :
                     advancementResult.fatalStat === 'aura' ? nextPl.aura : nextPl.heat,
        baseDamage: 0,
        finalDamage: 0,
        postStatValue: advancementResult.fatalStatValue
      };

      set({ bankedLegacyPoints: state.bankedLegacyPoints + (finalNextPl.legacyScore || 0) });

      finalNextPl.deathCount = (finalNextPl.deathCount || 0) + 1;
      if (finalDeathBadge && !finalNextPl.collectedDeathBadges.includes(finalDeathBadge)) {
        finalNextPl.collectedDeathBadges.push(finalDeathBadge);
      }

      const finalStat = getDominantStat(finalNextPl);
      const ending = getEnding(finalNextPl.legacyScore || 0, finalStat);
      const arrestSummary = Bio.recordArrestSummary(finalNextPl);
      if (arrestSummary) {
        finalNextPl.biography = [...(finalNextPl.biography || []), arrestSummary.entry];
        finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), arrestSummary.key!];
      }
      const bioUpdate = Bio.recordDeath(finalNextPl, ending.title, finalFatalCause || 'Unknown cause');
      if (bioUpdate) {
        finalNextPl.biography = [...(finalNextPl.biography || []), bioUpdate.entry];
        finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!];
      }
    }

    set({
      pl: finalNextPl,
      currentMarket: finalCurrentMarket,
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
      news: [...tickNews, `😴 Rested: ${branch.name} (-$${branch.cost.toLocaleString()})`, ...state.news].slice(0, 50),
    });

    const appliedCash = finalNextPl.bag - state.pl.bag;
    const appliedClout = finalNextPl.clout - state.pl.clout;
    const appliedAura = finalNextPl.aura - state.pl.aura;
    const appliedMental = finalNextPl.mentalHealth - state.pl.mentalHealth;
    const appliedHeat = finalNextPl.heat - state.pl.heat;

    get().logEvent('HUSTLE_COMPLETED', {
      hustleId,
      hustleName: hustle.name,
      success: true,
      profit: appliedCash,
      yieldClout: appliedClout,
      yieldAura: appliedAura,
      mentalHit: appliedMental,
      heatHit: appliedHeat,
      branchId,
      multiplier: 1.0,
      rentDeducted: advancementResult.totalRent,
      passiveIncomeTotal: advancementResult.passiveIncome,
      passiveBreakdown: advancementResult.passiveBreakdown
    });

    get().logAction({
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: branch.level,
      branchId,
      branchName: branch.name || hustle.name,
      cost: branch.cost,
      yieldCash: 0,
      yieldClout: branch.yieldClout,
      yieldAura: branch.yieldAura,
      netCash: appliedCash,
      success: true,
      passiveAdded: branch.passiveYield || 0,
      marketMult: { yield: 1, expense: 1, heat: 1 },
      marketName: state.currentMarket,
      variation: 0
    });
    get().checkMilestones();

    return { success: true, message: '' };
  },

  executeBranch: (hustleId, branchId) => {
    const state = get();
    if (state.pl.inJail) return { success: false, message: 'Cannot work while in jail' };
    const hustle = HUSTLES[hustleId];
    const branch = hustle?.branches?.[branchId];

    if (!branch) return { success: false, message: 'Branch not found' };

    const market = MARKET_CONFIGS[state.currentMarket];
    const isVending = hustleId === 'r_vending';
    const rivalThreat = state.pl.rivalThreats?.[hustle.tier] || 'NEUTRAL';

    const result = calculateHustleMath(
      hustleId,
      branch,
      1, // Upgrades/Branching uses base cost, not scaled by target level
      isVending ? 1 : market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1,
      true,
      state.pl.mentalShieldTurns,
      rivalThreat
    );

    // Apply Flex Asset Bonuses
    applyFlexBonuses(result, calculateFlexBonuses(state.pl));

    if (state.pl.bag < result.cost) return { success: false, message: `Need $${result.cost.toLocaleString()}` };

    // Backup if spending > 10%
    if (result.cost > state.pl.bag * 0.1) {
      backupSave();
    }
    if (state.pl.clout < branch.cloutReq) return { success: false, message: `Need ${branch.cloutReq} clout` };
    if (state.pl.aura < branch.auraReq) return { success: false, message: `Need ${branch.auraReq} aura` };

    if (branch.isRepeatable) {
      const currentCount = (hustleId === 'r_vending')
        ? state.pl.vendingCount
        : (branch.id === 'l2a' ? state.pl.flipCount : state.pl.rentPortfolioCount);

      if (branch.maxRepeat !== undefined && currentCount >= branch.maxRepeat) {
        const msg = branch.id === 'l2b' ? `Maximum ${branch.maxRepeat} Rent Portfolios reached.` : `Maximum ${branch.maxRepeat} reached`;
        return { success: false, message: msg };
      }
    }

    const newBag = state.pl.bag - result.cost;
    const newClout = state.pl.clout + result.yieldClout;
    const newAura = state.pl.aura + result.yieldAura;
    const newMental = state.pl.mentalHealth + result.mentalHit;
    const newHeat = state.pl.heat + result.heatHit;

    let newRentalCount = state.pl.rentalCount || 0;
    let newRentPortfolioCount = state.pl.rentPortfolioCount || 0;
    let newFlipCount = state.pl.flipCount || 0;
    let newVendingCount = state.pl.vendingCount || 0;

    if (hustleId === 'r_vending') {
      newVendingCount++;
    } else if (branch.id === 'l2a') {
      newFlipCount++;
    } else if (branch.id === 'l2b') {
      newRentPortfolioCount++;
    }

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    newStats.successfulHustles += 1;
    const totalHustlesCompleted = state.pl.totalHustlesCompleted + 1;

    const newHustlePlays = { ...state.pl.hustlePlays };
    newHustlePlays[hustleId] = (newHustlePlays[hustleId] || 0) + 1;

    const newTierStats = { ...state.pl.tierStats };
    const tier = hustle.tier;
    if (!newTierStats[tier]) {
      newTierStats[tier] = { plays: 0, earnings: 0, favoriteHustle: hustle.name };
    }
    newTierStats[tier].plays += 1;
    // Favorite hustle check
    const tierHustles = Object.values(HUSTLES).filter(h => h.tier === tier);
    let favorite = newTierStats[tier].favoriteHustle;
    let maxPlays = newHustlePlays[hustleId];
    tierHustles.forEach(h => {
      const plays = newHustlePlays[h.id] || 0;
      if (plays > maxPlays) {
        maxPlays = plays;
        favorite = h.name;
      }
    });
    newTierStats[tier].favoriteHustle = favorite;

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: newBag,
      clout: newClout,
      aura: newAura,
      mentalHealth: newMental,
      heat: newHeat,
      mentalShieldTurns: state.pl.mentalShieldTurns + result.shieldTurns,
      rentalCount: newRentalCount,
      rentPortfolioCount: newRentPortfolioCount,
      flipCount: newFlipCount,
      vendingCount: newVendingCount,
      hustleBranchIds: { ...state.pl.hustleBranchIds, [hustleId]: branchId },
      hustleLevels: { ...state.pl.hustleLevels, [hustleId]: branch.level },
      stats: newStats,
      hustlePlays: newHustlePlays,
      tierStats: newTierStats,
      totalHustlesCompleted,
      monthsSinceLastHustle: 0, // Reset inactivity tracker on any attempt
    });
    nextPl.legacyScore = calculateLegacyScore(nextPl);

    const { shouldDie, deathCause, fatalStat, fatalStatValue } = checkDeathConditions(nextPl);
    let finalPh = state.ph;
    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (shouldDie) {
      const deathInfo = DEATH_MESSAGES[hustleId] || DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = deathCause;

      nextPl.deathContext = {
        mentalHealthAtDeath: Math.floor(nextPl.mentalHealth),
        lastHustleMentalHit: Math.abs(result.mentalHit || 0),
        lastHustleName: branch.name || hustle.name,
        heatAtDeath: Math.floor(nextPl.heat),
        monthsPlayed: nextPl.month,
        tier: nextPl.currentTier,
        fatalStat,
        fatalStatValue,
        preStatValue: fatalStat === 'mental' ? state.pl.mentalHealth :
                     fatalStat === 'bag' ? state.pl.bag :
                     fatalStat === 'clout' ? state.pl.clout :
                     fatalStat === 'aura' ? state.pl.aura : state.pl.heat,
        baseDamage: result.mentalHit, // Branches are simpler
        finalDamage: result.mentalHit,
        postStatValue: fatalStatValue
      };

      set({ bankedLegacyPoints: state.bankedLegacyPoints + (nextPl.legacyScore || 0) });

      nextPl.deathCount = (nextPl.deathCount || 0) + 1;
      if (finalDeathBadge && !nextPl.collectedDeathBadges.includes(finalDeathBadge)) {
        nextPl.collectedDeathBadges.push(finalDeathBadge);
      }

      const finalStat = getDominantStat(nextPl);
      const ending = getEnding(nextPl.legacyScore || 0, finalStat);
      const arrestSummary = Bio.recordArrestSummary(nextPl);
      if (arrestSummary) {
        nextPl.biography = [...(nextPl.biography || []), arrestSummary.entry];
        nextPl.recordedBioKeys = [...(nextPl.recordedBioKeys || []), arrestSummary.key!];
      }
      const bioUpdate = Bio.recordDeath(nextPl, ending.title, finalFatalCause || 'Unknown cause');
      if (bioUpdate) {
        nextPl.biography = [...(nextPl.biography || []), bioUpdate.entry];
        nextPl.recordedBioKeys = [...(nextPl.recordedBioKeys || []), bioUpdate.key!];
      }
      let savedEndings = [];
      try {
        savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
      } catch (e) {
        savedEndings = [];
      }
      if (!savedEndings.includes(ending.title)) {
        savedEndings.push(ending.title);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
          } catch (e) {}
        }
      }

      get().logEvent('SPECIAL_EVENT', {
        type: 'ENDING_UNLOCKED',
        title: ending.title,
        legacyPoints: nextPl.legacyScore || 0
      });

      if (nextPl.stats) {
        if (!nextPl.stats.bestRunBag || nextPl.bag > nextPl.stats.bestRunBag) {
          nextPl.stats.bestRunBag = nextPl.bag;
          nextPl.stats.bestRunTier = nextPl.currentTier;
          nextPl.stats.bestRunEnding = ending.title;
        }
      }
    }

    const isVendingBuy = hustleId === 'r_vending';
    const isRealEstateBuy = ['l2a', 'l2b', 'l3a'].includes(branchId) && hustleId === 'r_labor';

    let finalNextPl = nextPl;
    const sideEvents: { type: GameEventType, metadata: any }[] = [];

    if (isVendingBuy) {
      sideEvents.push({ type: 'BUSINESS_PURCHASED', metadata: { assetId: 'vending', cost: result.cost } });
      const bioUpdate = Bio.recordBusiness(finalNextPl, 'Vending Machine', 18 + Math.floor(state.pl.month / 12));
      if (bioUpdate) {
        finalNextPl = {
          ...finalNextPl,
          biography: [...(finalNextPl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!]
        };
      }
    } else if (isRealEstateBuy) {
      sideEvents.push({ type: 'PROPERTY_PURCHASED', metadata: { branchId, branchName: branch.name, cost: result.cost } });
      const bioUpdate = Bio.recordBusiness(finalNextPl, branch.name || 'Real Estate Portfolio', 18 + Math.floor(state.pl.month / 12));
      if (bioUpdate) {
        finalNextPl = {
          ...finalNextPl,
          biography: [...(finalNextPl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!]
        };
      }
    }

    // Update active challenges
    if (state.pl.activeChallenges.length > 0) {
      const updatedChallenges = state.pl.activeChallenges.map(c => {
        if (c.tier === hustle.tier) {
          const newCompleted = c.hustlesCompleted + 1;
          if (newCompleted >= c.hustlesRequired) {
            // Challenge Won
            const bonus = Math.floor(state.pl.bag * 0.1);
            get().addTickerMessage(`🏆 CHALLENGE WON: You defeated ${c.rivalName}! +$${bonus.toLocaleString()} (10% of bag).`, 'text-emerald-400 font-bold');

            const bioUpdate = Bio.recordRivalDefeat(finalNextPl, c.rivalName, c.tier);
            finalNextPl = {
              ...finalNextPl,
              bag: finalNextPl.bag + bonus,
              biography: bioUpdate ? [...(finalNextPl.biography || []), bioUpdate.entry] : finalNextPl.biography,
              recordedBioKeys: (bioUpdate && bioUpdate.key) ? [...(finalNextPl.recordedBioKeys || []), bioUpdate.key] : finalNextPl.recordedBioKeys,
              crushedRivals: [...finalNextPl.crushedRivals, c.rivalId]
            };
            sideEvents.push({ type: 'RIVAL_DEFEATED', metadata: { rivalId: c.rivalId, rivalName: c.rivalName, bonus } });
            return null; // Remove challenge
          }
          return { ...c, hustlesCompleted: newCompleted };
        }
        return c;
      }).filter(Boolean) as Challenge[];

      finalNextPl = { ...finalNextPl, activeChallenges: updatedChallenges };
    }

    const isTimelineTick = branchId === 'vending' || hustleId === 'r_vending' || (branchId === 'l2b' && hustleId === 'r_labor') || (branchId === 'l1' && hustleId === 'r_labor');
    let finalCurrentMarket = state.currentMarket;
    let tickNews: (string | TickerMessage)[] = [];
    let advancementResult: any = null;

    if (isTimelineTick) {
      advancementResult = advanceMonth(
        finalNextPl,
        state.currentMarket,
        state.unlockedLegacyUpgradeIds
      );

      finalNextPl = enforceStatCaps(advancementResult.newPl);
      finalNextPl.lastPassiveBreakdown = advancementResult.passiveBreakdown;
      finalCurrentMarket = advancementResult.newMarket;
      tickNews = advancementResult.news;

      finalNextPl.legacyScore = calculateLegacyScore(finalNextPl);

      if (advancementResult.shouldDie) {
        const deathInfo = DEATH_MESSAGES[hustleId] || DEATH_MESSAGES['DEFAULT'];
        finalPh = 'POST_MORTEM';
        finalDeathBadge = deathInfo.badge;
        finalFatalCause = advancementResult.deathCause;

        finalNextPl.deathContext = {
          mentalHealthAtDeath: Math.floor(finalNextPl.mentalHealth),
          lastHustleMentalHit: Math.abs(result.mentalHit || 0),
          lastHustleName: branch.name || hustle.name,
          heatAtDeath: Math.floor(finalNextPl.heat),
          monthsPlayed: finalNextPl.month,
          tier: finalNextPl.currentTier,
          fatalStat: advancementResult.fatalStat,
          fatalStatValue: advancementResult.fatalStatValue,
          preStatValue: advancementResult.fatalStat === 'mental' ? nextPl.mentalHealth :
                       advancementResult.fatalStat === 'bag' ? nextPl.bag :
                       advancementResult.fatalStat === 'clout' ? nextPl.clout :
                       advancementResult.fatalStat === 'aura' ? nextPl.aura : nextPl.heat,
          baseDamage: result.mentalHit,
          finalDamage: result.mentalHit,
          postStatValue: advancementResult.fatalStatValue
        };

        set({ bankedLegacyPoints: state.bankedLegacyPoints + (finalNextPl.legacyScore || 0) });

        finalNextPl.deathCount = (finalNextPl.deathCount || 0) + 1;
        if (finalDeathBadge && !finalNextPl.collectedDeathBadges.includes(finalDeathBadge)) {
          finalNextPl.collectedDeathBadges.push(finalDeathBadge);
        }

        const finalStat = getDominantStat(finalNextPl);
        const ending = getEnding(finalNextPl.legacyScore || 0, finalStat);
        const arrestSummary = Bio.recordArrestSummary(finalNextPl);
        if (arrestSummary) {
          finalNextPl.biography = [...(finalNextPl.biography || []), arrestSummary.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), arrestSummary.key!];
        }
        const bioUpdate = Bio.recordDeath(finalNextPl, ending.title, finalFatalCause || 'Unknown cause');
        if (bioUpdate) {
          finalNextPl.biography = [...(finalNextPl.biography || []), bioUpdate.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!];
        }
        let savedEndings = [];
        try {
          savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
        } catch (e) {
          savedEndings = [];
        }
        if (!savedEndings.includes(ending.title)) {
          savedEndings.push(ending.title);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
            } catch (e) {}
          }
        }

        get().logEvent('SPECIAL_EVENT', {
          type: 'ENDING_UNLOCKED',
          title: ending.title,
          legacyPoints: finalNextPl.legacyScore || 0
        });

        if (finalNextPl.stats) {
          if (!finalNextPl.stats.bestRunBag || finalNextPl.bag > finalNextPl.stats.bestRunBag) {
            finalNextPl.stats.bestRunBag = finalNextPl.bag;
            finalNextPl.stats.bestRunTier = finalNextPl.currentTier;
            finalNextPl.stats.bestRunEnding = ending.title;
          }
        }
      }

      console.log(`⏰ TIMELINE GUARD: Executed ${hustleId}:${branchId}. Time advanced 1 month.`);
    }

    set({
      pl: finalNextPl,
      currentMarket: finalCurrentMarket,
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
      news: isTimelineTick
        ? [...tickNews, `⬆️ Upgraded: ${branch.name} (-$${result.cost.toLocaleString()})`, ...state.news].slice(0, 50)
        : [`⬆️ Upgraded: ${branch.name} (-$${result.cost.toLocaleString()})`, ...state.news.slice(0, 49)],
    });

    sideEvents.forEach(e => get().logEvent(e.type, e.metadata));

    const appliedCash = finalNextPl.bag - state.pl.bag;
    const appliedClout = finalNextPl.clout - state.pl.clout;
    const appliedAura = finalNextPl.aura - state.pl.aura;
    const appliedMental = finalNextPl.mentalHealth - state.pl.mentalHealth;
    const appliedHeat = finalNextPl.heat - state.pl.heat;

    get().logEvent('HUSTLE_COMPLETED', {
      hustleId,
      hustleName: hustle.name,
      success: true,
      profit: appliedCash,
      yieldClout: appliedClout,
      yieldAura: appliedAura,
      mentalHit: appliedMental,
      heatHit: appliedHeat,
      branchId,
      miniGame: hustle.miniGame || branch.miniGame,
      multiplier: 1.0,
      rentDeducted: isTimelineTick ? (advancementResult?.totalRent) : 0,
      passiveIncomeTotal: isTimelineTick ? (advancementResult?.passiveIncome) : 0,
      passiveBreakdown: isTimelineTick ? (advancementResult?.passiveBreakdown) : undefined
    });

    const { updateChallengeProgress } = get();
    updateChallengeProgress('hustle_count', 1);
    updateChallengeProgress('earn_cash', result.yieldCash);
    updateChallengeProgress('clout_gain', result.yieldClout);
    updateChallengeProgress('aura_gain', result.yieldAura);

    get().logAction({
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: branch.level,
      branchId,
      branchName: branch.name || hustle.name,
      cost: result.cost,
      yieldCash: 0,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: appliedCash,
      success: true,
      passiveAdded: branch.passiveYield || 0,
      marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
      marketName: market.name,
      variation: 0
    });
    get().checkMilestones();

    return { success: true, message: '' };
  },

  executeHustle: (hustleId, minigameMultiplier = 1, forceSuccess) => {
    const state = get();
    if (state.pl.inJail) {
      return {
        success: false, netChange: 0, message: 'Cannot work while in jail',
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }
    const initialBag = state.pl.bag;
    const initialClout = state.pl.clout;
    const initialAura = state.pl.aura;
    const initialMental = state.pl.mentalHealth;
    const initialHeat = state.pl.heat;

    const hustle = HUSTLES[hustleId];

    if (!hustle) {
      return {
        success: false, netChange: 0, message: 'Hustle not found',
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    const currentTierIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
    const hustleTierIndex = PROGRESSION_ORDER.indexOf(hustle.tier as Tier);

    const isTutorialBypass = !state.isTutorialSkipped && state.tutorialStep === 2 && (hustleId === 'cc' || hustleId === 'pod');

    if (hustleTierIndex > currentTierIndex && !isTutorialBypass) {
      return {
        success: false, netChange: 0, message: `${hustle.tier} tier locked. Advance your rank first.`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    let levelData: HustleLevel | undefined;
    const currentLevel = state.pl.hustleLevels[hustleId] || 1;

    if (hustle.branches) {
      const nodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
      levelData = nodeId ? hustle.branches[nodeId] : undefined;
    } else if (hustle.levels) {
      levelData = hustle.levels.find(l => l.level === currentLevel);
    }

    if (!levelData) {
      levelData = { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0 };
    }

    if (state.pl.clout < levelData.cloutReq) {
      return {
        success: false, netChange: 0, message: `Need ${levelData.cloutReq} clout`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    if (state.pl.aura < levelData.auraReq) {
      return {
        success: false, netChange: 0, message: `Need ${levelData.auraReq} aura`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    if (state.pl.bag < levelData.cost) {
        return {
          success: false, netChange: 0, message: `Need $${levelData.cost.toLocaleString()}`,
          cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
        };
    }

    if (levelData.isRepeatable) {
      const currentCount = (hustleId === 'r_vending')
        ? state.pl.vendingCount
        : (levelData.id === 'l2a' ? state.pl.flipCount : (levelData.id === 'l2b' ? state.pl.rentPortfolioCount : 0));

      if (levelData.maxRepeat !== undefined && currentCount >= levelData.maxRepeat) {
        const msg = levelData.id === 'l2b' ? `Maximum ${levelData.maxRepeat} Rent Portfolios reached.` : `Maximum ${levelData.maxRepeat} reached`;
        return {
          success: false, netChange: 0, message: msg,
          cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
        };
      }
    }

    // Backup if spending > 10%
    if (levelData.cost > state.pl.bag * 0.1) {
      backupSave();
    }

    const rivalThreat = state.pl.rivalThreats?.[hustle.tier] || 'NEUTRAL';
    const result = executeHustleAction(
      hustleId,
      state.pl,
      state.currentMarket,
      levelData,
      currentLevel,
      minigameMultiplier,
      forceSuccess,
      rivalThreat
    );

    const newBag = state.pl.bag - result.cost + result.yieldCash;
    const newDynamicPassives = { ...state.pl.dynamicPassives };

    const newHustlePlays = { ...state.pl.hustlePlays };
    newHustlePlays[hustleId] = (newHustlePlays[hustleId] || 0) + 1;
    if (result.passiveAdded !== undefined) {
      const basePassive = levelData.passiveYield || 0;
      const bonusPassive = result.passiveAdded
        ? Math.max(0, result.passiveAdded - basePassive)
        : 0;
      newDynamicPassives[hustleId] = basePassive + bonusPassive;
    }

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    if (result.success) newStats.successfulHustles += 1;
    newStats.lifetimeEarnings += result.yieldCash;
    const totalHustlesCompleted = state.pl.totalHustlesCompleted + (result.success ? 1 : 0);


    const newTierStats = { ...state.pl.tierStats };
    const tier = hustle.tier;
    if (!newTierStats[tier]) {
      newTierStats[tier] = { plays: 0, earnings: 0, favoriteHustle: hustle.name };
    }
    newTierStats[tier].plays += 1;
    newTierStats[tier].earnings += result.yieldCash;
    // Favorite hustle check
    const tierHustles = Object.values(HUSTLES).filter(h => h.tier === tier);
    let favorite = newTierStats[tier].favoriteHustle;
    let maxPlays = 0;
    tierHustles.forEach(h => {
      const plays = newHustlePlays[h.id] || 0;
      if (plays > maxPlays) {
        maxPlays = plays;
        favorite = h.name;
      }
    });
    newTierStats[tier].favoriteHustle = favorite;

    let updatedBiography = [...(state.pl.biography || [])];
    let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];

    let updatedFounders: Founder[] = [...(state.pl.foundersBacked || [])];
    if (hustleId === 'venture_capital' && result.success) {
      const performanceFactor = minigameMultiplier || 1.0;
      const performanceBonus = Math.floor((performanceFactor - 1.0) * 15);

      const execution = Math.max(10, Math.min(100, (30 + Math.floor(Math.random() * 40)) + performanceBonus));
      const vision = Math.max(10, Math.min(100, (30 + Math.floor(Math.random() * 40)) + performanceBonus));
      const burnDiscipline = Math.max(10, Math.min(100, (30 + Math.floor(Math.random() * 40)) + performanceBonus));

      const firstName = FOUNDER_FIRST_NAMES[Math.floor(Math.random() * FOUNDER_FIRST_NAMES.length)];
      const lastName = FOUNDER_LAST_NAMES[Math.floor(Math.random() * FOUNDER_LAST_NAMES.length)];
      const companyPrefix = COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)];
      const companySuffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
      const pitchIdea = PITCH_IDEAS[Math.floor(Math.random() * PITCH_IDEAS.length)];
      const avatar = FOUNDER_AVATARS[Math.floor(Math.random() * FOUNDER_AVATARS.length)];

      const founderName = `${firstName} ${lastName}`;
      const companyName = `${companyPrefix}${companySuffix}`;
      const id = `founder_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const newFounder: Founder = {
        id,
        name: founderName,
        avatar,
        companyName,
        pitchIdea,
        followOnCount: 0,
        stats: {
          execution,
          vision,
          burnDiscipline,
        }
      };

      updatedFounders.push(newFounder);

      const bioUpdate = Bio.recordFounderBacked(state.pl, founderName, companyName);
      if (bioUpdate) {
        updatedBiography.push(bioUpdate.entry);
        updatedRecordedBioKeys.push(bioUpdate.key!);
      }

      if (!result.tickerMessages) result.tickerMessages = [];
      result.tickerMessages.push({
        text: `🤝 DEAL CLOSED: Backed ${founderName} (${companyName})! Exec: ${execution}, Vis: ${vision}, Burn: ${burnDiscipline}`,
        colorClass: 'text-yellow-400 font-bold'
      });
    }

    const currentStreak = result.success ? (state.pl.streak || 0) + 1 : 0;
    const isStreakAuraRewardActive = result.success && currentStreak >= 5;
    const streakAuraBonus = isStreakAuraRewardActive ? 2 : 0;

    if (isStreakAuraRewardActive) {
      if (!result.tickerMessages) result.tickerMessages = [];
      result.tickerMessages.push({
        text: `🔥 WINNING STREAK: Momentum boost! +2 Aura.`,
        colorClass: 'text-emerald-400 font-medium',
        tier: state.pl.currentTier
      });
    }

    let finalAuraYield = state.pl.aura + result.yieldAura + streakAuraBonus;
    if (!result.success) {
      const isMajor = ['CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'].includes(hustle.tier);
      const auraLossAmt = isMajor ? 10 : 5;
      const reputation = state.pl.narrativeFlags?.publicReputation as string || "The Hustler";
      const failedLosses = applyReputationLossScale(0, auraLossAmt, reputation, state.pl);
      finalAuraYield = Math.max(0, finalAuraYield - failedLosses.aura);
      if (!result.tickerMessages) result.tickerMessages = [];
      result.tickerMessages.push({
        text: `📉 FAILING VENTURE: Lost -${failedLosses.aura} Aura due to operational setback.`,
        colorClass: 'text-red-400 font-medium',
        tier: state.pl.currentTier
      });
    }

    const hustleResultPl = enforceStatCaps({
      ...state.pl,
      foundersBacked: updatedFounders,
      biography: updatedBiography,
      recordedBioKeys: updatedRecordedBioKeys,
      rareTechStockpile: (state.pl.rareTechStockpile || 0) + (result.success && (hustleId === 'r_scrap' || hustleId === 'techFlip') ? 1 : 0),
      algorithmicLogs: (state.pl.algorithmicLogs || 0) + (result.success && (hustleId === 'r_delivery' || hustleId === 'cleaning') ? 1 : 0),
      annualCashEarned: state.pl.annualCashEarned + Math.max(0, result.yieldCash || 0),
      annualCashSpent: state.pl.annualCashSpent + (levelData.cost || 0),
      annualHustlesRun: state.pl.annualHustlesRun + 1,
      approvalRating: Math.max(0, Math.min(100, state.pl.approvalRating + (result.approvalBonus || 0))),
      bag: newBag,
      clout: state.pl.clout + result.yieldClout,
      aura: finalAuraYield,
      mentalHealth: state.pl.mentalHealth + result.mentalHit,
      heat: state.pl.heat + result.heatHit,
      monthsSinceLastHustle: 0, // Reset inactivity tracker on any attempt
      legacyPoints: (state.pl.legacyPoints || 0) + (result.legacyGain || 0),
      dynamicPassives: newDynamicPassives,
      vendingCount: state.pl.vendingCount + (hustleId === 'r_vending' ? 1 : 0),
      rentalCount: state.pl.rentalCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'hold' ? 1 : 0),
      rentPortfolioCount: state.pl.rentPortfolioCount + (hustleId === 'r_labor' && state.pl.hustleBranchIds[hustleId] === 'l2b' ? 1 : 0),
      flipCount: state.pl.flipCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'flip' ? 1 : 0),
      stats: newStats,
      hustlePlays: newHustlePlays,
      tierStats: newTierStats,
      totalHustlesCompleted,
      lastExecutedHustleId: hustleId,
      streak: result.success ? (state.pl.streak || 0) + 1 : 0,
      hustleLevels: {
        ...state.pl.hustleLevels,
        [hustleId]: currentLevel
      },
      hustleBranchIds: hustle.branches ? {
        ...state.pl.hustleBranchIds,
        [hustleId]: state.pl.hustleBranchIds[hustleId] || hustle.startBranchId || ''
      } : state.pl.hustleBranchIds,
    });

    let runningPl = hustleResultPl;
    if (totalHustlesCompleted === 1 && !runningPl.history?.some(h => h.id === 'first_hustle')) {
      runningPl = recordHistoryEvent(runningPl, {
        id: 'first_hustle',
        title: 'First Hustle Completed',
        description: `Successfully completed first hustle: ${hustle.name}.`,
        category: 'CAREER',
        importance: 2,
        month: runningPl.month
      });
    }
    const sideEvents: { type: GameEventType, metadata: any }[] = [];

    if (result.tickerMessages?.some(m => m.text.includes('DATA BREACH'))) {
      sideEvents.push({ type: 'SCANDAL_TRIGGERED', metadata: { type: 'DATA_BREACH' } });
      runningPl.scandalCount = (runningPl.scandalCount || 0) + 1;
      const bioUpdate = Bio.recordScandal(runningPl, 'DATA_BREACH');
      if (bioUpdate) {
        runningPl = {
          ...runningPl,
          biography: [...(runningPl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(runningPl.recordedBioKeys || []), bioUpdate.key!]
        };
      }
    }
    if (runningPl.heat > 90) {
      sideEvents.push({ type: 'SCANDAL_TRIGGERED', metadata: { type: 'POLICE_RAID_RISK', heat: runningPl.heat } });
      const bioUpdate = Bio.recordScandal(runningPl, 'POLICE_RAID_RISK');
      if (bioUpdate) {
        runningPl = {
          ...runningPl,
          biography: [...(runningPl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(runningPl.recordedBioKeys || []), bioUpdate.key!]
        };
      }
    }

    const {
      newPl,
      newMarket,
      news: monthNews,
      shouldDie,
      deathCause,
      fatalStat,
      fatalStatValue,
      totalRent,
      passiveIncome,
      passiveBreakdown
    } = advanceMonth(
      runningPl,
      state.currentMarket,
      state.unlockedLegacyUpgradeIds
    );

    let plFinal = enforceStatCaps(newPl);
    plFinal.lastPassiveBreakdown = passiveBreakdown;

    // Update active challenges
    if (result.success && state.pl.activeChallenges.length > 0) {
      const updatedChallenges = state.pl.activeChallenges.map(c => {
        if (c.tier === hustle.tier) {
          const newCompleted = c.hustlesCompleted + 1;
          if (newCompleted >= c.hustlesRequired) {
            // Challenge Won
            const bonus = Math.floor(state.pl.bag * 0.1);
            get().addTickerMessage(`🏆 CHALLENGE WON: You defeated ${c.rivalName}! +$${bonus.toLocaleString()} (10% of bag).`, 'text-emerald-400 font-bold');

            const bioUpdate = Bio.recordRivalDefeat(plFinal, c.rivalName, c.tier);
            plFinal = {
              ...plFinal,
              bag: plFinal.bag + bonus,
              biography: bioUpdate ? [...(plFinal.biography || []), bioUpdate.entry] : plFinal.biography,
              recordedBioKeys: (bioUpdate && bioUpdate.key) ? [...(plFinal.recordedBioKeys || []), bioUpdate.key] : plFinal.recordedBioKeys,
              crushedRivals: [...plFinal.crushedRivals, c.rivalId]
            };
            sideEvents.push({ type: 'RIVAL_DEFEATED', metadata: { rivalId: c.rivalId, rivalName: c.rivalName, bonus } });
            return null; // Remove challenge
          }
          return { ...c, hustlesCompleted: newCompleted };
        }
        return c;
      }).filter(Boolean) as Challenge[];

      plFinal = { ...plFinal, activeChallenges: updatedChallenges };
    }

    let reactedPl = plFinal;
    if (newPl.inJail && !runningPl.inJail) {
      reactedPl = processWorldReaction(reactedPl, 'ARREST', {}).updatedPl;
    } else if (shouldDie && fatalStat === 'bag') {
      reactedPl = processWorldReaction(reactedPl, 'BANKRUPTCY', {}).updatedPl;
    } else if (result.success) {
      const netChange = result.yieldCash - result.cost;
      if (hustleId === 'philanthropy_empire') {
        reactedPl = processWorldReaction(reactedPl, 'PHILANTHROPY', { cost: result.cost }).updatedPl;
        reactedPl.narrativeFlags = {
          ...reactedPl.narrativeFlags,
          just_donated_charity: true
        };
      } else {
        const totalPlays = Object.values(state.pl.hustlePlays || {}).reduce((a, b) => a + b, 0);
        const isFirstBusiness = totalPlays === 0;
        if (isFirstBusiness) {
          reactedPl = processWorldReaction(reactedPl, 'FIRST_BUSINESS_LAUNCH', { hustleName: hustle.name, cost: result.cost }).updatedPl;
        } else if ((state.pl.hustlePlays[hustleId] || 0) === 0) {
          reactedPl = processWorldReaction(reactedPl, 'BUSINESS_LAUNCH', { hustleName: hustle.name, cost: result.cost }).updatedPl;
        }
        if (netChange >= 50000) {
          reactedPl = processWorldReaction(reactedPl, 'HUGE_PROFIT', { profit: netChange, hustleName: hustle.name }).updatedPl;
        } else if (netChange < -10000) {
          reactedPl = processWorldReaction(reactedPl, 'MAJOR_LOSS', { profit: netChange, hustleName: hustle.name }).updatedPl;
        }
      }
    } else {
      reactedPl = processWorldReaction(reactedPl, 'BUSINESS_FAILURE', { hustleName: hustle.name }).updatedPl;
    }

    plFinal = reactedPl;

    // --- SINGLE SOURCE OF TRUTH TRANSACTION CALCULATIONS ---
    const appliedCashDelta = plFinal.bag - initialBag;
    const appliedCloutDelta = plFinal.clout - initialClout;
    const appliedAuraDelta = plFinal.aura - initialAura;
    const appliedMentalDelta = plFinal.mentalHealth - initialMental;
    const appliedHeatDelta = plFinal.heat - initialHeat;

    // Synchronize result values with exact finalized applied deltas so the UI consumes the final state of the transaction
    result.netChange = appliedCashDelta;
    result.yieldCash = appliedCashDelta + result.cost; // ensures yieldCash - cost equals appliedCashDelta exactly!
    result.yieldClout = appliedCloutDelta;
    result.yieldAura = appliedAuraDelta;
    result.mentalHit = appliedMentalDelta;
    result.heatHit = appliedHeatDelta;

    // Update play statistics and trackers with finalized applied transaction yields
    if (plFinal.stats) {
      plFinal.stats.lifetimeEarnings = (state.pl.stats?.lifetimeEarnings || 0) + Math.max(0, appliedCashDelta);
    }
    if (plFinal.tierStats?.[tier]) {
      plFinal.tierStats[tier].earnings = (state.pl.tierStats?.[tier]?.earnings || 0) + Math.max(0, appliedCashDelta);
    }
    plFinal.annualCashEarned = state.pl.annualCashEarned + Math.max(0, appliedCashDelta);

    const actionLogData: Omit<GameAction, 'id' | 'timestamp'> = {
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: currentLevel,
      branchId: levelData.id || '',
      branchName: levelData.name || hustle.name,
      cost: result.cost,
      yieldCash: result.yieldCash,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: result.netChange,
      success: result.success,
      passiveAdded: result.passiveAdded !== undefined ? result.passiveAdded : (levelData.passiveYield || 0),
      rentDeducted: totalRent,
      passiveIncomeTotal: passiveIncome,
      passiveBreakdown,
      marketMult: { yield: 1, expense: 1, heat: 1 },
      marketName: state.currentMarket,
      variation: 0
    };

    if (newMarket !== state.currentMarket) {
      sideEvents.push({ type: 'ECONOMIC_EVENT', metadata: { from: state.currentMarket, to: newMarket } });
    }

    plFinal.mentalShieldTurns += (result.shieldTurns || 0);

    if (plFinal.rivals) {
      plFinal.rivals = plFinal.rivals.map(r => ({ ...r, currentBid: 0 }));
    }

    if (hustleId === 'r_vending' && result.success) {
      sideEvents.push({ type: 'BUSINESS_PURCHASED', metadata: { assetId: 'vending', cost: result.cost } });
      const bioUpdate = Bio.recordBusiness(plFinal, 'Vending Machine', 18 + Math.floor(state.pl.month / 12));
      if (bioUpdate) {
        plFinal = {
          ...plFinal,
          biography: [...(plFinal.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(plFinal.recordedBioKeys || []), bioUpdate.key!]
        };
      }
    }

    const executionNews = { text: ` ${result.success ? '✅' : '❌'} ${hustle.name}: ${result.success ? 'Success' : 'Failure'} - Net $${appliedCashDelta.toLocaleString()}`, tier: plFinal.currentTier };
    const finalNews = [
      ...monthNews,
      ...(result.bigWinMessage ? [{ text: result.bigWinMessage, colorClass: 'text-emerald-400 font-black animate-bounce', tier: plFinal.currentTier }] : []),
      executionNews,
      ...(result.tickerMessages || []),
      ...get().news
    ].slice(0, 50);

    let finalPh = state.ph;

    // Recalculate legacy score before saving
    plFinal.legacyScore = calculateLegacyScore(plFinal);

    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (shouldDie) {
      const lastHustleId = plFinal.lastExecutedHustleId || 'DEFAULT';
      const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = deathCause;

      plFinal.deathContext = {
        mentalHealthAtDeath: Math.floor(plFinal.mentalHealth),
        lastHustleMentalHit: Math.abs(appliedMentalDelta),
        lastHustleName: levelData.name || hustle.name,
        heatAtDeath: Math.floor(plFinal.heat),
        monthsPlayed: plFinal.month,
        tier: plFinal.currentTier,
        fatalStat,
        fatalStatValue,
        preStatValue: fatalStat === 'mental' ? runningPl.mentalHealth :
                     fatalStat === 'bag' ? runningPl.bag :
                     fatalStat === 'clout' ? runningPl.clout :
                     fatalStat === 'aura' ? runningPl.aura : runningPl.heat,
        baseDamage: result.deathBreakdown?.baseDamage,
        multipliers: result.deathBreakdown?.multipliers,
        finalDamage: result.deathBreakdown?.finalDamage,
        postStatValue: fatalStatValue
      };

      set({ bankedLegacyPoints: state.bankedLegacyPoints + (plFinal.legacyScore || 0) });

      plFinal.deathCount = (plFinal.deathCount || 0) + 1;

      if (finalDeathBadge && !plFinal.collectedDeathBadges.includes(finalDeathBadge)) {
        plFinal.collectedDeathBadges.push(finalDeathBadge);
      }

      const dominantStat = getDominantStat(plFinal);
      const ending = getEnding(plFinal.legacyScore || 0, dominantStat);
      const arrestSummary = Bio.recordArrestSummary(plFinal);
      if (arrestSummary) {
        plFinal = {
          ...plFinal,
          biography: [...(plFinal.biography || []), arrestSummary.entry],
          recordedBioKeys: [...(plFinal.recordedBioKeys || []), arrestSummary.key!]
        };
      }
      const bioUpdate = Bio.recordDeath(plFinal, ending.title, finalFatalCause || 'Unknown cause');
      if (bioUpdate) {
        plFinal = {
          ...plFinal,
          biography: [...(plFinal.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(plFinal.recordedBioKeys || []), bioUpdate.key!]
        };
      }
      let savedEndings = [];
      try {
        savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
      } catch (e) {
        savedEndings = [];
      }
      if (!savedEndings.includes(ending.title)) {
        savedEndings.push(ending.title);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
          } catch (e) {}
        }
      }

      sideEvents.push({
        type: 'SPECIAL_EVENT',
        metadata: {
          type: 'ENDING_UNLOCKED',
          title: ending.title,
          legacyPoints: plFinal.legacyScore || 0
        }
      });

      // Update best run
      if (plFinal.stats) {
        if (!plFinal.stats.bestRunBag || plFinal.bag > plFinal.stats.bestRunBag) {
          plFinal.stats.bestRunBag = plFinal.bag;
          plFinal.stats.bestRunTier = plFinal.currentTier;
          plFinal.stats.bestRunEnding = ending.title;
        }
      }
    }

    const hustleCompletedEvent = {
      type: 'HUSTLE_COMPLETED' as const,
      metadata: {
        hustleId,
        hustleName: hustle.name,
        success: result.success,
        profit: appliedCashDelta,
        yieldClout: appliedCloutDelta,
        yieldAura: appliedAuraDelta,
        mentalHit: appliedMentalDelta,
        heatHit: appliedHeatDelta,
        level: currentLevel,
        miniGame: hustle.miniGame || levelData.miniGame,
        multiplier: minigameMultiplier,
        rentDeducted: totalRent,
        passiveIncomeTotal: passiveIncome,
        passiveBreakdown
      }
    };

    set({
      pl: plFinal,
      currentMarket: newMarket,
      news: finalNews,
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
    });

    sideEvents.forEach(e => get().logEvent(e.type, e.metadata));
    get().logEvent(hustleCompletedEvent.type, hustleCompletedEvent.metadata);

    const { updateChallengeProgress } = get();
    updateChallengeProgress('hustle_count', 1);
    updateChallengeProgress('earn_cash', result.yieldCash);
    updateChallengeProgress('clout_gain', result.yieldClout);
    updateChallengeProgress('aura_gain', result.yieldAura);

    if (result.success) {
      if (result.isRare) {
        const { updateChallengeProgress: updateCP } = get();
        updateCP('big_win', 1);
      }
      if (hustleId === 'real_estate_empire') {
        get().logEvent('PROPERTY_PURCHASED', { type: state.pl.realEstateType, cost: result.cost });
      } else if (hustleId === 'privateequity') {
        get().logEvent('COMPANY_ACQUIRED', { level: currentLevel, cost: result.cost });
      } else if (hustleId === 'venture_capital') {
        get().logEvent('INVESTMENT_MADE', { sector: state.pl.vcSector, investment: result.cost });
        if (result.yieldCash > result.cost) {
          get().logEvent('MARKET_WIN', { type: 'VC_EXIT', profit: result.yieldCash - result.cost });
        }
      } else if (hustleId === 'hedgefund') {
        if (result.yieldCash > result.cost) {
          get().logEvent('MARKET_WIN', { type: 'TRADE_SUCCESS', profit: result.yieldCash - result.cost });
        }
      } else if (hustleId === 'data_monopoly' || hustleId === 'central_bank_play') {
        get().logEvent('LAW_PASSED', {
          hustleId,
          name: hustle.name,
          cost: result.cost,
          cloutCost: levelData.cloutReq,
          approvalImpact: result.approvalBonus || 0
        });
      } else if (hustleId === 'media_empire') {
        get().logEvent('SPECIAL_EVENT', {
          type: 'MEDIA_EXPANSION',
          level: currentLevel,
          passiveAdded: result.passiveAdded
        });
      }

      const activeRival = state.pl.rivals?.find(r => r.currentBid > 0);
      if (activeRival) {
        get().logEvent('RIVAL_DEFEATED', { rivalName: activeRival.name, bid: activeRival.currentBid });
      }
    }

    get().logAction(actionLogData);
    get().checkMilestones();

    return result;
  },

  upgradeHustle: (hustleId, branchId) => {
    const state = get();
    if (state.pl.inJail) return false;
    const hustle = HUSTLES[hustleId];

    if (!hustle) return false;

    let targetNodeData: HustleLevel | undefined;
    let isRepeat = false;

    if (hustle.branches) {
      const currentNodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
      const currentNode = currentNodeId ? hustle.branches[currentNodeId] : undefined;

      if (branchId) {
        if (currentNode?.nextBranches?.includes(branchId)) {
          targetNodeData = hustle.branches[branchId];
        }
        else if (branchId === currentNodeId && currentNode?.isRepeatable) {
          const currentCount = (hustleId === 'r_vending')
            ? state.pl.vendingCount
            : (branchId === 'l2a' ? state.pl.flipCount : (branchId === 'l2b' ? state.pl.rentPortfolioCount : 0));

          if (!currentNode.maxRepeat || currentCount < currentNode.maxRepeat) {
            targetNodeData = currentNode;
            isRepeat = true;
          } else {
            const msg = branchId === 'l2b' ? `Maximum ${currentNode.maxRepeat} Rent Portfolios reached.` : `Maximum ${currentNode.maxRepeat} reached`;
            get().addTickerMessage(msg, 'text-red-400');
            return false;
          }
        }
      }
    } else if (hustle.levels) {
      const currentLevel = state.pl.hustleLevels[hustleId] || 1;
      targetNodeData = hustle.levels.find(l => l.level === currentLevel + 1);
    }

    if (!targetNodeData) return false;

    const market = MARKET_CONFIGS[state.currentMarket];
    const isVending = hustleId === 'r_vending';

    const rivalThreat = state.pl.rivalThreats?.[hustle.tier] || 'NEUTRAL';
    const result = calculateHustleMath(
      hustleId,
      targetNodeData,
      1, // Level upgrades use base cost
      isVending ? 1 : market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1,
      true,
      state.pl.mentalShieldTurns,
      rivalThreat
    );

    // Apply Flex Asset Bonuses
    applyFlexBonuses(result, calculateFlexBonuses(state.pl));

    if (state.pl.bag < result.cost) return false;

    // Backup if spending > 10%
    if (result.cost > state.pl.bag * 0.1) {
      backupSave();
    }

    if (state.pl.clout < targetNodeData.cloutReq) return false;
    if (state.pl.aura < targetNodeData.auraReq) return false;

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    newStats.successfulHustles += 1;
    const totalHustlesCompleted = state.pl.totalHustlesCompleted + 1;

    const newHustlePlays = { ...state.pl.hustlePlays };
    newHustlePlays[hustleId] = (newHustlePlays[hustleId] || 0) + 1;

    const newTierStats = { ...state.pl.tierStats };
    const tier = hustle.tier;
    if (!newTierStats[tier]) {
      newTierStats[tier] = { plays: 0, earnings: 0, favoriteHustle: hustle.name };
    }
    newTierStats[tier].plays += 1;
    // Favorite hustle check
    const tierHustles = Object.values(HUSTLES).filter(h => h.tier === tier);
    let favorite = newTierStats[tier].favoriteHustle;
    let maxPlays = 0;
    tierHustles.forEach(h => {
      const plays = newHustlePlays[h.id] || 0;
      if (plays > maxPlays) {
        maxPlays = plays;
        favorite = h.name;
      }
    });
    newTierStats[tier].favoriteHustle = favorite;

    const newPl = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - result.cost,
      clout: state.pl.clout + result.yieldClout,
      aura: state.pl.aura + result.yieldAura,
      mentalHealth: state.pl.mentalHealth + result.mentalHit,
      heat: state.pl.heat + result.heatHit,
      mentalShieldTurns: state.pl.mentalShieldTurns + result.shieldTurns,
      stats: newStats,
      hustlePlays: newHustlePlays,
      tierStats: newTierStats,
      totalHustlesCompleted,
      monthsSinceLastHustle: 0, // Reset inactivity tracker on any attempt
    });
    newPl.legacyScore = calculateLegacyScore(newPl);

    if (hustle.branches && (branchId || targetNodeData.id)) {
      const nodeId = branchId || targetNodeData.id!;
      newPl.hustleBranchIds = {
        ...state.pl.hustleBranchIds,
        [hustleId]: nodeId
      };
      newPl.hustleLevels = {
        ...state.pl.hustleLevels,
        [hustleId]: targetNodeData.level
      };

      if (hustleId === 'r_vending') {
        newPl.vendingCount += 1;
      } else {
        if (nodeId === 'l2a') newPl.flipCount += 1;
        if (nodeId === 'l2b') newPl.rentPortfolioCount += 1;
      }
    } else {
      newPl.hustleLevels = {
        ...state.pl.hustleLevels,
        [hustleId]: targetNodeData.level
      };
    }

    const checkBranchId = branchId || targetNodeData.id || '';
    const isTimelineTick = checkBranchId === 'vending' || hustleId === 'r_vending' || (checkBranchId === 'l2b' && hustleId === 'r_labor') || (checkBranchId === 'l1' && hustleId === 'r_labor');
    let finalNextPl = newPl;

    const oldMaxLevel = Object.values(state.pl.hustleLevels || {}).reduce((max, lvl) => Math.max(max, lvl), 1);
    const newLevel = targetNodeData.level;
    const isFirstEmployee = oldMaxLevel === 1 && newLevel >= 2;
    if (isFirstEmployee) {
      finalNextPl = processWorldReaction(finalNextPl, 'FIRST_EMPLOYEE', { hustleName: hustle.name }).updatedPl;
      finalNextPl.narrativeFlags = {
        ...finalNextPl.narrativeFlags,
        just_hired_employee: true
      };
    }
    let finalCurrentMarket = state.currentMarket;
    let tickNews: (string | TickerMessage)[] = [];
    let advancementResult: any = null;

    let finalPh = state.ph;
    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (isTimelineTick) {
      advancementResult = advanceMonth(
        finalNextPl,
        state.currentMarket,
        state.unlockedLegacyUpgradeIds
      );

      finalNextPl = enforceStatCaps(advancementResult.newPl);
      finalNextPl.lastPassiveBreakdown = advancementResult.passiveBreakdown;
      finalCurrentMarket = advancementResult.newMarket;
      tickNews = advancementResult.news;

      finalNextPl.legacyScore = calculateLegacyScore(finalNextPl);

      if (advancementResult.shouldDie) {
        const deathInfo = DEATH_MESSAGES[hustleId] || DEATH_MESSAGES['DEFAULT'];
        finalPh = 'POST_MORTEM';
        finalDeathBadge = deathInfo.badge;
        finalFatalCause = advancementResult.deathCause;

        finalNextPl.deathContext = {
          mentalHealthAtDeath: Math.floor(finalNextPl.mentalHealth),
          lastHustleMentalHit: Math.abs(result.mentalHit || 0),
          lastHustleName: targetNodeData.name || hustle.name,
          heatAtDeath: Math.floor(finalNextPl.heat),
          monthsPlayed: finalNextPl.month,
          tier: finalNextPl.currentTier,
          fatalStat: advancementResult.fatalStat,
          fatalStatValue: advancementResult.fatalStatValue,
          preStatValue: advancementResult.fatalStat === 'mental' ? newPl.mentalHealth :
                       advancementResult.fatalStat === 'bag' ? newPl.bag :
                       advancementResult.fatalStat === 'clout' ? newPl.clout :
                       advancementResult.fatalStat === 'aura' ? newPl.aura : newPl.heat,
          baseDamage: result.mentalHit,
          finalDamage: result.mentalHit,
          postStatValue: advancementResult.fatalStatValue
        };

        set({ bankedLegacyPoints: state.bankedLegacyPoints + (finalNextPl.legacyScore || 0) });

        finalNextPl.deathCount = (finalNextPl.deathCount || 0) + 1;
        if (finalDeathBadge && !finalNextPl.collectedDeathBadges.includes(finalDeathBadge)) {
          finalNextPl.collectedDeathBadges.push(finalDeathBadge);
        }

        const finalStat = getDominantStat(finalNextPl);
        const ending = getEnding(finalNextPl.legacyScore || 0, finalStat);
        const arrestSummary = Bio.recordArrestSummary(finalNextPl);
        if (arrestSummary) {
          finalNextPl.biography = [...(finalNextPl.biography || []), arrestSummary.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), arrestSummary.key!];
        }
        const bioUpdate = Bio.recordDeath(finalNextPl, ending.title, finalFatalCause || 'Unknown cause');
        if (bioUpdate) {
          finalNextPl.biography = [...(finalNextPl.biography || []), bioUpdate.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!];
        }
        let savedEndings = [];
        try {
          savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
        } catch (e) {
          savedEndings = [];
        }
        if (!savedEndings.includes(ending.title)) {
          savedEndings.push(ending.title);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
            } catch (e) {}
          }
        }

        get().logEvent('SPECIAL_EVENT', {
          type: 'ENDING_UNLOCKED',
          title: ending.title,
          legacyPoints: finalNextPl.legacyScore || 0
        });

        if (finalNextPl.stats) {
          if (!finalNextPl.stats.bestRunBag || finalNextPl.bag > finalNextPl.stats.bestRunBag) {
            finalNextPl.stats.bestRunBag = finalNextPl.bag;
            finalNextPl.stats.bestRunTier = finalNextPl.currentTier;
            finalNextPl.stats.bestRunEnding = ending.title;
          }
        }
      }

      console.log(`⏰ TIMELINE GUARD: Executed ${hustleId}:${checkBranchId}. Time advanced 1 month.`);
    } else {
      const { shouldDie, deathCause, fatalStat, fatalStatValue } = checkDeathConditions(finalNextPl);
      if (shouldDie) {
        const deathInfo = DEATH_MESSAGES[hustleId] || DEATH_MESSAGES['DEFAULT'];
        finalPh = 'POST_MORTEM';
        finalDeathBadge = deathInfo.badge;
        finalFatalCause = deathCause;

        finalNextPl.deathContext = {
          mentalHealthAtDeath: Math.floor(finalNextPl.mentalHealth),
          lastHustleMentalHit: Math.abs(result.mentalHit || 0),
          lastHustleName: targetNodeData.name || hustle.name,
          heatAtDeath: Math.floor(finalNextPl.heat),
          monthsPlayed: finalNextPl.month,
          tier: finalNextPl.currentTier,
          fatalStat,
          fatalStatValue,
          preStatValue: fatalStat === 'mental' ? state.pl.mentalHealth :
                       fatalStat === 'bag' ? state.pl.bag :
                       fatalStat === 'clout' ? state.pl.clout :
                       fatalStat === 'aura' ? state.pl.aura : state.pl.heat,
          baseDamage: result.mentalHit,
          finalDamage: result.mentalHit,
          postStatValue: fatalStatValue
        };

        set({ bankedLegacyPoints: state.bankedLegacyPoints + (finalNextPl.legacyScore || 0) });

        finalNextPl.deathCount = (finalNextPl.deathCount || 0) + 1;
        if (finalDeathBadge && !finalNextPl.collectedDeathBadges.includes(finalDeathBadge)) {
          finalNextPl.collectedDeathBadges.push(finalDeathBadge);
        }

        const finalStat = getDominantStat(finalNextPl);
        const ending = getEnding(finalNextPl.legacyScore || 0, finalStat);
        const arrestSummary = Bio.recordArrestSummary(finalNextPl);
        if (arrestSummary) {
          finalNextPl.biography = [...(finalNextPl.biography || []), arrestSummary.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), arrestSummary.key!];
        }
        const bioUpdate = Bio.recordDeath(finalNextPl, ending.title, finalFatalCause || 'Unknown cause');
        if (bioUpdate) {
          finalNextPl.biography = [...(finalNextPl.biography || []), bioUpdate.entry];
          finalNextPl.recordedBioKeys = [...(finalNextPl.recordedBioKeys || []), bioUpdate.key!];
        }
        let savedEndings = [];
        try {
          savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
        } catch (e) {
          savedEndings = [];
        }
        if (!savedEndings.includes(ending.title)) {
          savedEndings.push(ending.title);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
            } catch (e) {}
          }
        }

        get().logEvent('SPECIAL_EVENT', {
          type: 'ENDING_UNLOCKED',
          title: ending.title,
          legacyPoints: finalNextPl.legacyScore || 0
        });

        if (finalNextPl.stats) {
          if (!finalNextPl.stats.bestRunBag || finalNextPl.bag > finalNextPl.stats.bestRunBag) {
            finalNextPl.stats.bestRunBag = finalNextPl.bag;
            finalNextPl.stats.bestRunTier = finalNextPl.currentTier;
            finalNextPl.stats.bestRunEnding = ending.title;
          }
        }
      }
    }

    const executionNewsStr = `${isRepeat ? '🔄' : '⬆️'} ${isRepeat ? 'Purchased' : 'Upgraded'}: ${targetNodeData.name || hustle.name} (-$${result.cost.toLocaleString()})`;

    set({
      pl: enforceStatCaps(finalNextPl),
      currentMarket: finalCurrentMarket,
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
      news: isTimelineTick
        ? [...tickNews, executionNewsStr, ...state.news].slice(0, 50)
        : [executionNewsStr, ...state.news.slice(0, 49)]
    });

    const appliedCash = finalNextPl.bag - state.pl.bag;
    const appliedClout = finalNextPl.clout - state.pl.clout;
    const appliedAura = finalNextPl.aura - state.pl.aura;
    const appliedMental = finalNextPl.mentalHealth - state.pl.mentalHealth;
    const appliedHeat = finalNextPl.heat - state.pl.heat;

    get().logEvent('HUSTLE_COMPLETED', {
      hustleId,
      hustleName: hustle.name,
      success: true,
      profit: appliedCash,
      yieldClout: appliedClout,
      yieldAura: appliedAura,
      mentalHit: appliedMental,
      heatHit: appliedHeat,
      level: targetNodeData.level,
      multiplier: 1.0,
      rentDeducted: isTimelineTick ? (advancementResult?.totalRent) : 0,
      passiveIncomeTotal: isTimelineTick ? (advancementResult?.passiveIncome) : 0,
      passiveBreakdown: isTimelineTick ? (advancementResult?.passiveBreakdown) : undefined
    });

    get().logAction({
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: targetNodeData.level,
      branchId: targetNodeData.id || '',
      branchName: targetNodeData.name || hustle.name,
      cost: result.cost,
      yieldCash: 0,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: appliedCash,
      success: true,
      passiveAdded: targetNodeData.passiveYield || 0,
      marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
      marketName: market.name,
      variation: 0
    });
    get().checkMilestones();

    return true;
  },

  advanceTier: () => {
    const state = get();
    if (state.pl.inJail) return false;
    const currentIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
    const nextTier = PROGRESSION_ORDER[currentIndex + 1];

    if (!nextTier) return false;

    const req = TIER_REQUIREMENTS[nextTier];

    const isTutorialStep6 = !state.isTutorialSkipped && state.tutorialStep === 5;

    if (isTutorialStep6 || (state.pl.bag >= req.cash &&
        state.pl.clout >= req.clout &&
        state.pl.aura >= req.aura)) {

      if (isTutorialStep6) {
         // Tutorial auto-advance logic
         const nextPl = enforceStatCaps({
            ...state.pl,
            currentTier: nextTier,
         });
         set({ pl: nextPl, activeTab: nextTier });
         get().setActiveTab(nextTier);
         return true;
      }

      // Instead of immediate advancement, we trigger the specialization selection
      set({ pendingSpecialization: true });
      return true;
    }

    const missing = [];
    if (state.pl.bag < req.cash) missing.push(`$${req.cash.toLocaleString()} cash`);
    if (state.pl.clout < req.clout) missing.push(`${req.clout} clout`);
    if (state.pl.aura < req.aura) missing.push(`${req.aura} aura`);

    set({
      news: [`❌ Cannot advance to ${nextTier}: Need ${missing.join(', ')}`, ...state.news.slice(0, 49)]
    });

    return false;
  },

  purchaseFlexAsset: (assetId) => {
    const state = get();
    const asset = FLEX_ASSETS.find(a => a.id === assetId);

    if (!asset) return false;
    if (state.pl.bag < asset.cost) return false;

    const newCount = (state.pl.flexAssets[assetId] || 0) + 1;

    const plAfterPurchase = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - asset.cost,
      flexAssets: {
        ...state.pl.flexAssets,
        [assetId]: newCount
      },
    });
    plAfterPurchase.legacyScore = calculateLegacyScore(plAfterPurchase);

    const { shouldDie, deathCause, fatalStat, fatalStatValue } = checkDeathConditions(plAfterPurchase);
    let finalPh = state.ph;
    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (shouldDie) {
      const deathInfo = DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = deathCause;

      plAfterPurchase.deathContext = {
        mentalHealthAtDeath: Math.floor(plAfterPurchase.mentalHealth),
        lastHustleMentalHit: 0,
        lastHustleName: asset.name,
        heatAtDeath: Math.floor(plAfterPurchase.heat),
        monthsPlayed: plAfterPurchase.month,
        tier: plAfterPurchase.currentTier,
        fatalStat,
        fatalStatValue,
        preStatValue: fatalStat === 'mental' ? state.pl.mentalHealth :
                     fatalStat === 'bag' ? state.pl.bag :
                     fatalStat === 'clout' ? state.pl.clout :
                     fatalStat === 'aura' ? state.pl.aura : state.pl.heat,
        baseDamage: asset.cost, // If they died of being broke
        finalDamage: asset.cost,
        postStatValue: fatalStatValue
      };

      set({ bankedLegacyPoints: state.bankedLegacyPoints + (plAfterPurchase.legacyScore || 0) });

      plAfterPurchase.deathCount = (plAfterPurchase.deathCount || 0) + 1;
      if (finalDeathBadge && !plAfterPurchase.collectedDeathBadges.includes(finalDeathBadge)) {
        plAfterPurchase.collectedDeathBadges.push(finalDeathBadge);
      }

      const finalStat = getDominantStat(plAfterPurchase);
      const ending = getEnding(plAfterPurchase.legacyScore || 0, finalStat);
      const arrestSummary = Bio.recordArrestSummary(plAfterPurchase);
      if (arrestSummary) {
        plAfterPurchase.biography = [...(plAfterPurchase.biography || []), arrestSummary.entry];
        plAfterPurchase.recordedBioKeys = [...(plAfterPurchase.recordedBioKeys || []), arrestSummary.key!];
      }
      const bioUpdate = Bio.recordDeath(plAfterPurchase, ending.title, finalFatalCause || 'Unknown cause');
      if (bioUpdate) {
        plAfterPurchase.biography = [...(plAfterPurchase.biography || []), bioUpdate.entry];
        plAfterPurchase.recordedBioKeys = [...(plAfterPurchase.recordedBioKeys || []), bioUpdate.key!];
      }
      let savedEndings = [];
      try {
        savedEndings = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
      } catch (e) {
        savedEndings = [];
      }
      if (!savedEndings.includes(ending.title)) {
        savedEndings.push(ending.title);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
          } catch (e) {}
        }
      }

      get().logEvent('SPECIAL_EVENT', {
        type: 'ENDING_UNLOCKED',
        title: ending.title,
        legacyPoints: plAfterPurchase.legacyScore || 0
      });

      if (plAfterPurchase.stats) {
        if (!plAfterPurchase.stats.bestRunBag || plAfterPurchase.bag > plAfterPurchase.stats.bestRunBag) {
          plAfterPurchase.stats.bestRunBag = plAfterPurchase.bag;
          plAfterPurchase.stats.bestRunTier = plAfterPurchase.currentTier;
          plAfterPurchase.stats.bestRunEnding = ending.title;
        }
      }
    }

    const { updatedPl: reactedPlPurchase } = processWorldReaction(plAfterPurchase, 'LUXURY_PURCHASE', { assetId, cost: asset.cost });

    set({
      pl: reactedPlPurchase,
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
      news: [`💎 Purchased ${asset.name}`, ...state.news.slice(0, 49)]
    });
    get().logEvent('BUSINESS_PURCHASED', { assetId, cost: asset.cost });

    return true;
  },

  serveMonth: () => {
    const state = get();
    if (!state.pl.inJail) return;

    const {
      newPl,
      newMarket,
      news: monthNews,
      shouldDie,
      deathCause,
      fatalStat,
      fatalStatValue,
    } = advanceMonth(
      state.pl,
      state.currentMarket,
      state.unlockedLegacyUpgradeIds
    );

    let finalPh = state.ph;
    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (shouldDie) {
      const deathInfo = DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = deathCause;

      newPl.deathContext = {
        mentalHealthAtDeath: Math.floor(newPl.mentalHealth),
        lastHustleMentalHit: 0,
        lastHustleName: 'Prison',
        heatAtDeath: Math.floor(newPl.heat),
        monthsPlayed: newPl.month,
        tier: newPl.currentTier,
        fatalStat,
        fatalStatValue,
        preStatValue: fatalStat === 'mental' ? state.pl.mentalHealth :
                     fatalStat === 'bag' ? state.pl.bag :
                     fatalStat === 'clout' ? state.pl.clout :
                     fatalStat === 'aura' ? state.pl.aura : state.pl.heat,
        postStatValue: fatalStatValue
      };

      set({ bankedLegacyPoints: state.bankedLegacyPoints + (calculateLegacyScore(newPl) || 0) });
      newPl.deathCount = (newPl.deathCount || 0) + 1;
    }

    set({
      pl: enforceStatCaps(newPl),
      currentMarket: newMarket,
      news: [...monthNews, ...state.news].slice(0, 50),
      ph: finalPh,
      deathBadge: finalDeathBadge,
      fatalCause: finalFatalCause,
    });
  },

  selectSpecialization: (specializationId) => {
    const state = get();
    const spec = SPECIALIZATIONS.find(s => s.id === specializationId);
    if (!spec) return;

    const currentIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
    const nextTier = PROGRESSION_ORDER[currentIndex + 1];
    if (!nextTier) return;

    const req = TIER_REQUIREMENTS[nextTier];
    const totalFee = req.fee * (1 - (spec.feeReduction || 0));

    if (state.pl.bag < totalFee) {
        set({
          pendingSpecialization: false,
          news: [`❌ Cannot advance to ${nextTier}: Need $${Math.floor(totalFee).toLocaleString()} for filing fees`, ...state.news.slice(0, 49)]
        });
        return;
    }

    backupSave();

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - totalFee,
      clout: Math.floor(state.pl.clout * spec.cloutTaxMultiplier),
      aura: Math.floor(state.pl.aura * spec.auraTaxMultiplier),
      currentTier: nextTier,
      activeSpecializationId: specializationId,
      specializationHistory: [...state.pl.specializationHistory, specializationId],
      prePresidencyTier: nextTier === 'PRESIDENT' ? state.pl.currentTier : state.pl.prePresidencyTier,
      congressSupport: nextTier === 'PRESIDENT' && state.pl.clout > 500 ? state.pl.congressSupport + 10 : state.pl.congressSupport,
      approvalFloor: nextTier === 'PRESIDENT' && state.pl.aura > 500 ? 5 : state.pl.approvalFloor,
      scandalRiskBonus: nextTier === 'PRESIDENT' && state.pl.heat > 70 ? 0.1 : state.pl.scandalRiskBonus,
    });
    nextPl.legacyScore = calculateLegacyScore(nextPl);

    const bioUpdate = Bio.recordTierAdvancement(state.pl, nextTier, spec.name);
    if (bioUpdate) {
      nextPl.biography = [...(nextPl.biography || []), bioUpdate.entry];
      nextPl.recordedBioKeys = [...(nextPl.recordedBioKeys || []), bioUpdate.key!];
    }

    const fromTier = state.pl.currentTier;
    const { updatedPl: reactedPlPromotion } = processWorldReaction(nextPl, 'TIER_PROMOTION', {
      tier: fromTier
    });

    let finalPromotionPl = reactedPlPromotion;
    if (nextTier === 'PRESIDENT') {
      finalPromotionPl = processWorldReaction(finalPromotionPl, 'ELECTION_VICTORY', {}).updatedPl;
    }

    const revealedBenefits: string[] = [];
    const masteredHustles = finalPromotionPl.masteredHustles || [];
    masteredHustles.forEach(hId => {
      const badge = HUSTLE_BADGES[hId];
      if (badge && badge.relevantTier === nextTier && badge.futureBenefit) {
        revealedBenefits.push(`Your ${badge.name} is now active: ${badge.futureBenefit}`);
      }
    });

    set({
      pl: finalPromotionPl,
      pendingSpecialization: false,
      activeTab: nextTier,
      news: [
        ...revealedBenefits.map(text => ({ text, colorClass: 'text-yellow-400 font-bold' })),
        ...(revealedBenefits.length > 0 ? ['Your past mastery is paying off.'] : []),
        `🎉 ADVANCED to ${nextTier} as ${spec.name}!`,
        ...state.news
      ].slice(0, 50)
    });

    revealedBenefits.forEach(benefit => {
      get().logEvent('SPECIAL_EVENT', { type: 'BADGE_BENEFIT_ACTIVE', message: benefit });
    });

    get().logEvent('PROMOTION_EARNED', { from: state.pl.currentTier, to: nextTier, fee: totalFee, specialization: spec.name });
    showConfetti();
    get().setActiveTab(nextTier);
  },

  retaliateRival: (rivalId) => {
    const state = get();
    const rival = state.pl.rivals.find(r => r.id === rivalId);
    if (!rival) return false;

    const cost = Math.floor(state.pl.bag * 0.1);
    if (state.pl.bag < cost) {
      get().addTickerMessage("Not enough cash to retaliate!", "text-red-400");
      return false;
    }

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - cost,
      rivals: state.pl.rivals.map(r =>
        r.id === rivalId ? {
          ...r,
          netWorth: Math.floor(r.netWorth * 0.4),
          relationshipWithPlayer: Math.max(-100, (r.relationshipWithPlayer ?? 0) - 20)
        } : r
      )
    });

    let nextPlReacted = processWorldReaction(nextPl, 'RIVAL_DEFEAT', { hustleName: rival.name }).updatedPl;
    const bioUpdate = Bio.recordRivalDefeat(nextPlReacted, rival.name, rival.tier);
    if (bioUpdate) {
      nextPlReacted.biography = [...(nextPlReacted.biography || []), bioUpdate.entry];
      nextPlReacted.recordedBioKeys = [...(nextPlReacted.recordedBioKeys || []), bioUpdate.key!];
    }

    recordHistoryEvent(nextPlReacted, {
      id: `rival_retaliation_${rival.id}_${nextPlReacted.month}`,
      title: `Retaliation Dispatched`,
      description: `Launched a massive retaliatory operation against ${rival.name}, crushing their bottom line and reclaiming dominance.`,
      category: 'RIVAL',
      importance: 4,
      participants: [rival.name],
      month: nextPlReacted.month
    });

    set({
      pl: nextPlReacted,
      news: [{ text: `🔥 RETALIATION: You hit ${rival.name}'s bottom line. Their net worth plummeted! (-$${cost.toLocaleString()})`, colorClass: 'text-orange-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    get().logEvent('SPECIAL_EVENT', { type: 'RIVAL_RETALIATION', rivalId, rivalName: rival.name, cost });
    return true;
  },

  sabotageRival: (rivalId) => {
    const state = get();
    const rival = state.pl.rivals.find(r => r.id === rivalId);
    if (!rival) return;

    const cost = GAME_CONSTANTS.SABOTAGE_COST;
    if (state.pl.bag < cost) {
      get().addTickerMessage("Not enough cash to sabotage rival!", "text-red-400");
      return;
    }

    if (rival.lastSabotagedMonth === state.pl.month) {
      get().addTickerMessage("Already sabotaged this rival this month!", "text-yellow-400");
      return;
    }

    const reputation = state.pl.narrativeFlags?.publicReputation as string || "The Hustler";
    let successChance = state.pl.chosenBackgroundCategory === 'street_kid' ? 0.85 : 0.75;
    if (reputation === "The Crime Boss") {
      successChance = Math.min(1.0, successChance + 0.15);
    }
    const success = Math.random() < successChance;
    let nextPl = { ...state.pl, bag: state.pl.bag - cost };

    if (success) {
      nextPl.rivals = nextPl.rivals.map(r =>
        r.id === rivalId ? {
          ...r,
          netWorth: Math.floor(r.netWorth * 0.8),
          lastSabotagedMonth: state.pl.month,
          vengeance: (r.vengeance || 1) + 1,
          sabotagedCount: (r.sabotagedCount ?? 0) + 1,
          relationshipWithPlayer: Math.max(-100, (r.relationshipWithPlayer ?? 0) - 30)
        } : r
      );
      nextPl.aura += 50;
      get().addTickerMessage(`🎯 SABOTAGE SUCCESS: ${rival.name}'s operations disrupted! Net worth -20%.`, "text-emerald-400 font-bold");

      recordHistoryEvent(nextPl, {
        id: `rival_sabotage_success_${rival.id}_${nextPl.month}`,
        title: `Sabotage Dispatched: Success`,
        description: `Successfully disrupted ${rival.name}'s business operations, cutting their net worth.`,
        category: 'RIVAL',
        importance: 3,
        participants: [rival.name],
        month: nextPl.month
      });

      if (!nextPl.history?.some(h => h.id === 'first_sabotage')) {
        recordHistoryEvent(nextPl, {
          id: 'first_sabotage',
          title: 'First Sabotage Dispatched',
          description: `Disrupted ${rival.name}'s active regional operations.`,
          category: 'RIVAL',
          importance: 3,
          participants: [rival.name],
          month: nextPl.month
        });
      }
    } else {
      nextPl.rivals = nextPl.rivals.map(r =>
        r.id === rivalId ? {
          ...r,
          lastSabotagedMonth: state.pl.month,
          vengeance: (r.vengeance || 1) + 0.5,
          sabotagedCount: (r.sabotagedCount ?? 0) + 1,
          relationshipWithPlayer: Math.max(-100, (r.relationshipWithPlayer ?? 0) - 15)
        } : r
      );
      nextPl.heat += 25;
      nextPl.aura -= 100;
      get().addTickerMessage(`🚫 SABOTAGE FAILED: You were nearly caught! Heat +25%, Aura -100.`, "text-red-500 font-bold");

      recordHistoryEvent(nextPl, {
        id: `rival_sabotage_fail_${rival.id}_${nextPl.month}`,
        title: `Sabotage Dispatched: Failure`,
        description: `Dispatched sabotage against ${rival.name} but the operation was compromised, increasing Heat.`,
        category: 'RIVAL',
        importance: 3,
        participants: [rival.name],
        month: nextPl.month
      });
    }

    // Resolve advice trigger for sabotage
    let adviceFollowedCountSabotage = nextPl.adviceFollowedCount || 0;
    const activeAdviceTriggersSabotage = (nextPl.activeAdviceTriggers || []).map(t => {
      if (t.extraCondition === 'sabotage_or_counter') {
        adviceFollowedCountSabotage++;
        return { ...t, resolved: true };
      }
      return t;
    }).filter(t => !t.resolved);
    nextPl.activeAdviceTriggers = activeAdviceTriggersSabotage;
    nextPl.adviceFollowedCount = adviceFollowedCountSabotage;

    set({ pl: enforceStatCaps(nextPl) });
    get().logEvent('SPECIAL_EVENT', { type: 'RIVAL_SABOTAGE', rivalId, success, cost });
  },

  helpRival: (rivalId: string) => {
    const state = get();
    const rival = state.pl.rivals.find(r => r.id === rivalId);
    if (!rival) return;

    // Cost to help/partner scales based on the tier
    const costs: Record<string, number> = {
      MUD: 1000, STREET: 10000, STARTUP: 100000, CORPORATE: 1000000, ELITE: 10000000, MOGUL: 20000000, PRESIDENT: 50000000, OPEN: 100000000
    };
    const cost = costs[rival.tier] || 10000;

    if (state.pl.bag < cost) {
      get().addTickerMessage(`Need $${cost.toLocaleString()} to partner with ${rival.name}!`, "text-red-400");
      return;
    }

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - cost,
      aura: state.pl.aura + 25,
      rivals: state.pl.rivals.map(r =>
        r.id === rivalId ? {
          ...r,
          helpedCount: (r.helpedCount ?? 0) + 1,
          relationshipWithPlayer: Math.min(100, (r.relationshipWithPlayer ?? 0) + 25)
        } : r
      )
    });

    let nextPlReacted = processWorldReaction(nextPl, 'RIVAL_PARTNERSHIP', { hustleName: rival.name }).updatedPl;

    recordHistoryEvent(nextPlReacted, {
      id: `rival_help_${rival.id}_${nextPlReacted.month}`,
      title: `Relief Investment: ${rival.name}`,
      description: `Backed ${rival.name}'s strategy with a $${cost.toLocaleString()} relief injection, establishing a solid partnership.`,
      category: 'RIVAL',
      importance: 3,
      participants: [rival.name],
      month: nextPlReacted.month
    });

    if (!nextPlReacted.history?.some(h => h.id === 'first_partnership')) {
      recordHistoryEvent(nextPlReacted, {
        id: 'first_partnership',
        title: 'First Partnership Established',
        description: `Backed ${rival.name}'s strategy with a $${cost.toLocaleString()} seed loan, establishing a mutual partnership.`,
        category: 'RIVAL',
        importance: 3,
        participants: [rival.name],
        month: nextPlReacted.month
      });
    }

    set({
      pl: nextPlReacted,
      news: [{ text: `🤝 PARTNERSHIP ESTABLISHED: You backed ${rival.name}'s strategy with a $${cost.toLocaleString()} seed loan. Relationship surged!`, colorClass: 'text-emerald-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    get().logEvent('SPECIAL_EVENT', { type: 'INVESTMENT_MADE', cost });
  },

  counterBid: (rivalId) => {
    const state = get();
    const rival = state.pl.rivals.find(r => r.id === rivalId);
    if (!rival || rival.currentBid <= 0) return;

    const cost = Math.floor(rival.currentBid * 1.5);
    if (state.pl.bag < cost) {
      get().addTickerMessage(`Need $${cost.toLocaleString()} to counter-bid!`, "text-red-400");
      return;
    }

    const nextPl = {
      ...state.pl,
      bag: state.pl.bag - cost,
      clout: state.pl.clout + 300,
      rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, currentBid: 0 } : r),
      // Use a special flag in dynamicPassives to track the yield bonus for the current month
      dynamicPassives: { ...state.pl.dynamicPassives, [`counter_bid_bonus_${rival.tier}`]: 1 }
    };

    let nextPlReacted = processWorldReaction(nextPl, 'RIVAL_DEFEAT', { hustleName: rival.name }).updatedPl;
    const bioUpdate = Bio.recordRivalDefeat(nextPlReacted, rival.name, rival.tier);
    if (bioUpdate) {
      nextPlReacted.biography = [...(nextPlReacted.biography || []), bioUpdate.entry];
      nextPlReacted.recordedBioKeys = [...(nextPlReacted.recordedBioKeys || []), bioUpdate.key!];
    }

    recordHistoryEvent(nextPlReacted, {
      id: `rival_counter_bid_${rival.id}_${nextPlReacted.month}`,
      title: `Bidding War Victory`,
      description: `Out-bid ${rival.name}'s aggressive expansion, permanently capturing their sector position for $${cost.toLocaleString()}.`,
      category: 'RIVAL',
      importance: 3,
      participants: [rival.name],
      month: nextPlReacted.month
    });

    // Resolve advice trigger for counter-bid
    let adviceFollowedCountCounterBid = nextPlReacted.adviceFollowedCount || 0;
    const activeAdviceTriggersCounterBid = (nextPlReacted.activeAdviceTriggers || []).map(t => {
      if (t.extraCondition === 'counter_bid' || t.extraCondition === 'sabotage_or_counter') {
        adviceFollowedCountCounterBid++;
        return { ...t, resolved: true };
      }
      return t;
    }).filter(t => !t.resolved);
    nextPlReacted.activeAdviceTriggers = activeAdviceTriggersCounterBid;
    nextPlReacted.adviceFollowedCount = adviceFollowedCountCounterBid;

    set({
      pl: enforceStatCaps(nextPlReacted),
      news: [{ text: `🤝 COUNTER-BID: You bought out ${rival.name}'s position! Clout +300. 1.2x Yield bonus for ${rival.tier} active.`, colorClass: 'text-blue-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    get().logEvent('SPECIAL_EVENT', { type: 'RIVAL_COUNTER_BID', rivalId, cost });
  },

  recruitRival: (rivalId) => {
    const state = get();
    const rival = state.pl.rivals.find(r => r.id === rivalId);
    if (!rival) return false;

    // Check eligibility using our helper
    if (!isRivalEligibleForRecruit(rival)) {
      get().addTickerMessage(`Cannot recruit ${rival.name}: Requirements not met!`, "text-red-400");
      return false;
    }

    // Set Rival status to 'ally' and clear bid
    const updatedRivals = state.pl.rivals.map(r =>
      r.id === rivalId ? { ...r, status: 'ally' as any, currentBid: 0 } : r
    );

    // Generate roster profile
    const profile = getRivalRosterProfile(rival);

    let name = rival.name;
    let avatarId = getRivalAvatarId(rival.name);
    let bio = `${rival.name} was recruited after a hard-fought rivalry in ${rival.tier}.`;

    if (rival.characterId) {
      const char = CHARACTERS.find(c => c.id === rival.characterId);
      if (char) {
        name = char.name;
        avatarId = char.portraitId;
        bio = char.background;
      }
    }

    const plUpdate: Partial<PlayerStats> = {
      rivals: updatedRivals,
    };

    const isStartupOrLower = ['MUD', 'STREET', 'STARTUP'].includes(rival.tier);
    if (isStartupOrLower) {
      const newFounder: Founder = {
        id: `founder_${rival.id}`,
        name,
        avatar: "💼",
        avatarId,
        companyName: `${name} Ventures`,
        pitchIdea: bio,
        followOnCount: 0,
        stats: {
          execution: profile.execution,
          vision: profile.vision,
          burnDiscipline: profile.burnDiscipline,
        }
      };
      plUpdate.foundersBacked = [...(state.pl.foundersBacked || []), newFounder];
    } else {
      const newExec: RegionalExecutive = {
        id: `exec_${rival.id}`,
        name,
        avatar: "👔",
        avatarId,
        competence: profile.competence,
        loyalty: profile.loyalty,
        riskTolerance: profile.riskTolerance,
        bio,
        personalityTraits: rival.preferredIndustries || []
      };
      plUpdate.conglomerateCandidates = [...(state.pl.conglomerateCandidates || []), newExec];
    }

    // Add biography / history log
    let finalPl = enforceStatCaps({
      ...state.pl,
      ...plUpdate,
    });

    const bioUpdate = Bio.recordRivalRecruitment(finalPl, name);
    if (bioUpdate) {
      finalPl = {
        ...finalPl,
        biography: [...(finalPl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(finalPl.recordedBioKeys || []), bioUpdate.key!]
      };
    }

    recordHistoryEvent(finalPl, {
      id: `rival_recruited_${rival.id}_${finalPl.month}`,
      title: `Adversary Recruited`,
      description: `Successfully recruited longtime rival ${name} as a dedicated business partner, converting a competitor into an ally.`,
      category: 'RIVAL',
      importance: 3,
      participants: [name],
      month: finalPl.month
    });

    set({
      pl: finalPl,
      news: [{ text: `🤝 RECRUITED: Turned longtime rival ${name} into an ally!`, colorClass: 'text-emerald-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    get().logEvent('SPECIAL_EVENT', { type: 'RIVAL_RECRUITED', rivalId, rivalName: name });
    return true;
  },

  resolveNarrativeEvent: (choiceId) => {
    const state = get();
    const eventId = state.pl.activeNarrative;
    if (!eventId) return;

    const event = NARRATIVE_EVENTS.find(e => e.id === eventId);
    const choice = event?.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const cons = choice.consequences;
    const nextPl = { ...state.pl };

    // Apply immediate consequences
    if (cons.bag) nextPl.bag += cons.bag;
    if (cons.clout) nextPl.clout += cons.clout;
    if (cons.aura) nextPl.aura += cons.aura;
    if (cons.heat) nextPl.heat += cons.heat;
    if (cons.mentalHealth) nextPl.mentalHealth += cons.mentalHealth;

    // Apply Narrative Flags
    if (choice.setFlags) {
      nextPl.narrativeFlags = {
        ...nextPl.narrativeFlags,
        ...choice.setFlags
      };
      if (choice.setFlags.sofia_charity_active) {
        nextPl.narrativeFlags.just_donated_charity = true;
      }
      if (choice.setFlags.cassie_shares_bought) {
        nextPl.narrativeFlags.just_bought_insider = true;
      }
      if (choice.setFlags.university_accepted) {
        nextPl.narrativeFlags.just_accepted_university = true;
      }
    }

    // Apply Biography Entry
    if (cons.biographyEntry) {
      const bioUpdate = Bio.recordEvent(nextPl, cons.biographyEntry, `narrative_${event!.id}_${choiceId}`);
      if (bioUpdate) {
        nextPl.biography = [...(nextPl.biography || []), bioUpdate.entry];
        nextPl.recordedBioKeys = [...(nextPl.recordedBioKeys || []), bioUpdate.key!];
      }
    }

    // Apply permanent passive
    if (cons.passiveCash) {
      nextPl.dynamicPassives = {
        ...nextPl.dynamicPassives,
        [`narrative_${event!.id}`]: cons.passiveCash
      };
    }

    // Specialization Lock/Override
    if (cons.specializationLock) {
        nextPl.activeSpecializationId = cons.specializationLock;
    }

    // Create Consequence(s) from choice
    if (choice.createConsequences) {
      if (!nextPl.consequences) nextPl.consequences = [];
      nextPl.consequences.push(...choice.createConsequences);
    }

    // Modify Consequence(s) from choice
    if (choice.modifyConsequences) {
      nextPl.consequences = (nextPl.consequences || []).map(c => {
        const mod = choice.modifyConsequences?.find(m => m.source === c.source);
        if (mod) {
          const updated = { ...c };
          if (mod.delay !== undefined) updated.delay = mod.delay;
          if (mod.expiry !== undefined) updated.expiry = mod.expiry;
          if (mod.severity !== undefined) updated.severity = mod.severity;
          return updated;
        }
        return c;
      });
    }

    // Resolve Consequence(s) from choice
    if (choice.resolveConsequences) {
      nextPl.consequences = (nextPl.consequences || []).map(c => {
        if (choice.resolveConsequences?.includes(c.source)) {
          return { ...c, status: 'resolved' as const };
        }
        return c;
      }).filter(c => c.status !== 'resolved');
    }

    // Clean up
    nextPl.activeNarrative = null;
    if (!nextPl.completedNarrativeEvents) nextPl.completedNarrativeEvents = [];
    nextPl.completedNarrativeEvents = [...nextPl.completedNarrativeEvents, eventId];

    const { updatedPl: reactedPlDecision } = processWorldReaction(nextPl, 'NARRATIVE_DECISION', {
      choiceText: choice.label
    });

    set({
      pl: enforceStatCaps(reactedPlDecision),
      news: [{ text: choice.logMessage || `🎭 DECISION: ${choice.label}`, colorClass: 'text-blue-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    get().logEvent('REFLECTION', { eventId, choiceId, choiceLabel: choice.label });
  },

  resolveInteractiveStoryEvent: (choiceIndex) => {
    const state = get();
    const event = state.activeModalEvent;
    if (!event || !event.options || !event.options[choiceIndex]) return;

    const option = event.options[choiceIndex];

    set((s) => {
      const updatedPlayer = { ...(s.player || s.pl) };
      updatedPlayer.age = `${Math.floor(updatedPlayer.month / 12) + 18}Y ${updatedPlayer.month % 12}M`;

      const stateMutators = {
        pl: updatedPlayer,
        player: updatedPlayer,
        updateBag: (amount: number) => {
          updatedPlayer.bag = Math.max(0, updatedPlayer.bag + amount);
        },
        updateHeat: (amount: number) => {
          updatedPlayer.heat = Math.max(0, Math.min(100, updatedPlayer.heat + amount));
        },
        updateClout: (amount: number) => {
          updatedPlayer.clout = Math.max(0, updatedPlayer.clout + amount);
        },
        updateAura: (amount: number) => {
          updatedPlayer.aura = Math.max(0, updatedPlayer.aura + amount);
        }
      };

      if (typeof option.effect === 'function') {
        option.effect(stateMutators);
      }

      // Format ticker news and append to news feed
      const newsFeedList = s.newsFeed || [];
      const updatedFeed = [
        {
          id: `${event.id}_option_${choiceIndex}_${Date.now()}`,
          title: event.title,
          text: `Selected: ${option.text}`,
          timestamp: updatedPlayer.age,
          type: 'NEWS'
        },
        ...newsFeedList
      ];

      const standardTickerNews = [
        {
          text: `🎭 DECISION: ${option.text}`,
          colorClass: 'text-blue-400 font-bold'
        },
        ...s.news
      ];

      // Check death conditions
      const deathResult = checkDeathConditions(updatedPlayer);
      let finalPh = s.ph;
      let finalDeathBadge = s.deathBadge;
      let finalFatalCause = s.fatalCause;

      if (deathResult.shouldDie) {
        finalPh = 'POST_MORTEM';
        finalDeathBadge = 'DEFAULT';
        finalFatalCause = deathResult.deathCause;
        updatedPlayer.deathContext = {
          mentalHealthAtDeath: Math.floor(updatedPlayer.mentalHealth),
          lastHustleMentalHit: 0,
          lastHustleName: event.title,
          heatAtDeath: Math.floor(updatedPlayer.heat),
          monthsPlayed: updatedPlayer.month,
          tier: updatedPlayer.currentTier,
          fatalStat: deathResult.fatalStat,
          fatalStatValue: deathResult.fatalStatValue
        };
      }

      return {
        pl: updatedPlayer,
        player: updatedPlayer,
        news: standardTickerNews.slice(0, 50),
        newsFeed: updatedFeed.slice(0, 50),
        activeModalEvent: null,
        ph: finalPh,
        deathBadge: finalDeathBadge,
        fatalCause: finalFatalCause
      };
    });
  },

  advanceMonthAction: () => {
    set((state) => {
      // 1. Run your existing monthly value increments/decay logic first
      // (e.g., aging the player, updating passive yields, evolving NPCs)
      const playerToUse = state.player || state.pl;
      if (!playerToUse) return {};

      // Calculate new advanced month/rent/passive yield etc.
      const advancementResult = advanceMonth(
        playerToUse,
        state.currentMarket,
        state.unlockedLegacyUpgradeIds,
        false
      );

      const advancedPl = enforceStatCaps(advancementResult.newPl);
      advancedPl.lastPassiveBreakdown = advancementResult.passiveBreakdown;
      const finalCurrentMarket = advancementResult.newMarket;

      // 2. Check for active legacy story choice events first!
      const choiceModal = checkAndGenerateChoiceModal(advancedPl);

      if (choiceModal) {
        const updatedPlayer = { ...advancedPl };
        updatedPlayer.age = `${Math.floor(updatedPlayer.month / 12) + 18}Y ${updatedPlayer.month % 12}M`;

        // Check for death conditions
        const deathResult = checkDeathConditions(updatedPlayer);
        let finalPh = state.ph;
        let finalDeathBadge = state.deathBadge;
        let finalFatalCause = state.fatalCause;

        if (deathResult.shouldDie) {
          finalPh = 'POST_MORTEM';
          finalDeathBadge = 'DEFAULT';
          finalFatalCause = deathResult.deathCause;
          updatedPlayer.deathContext = {
            mentalHealthAtDeath: Math.floor(updatedPlayer.mentalHealth),
            lastHustleMentalHit: 0,
            lastHustleName: 'Monthly Advancement',
            heatAtDeath: Math.floor(updatedPlayer.heat),
            monthsPlayed: updatedPlayer.month,
            tier: updatedPlayer.currentTier,
            fatalStat: deathResult.fatalStat,
            fatalStatValue: deathResult.fatalStatValue
          };
        }

        return {
          pl: updatedPlayer,
          player: updatedPlayer,
          currentMarket: finalCurrentMarket,
          news: [...advancementResult.news, ...state.news].slice(0, 50),
          activeModalEvent: choiceModal,
          ph: finalPh,
          deathBadge: finalDeathBadge,
          fatalCause: finalFatalCause
        };
      }

      // 3. Prepare the new player state clone to apply mutations
      const updatedPlayer = { ...advancedPl };
      updatedPlayer.age = `${Math.floor(updatedPlayer.month / 12) + 18}Y ${updatedPlayer.month % 12}M`;

      // Check for death conditions
      const deathResult = checkDeathConditions(updatedPlayer);
      let finalPh = state.ph;
      let finalDeathBadge = state.deathBadge;
      let finalFatalCause = state.fatalCause;

      if (deathResult.shouldDie) {
        finalPh = 'POST_MORTEM';
        finalDeathBadge = 'DEFAULT';
        finalFatalCause = deathResult.deathCause;
        updatedPlayer.deathContext = {
          mentalHealthAtDeath: Math.floor(updatedPlayer.mentalHealth),
          lastHustleMentalHit: 0,
          lastHustleName: 'Monthly Advancement',
          heatAtDeath: Math.floor(updatedPlayer.heat),
          monthsPlayed: updatedPlayer.month,
          tier: updatedPlayer.currentTier,
          fatalStat: deathResult.fatalStat,
          fatalStatValue: deathResult.fatalStatValue
        };
      }

      return {
        pl: updatedPlayer,
        player: updatedPlayer,
        currentMarket: finalCurrentMarket,
        news: [...advancementResult.news, ...state.news].slice(0, 50),
        ph: finalPh,
        deathBadge: finalDeathBadge,
        fatalCause: finalFatalCause
      };
    });

    get().logEvent('SPECIAL_EVENT', { type: 'MONTH_TICKED', month: get().pl.month });
  },
});

// 2. REWRITE Concert Completion to evaluate only the chosen artist lineup:
export const completeConcertPerformanceWithLineup = (draftPl: any, score: number, gigLevel: number, performingArtistIds: string[], newsFeed: string[]) => {
  if (!draftPl.artists || performingArtistIds.length === 0) return;

  // Filter out the exact artists selected by the player for this gig
  const lineup = draftPl.artists.filter((a: any) => performingArtistIds.includes(a.id));
  if (lineup.length === 0) return;

  // Calculate dynamic line-up multiplier based on collective star power/hype
  const collectiveLineupHype = lineup.reduce((acc: number, curr: any) => acc + (curr.hypeFactor || 1.0), 0);

  // Ticket payout scales directly based on who you put on stage
  const ticketSalesPayoff = Math.floor(score * gigLevel * 30 * (collectiveLineupHype / lineup.length));
  draftPl.bag += ticketSalesPayoff;

  // Hype bumps are awarded explicitly to the artists who performed the physical labor of the show
  const individualHypeBoost = parseFloat((score * 0.02 * gigLevel).toFixed(3));

  draftPl.artists = draftPl.artists.map((artist: any) => {
    if (performingArtistIds.includes(artist.id)) {
      const oldHype = artist.hypeFactor || 1.0;
      const newHype = Math.min(5.0, oldHype + individualHypeBoost);
      return {
        ...artist,
        hypeFactor: newHype,
        monthlyRevenue: Math.floor(artist.monthlyRevenue * (newHype / oldHype))
      };
    }
    return artist;
  });

  const lineupNames = lineup.map((a: any) => a.name).join(', ');
  const bioUpdate = Bio.recordArtistBooking(draftPl, lineupNames, gigLevel);
  if (bioUpdate) {
    draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
    draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
  }

  newsFeed.unshift(`🎉 LIVE WRAP: Show complete! Your chosen lineup generated $${ticketSalesPayoff} in revenue. Performers gained +${individualHypeBoost}x Hype!`);
};
