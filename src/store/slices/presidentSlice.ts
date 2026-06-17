import type { StateCreator } from 'zustand';
import type { GameState, CabinetMember, PresidentCrisis } from '../../types/game';
import { EXECUTIVE_ORDERS, generateCrisis } from '../../engine/presidentEngine';
import { enforceStatCaps } from '../../engine/statEngine';
import { advanceMonth } from '../../engine/advancementEngine';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import { DEATH_MESSAGES } from '../../config/deathMessages';
import { getDominantStat } from '../../utils/endingUtils';
import { getEnding } from '../../config/endings';

export interface PresidentSlice {
  issueExecutiveOrder: (orderId: string) => void;
  appointCabinetMember: (member: CabinetMember) => void;
  resolveCrisis: (crisisId: string) => void;
  advancePresidentialMonth: () => void;
}

export const createPresidentSlice: StateCreator<GameState, [], [], PresidentSlice> = (set, get) => ({
  issueExecutiveOrder: (orderId) => {
    const state = get();
    const order = EXECUTIVE_ORDERS.find(o => o.id === orderId);
    if (!order) return;

    if ((order.cost.cash && state.pl.bag < order.cost.cash) ||
        (order.cost.clout && state.pl.clout < order.cost.clout) ||
        (order.cost.aura && state.pl.aura < order.cost.aura)) {
      state.addTickerMessage(`Need more resources to issue ${order.name}`, 'text-red-400');
      return;
    }

    // Apply Cabinet Bonuses to order outcomes
    let approvalImpact = order.impact.approval;
    let passiveCashImpact = order.impact.passiveCash || 0;

    Object.values(state.pl.cabinet).forEach(member => {
      if (member.bonus.type === 'approval') {
        approvalImpact = Math.ceil(approvalImpact * (1 + member.bonus.value / 100));
      }
      if (member.bonus.type === 'cash') {
        passiveCashImpact = Math.ceil(passiveCashImpact * (1 + member.bonus.value / 100));
      }
    });

    const diaryEntry = {
      id: Math.random().toString(36).substring(7),
      month: state.pl.presidentMonth,
      event: order.name,
      outcome: `Successfully issued the ${order.name}. Approval adjusted by ${approvalImpact > 0 ? '+' : ''}${approvalImpact}%.`,
      type: 'ORDER' as const
    };

    const newDemographics = { ...state.pl.demographicApproval };
    if (order.impact.demographics) {
      Object.entries(order.impact.demographics).forEach(([key, val]) => {
        newDemographics[key] = (newDemographics[key] || 50) + val;
      });
    }

    const newPl = {
      ...state.pl,
      bag: state.pl.bag - (order.cost.cash || 0),
      clout: state.pl.clout - (order.cost.clout || 0),
      aura: state.pl.aura - (order.cost.aura || 0),
      approvalRating: state.pl.approvalRating + approvalImpact,
      demographicApproval: newDemographics,
      presidentialDiary: [diaryEntry, ...state.pl.presidentialDiary],
      heat: state.pl.heat + (order.impact.heat || 0),
      dynamicPassives: {
        ...state.pl.dynamicPassives,
        [order.id]: (state.pl.dynamicPassives[order.id] || 0) + passiveCashImpact
      }
    };

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`BREAKING: President signs ${order.name}`, 'text-blue-400 font-bold');
    state.logEvent('LAW_PASSED', { orderId, name: order.name });
  },

  appointCabinetMember: (member) => {
    set((state) => ({
      pl: enforceStatCaps({
        ...state.pl,
        cabinet: { ...state.pl.cabinet, [member.id]: member }
      })
    }));
    get().addTickerMessage(`Cabinet Appointed: ${member.name} as ${member.role}`, 'text-emerald-400');
    get().logEvent('CABINET_APPOINTED', { memberId: member.id, name: member.name, role: member.role });
  },

  resolveCrisis: (crisisId) => {
    const state = get();
    const crisisIndex = state.pl.activeCrises.findIndex(c => c.id === crisisId);
    if (crisisIndex === -1) return;

    const crisis = state.pl.activeCrises[crisisIndex];

    if ((crisis.resolutionCost.cash && state.pl.bag < crisis.resolutionCost.cash) ||
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
      bag: state.pl.bag - (crisis.resolutionCost.cash || 0),
      clout: state.pl.clout - (crisis.resolutionCost.clout || 0),
      aura: state.pl.aura - (crisis.resolutionCost.aura || 0),
      activeCrises: newCrises,
      presidentialDiary: [diaryEntry, ...state.pl.presidentialDiary]
    };

    set({ pl: enforceStatCaps(newPl) });
    state.addTickerMessage(`NEWS: ${crisis.name} resolved by Oval Office`, 'text-emerald-400 font-bold');
    state.logEvent('SPECIAL_EVENT', { type: 'CRISIS_RESOLVED', crisisId, name: crisis.name });
  },

  advancePresidentialMonth: () => {
    const state = get();
    const { pl, currentMarket } = state;

    // 1. Manage Crises (Timers and Penalties)
    let approvalHit = 0;
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
    });

    // Update demographics based on active crises
    const newDemographics = { ...pl.demographicApproval };
    activeCrises.forEach(c => {
      if (c.impact.demographics) {
        Object.entries(c.impact.demographics).forEach(([key, val]) => {
          newDemographics[key] = (newDemographics[key] || 50) + val;
        });
      }
    });

    // Apply Cabinet Passive Bonuses
    let cabinetCash = 0;
    let cabinetClout = 0;
    let cabinetAura = 0;
    let cabinetApproval = 0;

    Object.values(pl.cabinet).forEach(member => {
      switch (member.bonus.type) {
        case 'cash': cabinetCash += member.bonus.value; break;
        case 'clout': cabinetClout += member.bonus.value; break;
        case 'aura': cabinetAura += member.bonus.value; break;
        case 'approval': cabinetApproval += member.bonus.value; break;
      }
    });

    let updatedPl = {
      ...pl,
      bag: pl.bag + cabinetCash,
      clout: pl.clout + cabinetClout,
      aura: pl.aura + cabinetAura,
      approvalRating: pl.approvalRating + approvalHit + cabinetApproval,
      demographicApproval: newDemographics,
      presidentialDiary: newDiaryEntries,
      activeCrises: activeCrises,
      presidentMonth: pl.presidentMonth + 1
    };

    // 2. Manage re-election and term limits
    let isGameOver = false;
    let gameOverCause = "";

    if (updatedPl.presidentMonth === 48 && !updatedPl.isSecondTerm) {
      if (updatedPl.approvalRating > 50) {
        state.addTickerMessage("RE-ELECTED! Four more years!", "text-yellow-400 font-black");
        updatedPl.isSecondTerm = true;
        updatedPl.approvalRating -= 10;
        state.logEvent('ELECTION_WON', { term: 'SECOND' });
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

      const finalStat = getDominantStat(updatedPl);
      getEnding(updatedPl.legacyPoints || 0, finalStat);

      updatedPl.legacyScore = calculateLegacyScore(updatedPl);

      set({
        pl: enforceStatCaps(updatedPl),
        ph: 'POST_MORTEM',
        deathBadge: deathInfo.badge,
        fatalCause: gameOverCause
      });
      return;
    }

    // 3. Generate new crisis
    const newCrisis = generateCrisis(updatedPl.isSecondTerm);
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
  }
});
