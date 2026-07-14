import type { PlayerStats, PlayerAmbition, TickerMessage } from '../types/game';
import { HUSTLE_SECTORS, type Sector } from '../config/sectors';
import * as Bio from './biographyEngine';

export interface AmbitionDefinition {
  id: string;
  title: string;
  description: string;
  rewardDescription: string;
  parentAmbitionId?: string; // If this is part of an evolution chain
  evolvesTo?: string; // Next stage in the chain
  suggestTrigger: (pl: PlayerStats) => boolean;
  getProgress: (pl: PlayerStats) => { progress: number; target: number; text: string };
  onComplete: (pl: PlayerStats) => {
    updatedPl: PlayerStats;
    news: TickerMessage[];
    biographyEntry: string;
  };
}

export const AMBITION_REGISTRY: AmbitionDefinition[] = [
  // --- REAL ESTATE EVOLUTION CHAIN ---
  {
    id: 'prop_portfolio',
    title: 'Small Property Portfolio',
    description: 'Establish your footings in the real estate market by acquiring a few properties.',
    rewardDescription: 'Historical entry, +300 Legacy Score, and unlocks "The Property Empire" ambition.',
    evolvesTo: 'property_empire',
    suggestTrigger: (pl) => {
      const current = (pl.rentalCount || 0) + (pl.rentPortfolioCount || 0);
      return current >= 1;
    },
    getProgress: (pl) => {
      const current = (pl.rentalCount || 0) + (pl.rentPortfolioCount || 0);
      const target = pl.currentTier === 'MUD' ? 2 : 3;
      return {
        progress: Math.min(target, current),
        target,
        text: `Acquire ${current} / ${target} properties or rent portfolios.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🏠 AMBITION EVOLVED: ${pl.name || 'You'} established a "Small Property Portfolio"! Ready to dominate the market.`,
          colorClass: 'text-emerald-400 font-bold',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 300,
          legacyPoints: (pl.legacyPoints || 0) + 3,
        },
        news,
        biographyEntry: `Began a real estate portfolio, acquiring initial residential property units as a budding landlord.`,
      };
    }
  },
  {
    id: 'property_empire',
    title: 'The Property Empire',
    description: 'Expand your real estate holdings to shape municipal housing slates.',
    rewardDescription: 'Historical recognition as the City Landlord, +800 Legacy Score, and unlocks "National Property Baron".',
    parentAmbitionId: 'prop_portfolio',
    evolvesTo: 'prop_baron',
    suggestTrigger: (pl) => {
      // Unlocked when prop_portfolio is completed
      return pl.ambitions?.some(a => a.id === 'prop_portfolio' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = (pl.rentalCount || 0) + (pl.rentPortfolioCount || 0);
      // Harder starting conditions or higher tiers demand higher targets
      const target = pl.currentTier === 'ELITE' || pl.currentTier === 'MOGUL' ? 12 : 8;
      return {
        progress: Math.min(target, current),
        target,
        text: `Own ${current} / ${target} properties or portfolios.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `👑 AMBITION EVOLVED: ${pl.name || 'You'} created "The Property Empire" with major regional holdings!`,
          colorClass: 'text-yellow-400 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 800,
          legacyPoints: (pl.legacyPoints || 0) + 8,
        },
        news,
        biographyEntry: `Created a renowned regional Property Empire, capturing high-yield residential blocks under management.`,
      };
    }
  },
  {
    id: 'prop_baron',
    title: 'National Property Baron',
    description: 'Command massive commercial blocks and residential towers across state borders.',
    rewardDescription: 'National economic prestige, +1,500 Legacy Score, and unlocks "Global Property Legacy".',
    parentAmbitionId: 'property_empire',
    evolvesTo: 'prop_legacy',
    suggestTrigger: (pl) => {
      return pl.ambitions?.some(a => a.id === 'property_empire' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = (pl.rentalCount || 0) + (pl.rentPortfolioCount || 0);
      const target = pl.chosenBackgroundCategory === 'benefactor' ? 25 : 20;
      return {
        progress: Math.min(target, current),
        target,
        text: `Own ${current} / ${target} properties or portfolios.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🏢 AMBITION EVOLVED: ${pl.name || 'You'} is crowned the "National Property Baron"! State housing answers to you.`,
          colorClass: 'text-indigo-400 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
        },
        news,
        biographyEntry: `Crowned as the National Property Baron after expanding commercial portfolios to a state-wide monopoly.`,
      };
    }
  },
  {
    id: 'prop_legacy',
    title: 'Global Property Legacy',
    description: 'Erect skyscrapers, purchase private islands, and cement an immortal property dynasty.',
    rewardDescription: 'Immortalized in property history, +3,000 Legacy Score, and custom global ticker features.',
    parentAmbitionId: 'prop_baron',
    suggestTrigger: (pl) => {
      return pl.ambitions?.some(a => a.id === 'prop_baron' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = (pl.rentalCount || 0) + (pl.rentPortfolioCount || 0);
      const target = 40;
      return {
        progress: Math.min(target, current),
        target,
        text: `Own ${current} / ${target} skyscrapers, properties, or private islands.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🪐 AMBITION ACHIEVED: ${pl.name || 'You'} achieved the final "Global Property Legacy"! An immortal dynasty is sealed.`,
          colorClass: 'text-yellow-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 3000,
          legacyPoints: (pl.legacyPoints || 0) + 30,
        },
        news,
        biographyEntry: `Sealed an immortal Global Property Legacy, commanding skyscrapers, private islands, and city-shaping trusts.`,
      };
    }
  },

  // --- CORPORATE EVOLUTION CHAIN ---
  {
    id: 'corp_local',
    title: 'Local Business',
    description: 'Launch and establish your initial active businesses in the local neighborhood.',
    rewardDescription: 'Local community trust, +300 Legacy Score, and unlocks "Corporate Group".',
    evolvesTo: 'corp_group',
    suggestTrigger: (pl) => {
      return Object.keys(pl.hustleLevels).length >= 1;
    },
    getProgress: (pl) => {
      const current = Object.keys(pl.hustleLevels).length;
      const target = 2;
      return {
        progress: Math.min(target, current),
        target,
        text: `Launch ${current} / ${target} active neighborhood businesses.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🏢 AMBITION EVOLVED: ${pl.name || 'You'} established a successful "Local Business" presence on the block!`,
          colorClass: 'text-emerald-400 font-bold',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 300,
          legacyPoints: (pl.legacyPoints || 0) + 3,
        },
        news,
        biographyEntry: `Established the initial local neighborhood business presence, serving local communities.`,
      };
    }
  },
  {
    id: 'corp_group',
    title: 'Corporate Group',
    description: 'Expand your holdings into a diverse group of mid-tier active corporate firms.',
    rewardDescription: 'Elite corporate board leverage, +800 Legacy Score, and unlocks "National Corporation".',
    parentAmbitionId: 'corp_local',
    evolvesTo: 'corp_national',
    suggestTrigger: (pl) => {
      return pl.ambitions?.some(a => a.id === 'corp_local' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = Object.keys(pl.hustleLevels).length;
      const target = 5;
      return {
        progress: Math.min(target, current),
        target,
        text: `Own ${current} / ${target} distinct business holdings.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `💼 AMBITION EVOLVED: ${pl.name || 'You'} incorporated a mid-tier "Corporate Group"! Boardroom clout unlocked.`,
          colorClass: 'text-yellow-400 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 800,
          legacyPoints: (pl.legacyPoints || 0) + 8,
        },
        news,
        biographyEntry: `Incorporated a mid-tier Corporate Group, coordinating multiple regional operational streams.`,
      };
    }
  },
  {
    id: 'corp_national',
    title: 'National Corporation',
    description: 'Scale active enterprise slates across state borders with substantial net worth backing.',
    rewardDescription: 'Billionaire prestige, +1,500 Legacy Score, and unlocks "Global Conglomerate".',
    parentAmbitionId: 'corp_group',
    evolvesTo: 'corp_conglomerate',
    suggestTrigger: (pl) => {
      return pl.ambitions?.some(a => a.id === 'corp_group' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = Object.keys(pl.hustleLevels).length;
      const target = 8;
      return {
        progress: Math.min(target, current),
        target,
        text: `Manage ${current} / ${target} distinct businesses with state contracts.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🚀 AMBITION EVOLVED: ${pl.name || 'You'} scaled up to a "National Corporation"! Share value is skyrocketing.`,
          colorClass: 'text-indigo-400 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
        },
        news,
        biographyEntry: `Scaled active enterprises into a major National Corporation, controlling massive state contracts.`,
      };
    }
  },
  {
    id: 'corp_conglomerate',
    title: 'Global Conglomerate',
    description: 'Establish an absolute multi-national monopoly over global industry streams.',
    rewardDescription: 'Tribute as a Conglomerate Kingpin, +3,000 Legacy Score, and custom global ticker announcements.',
    parentAmbitionId: 'corp_national',
    suggestTrigger: (pl) => {
      return pl.ambitions?.some(a => a.id === 'corp_national' && a.status === 'COMPLETED') || false;
    },
    getProgress: (pl) => {
      const current = Object.keys(pl.hustleLevels).length;
      const target = 12;
      return {
        progress: Math.min(target, current),
        target,
        text: `Command ${current} / ${target} active multi-national subsidiaries.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `👑 AMBITION ACHIEVED: ${pl.name || 'You'} established a "Global Conglomerate"! Your cartel dictates global trade.`,
          colorClass: 'text-yellow-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 3000,
          legacyPoints: (pl.legacyPoints || 0) + 30,
        },
        news,
        biographyEntry: `Established a renowned Global Conglomerate, orchestrating an absolute multi-national monopoly.`,
      };
    }
  },

  // --- CONFLICTING THEMATIC AMBITIONS ---
  {
    id: 'leave_better_society',
    title: 'Leave Society Better Than You Found It',
    description: 'Commit to community development, support regional networks, and fund extensive philanthropy.',
    rewardDescription: 'Immortalized as a beloved Philanthropist, +1,500 Legacy Score, and permanent +100 starting Aura.',
    suggestTrigger: (pl) => {
      // Conflict check: A philanthropist should NOT be a criminal mastermind!
      const isCriminal = pl.ambitions?.some(a => a.id === 'shadow_kingpin' && (a.status === 'ACTIVE' || a.status === 'COMPLETED'));
      if (isCriminal) return false;

      const helpedCount = pl.rivals?.reduce((sum, r) => sum + (r.helpedCount || 0), 0) || 0;
      return helpedCount >= 1 || pl.aura >= 150 || (pl.philanthropyDonation || 0) >= 5000000;
    },
    getProgress: (pl) => {
      const helpedCount = pl.rivals?.reduce((sum, r) => sum + (r.helpedCount || 0), 0) || 0;
      const donated = pl.philanthropyDonation || 0;
      const donatedPoints = donated >= 50000000 ? 5 : (donated >= 10000000 ? 3 : (donated > 0 ? 1 : 0));
      const current = helpedCount + donatedPoints;
      // Scales based on current progression tier
      const target = pl.currentTier === 'MOGUL' || pl.currentTier === 'PRESIDENT' ? 7 : 5;
      return {
        progress: Math.min(target, current),
        target,
        text: `Accumulate ${current} / ${target} humanitarian or philanthropic points.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🕊️ AMBITION ACHIEVED: ${pl.name || 'You'} realized the "Leave Society Better Than You Found It" dream!`,
          colorClass: 'text-emerald-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
          aura: Math.min(10000, pl.aura + 200),
        },
        news,
        biographyEntry: `Immortalized as a beloved public Philanthropist, recognized globally for dedicating wealth to the betterment of mankind.`,
      };
    }
  },
  {
    id: 'shadow_kingpin',
    title: 'The Shadow Kingpin',
    description: 'Build a dark underworld network, master stealth operations, and manage extreme Heat.',
    rewardDescription: 'Legendary infamy as Godfather, +1,500 Legacy Score, and street protection benefits.',
    suggestTrigger: (pl) => {
      // Conflict check: A crime kingpin should NOT be a pure philanthropist!
      const isPhilanthropist = pl.ambitions?.some(a => a.id === 'leave_better_society' && (a.status === 'ACTIVE' || a.status === 'COMPLETED'));
      if (isPhilanthropist) return false;

      return pl.heat >= 60 || (pl.arrestCount || 0) >= 1 || pl.hustleLevels['r_ghost_mode'] >= 2;
    },
    getProgress: (pl) => {
      const current = (pl.arrestCount || 0) * 3 + (pl.hustleLevels['r_ghost_mode'] || 0) + (pl.heat >= 80 ? 2 : 0);
      const target = pl.currentTier === 'PRESIDENT' ? 12 : 8;
      return {
        progress: Math.min(target, current),
        target,
        text: `Accumulate ${current} / ${target} underworld syndicate experience points.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🥷 AMBITION ACHIEVED: ${pl.name || 'You'} is now "The Shadow Kingpin"! Underworld bosses kneel.`,
          colorClass: 'text-red-500 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
        },
        news,
        biographyEntry: `Earned legendary infamy as 'The Shadow Kingpin', ruling the digital underworld with extreme calculated precision.`,
      };
    }
  },

  // --- OTHER THEMATIC STANDALONE AMBITIONS WITH DYNAMIC DIFFICULTY ---
  {
    id: 'oval_office_dream',
    title: 'The Oval Office Dream',
    description: 'Ascend to the highest political office by securing the Presidency.',
    rewardDescription: 'Immortal Presidential legacy, +2,000 Legacy Score, and custom world summary features.',
    suggestTrigger: (pl) => {
      return pl.currentTier === 'MOGUL' || (pl.campaignStage !== undefined && pl.campaignStage > 1);
    },
    getProgress: (pl) => {
      const isPresident = pl.currentTier === 'PRESIDENT' || (pl.campaignStage !== undefined && pl.campaignStage >= 8);
      return {
        progress: isPresident ? 1 : 0,
        target: 1,
        text: isPresident ? 'Presidency secured.' : 'Achieve the PRESIDENT tier.',
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🇺🇸 AMBITION ACHIEVED: ${pl.name || 'You'} completed "The Oval Office Dream"! All global leaders answer to you.`,
          colorClass: 'text-indigo-400 font-black animate-pulse',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 2000,
          legacyPoints: (pl.legacyPoints || 0) + 20,
        },
        news,
        biographyEntry: `Realized 'The Oval Office Dream', climbing to the supreme rank of President of the United States.`,
      };
    }
  },
  {
    id: 'wealth_titan',
    title: 'The Wealth Titan',
    description: 'Amass unparalleled cash reserves to buy out all competitive rivals.',
    rewardDescription: 'Hall of Fame elite badge, +1,500 Legacy Score, and custom economic ticker coverage.',
    suggestTrigger: (pl) => {
      return pl.bag >= 10000000;
    },
    getProgress: (pl) => {
      // Scale target based on progression tiers to prevent static thresholds
      const target = pl.currentTier === 'MOGUL' || pl.currentTier === 'PRESIDENT' || pl.currentTier === 'OPEN' ? 500000000 : 100000000;
      return {
        progress: Math.min(target, pl.bag),
        target,
        text: `Accumulate $${pl.bag.toLocaleString()} / $${target.toLocaleString()} cash.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `💰 AMBITION ACHIEVED: ${pl.name || 'You'} is now "The Wealth Titan", cementing absolute monetary sovereignty!`,
          colorClass: 'text-emerald-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
        },
        news,
        biographyEntry: `Crowned as 'The Wealth Titan' after securing unprecedented cash reserves, eclipsing all corporate rivals.`,
      };
    }
  },
  {
    id: 'voice_of_nation',
    title: 'The Voice of a Nation',
    description: 'Monopolize the television, audio streams, and broadcasting channels.',
    rewardDescription: 'Absolute public narrative control, +1,000 Legacy Score, and 15% reduction in public backlash.',
    suggestTrigger: (pl) => {
      const mediaHustles = ['cc', 'pod', 'audio', 'film_studio', 'media_empire'];
      return mediaHustles.some(h => (pl.hustleLevels[h] !== undefined || pl.hustleBranchIds[h] !== undefined));
    },
    getProgress: (pl) => {
      const ccLvl = pl.hustleLevels['cc'] || 0;
      const podLvl = pl.hustleLevels['pod'] || 0;
      const audioLvl = pl.hustleLevels['audio'] || 0;
      const filmLvl = pl.hustleLevels['film_studio'] || 0;
      const mediaLvl = pl.hustleLevels['media_empire'] || 0;
      const current = ccLvl + podLvl + audioLvl + filmLvl + mediaLvl;
      // Scales dynamically with player progression tier
      const target = pl.currentTier === 'MOGUL' || pl.currentTier === 'PRESIDENT' || pl.currentTier === 'OPEN' ? 10 : 7;
      return {
        progress: Math.min(target, current),
        target,
        text: `Accumulate ${current} / ${target} total levels in media and entertainment enterprises.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `📺 AMBITION ACHIEVED: ${pl.name || 'You'} finalized "The Voice of a Nation" through absolute broadcasting monopoly!`,
          colorClass: 'text-purple-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1000,
          legacyPoints: (pl.legacyPoints || 0) + 10,
        },
        news,
        biographyEntry: `Orchestrated national public relations, honored as 'The Voice of a Nation' for controlling regional media slates.`,
      };
    }
  },
  {
    id: 'sector_dominator',
    title: 'The Sector Dominator',
    description: 'Own active subsidary operations in multiple distinct industrial sectors.',
    rewardDescription: 'Immortal tribute as Conglomerate Baron, +1,200 Legacy Score, and dynamic story ticker highlights.',
    suggestTrigger: (pl) => {
      const sectors = new Set<Sector>();
      Object.keys(pl.hustleLevels).forEach(hustleId => {
        const sector = HUSTLE_SECTORS[hustleId];
        if (sector) sectors.add(sector);
      });
      return sectors.size >= 3;
    },
    getProgress: (pl) => {
      const sectors = new Set<Sector>();
      Object.keys(pl.hustleLevels).forEach(hustleId => {
        const sector = HUSTLE_SECTORS[hustleId];
        if (sector) sectors.add(sector);
      });
      const target = pl.currentTier === 'OPEN' ? 6 : 5;
      return {
        progress: Math.min(target, sectors.size),
        target,
        text: `Own upgraded branches in ${sectors.size} / ${target} distinct sectors.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🌐 AMBITION ACHIEVED: ${pl.name || 'You'} completed "The Sector Dominator", leading a multi-industry syndicate!`,
          colorClass: 'text-yellow-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1200,
          legacyPoints: (pl.legacyPoints || 0) + 12,
        },
        news,
        biographyEntry: `Captured high-yield multi-industry subsidiaries, celebrated as 'The Sector Dominator'.`,
      };
    }
  },
  {
    id: 'silicon_sovereign',
    title: 'The Silicon Sovereign',
    description: 'Harness the power of technology through big data software, server mining, and artificial algorithms.',
    rewardDescription: 'Recognized as Tech Sovereign, +1,200 Legacy Score, and custom AI disruption world reactions.',
    suggestTrigger: (pl) => {
      const techHustles = ['techFlip', 'smm', 'saas_mvp', 'data_analytics', 'crypto_mining', 'data_monopoly'];
      return techHustles.some(h => pl.hustleLevels[h] !== undefined);
    },
    getProgress: (pl) => {
      const saasLvl = pl.hustleLevels['saas_mvp'] || 0;
      const dataLvl = pl.hustleLevels['data_analytics'] || 0;
      const miningLvl = pl.hustleLevels['crypto_mining'] || 0;
      const monLvl = pl.hustleLevels['data_monopoly'] || 0;
      const current = saasLvl + dataLvl + miningLvl + monLvl;
      const target = pl.currentTier === 'PRESIDENT' ? 8 : 6;
      return {
        progress: Math.min(target, current),
        target,
        text: `Own ${current} / ${target} levels in advanced technological enterprises.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🚀 AMBITION ACHIEVED: ${pl.name || 'You'} is now the "The Silicon Sovereign"! Cyber industries belong to you.`,
          colorClass: 'text-blue-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1200,
          legacyPoints: (pl.legacyPoints || 0) + 12,
        },
        news,
        biographyEntry: `Pioneered high-growth algorithmic registries, universally crowned as 'The Silicon Sovereign'.`,
      };
    }
  },
  {
    id: 'political_maestro',
    title: 'A Political Maestro',
    description: 'Maintain absolute legislative consensus and high cabinet member loyalty.',
    rewardDescription: 'Historical State Architect recognition, +1,500 Legacy Score, and permanent PR shield.',
    suggestTrigger: (pl) => {
      return pl.currentTier === 'PRESIDENT' || pl.clout >= 1000;
    },
    getProgress: (pl) => {
      const highLoyaltyCount = Object.values(pl.cabinet || {}).filter(m => m.loyalty >= 70).length;
      const ordersPassed = pl.presidentialDiary?.length || 0;
      const current = highLoyaltyCount + ordersPassed;
      // Scales naturally during presidential term stages
      const target = pl.currentTier === 'PRESIDENT' && pl.isSecondTerm ? 7 : 5;
      return {
        progress: Math.min(target, current),
        target,
        text: `Have high cabinet loyalty or pass executive policies: ${current} / ${target} milestones.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🗳️ AMBITION ACHIEVED: ${pl.name || 'You'} completed "A Political Maestro" with flawless legislative consensus!`,
          colorClass: 'text-indigo-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1500,
          legacyPoints: (pl.legacyPoints || 0) + 15,
        },
        news,
        biographyEntry: `Orchestrated state policy with flawless legislative alliances, remembered as 'A Political Maestro'.`,
      };
    }
  },
  {
    id: 'rentier_dream',
    title: 'The Rentier Dream',
    description: 'Secure substantial automated cash flows to live purely passively on investments.',
    rewardDescription: 'Permanent financial independence legacy, +1,000 Legacy Score, and custom luxury retirement articles.',
    suggestTrigger: (pl) => {
      return (pl.lastPassiveBreakdown?.finalTotal || 0) >= 30000;
    },
    getProgress: (pl) => {
      const current = pl.lastPassiveBreakdown?.finalTotal || 0;
      // Target scales naturally with progression tiers
      const target = pl.currentTier === 'MOGUL' || pl.currentTier === 'PRESIDENT' || pl.currentTier === 'OPEN' ? 1000000 : 500000;
      return {
        progress: Math.min(target, current),
        target,
        text: `Build monthly passive income to $${current.toLocaleString()} / $${target.toLocaleString()}.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `💸 AMBITION ACHIEVED: ${pl.name || 'You'} realized "The Rentier Dream" with massive automated assets!`,
          colorClass: 'text-emerald-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1000,
          legacyPoints: (pl.legacyPoints || 0) + 10,
        },
        news,
        biographyEntry: `Achieved complete financial independence, completing 'The Rentier Dream' through automated passive income streams.`,
      };
    }
  },
  {
    id: 'green_horizon',
    title: 'Green Horizon',
    description: 'Lead universal clean energy initiatives, clean transit, and orbital carbon reduction technology.',
    rewardDescription: 'Immortal Savior of the Planet recognition, +1,200 Legacy Score, and global atmosphere news ticker reports.',
    suggestTrigger: (pl) => {
      return pl.hustleLevels['space_investment'] !== undefined || pl.vcSector === 'energy';
    },
    getProgress: (pl) => {
      const spaceLvl = pl.hustleLevels['space_investment'] || 0;
      const energyVC = pl.vcSector === 'energy' && pl.vcInvestment > 0 ? 3 : 0;
      const techConglom = pl.flexAssets['tech_conglomerate'] || 0;
      const current = spaceLvl * 2 + energyVC + techConglom;
      const target = 5;
      return {
        progress: Math.min(target, current),
        target,
        text: `Invest in energy sectors, space travel, or tech conglomerates: ${current} / ${target} points.`,
      };
    },
    onComplete: (pl) => {
      const news: TickerMessage[] = [
        {
          text: `🌍 AMBITION ACHIEVED: ${pl.name || 'You'} realized the "Green Horizon" dream! Carbon emissions are plummeting.`,
          colorClass: 'text-emerald-400 font-black animate-bounce',
        }
      ];
      return {
        updatedPl: {
          ...pl,
          legacyScore: (pl.legacyScore || 0) + 1200,
          legacyPoints: (pl.legacyPoints || 0) + 12,
        },
        news,
        biographyEntry: `Universally honored as a Savior of the Planet, realizing the clean 'Green Horizon' carbon reduction dream.`,
      };
    }
  }
];

export function checkAmbitionTriggersAndCompletions(pl: PlayerStats): {
  updatedPl: PlayerStats;
  news: TickerMessage[];
} {
  let nextPl = { ...pl };
  if (!nextPl.ambitions) {
    nextPl.ambitions = [];
  }

  const news: TickerMessage[] = [];

  // Update existing ACTIVE ambitions progress and check for completions
  const updatedAmbitions: PlayerAmbition[] = [];

  for (const amb of nextPl.ambitions) {
    if (amb.status === 'COMPLETED' || amb.status === 'IGNORED') {
      updatedAmbitions.push(amb);
      continue;
    }

    const def = AMBITION_REGISTRY.find(d => d.id === amb.id);
    if (!def) {
      updatedAmbitions.push(amb);
      continue;
    }

    const progInfo = def.getProgress(nextPl);
    const completedNow = amb.status === 'ACTIVE' && progInfo.progress >= progInfo.target;

    let nextStatus: PlayerAmbition['status'] = amb.status;
    if (completedNow) {
      nextStatus = 'COMPLETED';

      // Execute onComplete callback
      const callbackRes = def.onComplete(nextPl);
      nextPl = callbackRes.updatedPl as PlayerStats;
      news.push(...callbackRes.news);

      // Add biography entry
      const bioUpdate = Bio.recordEvent(nextPl, callbackRes.biographyEntry, `ambition_${amb.id}`);
      if (bioUpdate) {
        nextPl.biography = [...(nextPl.biography || []), bioUpdate.entry];
        nextPl.recordedBioKeys = [...(nextPl.recordedBioKeys || []), bioUpdate.key!];
      }

      // Pin to World Feed
      const summaryId = Math.random().toString(36).substring(7);
      nextPl.worldFeed = [
        {
          id: summaryId,
          category: 'WORLD' as const,
          text: `🌟 HISTORICAL TRIUMPH: The legendary ${nextPl.name || 'individual'} has successfully realized the grand life ambition: "${def.title}". ${callbackRes.biographyEntry}`,
          source: 'Grand Historian Archive',
          timestamp: Date.now(),
          month: nextPl.month,
          pinned: true,
        },
        ...(nextPl.worldFeed || [])
      ].slice(0, 100);

      // Automatically handle progressive ambition evolution!
      // If it has an evolvesTo and the child is not already registered, suggest the evolved version in the next tick.
      if (def.evolvesTo) {
        const nextDef = AMBITION_REGISTRY.find(d => d.id === def.evolvesTo);
        if (nextDef) {
          const nextProg = nextDef.getProgress(nextPl);
          const newAmbition: PlayerAmbition = {
            id: nextDef.id,
            title: nextDef.title,
            description: nextDef.description,
            status: 'SUGGESTED',
            progress: nextProg.progress,
            target: nextProg.target,
            progressText: nextProg.text,
            rewardDescription: nextDef.rewardDescription,
          };
          updatedAmbitions.push(newAmbition);
          news.push({
            text: `💡 AMBITION EVOLVED: Your success unlocked the next tier of aspiration: "${nextDef.title}"!`,
            colorClass: 'text-indigo-400 font-bold animate-pulse',
          });
        }
      }
    }

    updatedAmbitions.push({
      ...amb,
      status: nextStatus,
      progress: progInfo.progress,
      target: progInfo.target,
      progressText: progInfo.text,
    });
  }

  nextPl.ambitions = updatedAmbitions;

  // Suggest new ambitions if they match triggers
  AMBITION_REGISTRY.forEach(def => {
    // Check if player already has this ambition in any form
    const exists = nextPl.ambitions!.some(a => a.id === def.id);
    if (exists) return;

    // Check suggest trigger
    if (def.suggestTrigger(nextPl)) {
      const progInfo = def.getProgress(nextPl);
      const newAmbition: PlayerAmbition = {
        id: def.id,
        title: def.title,
        description: def.description,
        status: 'SUGGESTED',
        progress: progInfo.progress,
        target: progInfo.target,
        progressText: progInfo.text,
        rewardDescription: def.rewardDescription,
      };

      nextPl.ambitions!.push(newAmbition);
      news.push({
        text: `💡 NEW AMBITION SUGGESTED: "${def.title}" is now available in your Strategic Intelligence Advisor.`,
        colorClass: 'text-indigo-400 font-bold',
      });
    }
  });

  return {
    updatedPl: nextPl,
    news,
  };
}
