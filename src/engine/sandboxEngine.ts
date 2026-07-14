import type { PlayerStats, TickerMessage } from '../types/game';

/**
 * Core Sandbox Engine for the OPEN tier.
 * Implements multi-system interactions, legacy evolution, district regeneration,
 * post-presidency politics, antitrust investigations, media kingmaker loops,
 * and decadal historical storytelling.
 *
 * Dynamic late-game scaling is applied to all costs, fees, and penalties to preserve
 * strategic tension and prevent player dominance exploits.
 */

export function simulateSandboxTick(pl: PlayerStats, news: (string | TickerMessage)[]): PlayerStats {
  let nextPl = { ...pl };
  const pName = pl.name || 'You';

  // Ensure dynamicPassives is initialized to avoid any uninitialized state access risks
  if (!nextPl.dynamicPassives) {
    nextPl.dynamicPassives = {};
  }

  // 1. BUSINESSES: Antitrust Investigations & Hostile Takeovers (Monopoly balancing)
  const businessIds = ['data_monopoly', 'global_franchise', 'luxury_conglomerate', 'media_empire', 'hedgefund', 'saas_mvp'];
  const hasMegaHoldings = businessIds.some(id => (pl.hustleLevels?.[id] || 0) >= 3) || pl.bag > 1000000000;

  if (hasMegaHoldings && Math.random() < 0.05) {
    // Settle fees scale proportionally to prevent trivial post-scarcity wealth exploits
    const settlementFee = Math.max(50000000, Math.floor(nextPl.bag * 0.08));
    if (nextPl.bag >= settlementFee) {
      nextPl.bag -= settlementFee;
      nextPl.heat = Math.max(0, nextPl.heat - 15);
      news.push({
        text: `⚖️ ANTITRUST SETTLEMENT: Your massive monopolies triggered a federal antitrust investigation. You settled out of court for $${settlementFee.toLocaleString()} to protect your subsidiaries!`,
        colorClass: 'text-orange-400 font-bold',
        tier: 'OPEN'
      });
      nextPl.biography = [
        ...(nextPl.biography || []),
        `Settled a major federal antitrust investigation into ${pName}'s business cartel for $${(settlementFee / 1000000).toFixed(1)}M.`
      ].slice(-100);
    } else {
      // Crackdown penalties scale with player clout to prevent infinite clout stacking without risk
      const cloutPenalty = Math.max(500, Math.floor(nextPl.clout * 0.10));
      nextPl.heat = Math.min(100, nextPl.heat + 30);
      nextPl.clout = Math.max(0, nextPl.clout - cloutPenalty);
      news.push({
        text: `⚖️ ANTITRUST CRACKDOWN: Incapable of paying settlement fees, federal courts placed regulatory monitors across your monopolies! Clout -${cloutPenalty} | Heat +30`,
        colorClass: 'text-red-500 font-black',
        tier: 'OPEN'
      });
    }
  }

  // 2. MEDIA POST-PRESIDENCY: Endorsing Candidates (Kingmaker) & Squeezing Rivals
  const mediaLevel = Math.max(pl.hustleLevels?.['media_empire'] || 0, pl.hustleLevels?.['film_studio'] || 0);
  if (mediaLevel >= 2) {
    // Attack a random competitor/rival
    if (nextPl.rivals && nextPl.rivals.length > 0 && Math.random() < 0.15) {
      const targetRival = nextPl.rivals[Math.floor(Math.random() * nextPl.rivals.length)];
      nextPl.rivals = nextPl.rivals.map(r => {
        if (r.id === targetRival.id) {
          const loss = Math.floor(r.netWorth * 0.20);
          return {
            ...r,
            netWorth: Math.max(0, r.netWorth - loss),
            relationshipWithPlayer: Math.max(-100, (r.relationshipWithPlayer || 0) - 15)
          };
        }
        return r;
      });
      news.push({
        text: `📺 MEDIA SLANDER: You leveraged your TV networks to run smear campaigns against rival ${targetRival.name}, cutting their market capitalization by 20%!`,
        colorClass: 'text-purple-400 font-extrabold',
        tier: 'OPEN'
      });
    }

    // Kingmaker endorse local candidate
    if (Math.random() < 0.10) {
      nextPl.clout = nextPl.clout + 300;
      nextPl.aura = nextPl.aura + 150;
      news.push({
        text: `👑 KINGMAKER: Your broadcasting networks endorsed the new reform mayor candidate. Their victory seals your absolute municipal kingmaker clout! +300 Clout | +150 Aura`,
        colorClass: 'text-yellow-400 font-black animate-pulse',
        tier: 'OPEN'
      });
    }
  }

  // 3. POST-PRESIDENCY POLITICS: Kingmaker, Donor & Lobbyist
  if (nextPl.bag > 200000000 && Math.random() < 0.08) {
    const donationCost = Math.max(50000000, Math.floor(nextPl.bag * 0.04));
    nextPl.bag -= donationCost;
    nextPl.clout = nextPl.clout + 1000;
    nextPl.aura = nextPl.aura + 500;

    // Positive market shift
    nextPl.marketCycle = {
      ...nextPl.marketCycle,
      realEstate: 'boom'
    };

    news.push({
      text: `🏛️ POLITICAL DONOR: You donated $${donationCost.toLocaleString()} to the ruling party PAC. In return, they passed pro-business legislation! Real Estate shifted to BOOM! +1000 Clout | +500 Aura`,
      colorClass: 'text-emerald-400 font-black animate-bounce',
      tier: 'OPEN'
    });
    nextPl.biography = [
      ...(nextPl.biography || []),
      `Acted as key Post-Presidency Political Donor, investing $${(donationCost / 1000000).toFixed(1)}M in party PACs to steer national legislation.`
    ].slice(-100);
  }

  // 4. PROPERTY & DISTRICT OWNERSHIP: Funding Regeneration
  const propertyCount = (nextPl.rentalCount || 0) + (nextPl.rentPortfolioCount || 0);
  if (propertyCount >= 15 && nextPl.bag > 100000000 && Math.random() < 0.08) {
    const regenCost = Math.max(30000000, Math.floor(nextPl.bag * 0.03));
    nextPl.bag -= regenCost;
    nextPl.heat = Math.max(0, nextPl.heat - 20);
    nextPl.aura = nextPl.aura + 400;

    // Permanently improve passive rents through dynamicPassives safely
    const existingBonus = nextPl.dynamicPassives?.['district_regeneration_bonus'] || 0;
    nextPl.dynamicPassives = {
      ...nextPl.dynamicPassives,
      ['district_regeneration_bonus']: existingBonus + 150000 // +$150k passive rent per month
    };

    news.push({
      text: `🏙️ DISTRICT REGENERATION: You funded a $${regenCost.toLocaleString()} urban redevelopment project in your properties' district. Local economies flourished! +$150k/mo Passive Rent | -20 Heat | +400 Aura`,
      colorClass: 'text-cyan-400 font-black',
      tier: 'OPEN'
    });
    nextPl.biography = [
      ...(nextPl.biography || []),
      `Funded municipal regeneration projects, redeveloping entire city blocks to permanently scale landlord yield.`
    ].slice(-100);
  }

  // 5. RIVALS: Retiring, Successors, and Revenge Takeovers
  if (nextPl.rivals && nextPl.rivals.length > 0) {
    // 5.1 Rival Retirement (Graceful Exit)
    if (Math.random() < 0.05) {
      const retiringRival = nextPl.rivals[Math.floor(Math.random() * nextPl.rivals.length)];
      const successorNames = ['Marcus Vance', 'Olivia Sterling', 'Cole Rosso', 'Sofia Thorne', 'Helena Dubois', 'Leo Volkov'];
      const nextName = successorNames[Math.floor(Math.random() * successorNames.length)];

      nextPl.rivals = nextPl.rivals.map(r => {
        if (r.id === retiringRival.id) {
          return {
            ...r,
            name: `${nextName} (Successor)`,
            netWorth: Math.floor(retiringRival.netWorth * 1.2),
            relationshipWithPlayer: 0,
            sabotagedCount: 0,
            helpedCount: 0,
            aggression: Math.random(),
            intelligence: Math.random(),
            ambition: Math.random()
          };
        }
        return r;
      });

      news.push({
        text: `👵 RIVAL RETIREMENT: ${retiringRival.name} has gracefully retired from active corporate boards. Their ambitious successor, ${nextName}, has assumed absolute control!`,
        colorClass: 'text-slate-300 font-bold',
        tier: 'OPEN'
      });
    }

    // 5.2 Revenge Hostile Takeovers (with secure dynamicPassives fallbacks)
    const revengeRival = nextPl.rivals.find(r => (r.sabotagedCount || 0) > 0);
    if (revengeRival && Math.random() < 0.10) {
      const defenseCost = Math.max(15000000, Math.floor(nextPl.bag * 0.05));
      if (nextPl.bag >= defenseCost) {
        nextPl.bag -= defenseCost;
        news.push({
          text: `💥 DEFENSE SYSTEM: Rival ${revengeRival.name} attempted a hostile takeover of your logistics chain out of revenge! You paid a $${defenseCost.toLocaleString()} premium to retain corporate sovereignty.`,
          colorClass: 'text-red-400 font-semibold',
          tier: 'OPEN'
        });
      } else {
        const cloutPenalty = Math.max(800, Math.floor(nextPl.clout * 0.15));
        const auraPenalty = Math.max(400, Math.floor(nextPl.aura * 0.15));
        nextPl.clout = Math.max(0, nextPl.clout - cloutPenalty);
        nextPl.aura = Math.max(0, nextPl.aura - auraPenalty);

        // Block passive business yields temporarily (safe access)
        const oldHustleId = revengeRival.currentHustle || 'data_monopoly';
        nextPl.dynamicPassives = {
          ...nextPl.dynamicPassives,
          [oldHustleId]: (nextPl.dynamicPassives?.[oldHustleId] || 0) - 100000
        };

        news.push({
          text: `💥 HOSTILE TAKEOVER: Vulnerable to cash deficits, you failed to block ${revengeRival.name}'s revenge buyout of your local holdings! Clout -${cloutPenalty} | Aura -${auraPenalty}`,
          colorClass: 'text-red-500 font-black animate-pulse',
          tier: 'OPEN'
        });
      }
    }
  }

  // 6. DECADES OF HISTORY & LEGACY STORYTELLING
  if (pl.month > 0 && pl.month % 120 === 0) {
    const decade = Math.floor(pl.month / 120);
    news.push({
      text: `🪐 DECADAL LEGACY: ${pName} has dominated the sandbox for ${decade}0 full years! Standard family reputation metrics have peaked.`,
      colorClass: 'text-yellow-400 font-black animate-bounce',
      tier: 'OPEN'
    });

    // Pinned historic entry to World Feed with deterministic sequential ID
    nextPl.worldFeed = [
      {
        id: `decadal_monument_m${pl.month}`,
        category: 'WORLD' as const,
        text: `🪐 DYNASTY VERDICT: Over ${decade}0 years of continued simulation, the legendary ${pName} family continues to write national history. Absolute sovereignty is sealed.`,
        source: 'Global Historical Monument',
        timestamp: Date.now(),
        month: pl.month,
        pinned: true
      },
      ...(nextPl.worldFeed || [])
    ].slice(0, 100);

    nextPl.biography = [
      ...(nextPl.biography || []),
      `Celebrated a spectacular ${decade}0-year landmark of absolute sandbox dominance, recognized as an immortal industry sovereign.`
    ].slice(-100);
  }

  return nextPl;
}
