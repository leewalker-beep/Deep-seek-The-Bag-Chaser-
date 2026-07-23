import type { PlayerStats, Consequence } from '../types/game';
import { processWorldReaction } from './reactiveWorldEngine';
import { triggerBurnoutRecovery, triggerDebtRecovery } from './comebackEngine';

/**
 * Helper to generate a unique random ID
 */
const generateId = () => Math.random().toString(36).substring(7);

/**
 * Checks if a consequence with the same source already exists (either pending or active)
 */
const hasExistingConsequence = (pl: PlayerStats, source: string): boolean => {
  const consequences = pl.consequences || [];
  return consequences.some(c => c.source === source && (c.status === 'pending' || c.status === 'active'));
};

/**
 * Scans player state and naturally schedules future consequences based on actions.
 */
export function detectAndCreateConsequences(pl: PlayerStats, news: any[]): PlayerStats {
  let updatedPl = { ...pl };
  if (!updatedPl.consequences) {
    updatedPl.consequences = [];
  }

  // 1. Trigger: Repeated Sabotage of Rivals
  // Sum sabotaged count across all rivals
  const totalSabotaged = updatedPl.rivals?.reduce((sum, r) => sum + (r.sabotagedCount || 0), 0) || 0;
  const hasSpecificSaboteur = updatedPl.rivals?.some(r => (r.sabotagedCount || 0) >= 2);

  if ((totalSabotaged >= 3 || hasSpecificSaboteur) && !hasExistingConsequence(updatedPl, 'sabotage_retaliation')) {
    const delay = 3;
    const cons: Consequence = {
      id: `cons_sabotage_${generateId()}`,
      source: 'sabotage_retaliation',
      triggerCondition: 'Repeated Sabotage of Competitors',
      delay,
      severity: 'severe',
      expiry: 6,
      affectedSystems: ['businesses', 'politics', 'aura', 'clout', 'relationships'],
      status: 'pending',
      description: `Rivals have formed an alliance to expose your industrial espionage. A highly damaging media smear campaign is being prepared.`,
      effectModifier: { yieldCashMult: 0.75, cloutGainMult: 0.8, auraGainMult: 0.8 },
      newsTemplates: [
        'Leaked documents highlight your aggressive history of corporate espionage against local rivals.',
        'A rival group has launched a highly coordinated media campaign challenging your business ethics.',
        'Election polling suggests your recent cutthroat business decisions have alienated key labor demographics.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `📰 DEVELOPING STORY: Rumors swirl that major rivals are compiling a dossier on your corporate tactics... (Starts in ${delay} months)`,
      colorClass: 'text-orange-400 font-medium'
    });
  }

  // 2. Trigger: Housing Affordability Collapse (Monopolizing properties)
  const isLandlordEmpire = (updatedPl.rentPortfolioCount || 0) >= 5 || (updatedPl.rentalCount || 0) >= 3;
  if (isLandlordEmpire && !hasExistingConsequence(updatedPl, 'housing_affordability_crisis')) {
    const delay = 4;
    const cons: Consequence = {
      id: `cons_housing_${generateId()}`,
      source: 'housing_affordability_crisis',
      triggerCondition: 'High Property Ownership',
      delay,
      severity: 'severe',
      expiry: 8,
      affectedSystems: ['real_estate', 'politics', 'aura', 'economy'],
      status: 'pending',
      description: `Your extensive property acquisitions have decreased city housing affordability, leading to tenant protests and impending rent caps.`,
      effectModifier: { rentMult: 0.7 },
      newsTemplates: [
        'Local tenant unions are staging city-wide rent strikes protesting corporate property monopolization.',
        'Housing advocacy groups lobby the city council to pass emergency rent-control caps.',
        'Real estate indices plunge as public outcry forces stricter regulatory compliance checks.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `🏠 HOUSING MARKET WATCH: Affordability indices have hit record lows. Tenant unions are warning of strikes... (Starts in ${delay} months)`,
      colorClass: 'text-yellow-400 font-medium'
    });
  }

  // 3. Trigger: High Heat / Regulatory Audits
  const extremeHeatHistory = (updatedPl.heat || 0) >= 80 || (updatedPl.arrestCount || 0) >= 2;
  if (extremeHeatHistory && !hasExistingConsequence(updatedPl, 'regulatory_crackdown')) {
    const delay = 2;
    const cons: Consequence = {
      id: `cons_regulatory_${generateId()}`,
      source: 'regulatory_crackdown',
      triggerCondition: 'Elevated Heat and Arrest Profile',
      delay,
      severity: 'severe',
      expiry: 6,
      affectedSystems: ['businesses', 'clout', 'heat', 'economy'],
      status: 'pending',
      description: `State compliance watchdogs are launching extensive audit reviews against your commercial holdings.`,
      effectModifier: { yieldCashMult: 0.75, heatGainMult: 1.5 },
      newsTemplates: [
        'Investors remain highly cautious as federal regulators subpoena corporate communication logs.',
        'Audit reports indicate a significant compliance squeeze on leading mid-tier tech and media ventures.',
        'Market volatility rises as compliance audits slow down active cash execution pipelines.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `⚖️ REGULATORY WATCH: Your criminal profile has drawn scrutiny. Compliance officers are planning audits... (Starts in ${delay} months)`,
      colorClass: 'text-red-400 font-medium'
    });
  }

  // 4. Trigger: Philanthropic Goodwill Halo (Positive)
  const hugeGoodwill = (updatedPl.philanthropyDonation || 0) >= 5000000 || updatedPl.masteredHustles?.includes('philanthropy_empire');
  if (hugeGoodwill && !hasExistingConsequence(updatedPl, 'philanthropic_halo')) {
    const delay = 2;
    const cons: Consequence = {
      id: `cons_goodwill_${generateId()}`,
      source: 'philanthropic_halo',
      triggerCondition: 'Major Philanthropy Initiatives',
      delay,
      severity: 'moderate',
      expiry: 10,
      affectedSystems: ['politics', 'aura', 'clout', 'relationships', 'campaigns'],
      status: 'pending',
      description: `Your extensive community investments have earned you a public halo, compounding Clout/Aura and shielding you from scandals.`,
      effectModifier: { auraGainMult: 1.25, cloutGainMult: 1.15, heatGainMult: 0.5 },
      newsTemplates: [
        'Civic leaders praise your foundation\'s multi-million dollar contributions to local youth clinics.',
        'Polls suggest voters overwhelmingly view your charitable wing as a gold standard of civic leadership.',
        'Rival campaigns find it impossible to smear your name amid surging public adoration.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `🕊️ PUBLIC GOODWILL: Your philanthropy is trending across civic boards. A public relations halo is forming... (Starts in ${delay} months)`,
      colorClass: 'text-emerald-400 font-medium'
    });
  }

  // 5. Trigger: Burnout Immunity / Rest focus (Positive)
  const strongMentalCare = (updatedPl.hustleLevels?.['r_sleep'] || 0) >= 3 || (updatedPl.hustlePlays?.['wellness_retreat'] || 0) >= 2;
  if (strongMentalCare && !hasExistingConsequence(updatedPl, 'burnout_immunity')) {
    const delay = 1;
    const cons: Consequence = {
      id: `cons_burnout_${generateId()}`,
      source: 'burnout_immunity',
      triggerCondition: 'High Self-Care and Rest Focus',
      delay,
      severity: 'moderate',
      expiry: 5,
      affectedSystems: ['mental_health', 'stress'],
      status: 'pending',
      description: `Your dedication to mindfulness and recuperation has built strong burnout immunity, significantly halving mental exhaustion.`,
      effectModifier: { mentalHitMult: 0.5 },
      newsTemplates: [
        'Health journals highlight your corporate self-care protocols as a leading wellness trend.',
        'Analysts note a significant sharpening of your decision-making and operational stamina.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `🧘 WELLNESS METRICS: Your focus on rest and recovery is preparing deep burnout immunity benefits... (Starts in ${delay} months)`,
      colorClass: 'text-blue-400 font-medium'
    });
  }

  // 6. Trigger: Severe Burnout from Continuous Hustling (Negative)
  const isSeverelyFatigued = (updatedPl.mentalHealth || 0) <= 35;
  if (isSeverelyFatigued && !hasExistingConsequence(updatedPl, 'burnout_state')) {
    const delay = 1;
    const cons: Consequence = {
      id: `cons_burnout_state_${generateId()}`,
      source: 'burnout_state',
      triggerCondition: 'Severe Exhaustion & Low Mental Health',
      delay,
      severity: 'severe',
      expiry: 4,
      affectedSystems: ['businesses', 'clout', 'aura'],
      status: 'pending',
      description: `Your extreme exhaustion is leading to imminent severe Burnout! Rest next month to restore mental stability and avert drastic yield collapses.`,
      effectModifier: { yieldCashMult: 0.70, cloutGainMult: 0.75, auraGainMult: 0.75 },
      newsTemplates: [
        'Fatigue begins taking a visible toll on your corporate decision-making and operational stamina.',
        'Market insiders speculate your leadership team is facing severe operational fatigue and slow response times.'
      ]
    };
    updatedPl.consequences.push(cons);
    news.push({
      text: `⚠️ BURNOUT WARNING: Your extreme mental exhaustion is reaching a tipping point. Schedule Rest immediately... (Starts in ${delay} months)`,
      colorClass: 'text-red-400 font-bold'
    });
  }

  // Auto-resolve Burnout if player rest/recovery brings mentalHealth back above 60
  if ((updatedPl.mentalHealth || 0) > 60 && hasExistingConsequence(updatedPl, 'burnout_state')) {
    if (updatedPl.consequences) {
      updatedPl.consequences = updatedPl.consequences.filter(c => c.source !== 'burnout_state');
    }
    const bRecovery = triggerBurnoutRecovery(updatedPl);
    updatedPl = bRecovery.updatedPl;
    bRecovery.news.forEach(n => {
      news.push({
        text: n,
        colorClass: 'text-emerald-400 font-bold'
      });
    });
  }

  // 7. Trigger: High Leverage Debt Squeeze (Negative)
  const debts = updatedPl.financialDebts || [];
  const totalDebtService = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const totalPrincipal = debts.reduce((sum, d) => sum + d.principal, 0);

  const isOverLeveraged = totalPrincipal >= 40000 || totalDebtService >= 2500;
  if (isOverLeveraged && !hasExistingConsequence(updatedPl, 'leverage_squeeze')) {
    const delay = 1;
    const cons: Consequence = {
      id: `cons_leverage_squeeze_${generateId()}`,
      source: 'leverage_squeeze',
      triggerCondition: 'High Outstanding Debt Principal',
      delay,
      severity: 'moderate',
      expiry: 6,
      affectedSystems: ['politics', 'aura', 'clout'],
      status: 'pending',
      description: `Your aggressive debt leverage is triggering creditor panic! Solvency concerns are diminishing your public Clout and Aura growth.`,
      effectModifier: { cloutGainMult: 0.80, auraGainMult: 0.80 },
      newsTemplates: [
        'Unresolved credit liabilities and rising interest obligations raise concerns among local investors.',
        'Market analysts caution that high leverage ratios are narrowing your investment options.'
      ]
    };
    updatedPl.consequences!.push(cons);
    news.push({
      text: `💸 LEVERAGE WARNING: High credit leverage detected ($${totalPrincipal.toLocaleString()} principal). Creditors are monitoring your cash flows... (Starts in ${delay} months)`,
      colorClass: 'text-yellow-400 font-bold'
    });
  }

  // Auto-resolve Debt/Leverage Squeeze once principal falls below 10000
  if (totalPrincipal < 10000 && hasExistingConsequence(updatedPl, 'leverage_squeeze')) {
    if (updatedPl.consequences) {
      updatedPl.consequences = updatedPl.consequences.filter(c => c.source !== 'leverage_squeeze');
    }
    const dRecovery = triggerDebtRecovery(updatedPl);
    updatedPl = dRecovery.updatedPl;
    dRecovery.news.forEach(n => {
      news.push({
        text: n,
        colorClass: 'text-emerald-400 font-bold'
      });
    });
  }

  return updatedPl;
}

/**
 * Decrements delay/expiry, handles state transitions, and formats developing stories.
 */
export function tickConsequences(pl: PlayerStats, news: any[]): PlayerStats {
  const updatedPl = { ...pl };
  if (!updatedPl.consequences) {
    updatedPl.consequences = [];
    return updatedPl;
  }

  // Decrement pending consequences, activate them when delay is 0
  const processed: Consequence[] = updatedPl.consequences.map(c => {
    const copy = { ...c };

    if (copy.status === 'pending') {
      copy.delay--;
      if (copy.delay <= 0) {
        copy.status = 'active';
        news.push({
          text: `🚨 CONSEQUENCE ACTIVATED: "${copy.description}" is now in full effect!`,
          colorClass: copy.source.includes('halo') || copy.source.includes('burnout')
            ? 'text-emerald-400 font-bold animate-pulse'
            : 'text-red-500 font-bold animate-pulse'
        });
        if (copy.source === 'housing_affordability_crisis') {
          // Trigger housing protest world feed story
          const reactionResult = processWorldReaction(updatedPl, 'HOUSING_PROTEST', {});
          Object.assign(updatedPl, reactionResult.updatedPl);
        }
      }
    } else if (copy.status === 'active') {
      if (copy.expiry > 0) {
        copy.expiry--;
        if (copy.expiry <= 0) {
          copy.status = 'expired';
          news.push({
            text: `📰 CONTEXT NORMALIZED: The delayed effects of "${copy.triggerCondition}" have normalized.`,
            colorClass: 'text-slate-400'
          });
        } else {
          // Occasional Developing News template reference
          if (copy.newsTemplates && copy.newsTemplates.length > 0 && Math.random() < 0.4) {
            const template = copy.newsTemplates[Math.floor(Math.random() * copy.newsTemplates.length)];
            news.push({
              text: `📰 DEVELOPING STORY: ${template}`,
              colorClass: copy.source.includes('halo') || copy.source.includes('burnout')
                ? 'text-emerald-300 font-medium'
                : 'text-red-300 font-medium'
            });
          }
        }
      }
    }

    return copy;
  });

  // Filter out expired or resolved consequences
  updatedPl.consequences = processed.filter(c => c.status === 'pending' || c.status === 'active');

  return updatedPl;
}

/**
 * Returns a combined multiplier for a specific affected system key across all active consequences.
 */
export function getConsequenceMultiplier(pl: PlayerStats, system: string, key: string, defaultValue: number = 1.0): number {
  if (!pl.consequences || pl.consequences.length === 0) return defaultValue;

  let finalMult = defaultValue;

  pl.consequences.forEach(c => {
    if (c.status === 'active' && c.affectedSystems.includes(system) && c.effectModifier && c.effectModifier[key] !== undefined) {
      finalMult *= c.effectModifier[key];
    }
  });

  return finalMult;
}

/**
 * Checks if a specific consequence source is active.
 */
export function isConsequenceActive(pl: PlayerStats, source: string): boolean {
  if (!pl.consequences) return false;
  return pl.consequences.some(c => c.source === source && c.status === 'active');
}
