import { type OriginBonus } from '../types/game';

export interface Background {
  id: string;
  name: string;
  flavor: string;
  backgroundStyle: string;
  icon: string;
  flavorText: string;
  starterBag: number;
  starterClout: number;
  starterAura: number;
  newsReferences: string[];
  originBonus: OriginBonus;
}

export interface BackgroundCategory {
  id: string;
  name: string;
  description: string;
  variations: Background[];
}

const STREET_KID_BONUS: OriginBonus = {
  type: 'cash',
  multiplier: 1.15,
  tiers: ['MUD', 'STREET'],
  description: '+15% cash from street hustles'
};

const DROPOUT_BONUS: OriginBonus = {
  type: 'clout',
  multiplier: 1.20,
  tiers: ['MUD', 'STREET', 'STARTUP', 'CORPORATE'],
  description: '+20% clout across early tiers'
};

const BENEFACTOR_BONUS: OriginBonus = {
  type: 'aura',
  multiplier: 1.15,
  tiers: ['CORPORATE', 'ELITE', 'MOGUL'],
  description: '+15% aura at corporate tiers'
};

const CHOSEN_ONE_BONUS: OriginBonus = {
  type: 'cash',
  multiplier: 1.1,
  tiers: ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'],
  description: 'A destiny realized: +10% cash across all tiers'
};

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  {
    id: 'street_kid',
    name: 'Street Kid',
    description: 'You grew up with nothing. Every dollar feels like survival.',
    variations: [
      {
        id: 'sk_scrap',
        name: 'Scrap Yard Scavenger',
        flavor: 'You spent your childhood pulling copper from abandoned lots. You know the value of what others throw away.',
        backgroundStyle: 'gritty',
        icon: '🔧',
        flavorText: 'You grew up in the scrap yards.',
        starterBag: 500,
        starterClout: 0,
        starterAura: 15,
        newsReferences: ['The scavenger who built a kingdom.', 'From the scrap yard to the penthouse.'],
        originBonus: STREET_KID_BONUS,
      },
      {
        id: 'sk_ghost',
        name: 'The Ghost',
        flavor: 'You lived in the shadows of the city, unseen and unheard. Now, you\'re ready to make your presence felt.',
        backgroundStyle: 'gritty',
        icon: '👻',
        flavorText: 'Shadows are your only true companions.',
        starterBag: 700,
        starterClout: 5,
        starterAura: 10,
        newsReferences: ['The ghost emerges into the light.', 'A phantom in the boardroom.'],
        originBonus: STREET_KID_BONUS,
      },
      {
        id: 'sk_delivery',
        name: 'Delivery Hustler',
        flavor: 'You know the city streets better than any GPS. Thousands of miles on a bike for pennies, but you\'re done delivering for others.',
        backgroundStyle: 'gritty',
        icon: '🚲',
        flavorText: 'Every delivery was a lesson in the city\'s pulse.',
        starterBag: 900,
        starterClout: 2,
        starterAura: 8,
        newsReferences: ['The delivery driver who finally arrived.', 'Bypass the middleman, become the man.'],
        originBonus: STREET_KID_BONUS,
      },
      {
        id: 'sk_plasma',
        name: 'Plasma Donor',
        flavor: 'You literally sold your blood to pay the rent. That hunger never leaves you.',
        backgroundStyle: 'gritty',
        icon: '💉',
        flavorText: 'You\'ve already paid for your dreams in blood.',
        starterBag: 400,
        starterClout: 0,
        starterAura: 20,
        newsReferences: ['Built on blood, sweat, and plasma.', 'The donor who took it all back.'],
        originBonus: STREET_KID_BONUS,
      },
      {
        id: 'sk_artist',
        name: 'Street Artist',
        flavor: 'The city was your canvas, and the police were your critics. Now you\'re painting a different kind of future.',
        backgroundStyle: 'studio',
        icon: '🎨',
        flavorText: 'The city\'s walls told your story first.',
        starterBag: 600,
        starterClout: 12,
        starterAura: 5,
        newsReferences: ['From graffiti tags to stock tickers.', 'The artist who redefined success.'],
        originBonus: STREET_KID_BONUS,
      },
    ],
  },
  {
    id: 'legacy',
    name: 'The Chosen',
    description: 'A legacy foretold. You are the one they were waiting for.',
    variations: [
      {
        id: 'lc_chosen',
        name: 'The Chosen One',
        flavor: 'You were born under a lucky star, or perhaps it was just the heavy weight of your family name. Either way, the path is open.',
        backgroundStyle: 'tech',
        icon: '👑',
        flavorText: 'Destiny is a heavy burden, but you carry it well.',
        starterBag: 10000,
        starterClout: 100,
        starterAura: 100,
        newsReferences: ['The chosen one has finally arrived.', 'A legend reborn in the digital age.'],
        originBonus: CHOSEN_ONE_BONUS,
      },
    ],
  },
  {
    id: 'dropout',
    name: 'The Dropout',
    description: 'You left school early to chase money. You have something to prove.',
    variations: [
      {
        id: 'dr_vending',
        name: 'Vending Machine Specialist',
        flavor: 'While others were in class, you were restocking machines and counting quarters. You understand micro-economies.',
        backgroundStyle: 'neon',
        icon: '🛒',
        flavorText: 'You started with a single machine.',
        starterBag: 2500,
        starterClout: 5,
        starterAura: 5,
        newsReferences: ['The vending king expands the empire.', 'Quarters turned into millions.'],
        originBonus: DROPOUT_BONUS,
      },
      {
        id: 'dr_tech',
        name: 'Self-Taught Techie',
        flavor: 'The curriculum was ten years behind. You taught yourself to code in the library while skipping lectures.',
        backgroundStyle: 'tech',
        icon: '⌨️',
        flavorText: 'You were fixing computers before you could read.',
        starterBag: 3000,
        starterClout: 15,
        starterAura: 0,
        newsReferences: ['The dropout who outcoded the experts.', 'Silicon Valley\'s newest nightmare.'],
        originBonus: DROPOUT_BONUS,
      },
      {
        id: 'dr_dropship',
        name: 'E-com Hustler',
        flavor: 'You were running three Shopify stores from the back of the lecture hall. Why wait for a degree to start earning?',
        backgroundStyle: 'neon',
        icon: '📦',
        flavorText: 'The world is your warehouse, and you\'re the gatekeeper.',
        starterBag: 4000,
        starterClout: 10,
        starterAura: 2,
        newsReferences: ['The dropshipper who became a titan.', 'From viral ads to global conglomerates.'],
        originBonus: DROPOUT_BONUS,
      },
      {
        id: 'dr_music',
        name: 'Bedroom Producer',
        flavor: 'Your dorm room was a studio. You realized your beats were worth more than your GPA.',
        backgroundStyle: 'studio',
        icon: '🎹',
        flavorText: 'You found your rhythm early.',
        starterBag: 2000,
        starterClout: 20,
        starterAura: 5,
        newsReferences: ['The producer who owns the label now.', 'From soundcloud to the stratosphere.'],
        originBonus: DROPOUT_BONUS,
      },
      {
        id: 'dr_pr',
        name: 'PR Maverick',
        flavor: 'You knew how to spin a story better than your professors. You dropped out when you realized you could sell anything.',
        backgroundStyle: 'neon',
        icon: '📣',
        flavorText: 'Reality is whatever you convince them it is.',
        starterBag: 3500,
        starterClout: 25,
        starterAura: 0,
        newsReferences: ['The spin doctor who became the story.', 'Marketing genius or dropout? Both.'],
        originBonus: DROPOUT_BONUS,
      },
    ],
  },
  {
    id: 'benefactor',
    name: 'The Benefactor',
    description: 'A head start from those who came before. You carry their legacy.',
    variations: [
      {
        id: 'bn_mining',
        name: 'Mining Heir',
        flavor: 'Your family made their fortune in the old world. You\'re taking it into the new one.',
        backgroundStyle: 'industrial',
        icon: '⛏️',
        flavorText: 'Deep in the earth, you found the seeds of an empire.',
        starterBag: 25000,
        starterClout: 5,
        starterAura: 5,
        newsReferences: ['Old money meets new hustle.', 'The mining fortune reborn.'],
        originBonus: BENEFACTOR_BONUS,
      },
      {
        id: 'bn_realestate',
        name: 'Real Estate Scion',
        flavor: 'You grew up looking at blueprints. Now you\'re ready to build your own skyline.',
        backgroundStyle: 'industrial',
        icon: '🏙️',
        flavorText: 'You grew up looking at blueprints.',
        starterBag: 30000,
        starterClout: 10,
        starterAura: 0,
        newsReferences: ['The scion who surpassed the father.', 'Building an empire on solid ground.'],
        originBonus: BENEFACTOR_BONUS,
      },
      {
        id: 'bn_logistics',
        name: 'Logistics Legacy',
        flavor: 'You understand that movement is money. Your family moved the world; now you own it.',
        backgroundStyle: 'industrial',
        icon: '🚚',
        flavorText: 'Movement is money, and you own the road.',
        starterBag: 20000,
        starterClout: 5,
        starterAura: 10,
        newsReferences: ['Efficiency is in the blood.', 'The logistics titan takes control.'],
        originBonus: BENEFACTOR_BONUS,
      },
      {
        id: 'bn_factory',
        name: 'Industrialist\'s Child',
        flavor: 'The sound of machinery is your lullaby. You\'re turning the gears of industry into a personal fortune.',
        backgroundStyle: 'industrial',
        icon: '🏭',
        flavorText: 'The sound of machinery is your lullaby.',
        starterBag: 40000,
        starterClout: 5,
        starterAura: 0,
        newsReferences: ['The factory line leads to the top.', 'Industrial power in a digital age.'],
        originBonus: BENEFACTOR_BONUS,
      },
      {
        id: 'bn_investor',
        name: 'Angel Protégé',
        flavor: 'A family friend saw your potential and gave you the seed money. Don\'t let them down.',
        backgroundStyle: 'tech',
        icon: '📈',
        flavorText: 'Potential is the only currency that matters.',
        starterBag: 35000,
        starterClout: 15,
        starterAura: 5,
        newsReferences: ['The protégé becomes the master.', 'Early investment, eternal reward.'],
        originBonus: BENEFACTOR_BONUS,
      },
    ],
  },
];

// For backward compatibility while I update other files
export const BACKGROUNDS: Background[] = BACKGROUND_CATEGORIES.flatMap(cat => cat.variations);
