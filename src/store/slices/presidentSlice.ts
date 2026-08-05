import type { StateCreator } from 'zustand';
import type { GameState, CabinetMember, PresidentCrisis } from '../../types/game';

interface IntegrityAudit {
  approvalImpact: number;
  generatedNewsLogs: string[];
}

export const auditCabinetIntegrity = (members: CabinetMember[]): IntegrityAudit => {
  let approvalImpact = 0;
  const generatedNewsLogs: string[] = [];

  members.forEach(member => {
    const corruptionRisk = member.corruptionRisk ?? 20;
    const integrity = member.integrity ?? 70;
    if (corruptionRisk > 75 && integrity < 25) {
      if (Math.random() < 0.14) {
        generatedNewsLogs.push(`📰 INVESTIGATION: Your appointed ${member.role} was caught funneling public infrastructure state allocations!`);
        approvalImpact -= 15;
      }
    }
  });

  return { approvalImpact, generatedNewsLogs };
};
import { EXECUTIVE_ORDERS, generateCrisis, getMasteryBonusDetails, advancePresidentialDecay, inferAdministrationIdentity } from '../../engine/presidentEngine';
import { processWorldReaction } from '../../engine/reactiveWorldEngine';
import { PRESIDENTIAL_ACTIVITIES } from '../../config/presidencyActivities';
import { enforceStatCaps } from '../../engine/statEngine';
import { advanceMonth } from '../../engine/advancementEngine';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import { DEATH_MESSAGES } from '../../config/deathMessages';
import { getDominantStat } from '../../utils/endingUtils';
import { getEnding } from '../../config/endings';
import * as Bio from '../../engine/biographyEngine';

export interface PresidentSlice {
  issueExecutiveOrder: (orderId: string) => void;
  appointCabinetMember: (member: CabinetMember) => void;
  fireCabinetMember: (roleId: string) => void;
  resolveCrisis: (crisisId: string) => void;
  investPersonalFunds: (amount: number) => void;
  advancePresidentialMonth: () => void;
  updatePresidentialStat: (stat: string, value: number) => void;
  updateDemographicApproval: (demographic: string, value: number) => void;
  startPresidentialActivity: (activityId: string) => void;
  resolvePresidentialActivity: (
    activityId: string,
    choiceId: string,
    multiplier: number
  ) => {
    impacts: Record<string, number>;
    diaryEntry: string;
    finalMultiplier: number;
  } | null;
}

export const createPresidentSlice: StateCreator<GameState, [], [], PresidentSlice> = (set, get) => ({
  issueExecutiveOrder: (orderId) => {
    const state = get();
    const order = EXECUTIVE_ORDERS.find(o => o.id === orderId);
    if (!order) return;

    // Mastery Bonuses
    const { bonus: masteryBonus, details: masteredHustlesDetails } = getMasteryBonusDetails(state.pl, orderId);

    // Policy Alignment Discount
    const costMultiplier = 1 - masteryBonus;

    // 1. Large Company Clout discount (5% per large biz, up to 25%)
    const largeBizIds = ['film_studio', 'fight_promoter', 'space_investment', 'philanthropy_empire', 'media_empire', 'luxury_conglomerate', 'data_monopoly', 'central_bank_play', 'legacy_fund'];
    const largeBizCount = largeBizIds.filter(id => (state.pl.hustleLevels?.[id] || 0) > 0).length;
    const largeBizDiscount = Math.min(0.25, largeBizCount * 0.05);

    // 2. High Clout-based discount on Clout costs (up to 25% discount, triggers when Clout is high > 10000)
    const cloutDiscount = state.pl.clout > 10000 ? Math.min(0.25, state.pl.clout / 40000) : 0;

    const cloutMultiplier = Math.max(0.5, 1 - largeBizDiscount - cloutDiscount);

    const finalCashCost = (order.cost.cash || 0) * costMultiplier;
    const finalAuraCost = (order.cost.aura || 0) * costMultiplier;
    const baseCloutCost = (order.cost.clout || 0) * costMultiplier * cloutMultiplier;

    // Apply Opposition/Congress support multiplier to Clout costs
    const scaledCloutCost = baseCloutCost
      ? Math.floor(baseCloutCost * (1 + (100 - state.pl.congressSupport) / 100))
      : 0;

    if ((finalCashCost && state.pl.federalBudget < finalCashCost) ||
        (scaledCloutCost && state.pl.clout < scaledCloutCost) ||
        (finalAuraCost && state.pl.aura < finalAuraCost)) {
      state.addTickerMessage(`Need more resources to issue ${order.name}`, 'text-red-400');
      return;
    }

    // Apply Cabinet Bonuses and Economic Penalties to order outcomes
    let approvalImpact = order.impact.approval;
    let passiveCashImpact = order.impact.passiveCash || 0;
    let gdpImpact = order.impact.gdp || 0;
    let inflationImpact = order.impact.inflation || 0;
    let debtImpact = order.impact.debt || 0;

    // Penalty: tax policies less effective if GDP < 80
    if (state.pl.gdp < 80 && (order.id.includes('tax') || order.id === 'deregulation')) {
      approvalImpact = Math.floor(approvalImpact * 0.5);
      passiveCashImpact = Math.floor(passiveCashImpact * 0.5);
      gdpImpact = Math.floor(gdpImpact * 0.5);
    }

    if (masteryBonus > 0) {
      approvalImpact = Math.ceil(approvalImpact * (1 + masteryBonus));
      passiveCashImpact = Math.ceil(passiveCashImpact * (1 + masteryBonus));
    }

    const newCabinet = { ...state.pl.cabinet };
    Object.keys(newCabinet).forEach(roleId => {
      const member = newCabinet[roleId];
      // Loyalty scales the bonus. If loyalty < 40, bonus is significantly reduced.
      const loyaltyFactor = member.loyalty / 100;
      const effectiveBonusValue = member.loyalty < 40 ? member.bonus.value * 0.2 : member.bonus.value * loyaltyFactor;

      if (member.bonus.type === 'approval') {
        approvalImpact = Math.ceil(approvalImpact * (1 + effectiveBonusValue / 100));
      }
      if (member.bonus.type === 'cash') {
        passiveCashImpact = Math.ceil(passiveCashImpact * (1 + effectiveBonusValue / 100));
      }

      // Update Loyalty based on advisor sentiment
      if (order.quotes?.[roleId]) {
        const quote = order.quotes[roleId].toLowerCase();
        if (quote.includes('love') || quote.includes('win') || quote.includes('dividends') || quote.includes('envy') || quote.includes('surge') || quote.includes('stabilizing') || quote.includes('legacy')) {
          newCabinet[roleId] = { ...member, loyalty: Math.min(100, member.loyalty + 5) };
        } else if (quote.includes('worry') || quote.includes('disrupt') || quote.includes('hurts') || quote.includes('deficit') || quote.includes('astronomical')) {
          newCabinet[roleId] = { ...member, loyalty: Math.max(0, member.loyalty - 5) };
        }
      }
    });

    // 3. Rivals Support/Opposition Evaluation based on Leanings, Industries, and Relationships
    let congressSupportDelta = 0;
    let approvalRatingDelta = 0;
    const rivalNews: string[] = [];
    if (state.pl.rivals) {
      state.pl.rivals.forEach(rival => {
        let supportScore = 0;
        const leansRight = rival.politicalLeaning === 'right';
        const leansLeft = rival.politicalLeaning === 'left';
        const hasFinanceIndustry = rival.industries?.includes('Finance') || rival.preferredIndustries?.includes('Finance');
        const hasRealEstateIndustry = rival.industries?.includes('Real Estate') || rival.preferredIndustries?.includes('Real Estate');
        const hasTechIndustry = rival.industries?.includes('Technology') || rival.preferredIndustries?.includes('Technology');
        const relationship = rival.relationshipWithPlayer ?? 0;

        if (orderId === 'tax_cut' || orderId === 'deregulation' || orderId === 'crypto_mining') {
          if (leansRight) supportScore += 2;
          if (leansLeft) supportScore -= 2;
          if ((rival.riskTolerance ?? 0.5) > 0.6) supportScore += 1;
          if (hasFinanceIndustry || hasTechIndustry) supportScore += 2; // Industry incentive
        } else if (orderId === 'healthcare' || orderId === 'labor_policy' || orderId === 'working_class_policy') {
          if (leansLeft) supportScore += 2;
          if (leansRight) supportScore -= 2;
          if ((rival.ethics ?? 0.5) > 0.6) supportScore += 1;
        } else if (orderId === 'housing_policy') {
          if (leansLeft) supportScore += 2;
          if (leansRight) supportScore -= 2;
          if (hasRealEstateIndustry) supportScore -= 3; // Rent control hurts their real estate assets!
        } else {
          if ((rival.intelligence ?? 0.5) > 0.6) supportScore += 1;
        }

        // Spite/Loyalty bias based on relationship with player
        if (relationship < -50) {
          supportScore -= 1.5; // pure spite
        } else if (relationship > 50) {
          supportScore += 1.5; // pure loyalty
        }

        if (supportScore >= 1.5) {
          congressSupportDelta += 1.5;
          // Believable and occasional surprising news
          if (relationship < -50 && (hasFinanceIndustry || hasTechIndustry) && (orderId === 'deregulation' || orderId === 'tax_cut')) {
            rivalNews.push(`🤝 BELIEVABLE SPITE: Despite hating you, rival ${rival.name} lobbied in favor of ${order.name} to line their own pockets!`);
          } else {
            rivalNews.push(`👑 SUPPORT: Rival ${rival.name} endorsed ${order.name}, boosting your congressional coalition!`);
          }
        } else if (supportScore <= -1.5) {
          congressSupportDelta -= 2.0;
          approvalRatingDelta -= 1.0;
          rivalNews.push(`⚠️ OPPOSITION: ${rival.name} spent $250k on PAC ads opposing ${order.name}!`);
        }
      });
    }

    let masteryOutcomeMsg = "";
    if (masteredHustlesDetails.length > 0) {
      masteryOutcomeMsg = ` Mastery bonus: +${Math.round(masteryBonus * 100)}% from ${masteredHustlesDetails.map(d => d.name).join(', ')}.`;
    }

    const diaryEntry = {
      id: Math.random().toString(36).substring(7),
      month: state.pl.presidentMonth,
      event: order.name,
      outcome: `Successfully issued the ${order.name}. Approval adjusted by ${approvalImpact > 0 ? '+' : ''}${approvalImpact}%.${masteryOutcomeMsg}`,
      type: 'ORDER' as const,
      appliedMasteryBonuses: masteredHustlesDetails
    };

    const newDemographics = { ...state.pl.demographicApproval };
    if (order.impact.demographics) {
      Object.entries(order.impact.demographics).forEach(([key, val]) => {
        newDemographics[key] = Math.max(0, Math.min(100, (newDemographics[key] || 50) + val));
      });
    }

    const newPendingImpacts = [...(state.pl.pendingPresidentialImpacts || [])];
    if (order.delayedImpacts) {
      order.delayedImpacts.forEach(di => {
        newPendingImpacts.push({
          monthToTrigger: state.pl.presidentMonth + di.delay,
          impact: di.impact,
          message: di.message
        });
      });
    }

    const newRegionalApproval = { ...state.pl.regionalApproval };
    if (order.regionalImpacts) {
      Object.entries(order.regionalImpacts).forEach(([region, impact]) => {
        newRegionalApproval[region] = Math.min(100, Math.max(0, (newRegionalApproval[region] || 50) + impact));
      });
    }

    // 4. Housing Affordability Resolution & Dynamic Consequences injection
    let updatedConsequences = [...(state.pl.consequences || [])];
    let updatedActiveCrises = [...(state.pl.activeCrises || [])];
    if (orderId === 'housing_policy') {
      const initialLength = updatedConsequences.length;
      updatedConsequences = updatedConsequences.filter(c => c.source !== 'housing_affordability_crisis');

      const initialCrisesLength = updatedActiveCrises.length;
      updatedActiveCrises = updatedActiveCrises.filter(c => c.type !== 'housing_affordability_crisis');

      if (updatedConsequences.length < initialLength || updatedActiveCrises.length < initialCrisesLength) {
        state.addTickerMessage(`🍀 POLICY SUCCESS: Affordable Housing Act has resolved the Housing Affordability Crisis!`, 'text-emerald-400 font-bold');
      }
    }

    if (orderId === 'healthcare' || orderId === 'tax_cut') {
      updatedConsequences.push({
        id: `cons_wellness_${Math.random().toString(36).substring(7)}`,
        source: 'universal_wellness_aura',
        triggerCondition: order.name,
        delay: 2,
        severity: 'moderate',
        expiry: 12,
        affectedSystems: ['politics', 'aura', 'mental_health'],
        status: 'pending' as const,
        description: `Your healthcare/tax policies have improved public health, bolstering your aura and shielding you from stress.`,
        effectModifier: { auraGainMult: 1.25, mentalHitMult: 0.5 }
      });
    } else if (orderId === 'deregulation' || orderId === 'crypto_mining') {
      updatedConsequences.push({
        id: `cons_volatility_${Math.random().toString(36).substring(7)}`,
        source: 'financial_bubble',
        triggerCondition: order.name,
        delay: 3,
        severity: 'severe',
        expiry: 6,
        affectedSystems: ['businesses', 'politics', 'heat'],
        status: 'pending' as const,
        description: `Financial deregulation has fueled market speculation, increasing yields but raising scandal risk.`,
        effectModifier: { yieldCashMult: 1.3, heatGainMult: 1.5 }
      });
    } else if (orderId === 'tariffs') {
      updatedConsequences.push({
        id: `cons_trade_war_${Math.random().toString(36).substring(7)}`,
        source: 'trade_war',
        triggerCondition: order.name,
        delay: 2,
        severity: 'severe',
        expiry: 8,
        affectedSystems: ['businesses', 'politics'],
        status: 'pending' as const,
        description: `Retaliatory trade tariffs have raised supply chain costs and reduced corporate yields.`,
        effectModifier: { yieldCashMult: 0.8 }
      });
    }

    const newPl = {
      ...state.pl,
      congressSupport: Math.max(0, Math.min(100, state.pl.congressSupport + congressSupportDelta)),
      federalBudget: state.pl.federalBudget - finalCashCost,
      clout: state.pl.clout - scaledCloutCost,
      aura: state.pl.aura - finalAuraCost,
      approvalRating: Math.max(0, Math.min(100, state.pl.approvalRating + approvalImpact + approvalRatingDelta)),
      gdp: state.pl.gdp + gdpImpact,
      inflation: state.pl.inflation + inflationImpact,
      nationalDebt: state.pl.nationalDebt + debtImpact,
      demographicApproval: newDemographics,
      regionalApproval: newRegionalApproval,
      cabinet: newCabinet,
      presidentialDiary: [diaryEntry, ...state.pl.presidentialDiary],
      activeCrises: updatedActiveCrises,
      heat: state.pl.heat + (order.impact.heat || 0),
      dynamicPassives: {
        ...state.pl.dynamicPassives,
        [order.id]: (state.pl.dynamicPassives[order.id] || 0) + passiveCashImpact
      },
      presidentialMarketControl: order.marketEffect ? {
        type: order.marketEffect.type,
        monthsRemaining: order.marketEffect.duration
      } : state.pl.presidentialMarketControl,
      pendingPresidentialImpacts: newPendingImpacts,
      consequences: updatedConsequences
    };

    // Trigger opposition warnings
    rivalNews.forEach(msg => state.addTickerMessage(msg, 'text-red-300 text-xs'));

    // Detailed policy trade-off feedback ticker messages
    if (orderId === 'tax_cut') {
      state.addTickerMessage(`📈 TAX CUT WINNERS: Middle class celebrates tax relief, boosting retail yields!`, 'text-emerald-400 font-bold');
      state.addTickerMessage(`📉 BUDGET LOSSES: Federal reserves shrink. National Debt scales up.`, 'text-red-400');
    } else if (orderId === 'deregulation') {
      state.addTickerMessage(`📈 WALL STREET SURGE: Financial deregulation boosts banking sector yields!`, 'text-emerald-400 font-bold');
      state.addTickerMessage(`⚠️ REGULATORY RISK: Consumer groups warn of extreme speculation and bubble risk.`, 'text-orange-400');
    } else if (orderId === 'healthcare') {
      state.addTickerMessage(`🏥 PUBLIC HEALTH WIN: Universal Healthcare signed into law! Families relieved.`, 'text-emerald-400 font-bold');
      state.addTickerMessage(`💸 FISCAL STRAIN: Massive public healthcare spending drains treasury by $50M.`, 'text-red-400');
    } else if (orderId === 'tariffs') {
      state.addTickerMessage(`🚜 TRADE PROTECTIONISM: Import tariffs signed! Domestic manufacturing yields protect local labor.`, 'text-emerald-400 font-bold');
      state.addTickerMessage(`🚨 CONSUMER CRISIS: Import tariffs drive up inflation and retail price indices.`, 'text-red-400');
    } else if (orderId === 'housing_policy') {
      state.addTickerMessage(`🏡 HOUSING STABILITY: Rent control caps protect families!`, 'text-emerald-400 font-bold');
      state.addTickerMessage(`📉 LANDLORD COMPLAINT: Real Estate rental yields drop by 30% due to emergency rent caps.`, 'text-red-400');
    }

    const bioUpdate = Bio.recordPresidencyAchievement(state.pl, order.name);
    if (bioUpdate) {
      newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
      newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
    }
    const { updatedPl: reactedPl } = processWorldReaction(newPl, 'PRESIDENCY_ORDER', { hustleName: order.name });
    set({ pl: enforceStatCaps(reactedPl) });
    state.addTickerMessage(`BREAKING: President signs ${order.name}`, 'text-blue-400 font-bold');
    if (masteryBonus > 0) {
      state.addTickerMessage(`Your ${masteredHustlesDetails[0].name} mastery boosted this order by +${Math.round(masteryBonus * 100)}%.`, 'text-emerald-400 text-xs');
    }
    if (order.marketEffect) {
      set({ currentMarket: order.marketEffect.type });
      state.addTickerMessage(`MARKET SHIFT: Administration forces ${order.marketEffect.type} for ${order.marketEffect.duration} months.`, 'text-orange-400 font-bold');
    }
    state.logEvent('LAW_PASSED', {
      orderId,
      name: order.name,
      cost: finalCashCost,
      cloutCost: scaledCloutCost,
      auraCost: finalAuraCost,
      approvalImpact
    });
    state.logAction({
      month: state.pl.presidentMonth,
      tier: 'PRESIDENT',
      hustleId: order.id,
      hustleName: order.name,
      level: 1,
      branchId: 'EXECUTIVE_ORDER',
      branchName: 'Executive Order',
      cost: finalCashCost,
      yieldCash: 0,
      yieldClout: -scaledCloutCost,
      yieldAura: -finalAuraCost,
      netCash: -finalCashCost,
      success: true
    });
  },

  appointCabinetMember: (member) => {
    const state = get();
    const bioUpdate = Bio.recordCabinetAppointment(state.pl, member.name, member.role);

    set((state) => {
      const updatedMember = { ...member };
      if (state.pl.chosenBackgroundCategory === 'benefactor') {
        updatedMember.loyalty = Math.min(100, updatedMember.loyalty + 15);
      }

      // Relationship influence: high NPC relationship adds loyalty bonus
      if (member.characterId && state.pl.npcs) {
        const matchingNpc = state.pl.npcs.find(n => n.id === member.characterId);
        if (matchingNpc && matchingNpc.disposition > 60) {
          updatedMember.loyalty = Math.min(100, updatedMember.loyalty + 10);
        }
      }

      const newPl = {
        ...state.pl,
        cabinet: { ...state.pl.cabinet, [member.id]: updatedMember }
      };

      if (bioUpdate) {
        newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
        newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
      }

      return { pl: enforceStatCaps(newPl) };
    });
    get().addTickerMessage(`Cabinet Appointed: ${member.name} as ${member.role}`, 'text-emerald-400');
    get().logEvent('CABINET_APPOINTED', { memberId: member.id, name: member.name, role: member.role });
    get().logAction({
      month: get().pl.presidentMonth,
      tier: 'PRESIDENT',
      hustleId: member.id,
      hustleName: member.name,
      level: 1,
      branchId: 'CABINET',
      branchName: member.role,
      cost: 0,
      yieldCash: 0,
      yieldClout: 0,
      yieldAura: 0,
      netCash: 0,
      success: true
    });
  },

  fireCabinetMember: (roleId) => {
    const state = get();
    if (state.pl.clout < 10) {
      state.addTickerMessage("Insufficient Clout to fire cabinet member", "text-red-400");
      return;
    }
    const member = state.pl.cabinet[roleId];
    if (!member) return;

    const bioUpdate = Bio.recordCabinetDismissal(state.pl, member.name, member.role);
    const newCabinet = { ...state.pl.cabinet };
    delete newCabinet[roleId];

    // Firing a cabinet member hurts relationships with NPC friends
    let updatedNpcs = state.pl.npcs;
    if (member.characterId && state.pl.npcs) {
      updatedNpcs = state.pl.npcs.map(npc => {
        if (npc.id === member.characterId) {
          return { ...npc, disposition: Math.max(-100, npc.disposition - 40) };
        }
        return npc;
      });
    }

    const newPl = {
      ...state.pl,
      clout: state.pl.clout - 10,
      cabinet: newCabinet,
      npcs: updatedNpcs,
      presidentialDiary: [
        {
          id: Math.random().toString(36).substring(7),
          month: state.pl.presidentMonth,
          event: 'CABINET SHAKEUP',
          outcome: `President fired ${member.name} (${member.role}).`,
          type: 'ORDER' as const
        },
        ...state.pl.presidentialDiary
      ]
    };

    if (bioUpdate) {
      newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
      newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
    }

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`NEWS: President fires ${member.role} ${member.name}!`, 'text-orange-500 font-bold');
  },

  resolveCrisis: (crisisId) => {
    const state = get();
    const crisisIndex = state.pl.activeCrises.findIndex(c => c.id === crisisId);
    if (crisisIndex === -1) return;

    const crisis = state.pl.activeCrises[crisisIndex];

    if ((crisis.resolutionCost.cash && state.pl.federalBudget < crisis.resolutionCost.cash) ||
        (crisis.resolutionCost.clout && state.pl.clout < crisis.resolutionCost.clout) ||
        (crisis.resolutionCost.aura && state.pl.aura < crisis.resolutionCost.aura)) {
      state.addTickerMessage(`Inadequate resources to resolve ${crisis.name}`, 'text-red-400');
      return;
    }

    const diaryEntry = {
      id: Math.random().toString(36).substring(7),
      month: state.pl.presidentMonth,
      event: `Crisis Resolved: ${crisis.name}`,
      outcome: `The administration successfully managed the ${crisis.name} through decisive action.`,
      type: 'CRISIS' as const
    };

    const newCrises = [...state.pl.activeCrises];
    newCrises.splice(crisisIndex, 1);

    const newPl = {
      ...state.pl,
      federalBudget: state.pl.federalBudget - (crisis.resolutionCost.cash || 0),
      clout: state.pl.clout - (crisis.resolutionCost.clout || 0),
      aura: state.pl.aura - (crisis.resolutionCost.aura || 0),
      activeCrises: newCrises,
      presidentialDiary: [diaryEntry, ...state.pl.presidentialDiary]
    };

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`NEWS: ${crisis.name} resolved by Oval Office`, 'text-emerald-400 font-bold');
    state.logEvent('CRISIS_RESOLVED', {
      crisisId,
      name: crisis.name,
      cost: crisis.resolutionCost.cash || 0,
      cloutCost: crisis.resolutionCost.clout || 0,
      auraCost: crisis.resolutionCost.aura || 0
    });
    state.logAction({
      month: state.pl.presidentMonth,
      tier: 'PRESIDENT',
      hustleId: crisis.id,
      hustleName: crisis.name,
      level: 1,
      branchId: 'CRISIS_RESOLUTION',
      branchName: 'Crisis Resolution',
      cost: crisis.resolutionCost.cash || 0,
      yieldCash: 0,
      yieldClout: -(crisis.resolutionCost.clout || 0),
      yieldAura: -(crisis.resolutionCost.aura || 0),
      netCash: -(crisis.resolutionCost.cash || 0),
      success: true
    });
  },

  investPersonalFunds: (amount) => {
    const state = get();
    if (state.pl.bag < amount) {
      state.addTickerMessage("Insufficient personal funds to invest in federal budget", "text-red-400");
      return;
    }

    const newPl = {
      ...state.pl,
      bag: state.pl.bag - amount,
      federalBudget: (state.pl.federalBudget || 0) + amount,
      presidentialDiary: [
        {
          id: Math.random().toString(36).substring(7),
          month: state.pl.presidentMonth,
          event: 'PERSONAL INVESTMENT',
          outcome: `The President invested $${(amount/1000000).toFixed(1)}M of personal wealth into the federal budget.`,
          type: 'ORDER' as const
        },
        ...state.pl.presidentialDiary
      ]
    };

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`BREAKING: President bails out Treasury with $${(amount/1000000).toFixed(1)}M personal wealth!`, 'text-emerald-400 font-black');
  },

  advancePresidentialMonth: () => {
    const state = get();
    const { pl, currentMarket } = state;

    // Run presidential decay to tick aura/clout down, applying media ownership slowdowns
    let updatedPl = advancePresidentialDecay({ ...pl });
    let approvalHit = 0;

    // Media ownership influence: permanent positive drift, scandal buffers
    const mediaLevel = Math.max(pl.hustleLevels?.['media_empire'] || 0, pl.hustleLevels?.['film_studio'] || 0);
    const mediaApprovalDrift = mediaLevel * 1.5;
    const scandalBuffer = mediaLevel > 0 ? 0.5 : 1.0;

    // Aura-based scandal buffer
    const auraScandalBuffer = pl.aura > 700 ? 0.7 : 1.0;
    const combinedScandalBuffer = scandalBuffer * auraScandalBuffer;

    // 1. Manage Crises (Timers and Penalties)
    const updatedCrises: PresidentCrisis[] = pl.activeCrises.map(c => ({
      ...c,
      monthsRemaining: c.monthsRemaining !== undefined ? c.monthsRemaining - 1 : undefined
    }));

    const expiredCrises = updatedCrises.filter(c => c.monthsRemaining !== undefined && (c.monthsRemaining as number) <= 0);
    let activeCrises = updatedCrises.filter(c => c.monthsRemaining === undefined || c.monthsRemaining > 0);
    const newDiaryEntries = [...pl.presidentialDiary];

    expiredCrises.forEach(c => {
      approvalHit += (c.impact.approval * 1.5) * combinedScandalBuffer; // 50% extra penalty for expiration, buffered
      newDiaryEntries.unshift({
        id: Math.random().toString(36).substring(7),
        month: pl.presidentMonth,
        event: `CRISIS FAILURE: ${c.name}`,
        outcome: `The administration failed to resolve ${c.name} in time. Massive approval hit.`,
        type: 'CRISIS' as const
      });
      state.addTickerMessage(`DISASTER: ${c.name} worsens after administration inaction!`, 'text-red-500 font-black');
    });

    activeCrises.forEach(c => {
      approvalHit += c.impact.approval * combinedScandalBuffer;
      // Crisis impacts federal budget instead of personal bag
      if (c.impact.cash) {
        updatedPl.federalBudget += (c.impact.cash || 0);
      }
      // Apply Macro Impacts from Crises
      if (c.impact.gdp) updatedPl.gdp += c.impact.gdp;
      if (c.impact.inflation) updatedPl.inflation += c.impact.inflation;
      if (c.impact.debt) updatedPl.nationalDebt += c.impact.debt;
    });

    // 1.1 Process Pending Presidential Impacts
    const currentMonth = pl.presidentMonth;
    const pendingImpacts = pl.pendingPresidentialImpacts || [];
    const dueImpacts = pendingImpacts.filter(i => i.monthToTrigger <= currentMonth);
    const remainingImpacts = pendingImpacts.filter(i => i.monthToTrigger > currentMonth);

    dueImpacts.forEach(i => {
      if (i.impact.approval) approvalHit += i.impact.approval;
      if (i.impact.gdp) updatedPl.gdp += i.impact.gdp;
      if (i.impact.inflation) updatedPl.inflation += i.impact.inflation;
      if (i.impact.debt) updatedPl.nationalDebt += i.impact.debt;
      if (i.impact.heat) updatedPl.heat += i.impact.heat;

      const appImpact = i.impact.approval || 0;
      state.addTickerMessage(`LEGACY IMPACT: ${i.message} (${appImpact > 0 ? '+' : ''}${appImpact}% Approval)`, 'text-slate-300 font-bold');
      newDiaryEntries.unshift({
        id: Math.random().toString(36).substring(7),
        month: currentMonth,
        event: "POLICY IMPACT",
        outcome: `${i.message}. Impacts applied.`,
        type: 'ORDER' as const
      });
    });

    // 1.4 Economic Feedback Loops & Macro Conditions dynamic approval impacts
    if (pl.inflation > 5) {
      approvalHit -= 2;
      state.addTickerMessage("PUBLIC UNREST: High inflation is hurting your approval!", "text-red-400 animate-pulse");
    }

    let macroApprovalChange = 0;
    let macroCongressChange = 0;
    if (pl.gdp > 110) {
      macroApprovalChange += 2;
    } else if (pl.gdp < 80) {
      macroApprovalChange -= 3;
    }
    if (pl.inflation > 5) {
      macroApprovalChange -= (pl.inflation - 5) * 1.5;
    }
    if (pl.nationalDebt > 90) {
      macroApprovalChange -= 2;
      macroCongressChange -= 1;
    }
    approvalHit += macroApprovalChange;

    // High Heat decays Congress Support
    if (pl.heat > 0) {
      macroCongressChange -= (pl.heat / 20);
    }
    updatedPl.congressSupport = Math.max(0, Math.min(100, (updatedPl.congressSupport || 50) + macroCongressChange));

    // Detailed Monthly Report System Feedback
    if (macroApprovalChange > 0) {
      state.addTickerMessage(`📊 ECONOMIC GROWTH: Strong GDP increases monthly approval rating by +${macroApprovalChange}%!`, 'text-emerald-400 text-[10px]');
    } else if (macroApprovalChange < 0) {
      state.addTickerMessage(`⚠️ ECONOMIC STRAIN: GDP stagnation, high inflation, or debt reduces monthly approval rating by ${macroApprovalChange}%!`, 'text-red-400 text-[10px]');
    }

    if (macroCongressChange > 0) {
      state.addTickerMessage(`🗳️ CONGRESS COOPERATION: High approval improves legislative support by +${macroCongressChange}%!`, 'text-emerald-400 text-[10px]');
    } else if (macroCongressChange < 0) {
      state.addTickerMessage(`⚡ CONGRESS OPPOSITION: High Heat or economic strain degrades legislative support by ${macroCongressChange.toFixed(1)}%!`, 'text-red-400 text-[10px]');
    }

    if (mediaApprovalDrift > 0) {
      state.addTickerMessage(`📺 MEDIA CONTROL: Your media holdings steer the public narrative: +${mediaApprovalDrift.toFixed(1)}% Approval Rating drift!`, 'text-emerald-400 text-[10px]');
    }

    // Media ownership approval rating positive drift
    approvalHit += mediaApprovalDrift;

    // Business Lobbying contributions
    let lobbyingRevenue = 0;
    let lobbyingClout = 0;
    Object.keys(pl.hustleLevels || {}).forEach(hId => {
      const lvl = pl.hustleLevels?.[hId] || 0;
      if (lvl > 0 && hId !== 'r_sleep' && hId !== 'power_nap' && hId !== 'r_pr_campaign' && hId !== 'president_campaign') {
        lobbyingRevenue += 25000 * lvl;
        lobbyingClout += 1;
      }
    });
    if (lobbyingRevenue > 0) {
      updatedPl.federalBudget += lobbyingRevenue;
      updatedPl.clout = (updatedPl.clout || 0) + lobbyingClout;
      state.addTickerMessage(`LOBBYING: Active businesses contributed $${(lobbyingRevenue/1000).toFixed(0)}k to the Federal Budget and +${lobbyingClout} Clout.`, 'text-emerald-500 text-[10px]');
    }

    // Crime history / Past Misdeeds Scandal chance
    if ((pl.arrestCount && pl.arrestCount > 0) || pl.heat > 50) {
      if (Math.random() < 0.05) {
        const pastMisdeedsCrisis = {
          id: `scandal_past_misdeeds_${Date.now()}`,
          type: 'past_misdeeds',
          name: 'Past Misdeeds Leak',
          title: 'Pre-Presidential Criminality Exposed',
          description: 'A series of leaks detail your prior arrests and law enforcement scrutiny. The public is outraged.',
          approvalImpact: -12,
          impact: { approval: -12, heat: 15 },
          resolved: false,
          resolutionCost: { clout: 80, cash: 5000000 },
          monthsRemaining: 3
        };
        activeCrises.push(pastMisdeedsCrisis);
        state.addTickerMessage(`🚨 SCANDAL ALERT: Past Misdeeds Leak!`, 'text-red-500 font-bold');
      }
    }

    // Real Estate housing affordability crisis
    const hasHousingAct = pl.dynamicPassives?.['housing_policy'] !== undefined;
    const hasHousingCrisis = activeCrises.some(c => c.type === 'housing_affordability_crisis');
    if ((pl.rentPortfolioCount || 0) > 10 && !hasHousingAct && !hasHousingCrisis) {
      activeCrises.push({
        id: `cons_housing_crisis_${Date.now()}`,
        type: 'housing_affordability_crisis',
        name: 'Housing Affordability Protest',
        title: 'Massive Real Estate Protest',
        description: 'Your vast rental empire has sparked city-wide housing protests. Sign the Affordable Housing Act immediately to calm the streets.',
        approvalImpact: -15,
        impact: { approval: -15, heat: 20 },
        resolved: false,
        resolutionCost: { clout: 50 },
        monthsRemaining: 4
      });
      state.addTickerMessage(`🚨 PROTEST: Vast rental empire triggers affordable housing crisis!`, 'text-red-500 font-bold');
    }

    // 1.5 Cabinet Consequences
    const newCabinet = { ...pl.cabinet };
    const cabinetMembers = Object.keys(newCabinet);

    cabinetMembers.forEach(roleId => {
      const member = { ...newCabinet[roleId] };
      let resigned = false;

      // Cabinet Loyalty affected by player Aura (updated thresholds)
      if (pl.aura > 700) {
        member.loyalty = Math.min(100, member.loyalty + 2);
      } else if (pl.aura < 400) {
        member.loyalty = Math.max(0, member.loyalty - 3);
      }

      // Fallback for legacy saves
      const corruptionRisk = member.corruptionRisk ?? 20;
      const integrity = member.integrity ?? 70;
      const ambition = member.ambition ?? 50;

      // Scandal Chance based on Corruption Risk and Integrity
      const scandalRisk = (corruptionRisk / 100) * (1.5 - integrity / 100);
      if (Math.random() < scandalRisk * 0.12) {
        const appPenalty = Math.floor((15 + Math.floor(Math.random() * 16)) * combinedScandalBuffer);
        approvalHit -= appPenalty;
        updatedPl.scandalCount = (updatedPl.scandalCount || 0) + 1;
        state.addTickerMessage(`SCANDAL: ${member.name} (${member.role}) caught in corruption scandal! Approval -${appPenalty}%`, 'text-red-600 font-black');
        newDiaryEntries.unshift({
          id: Math.random().toString(36).substring(7),
          month: currentMonth,
          event: "CABINET CORRUPTION",
          outcome: `${member.name} was implicated in a major corruption scandal.`,
          type: 'CRISIS' as const
        });
        state.logEvent('SCANDAL_TRIGGERED', { type: 'CABINET_CORRUPTION', memberName: member.name });
      }

      // Loyalty shifts based on ambition and player approval
      if (pl.approvalRating < 40 && ambition > 70) {
        member.loyalty = Math.max(0, member.loyalty - 5);
        if (member.loyalty < 20 && Math.random() < 0.3) {
          // Resignation
          state.addTickerMessage(`RESIGNATION: ${member.name} has resigned as ${member.role}!`, 'text-orange-500 font-bold');
          delete newCabinet[roleId];
          resigned = true;
          newDiaryEntries.unshift({
            id: Math.random().toString(36).substring(7),
            month: currentMonth,
            event: "CABINET RESIGNATION",
            outcome: `${member.name} resigned, citing "differences in direction".`,
            type: 'ORDER' as const
          });
        }
      }

      if (!resigned) {
        // Apply Member Specific Impacts
        if (member.impacts) {
          Object.entries(member.impacts).forEach(([stat, value]) => {
            if (stat === 'approval') approvalHit += value;
            else if (stat === 'scandals') {
              if (value > 0 && Math.random() < value * 0.05) {
                approvalHit -= Math.floor(10 * combinedScandalBuffer);
                updatedPl.scandalCount = (updatedPl.scandalCount || 0) + 1;
                state.addTickerMessage(`LEAK: Small scandal linked to ${member.name}'s department.`, 'text-red-400');
              } else if (value < 0) {
                // negative scandals value means they prevent scandals
              }
            } else if (stat === 'passiveCash') {
               // Handled in passive calculation below
            } else if (stat === 'gdp') updatedPl.gdp += value;
            else if (stat === 'inflation') updatedPl.inflation += value;
            else if (stat === 'nationalDebt') updatedPl.nationalDebt += value;
            else if (stat === 'aura') updatedPl.aura += value;
            else if (stat === 'heat') updatedPl.heat += value;
            else if (stat === 'clout') updatedPl.clout += value;
            else if (stat === 'congressSupport') updatedPl.congressSupport += value;
            else if (stat === 'foreignRelations') updatedPl.foreignRelations = (updatedPl.foreignRelations || 0) + value;
          });
        }

        // Trusted Ally — after 6 months high loyalty
        const currentLoyaltyMonths = member.loyaltyMonths ?? member.monthsAtHighLoyalty ?? 0;
        if (!member.trustedAlly && currentLoyaltyMonths >= 5 && member.loyalty >= 80) {
          member.trustedAlly = true;
          member.isTrustedAlly = true;
          member.bonus = { ...member.bonus, value: Math.floor(member.bonus.value * 2) };
          member.loyaltyMonths = currentLoyaltyMonths + 1;
          member.monthsAtHighLoyalty = member.loyaltyMonths;
          state.addTickerMessage(`TRUSTED ALLY: ${member.name} is now a cornerstone of your administration!`, 'text-emerald-400 font-bold');
        } else {
          member.loyaltyMonths = member.loyalty >= 70 ? currentLoyaltyMonths + 1 : 0;
          member.monthsAtHighLoyalty = member.loyaltyMonths;

          // Bond Broken - if loyalty falls too low, lose Trusted Ally status and its bonus
          if ((member.trustedAlly || member.isTrustedAlly) && member.loyalty < 70) {
            member.trustedAlly = false;
            member.isTrustedAlly = false;
            member.bonus = { ...member.bonus, value: Math.ceil(member.bonus.value / 2) };
            state.addTickerMessage(`BOND BROKEN: ${member.name} no longer considers you a trusted ally.`, 'text-orange-400');
          }
        }

        // Betrayal — disgruntled members may leak
        if (member.loyalty < 30 && !member.hasLeaked && Math.random() < 0.15) {
          member.hasLeaked = true;
          // Trigger a scandal crisis
          const crisisExists = activeCrises?.some(c => c.type === 'cabinet_leak');
          if (!crisisExists) {
            activeCrises.push({
              id: `leak_${member.name}_${Date.now()}`,
              type: 'cabinet_leak',
              name: 'Cabinet Leak',
              title: `${member.name} Leaks Documents`,
              description: `${member.name} has leaked confidential documents to the press. Your approval rating is taking damage.`,
              approvalImpact: -8,
              impact: { approval: -8, heat: 10 },
              resolved: false,
              resolutionCost: { clout: 50 },
              monthsRemaining: 2
            });
          }
          state.addTickerMessage(`BETRAYAL: ${member.name} has leaked documents to the press!`, 'text-red-600 font-black');
        }

        // Rivalries between ambitious members
        cabinetMembers.forEach(otherRoleId => {
          if (roleId !== otherRoleId && newCabinet[otherRoleId]) {
            const other = newCabinet[otherRoleId];
            const otherAmbition = other.ambition ?? 50;
            if (ambition > 80 && otherAmbition > 80 && Math.random() < 0.05) {
              member.loyalty = Math.max(0, member.loyalty - 2);
              // Note: other will be updated when its roleId is processed in the outer loop
              // or we can update it here if it's already processed... but better to keep it simple.
              state.addTickerMessage(`IN-FIGHTING: Rivalry heating up between ${member.name} and ${other.name}.`, 'text-slate-400 italic');
            }
          }
        });
        newCabinet[roleId] = member;
      }
    });

    updatedPl.cabinet = newCabinet;

    // 1.6 State of the Union History

    // 1.6 State of the Union History
    const newSotuHistory = [...(pl.sotuHistory || [])];
    if (currentMonth > 0 && currentMonth % 6 === 0) {
      newSotuHistory.push({
        month: currentMonth,
        gdp: pl.gdp,
        inflation: pl.inflation,
        debt: pl.nationalDebt,
        approval: pl.approvalRating
      });
      state.addTickerMessage("📊 STATE OF THE UNION: New economic summary available.", "text-blue-300 font-bold");
    }

    // 1.2 Manage Market Control
    let updatedMarketControl = pl.presidentialMarketControl || null;
    if (updatedMarketControl) {
      updatedMarketControl = {
        ...updatedMarketControl,
        monthsRemaining: updatedMarketControl.monthsRemaining - 1
      };
      if (updatedMarketControl.monthsRemaining <= 0) {
        state.addTickerMessage(`MARKET ADVISORY: Presidential market control period has expired.`, 'text-slate-400');
        updatedMarketControl = null;
      }
    }

    // Update demographics based on active crises
    const newDemographics = { ...pl.demographicApproval };
    activeCrises.forEach(c => {
      if (c.impact.demographics) {
        Object.entries(c.impact.demographics).forEach(([key, val]) => {
          newDemographics[key] = Math.max(0, Math.min(100, (newDemographics[key] || 50) + val));
        });
      }
    });

    // Apply Cabinet Passive Bonuses
    let cabinetCash = 0;
    let cabinetClout = 0;
    let cabinetAura = 0;
    let cabinetApproval = 0;

    Object.values(pl.cabinet).forEach(member => {
      const loyaltyFactor = member.loyalty / 100;
      let effectiveBonus = member.loyalty < 40 ? member.bonus.value * 0.2 : member.bonus.value * loyaltyFactor;


      if (pl.inJail) {
        effectiveBonus = 0;
      }

      // Add extra passive cash from candidate impacts
      if (member.impacts?.passiveCash) {
        cabinetCash += member.impacts.passiveCash;
      }

      switch (member.bonus.type) {
        case 'cash': cabinetCash += effectiveBonus; break;
        case 'clout': cabinetClout += effectiveBonus; break;
        case 'aura': cabinetAura += effectiveBonus; break;
        case 'approval': cabinetApproval += effectiveBonus; break;
      }
    });

    const isPresident = pl.currentTier === 'PRESIDENT';

    updatedPl = {
      ...updatedPl,
      bag: updatedPl.bag + (isPresident ? 0 : cabinetCash),
      federalBudget: updatedPl.federalBudget + (isPresident ? cabinetCash : 0),
      clout: updatedPl.clout + cabinetClout,
      aura: updatedPl.aura + cabinetAura,
      approvalRating: Math.max(0, Math.min(100, updatedPl.approvalRating + approvalHit + cabinetApproval)),
      demographicApproval: newDemographics,
      presidentialDiary: newDiaryEntries,
      activeCrises: activeCrises,
      presidentMonth: updatedPl.presidentMonth + 1,
      presidentialMarketControl: updatedMarketControl,
      pendingPresidentialImpacts: remainingImpacts,
      sotuHistory: newSotuHistory
    };

    if (updatedPl.inflation > 5) {
      const { updatedPl: reactedPl } = processWorldReaction(updatedPl, 'PRESIDENCY_INFLATION', {
        macroValue: updatedPl.inflation
      });
      updatedPl = reactedPl;
    }

    // 1.3 Midterm Elections
    if (updatedPl.presidentMonth === 24) {
      let newSupport = 50;
      if (updatedPl.approvalRating > 60) newSupport = 70;
      else if (updatedPl.approvalRating < 40) newSupport = 30;

      updatedPl.congressSupport = Math.max(0, Math.min(100, newSupport));
      state.addTickerMessage(`MIDTERMS: Congress support adjusted to ${newSupport}% based on approval.`, 'text-blue-300 font-bold');
      updatedPl.presidentialDiary.unshift({
        id: Math.random().toString(36).substring(7),
        month: 24,
        event: 'MIDTERM ELECTIONS',
        outcome: `The people have spoken. Congress support is now ${newSupport}%.`,
        type: 'ELECTION' as const
      });
    }

    // 2. Manage re-election and term limits
    let isGameOver = false;
    let gameOverCause = "";

    if (updatedPl.presidentMonth === 48 && !updatedPl.isSecondTerm) {
      if (updatedPl.approvalRating > 50) {
        state.addTickerMessage("TERM COMPLETE: Launching re-election campaign!", "text-yellow-400 font-black");
        updatedPl.isReElectionPhase = true;
        updatedPl.campaignStage = 1;
        updatedPl.campaignDelegates = 0;
        state.setActiveTab('PRESIDENT');
        state.setActiveHustleView('president_campaign');
      } else {
        gameOverCause = "Election Lost: The people have spoken. Your approval was too low for a second term.";
        isGameOver = true;
      }
    }

    if (updatedPl.presidentMonth === 96) {
      state.addTickerMessage("TERM LIMIT REACHED. A new era begins.", "text-blue-400 font-black");
      isGameOver = true;
      gameOverCause = "Term Limit Reached: You have served two full terms. It's time to step down.";
    }

    if (isGameOver) {
      state.addTickerMessage(gameOverCause, "text-red-500 font-black");

      const adminIdentity = inferAdministrationIdentity(updatedPl);
      state.addTickerMessage(`🏛️ HISTORICAL VERDICT: Your administration is remembered as a ${adminIdentity}!`, 'text-yellow-400 font-bold');
      updatedPl.biography = [...(updatedPl.biography || []), `HISTORICAL VERDICT: Left office with a legacy remembered as a ${adminIdentity}.`].slice(-50);

      updatedPl.deathContext = {
        mentalHealthAtDeath: Math.floor(updatedPl.mentalHealth),
        lastHustleMentalHit: 0,
        lastHustleName: updatedPl.lastExecutedHustleId || 'Presidency',
        heatAtDeath: Math.floor(updatedPl.heat),
        monthsPlayed: updatedPl.month,
        tier: updatedPl.currentTier,
      };

      // Manually trigger death/endgame logic
      const lastHustleId = updatedPl.lastExecutedHustleId || 'president_campaign';
      const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];

      const dominantStat = getDominantStat(updatedPl);
      const ending = getEnding(updatedPl.legacyScore || 0, dominantStat);
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

      state.logEvent('SPECIAL_EVENT', {
        type: 'ENDING_UNLOCKED',
        title: ending.title,
        legacyPoints: updatedPl.legacyScore || 0
      });

      if (deathInfo.badge && !updatedPl.collectedDeathBadges.includes(deathInfo.badge)) {
        updatedPl.collectedDeathBadges.push(deathInfo.badge);
      }

      // Update best run
      if (updatedPl.stats) {
        if (!updatedPl.stats.bestRunBag || updatedPl.bag > updatedPl.stats.bestRunBag) {
          updatedPl.stats.bestRunBag = updatedPl.bag;
          updatedPl.stats.bestRunTier = updatedPl.currentTier;
          updatedPl.stats.bestRunEnding = ending.title;
        }
      }

      updatedPl.legacyScore = calculateLegacyScore(updatedPl);
      updatedPl.deathCount = (updatedPl.deathCount || 0) + 1;

      set({
        pl: enforceStatCaps(updatedPl),
        ph: 'POST_MORTEM',
        deathBadge: deathInfo.badge,
        fatalCause: gameOverCause,
        bankedLegacyPoints: state.bankedLegacyPoints + (updatedPl.legacyScore || 0)
      });
      return;
    }

    // 1.7 Tax Revenue System
    let taxRevenue = 10000000; // Base $10M
    if (updatedPl.gdp > 100) taxRevenue += 2000000;
    else if (updatedPl.gdp < 80) taxRevenue -= 2000000;

    if (updatedPl.inflation > 5) taxRevenue -= 1000000;

    updatedPl.federalBudget += taxRevenue;
    state.addTickerMessage(`TREASURY: Monthly tax revenue of $${(taxRevenue/1000000).toFixed(1)}M collected.`, 'text-emerald-500/80 text-[10px]');

    // Calculate Cabinet average integrity to affect Scandal / Crisis risk
    const cabinetListForIntegrity = Object.values(updatedPl.cabinet);
    if (cabinetListForIntegrity.length > 0) {
      const avgIntegrity = cabinetListForIntegrity.reduce((sum, m) => sum + (m.integrity ?? 70), 0) / cabinetListForIntegrity.length;
      if (avgIntegrity < 40) {
        updatedPl.scandalRiskBonus = (updatedPl.scandalRiskBonus || 0) + 0.15;
      }
    }

    // 3. Generate new crisis
    const newCrisis = generateCrisis(updatedPl.isSecondTerm, updatedPl.nationalDebt, updatedPl.scandalRiskBonus || 0);
    if (newCrisis) {
      updatedPl.activeCrises = [...updatedPl.activeCrises, newCrisis];
      if (newCrisis.id.includes('scandal')) {
        updatedPl.scandalCount = (updatedPl.scandalCount || 0) + 1;
      }
      state.addTickerMessage(`CRISIS ALERT: ${newCrisis.name}!`, "text-red-500 font-black");
      state.logEvent('SCANDAL_TRIGGERED', { type: 'PRESIDENTIAL_CRISIS', crisisId: newCrisis.id, name: newCrisis.name });
    }

    // 4. Regular advancement (passive income, rent, heat decay)
    const { newPl: advancedPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
      updatedPl,
      currentMarket,
      state.unlockedLegacyUpgradeIds
    );

    if (shouldDie) {
      advancedPl.deathContext = {
        mentalHealthAtDeath: Math.floor(advancedPl.mentalHealth),
        lastHustleMentalHit: 0,
        lastHustleName: 'Presidential Duties',
        heatAtDeath: Math.floor(advancedPl.heat),
        monthsPlayed: advancedPl.month,
        tier: advancedPl.currentTier,
      };

      const dominantStat = getDominantStat(advancedPl);
      const ending = getEnding(advancedPl.legacyScore || 0, dominantStat);
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

      state.logEvent('SPECIAL_EVENT', {
        type: 'ENDING_UNLOCKED',
        title: ending.title,
        legacyPoints: advancedPl.legacyScore || 0
      });

      if (!advancedPl.collectedDeathBadges.includes('CORRUPTION')) {
        advancedPl.collectedDeathBadges.push('CORRUPTION');
      }

      // Update best run
      if (advancedPl.stats) {
        if (!advancedPl.stats.bestRunBag || advancedPl.bag > advancedPl.stats.bestRunBag) {
          advancedPl.stats.bestRunBag = advancedPl.bag;
          advancedPl.stats.bestRunTier = advancedPl.currentTier;
          advancedPl.stats.bestRunEnding = ending.title;
        }
      }

      advancedPl.legacyScore = calculateLegacyScore(advancedPl);
      advancedPl.deathCount = (advancedPl.deathCount || 0) + 1;

      set({
        pl: enforceStatCaps(advancedPl),
        ph: 'POST_MORTEM',
        fatalCause: deathCause,
        deathBadge: 'CORRUPTION', // Generic presidential death badge
        bankedLegacyPoints: state.bankedLegacyPoints + (advancedPl.legacyScore || 0)
      });
      return;
    }

    advancedPl.legacyScore = calculateLegacyScore(advancedPl);

    set({
      pl: enforceStatCaps(advancedPl),
      currentMarket: newMarket,
      news: [...monthNews, ...state.news].slice(0, 50)
    });
  },

  updatePresidentialStat: (stat, value) => {
    const state = get();
    set({
      pl: enforceStatCaps({
        ...state.pl,
        [stat]: (state.pl[stat as keyof typeof state.pl] as number || 0) + value
      })
    });
  },

  updateDemographicApproval: (demographic, value) => {
    const state = get();
    const newDemographics = { ...state.pl.demographicApproval };
    newDemographics[demographic] = Math.max(0, Math.min(100, (newDemographics[demographic] || 50) + value));
    set({
      pl: enforceStatCaps({
        ...state.pl,
        demographicApproval: newDemographics
      })
    });
  },

  startPresidentialActivity: (activityId) => {
    set({ activeHustleView: activityId });
  },

  resolvePresidentialActivity: (activityId, choiceId, multiplier) => {
    const state = get();
    const activity = PRESIDENTIAL_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return null;

    const choice = activity.choices.find(c => c.id === choiceId);
    if (!choice) return null;

    // Apply Cabinet Bonuses
    let choiceMultiplier = multiplier;
    let cabinetBonusApplied = false;
    if (choice.cabinetBonus) {
      const member = state.pl.cabinet[choice.cabinetBonus.roleId];
      if (member && member.loyalty >= 50) {
        const bonusValue = member.isTrustedAlly ? choice.cabinetBonus.multiplier + 0.5 : choice.cabinetBonus.multiplier;
        choiceMultiplier *= bonusValue;
        cabinetBonusApplied = true;
        state.addTickerMessage(`CABINET SUPPORT: ${choice.cabinetBonus.message}`, 'text-emerald-400 font-bold');
      }
    }

    // Difficulty scaling (based on month)
    const monthScaling = 1 + (state.pl.presidentMonth / 48) * 0.5;
    const finalMultiplier = choiceMultiplier / monthScaling;

    const impacts: Record<string, number> = {};
    const newPl = { ...state.pl };

    // Update stats and track impacts
    const statsToUpdate = [
      'approval', 'gdp', 'inflation', 'debt', 'foreignRelations',
      'worldPeace', 'congressSupport', 'bag', 'federalBudget',
      'clout', 'aura', 'heat'
    ];

    const reputation = newPl.narrativeFlags?.publicReputation as string || "The Hustler";
    statsToUpdate.forEach(stat => {
      const val = choice.impact[stat as keyof typeof choice.impact];
      if (val !== undefined) {
        // Use higher precision for macro-economic stats and approval
        const isMacro = ['gdp', 'inflation', 'debt', 'approval'].includes(stat);
        let rawImpact = (val as number) * finalMultiplier;
        if (reputation === "The President" && ['foreignRelations', 'worldPeace'].includes(stat)) {
          rawImpact *= 1.2; // 20% easier diplomacy
        }
        const impact = isMacro ? Number(rawImpact.toFixed(2)) : Math.floor(rawImpact);

        impacts[stat] = impact;
        if (stat === 'approval') newPl.approvalRating += impact;
        else if (stat === 'foreignRelations') newPl.foreignRelations = (newPl.foreignRelations || 0) + impact;
        else if (stat === 'federalBudget') newPl.federalBudget += impact;
        else {
          // Dynamic numeric stat updates on PlayerStats object
          ((newPl as unknown) as Record<string, number>)[stat] += impact;
        }
      }
    });

    // Record in diary
    const diaryEntryText = `Strategic Decision: ${choice.label} for ${activity.title}. ${cabinetBonusApplied ? 'Cabinet supported the initiative. ' : ''}Outcomes: ${Object.entries(impacts).filter(([_,v]) => v !== 0).map(([k,v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ')}.`;

    const diaryEntry = {
      id: Math.random().toString(36).substring(7),
      month: state.pl.presidentMonth,
      event: activity.title,
      outcome: diaryEntryText,
      type: 'ORDER' as const
    };
    newPl.presidentialDiary = [diaryEntry, ...state.pl.presidentialDiary];

    const { updatedPl: reactedPl } = processWorldReaction(newPl, 'PRESIDENCY_ORDER', { hustleName: activity.title });

    set({
      pl: enforceStatCaps(reactedPl),
      activeHustleView: null
    });

    state.addTickerMessage(`ACTIVITY COMPLETE: ${activity.title}`, 'text-blue-400 font-bold');

    return {
      impacts,
      diaryEntry: diaryEntryText,
      finalMultiplier
    };
  }
});
