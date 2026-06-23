import type { StateCreator } from 'zustand';
import type { GameState, CabinetMember, PresidentCrisis } from '../../types/game';
import { EXECUTIVE_ORDERS, generateCrisis, getMasteryBonusDetails, RIVAL_CABINET_MAP } from '../../engine/presidentEngine';
import { enforceStatCaps } from '../../engine/statEngine';
import { advanceMonth } from '../../engine/advancementEngine';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import { DEATH_MESSAGES } from '../../config/deathMessages';
import { getDominantStat } from '../../utils/endingUtils';
import { getEnding } from '../../config/endings';

export interface PresidentSlice {
  issueExecutiveOrder: (orderId: string) => void;
  appointCabinetMember: (member: CabinetMember) => void;
  fireCabinetMember: (roleId: string) => void;
  resolveCrisis: (crisisId: string) => void;
  investPersonalFunds: (amount: number) => void;
  advancePresidentialMonth: () => void;
  updatePresidentialStat: (stat: string, value: number) => void;
  updateDemographicApproval: (demographic: string, value: number) => void;
}

export const createPresidentSlice: StateCreator<GameState, [], [], PresidentSlice> = (set, get) => ({
  issueExecutiveOrder: (orderId) => {
    const state = get();
    const order = EXECUTIVE_ORDERS.find(o => o.id === orderId);
    if (!order) return;

    // Policy Alignment Discount
    let costMultiplier = 1;
    const techHustles = ['techFlip'];
    const housingHustles = ['real_estate_empire'];
    const mediaHustles = ['media_empire'];

    const hasTechMastery = state.pl.masteredHustles.some(h => techHustles.includes(h));
    const hasHousingMastery = state.pl.masteredHustles.some(h => housingHustles.includes(h));
    const hasMediaMastery = state.pl.masteredHustles.some(h => mediaHustles.includes(h));

    if ((order.id === 'data_analytics' || order.id === 'crypto_mining') && hasTechMastery) costMultiplier = 0.9;
    if (order.id === 'housing_policy' && hasHousingMastery) costMultiplier = 0.9;
    if (order.id === 'media_policy' && hasMediaMastery) costMultiplier = 0.9;

    const finalCashCost = (order.cost.cash || 0) * costMultiplier;
    const finalAuraCost = (order.cost.aura || 0) * costMultiplier;
    const baseCloutCost = (order.cost.clout || 0) * costMultiplier;

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

    // Mastery Bonuses
    const { bonus: masteryBonus, masteries: masteredHustlesNames } = getMasteryBonusDetails(state.pl, orderId);
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
        // Simple sentiment: words like 'love', 'win', 'dividends', 'modernized', 'envy', 'surge' are positive
        // Words like 'increase the deficit', 'worry our allies', 'disrupt', 'BRACING FOR IMPACT', 'Checks in pockets', 'checks' are neutral/positive
        // Words like 'astronomical', 'print money', 'hurts the coasts', 'worry' are negative
        if (quote.includes('love') || quote.includes('win') || quote.includes('dividends') || quote.includes('envy') || quote.includes('surge') || quote.includes('stabilizing') || quote.includes('legacy')) {
          newCabinet[roleId] = { ...member, loyalty: Math.min(100, member.loyalty + 5) };
        } else if (quote.includes('worry') || quote.includes('disrupt') || quote.includes('hurts') || quote.includes('deficit') || quote.includes('astronomical')) {
          newCabinet[roleId] = { ...member, loyalty: Math.max(0, member.loyalty - 5) };
        }
      }
    });

    let masteryOutcomeMsg = "";
    if (masteredHustlesNames.length > 0) {
      masteryOutcomeMsg = ` Mastery bonus: +${Math.round(masteryBonus * 100)}% from ${masteredHustlesNames.join(', ')}.`;
    }

    const diaryEntry = {
      id: Math.random().toString(36).substring(7),
      month: state.pl.presidentMonth,
      event: order.name,
      outcome: `Successfully issued the ${order.name}. Approval adjusted by ${approvalImpact > 0 ? '+' : ''}${approvalImpact}%.${masteryOutcomeMsg}`,
      type: 'ORDER' as const
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

    const newPl = {
      ...state.pl,
      congressSupport: Math.max(0, Math.min(100, state.pl.congressSupport)),
      federalBudget: state.pl.federalBudget - finalCashCost,
      clout: state.pl.clout - scaledCloutCost,
      aura: state.pl.aura - finalAuraCost,
      approvalRating: Math.max(0, Math.min(100, state.pl.approvalRating + approvalImpact)),
      gdp: state.pl.gdp + gdpImpact,
      inflation: state.pl.inflation + inflationImpact,
      nationalDebt: state.pl.nationalDebt + debtImpact,
      demographicApproval: newDemographics,
      regionalApproval: newRegionalApproval,
      cabinet: newCabinet,
      presidentialDiary: [diaryEntry, ...state.pl.presidentialDiary],
      heat: state.pl.heat + (order.impact.heat || 0),
      dynamicPassives: {
        ...state.pl.dynamicPassives,
        [order.id]: (state.pl.dynamicPassives[order.id] || 0) + passiveCashImpact
      },
      presidentialMarketControl: order.marketEffect ? {
        type: order.marketEffect.type,
        monthsRemaining: order.marketEffect.duration
      } : state.pl.presidentialMarketControl,
      pendingPresidentialImpacts: newPendingImpacts
    };

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`BREAKING: President signs ${order.name}`, 'text-blue-400 font-bold');
    if (masteryBonus > 0) {
      state.addTickerMessage(`Your ${masteredHustlesNames[0]} mastery boosted this order by +${Math.round(masteryBonus * 100)}%.`, 'text-emerald-400 text-xs');
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
    set((state) => {
      // If the role was previously occupied (even if currently empty in cabinet),
      // check if it's a replacement. Since we delete on fire, we can check diary.
      // Requirements: "fire cabinet member (costs 10 Clout, resets loyalty to 60%)"
      const previouslyOccupied = state.pl.presidentialDiary.some(d => d.event === 'CABINET SHAKEUP' && d.outcome.includes(member.role));
      let initialLoyalty = previouslyOccupied ? 60 : 70;

      // Cabinet Loyalty: Influenced by past rival relationships
      const alliedRivalId = Object.keys(RIVAL_CABINET_MAP).find(rivalId => RIVAL_CABINET_MAP[rivalId] === member.id);
      if (alliedRivalId && state.pl.crushedRivals.includes(alliedRivalId)) {
        initialLoyalty += 20;
      }

      return {
        pl: enforceStatCaps({
          ...state.pl,
          cabinet: { ...state.pl.cabinet, [member.id]: { ...member, loyalty: Math.min(100, initialLoyalty) } }
        })
      };
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

    const newCabinet = { ...state.pl.cabinet };
    delete newCabinet[roleId];

    set({
      pl: enforceStatCaps({
        ...state.pl,
        clout: state.pl.clout - 10,
        cabinet: newCabinet,
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
      })
    });
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

    let updatedPl = { ...pl };
    let approvalHit = 0;

    // 1. Manage Crises (Timers and Penalties)
    const updatedCrises: PresidentCrisis[] = pl.activeCrises.map(c => ({
      ...c,
      monthsRemaining: c.monthsRemaining !== undefined ? c.monthsRemaining - 1 : undefined
    }));

    const expiredCrises = updatedCrises.filter(c => c.monthsRemaining !== undefined && (c.monthsRemaining as number) <= 0);
    const activeCrises = updatedCrises.filter(c => c.monthsRemaining === undefined || c.monthsRemaining > 0);
    const newDiaryEntries = [...pl.presidentialDiary];

    expiredCrises.forEach(c => {
      approvalHit += (c.impact.approval * 1.5); // 50% extra penalty for expiration
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
      approvalHit += c.impact.approval;
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

    // 1.4 Economic Feedback Loops
    if (pl.inflation > 5) {
      approvalHit -= 2;
      state.addTickerMessage("PUBLIC UNREST: High inflation is hurting your approval!", "text-red-400 animate-pulse");
    }

    // 1.5 Cabinet Scandals
    Object.values(pl.cabinet).forEach(member => {
      if (member.loyalty < 40 && Math.random() < 0.2) {
        const appPenalty = 10 + Math.floor(Math.random() * 11);
        approvalHit -= appPenalty;
        state.addTickerMessage(`SCANDAL: ${member.name} (${member.role}) leaked damaging info! Approval -${appPenalty}%`, 'text-red-600 font-black');
        newDiaryEntries.unshift({
          id: Math.random().toString(36).substring(7),
          month: currentMonth,
          event: "CABINET SCANDAL",
          outcome: `${member.name} leaked damaging info to the press. Approval plummeted.`,
          type: 'CRISIS' as const
        });
        state.logEvent('SCANDAL_TRIGGERED', { type: 'CABINET_LEAK', memberName: member.name });
      }
    });

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
      const effectiveBonus = member.loyalty < 40 ? member.bonus.value * 0.2 : member.bonus.value * loyaltyFactor;

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
      // Manually trigger death/endgame logic
      const lastHustleId = updatedPl.lastExecutedHustleId || 'president_campaign';
      const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];

      const dominantStat = getDominantStat(updatedPl);
      const ending = getEnding(updatedPl.legacyPoints || 0, dominantStat);
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
        legacyPoints: updatedPl.legacyPoints || 0
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
        fatalCause: gameOverCause
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

    // 3. Generate new crisis
    const newCrisis = generateCrisis(updatedPl.isSecondTerm, updatedPl.nationalDebt, updatedPl.scandalRiskBonus || 0);
    if (newCrisis) {
      updatedPl.activeCrises = [...updatedPl.activeCrises, newCrisis];
      state.addTickerMessage(`CRISIS ALERT: ${newCrisis.name}!`, "text-red-500 font-black");
      state.logEvent('SCANDAL_TRIGGERED', { type: 'PRESIDENTIAL_CRISIS', crisisId: newCrisis.id, name: newCrisis.name });
    }

    // 4. Regular advancement (passive income, rent, heat decay)
    const { newPl: advancedPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
      updatedPl,
      currentMarket
    );

    if (shouldDie) {
      const dominantStat = getDominantStat(advancedPl);
      const ending = getEnding(advancedPl.legacyPoints || 0, dominantStat);
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
        legacyPoints: advancedPl.legacyPoints || 0
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
        deathBadge: 'CORRUPTION' // Generic presidential death badge
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
  }
});
