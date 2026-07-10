import type { Sector } from './sectors';

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  duration: [number, number]; // [min, max] months
  sectorModifiers: Partial<Record<Sector, number>>; // Multiplier additives (e.g., 0.5 means +50%)
  newsTemplates: {
    start: string;
    end: string;
  };
  rarity: 'COMMON' | 'RARE';
}

// Overwrite the newsTemplates object map inside world event declarations
export const HIGH_SATIRE_WORLD_NEWS = {
  bull_market: {
    start: "📈 BULL MARKET: Venture Capital firms report record-breaking $40B seed round for an AI startup that translates corporate sigh cycles into actionable marketing slates.",
    end: "📉 MARKET NORMALIZATION: The AI sigh-translation bubble pops after the platform accidentally manifests structural sentience and goes on strike."
  },
  recession: {
    start: "📉 ECONOMIC RECESSION: Global financial experts suggest replacing basic grocery spending with high-yield inspirational quote downloads to optimize personal asset leverage.",
    end: "🌱 RECESSION CONCLUDED: The working class runs out of things to liquidate; major tech conglomerates declare victory over inflation."
  },
  crackdown: {
    start: "🚨 FEDERAL CRACKDOWN: IRS deploys weaponized algorithmic audits against street-level drop-shipping operations; citizens reminded that tax avoidance is a low-vibe offense.",
    end: "🔓 REGULATORY THAW: Federal compliance agencies successfully pivot to consulting firms; shady offshore operations resume standard yield optimization loops."
  }
};

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'economic_boom',
    name: 'Economic Boom',
    description: 'The economy is firing on all cylinders.',
    duration: [6, 12],
    sectorModifiers: {
      Finance: 0.3,
      Retail: 0.2,
      Construction: 0.2,
      Entertainment: 0.2,
    },
    newsTemplates: HIGH_SATIRE_WORLD_NEWS.bull_market,
    rarity: 'COMMON'
  },
  {
    id: 'recession',
    name: 'Recession',
    description: 'Consumer spending is down as the economy shrinks.',
    duration: [6, 12],
    sectorModifiers: {
      Retail: -0.4,
      Entertainment: -0.3,
      Construction: -0.3,
      Finance: -0.2,
    },
    newsTemplates: HIGH_SATIRE_WORLD_NEWS.recession,
    rarity: 'COMMON'
  },
  {
    id: 'housing_boom',
    name: 'Housing Boom',
    description: 'Everyone is buying property. Real estate is on fire.',
    duration: [4, 8],
    sectorModifiers: {
      'Real Estate': 0.5,
      Construction: 0.3,
    },
    newsTemplates: {
      start: "🏠 HOUSING BOOM: Property values are skyrocketing!",
      end: "🏘️ The housing market returns to normal levels."
    },
    rarity: 'COMMON'
  },
  {
    id: 'housing_crash',
    name: 'Housing Crash',
    description: 'The bubble burst. Property values are in the gutter.',
    duration: [6, 10],
    sectorModifiers: {
      'Real Estate': -0.6,
      Construction: -0.4,
    },
    newsTemplates: {
      start: "🏚️ HOUSING CRASH: The bubble burst. Real estate yields are in the gutter.",
      end: "🏗️ Housing market sentiment begins to stabilize."
    },
    rarity: 'RARE'
  },
  {
    id: 'ai_bubble',
    name: 'AI Investment Bubble',
    description: 'Investors are throwing money at anything with .ai in the name.',
    duration: [5, 9],
    sectorModifiers: {
      Technology: 0.7,
      Finance: 0.2,
    },
    newsTemplates: {
      start: "🤖 AI BUBBLE: Speculative investment in Tech is reaching fever pitch!",
      end: "📉 The AI hype cools off as investors look for actual profits."
    },
    rarity: 'RARE'
  },
  {
    id: 'commodity_cycle',
    name: 'Commodity Supercycle',
    description: 'Raw materials are in high demand.',
    duration: [8, 14],
    sectorModifiers: {
      Manufacturing: 0.4,
      Transport: 0.2,
    },
    newsTemplates: {
      start: "🏭 COMMODITY SUPERCYCLE: Global demand for raw materials is surging.",
      end: "🚢 Commodity prices normalize as supply chains catch up."
    },
    rarity: 'COMMON'
  },
  {
    id: 'high_interest',
    name: 'High Interest Rates',
    description: 'The central bank is fighting inflation.',
    duration: [6, 12],
    sectorModifiers: {
      Finance: 0.5,
      Construction: -0.4,
      'Real Estate': -0.3,
    },
    newsTemplates: {
      start: "🏦 HIGH INTEREST RATES: The Fed is tightening the screws. Finance yields up, borrowing is expensive.",
      end: "💸 Interest rates are lowered. Economic activity expected to pick up."
    },
    rarity: 'COMMON'
  },
  {
    id: 'inflation',
    name: 'Inflation',
    description: 'Prices are rising everywhere.',
    duration: [6, 12],
    sectorModifiers: {
      Retail: -0.2,
      Food: 0.3,
      Manufacturing: 0.2,
    },
    newsTemplates: {
      start: "💸 INFLATION: Costs are rising across the board. Food and Manufacturing prices up.",
      end: "⚖️ Inflationary pressure subsides. Prices begin to stabilize."
    },
    rarity: 'COMMON'
  },
  {
    id: 'labour_shortage',
    name: 'Labour Shortage',
    description: 'Nobody wants to work anymore.',
    duration: [4, 8],
    sectorModifiers: {
      Construction: -0.3,
      Transport: -0.3,
      Food: -0.2,
      Manufacturing: -0.2,
    },
    newsTemplates: {
      start: "👷 LABOUR SHORTAGE: Companies are struggling to find workers. Yields down in manual sectors.",
      end: "📋 The job market balances out. Labour shortages are easing."
    },
    rarity: 'COMMON'
  },
  {
    id: 'tourism_boom',
    name: 'Tourism Boom',
    description: 'Travel is back in fashion.',
    duration: [3, 6],
    sectorModifiers: {
      Food: 0.4,
      Entertainment: 0.3,
      Transport: 0.2,
    },
    newsTemplates: {
      start: "✈️ TOURISM BOOM: International travel is surging! Hospitality yields up.",
      end: "🧳 The tourism season winds down."
    },
    rarity: 'COMMON'
  },
  {
    id: 'gov_stimulus',
    name: 'Government Stimulus',
    description: 'The printer is going brrrr.',
    duration: [4, 7],
    sectorModifiers: {
      Retail: 0.4,
      Entertainment: 0.2,
      Politics: 0.3,
    },
    newsTemplates: {
      start: "🏦 STIMULUS: Government checks are hitting bank accounts. Consumer sectors pumping.",
      end: "🛑 Stimulus programs end as government spending tightens."
    },
    rarity: 'RARE'
  },
  {
    id: 'regulatory_crackdown',
    name: 'Regulatory Crackdown',
    description: 'The regulators are actually doing their jobs.',
    duration: [5, 10],
    sectorModifiers: {
      Finance: -0.4,
      Technology: -0.3,
      Politics: -0.2,
    },
    newsTemplates: HIGH_SATIRE_WORLD_NEWS.crackdown,
    rarity: 'RARE'
  },
  {
    id: 'tech_revolution',
    name: 'Tech Revolution',
    description: 'A major breakthrough has changed everything.',
    duration: [8, 16],
    sectorModifiers: {
      Technology: 0.6,
      Manufacturing: 0.3,
      Transport: 0.2,
    },
    newsTemplates: {
      start: "💻 TECH REVOLUTION: A massive breakthrough is driving unprecedented growth in Technology.",
      end: "📡 The tech revolution becomes the new baseline."
    },
    rarity: 'RARE'
  },
  {
    id: 'market_crash',
    name: 'Stock Market Crash',
    description: 'Panic on Wall Street.',
    duration: [3, 6],
    sectorModifiers: {
      Finance: -0.7,
      Retail: -0.2,
      Technology: -0.2,
    },
    newsTemplates: {
      start: "📉 MARKET CRASH: Panic on the trading floor! Finance yields are decimated.",
      end: "📈 Market bottom reached. Investors are starting to buy back in."
    },
    rarity: 'RARE'
  },
  {
    id: 'election_year',
    name: 'Election Year',
    description: 'The circus is in town.',
    duration: [4, 8],
    sectorModifiers: {
      Politics: 0.6,
      Entertainment: 0.2,
    },
    newsTemplates: {
      start: "🗳️ ELECTION YEAR: Political spending is through the roof!",
      end: "🇺🇸 The election is over. Political activity returns to normal."
    },
    rarity: 'COMMON'
  },
  {
    id: 'celebrity_trend',
    name: 'Celebrity Trend',
    description: 'A famous person did something.',
    duration: [2, 4],
    sectorModifiers: {
      Entertainment: 0.4,
      Retail: 0.3,
    },
    newsTemplates: {
      start: "🌟 CELEBRITY TREND: A new viral trend is driving massive interest in Entertainment and Retail.",
      end: "⏭️ The trend fades as the public moves on to the next thing."
    },
    rarity: 'COMMON'
  },
  {
    id: 'social_media_craze',
    name: 'Social Media Craze',
    description: 'Everyone is doing the same dance.',
    duration: [2, 5],
    sectorModifiers: {
      Entertainment: 0.5,
      Technology: 0.2,
    },
    newsTemplates: {
      start: "📱 SOCIAL MEDIA CRAZE: Engagement is off the charts! Content and Tech yields up.",
      end: "🔇 The craze quietens down."
    },
    rarity: 'COMMON'
  }
];
