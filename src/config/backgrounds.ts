export interface Background {
  id: string;
  name: string;
  flavor: string;
  starterBag: number;
  starterClout: number;
  starterAura: number;
  newsReferences: string[];
}

export interface BackgroundCategory {
  id: string;
  name: string;
  description: string;
  variations: Background[];
}

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
        starterBag: 500,
        starterClout: 0,
        starterAura: 15,
        newsReferences: ['The scavenger who built a kingdom.', 'From the scrap yard to the penthouse.'],
      },
      {
        id: 'sk_ghost',
        name: 'The Ghost',
        flavor: 'You lived in the shadows of the city, unseen and unheard. Now, you\'re ready to make your presence felt.',
        starterBag: 700,
        starterClout: 5,
        starterAura: 10,
        newsReferences: ['The ghost emerges into the light.', 'A phantom in the boardroom.'],
      },
      {
        id: 'sk_delivery',
        name: 'Delivery Hustler',
        flavor: 'You know the city streets better than any GPS. Thousands of miles on a bike for pennies, but you\'re done delivering for others.',
        starterBag: 900,
        starterClout: 2,
        starterAura: 8,
        newsReferences: ['The delivery driver who finally arrived.', 'Bypass the middleman, become the man.'],
      },
      {
        id: 'sk_plasma',
        name: 'Plasma Donor',
        flavor: 'You literally sold your blood to pay the rent. That hunger never leaves you.',
        starterBag: 400,
        starterClout: 0,
        starterAura: 20,
        newsReferences: ['Built on blood, sweat, and plasma.', 'The donor who took it all back.'],
      },
      {
        id: 'sk_artist',
        name: 'Street Artist',
        flavor: 'The city was your canvas, and the police were your critics. Now you\'re painting a different kind of future.',
        starterBag: 600,
        starterClout: 12,
        starterAura: 5,
        newsReferences: ['From graffiti tags to stock tickers.', 'The artist who redefined success.'],
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
        starterBag: 2500,
        starterClout: 5,
        starterAura: 5,
        newsReferences: ['The vending king expands the empire.', 'Quarters turned into millions.'],
      },
      {
        id: 'dr_tech',
        name: 'Self-Taught Techie',
        flavor: 'The curriculum was ten years behind. You taught yourself to code in the library while skipping lectures.',
        starterBag: 3000,
        starterClout: 15,
        starterAura: 0,
        newsReferences: ['The dropout who outcoded the experts.', 'Silicon Valley\'s newest nightmare.'],
      },
      {
        id: 'dr_dropship',
        name: 'E-com Hustler',
        flavor: 'You were running three Shopify stores from the back of the lecture hall. Why wait for a degree to start earning?',
        starterBag: 4000,
        starterClout: 10,
        starterAura: 2,
        newsReferences: ['The dropshipper who became a titan.', 'From viral ads to global conglomerates.'],
      },
      {
        id: 'dr_music',
        name: 'Bedroom Producer',
        flavor: 'Your dorm room was a studio. You realized your beats were worth more than your GPA.',
        starterBag: 2000,
        starterClout: 20,
        starterAura: 5,
        newsReferences: ['The producer who owns the label now.', 'From soundcloud to the stratosphere.'],
      },
      {
        id: 'dr_pr',
        name: 'PR Maverick',
        flavor: 'You knew how to spin a story better than your professors. You dropped out when you realized you could sell anything.',
        starterBag: 3500,
        starterClout: 25,
        starterAura: 0,
        newsReferences: ['The spin doctor who became the story.', 'Marketing genius or dropout? Both.'],
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
        starterBag: 25000,
        starterClout: 5,
        starterAura: 5,
        newsReferences: ['Old money meets new hustle.', 'The mining fortune reborn.'],
      },
      {
        id: 'bn_realestate',
        name: 'Real Estate Scion',
        flavor: 'You grew up looking at blueprints. Now you\'re ready to build your own skyline.',
        starterBag: 30000,
        starterClout: 10,
        starterAura: 0,
        newsReferences: ['The scion who surpassed the father.', 'Building an empire on solid ground.'],
      },
      {
        id: 'bn_logistics',
        name: 'Logistics Legacy',
        flavor: 'You understand that movement is money. Your family moved the world; now you own it.',
        starterBag: 20000,
        starterClout: 5,
        starterAura: 10,
        newsReferences: ['Efficiency is in the blood.', 'The logistics titan takes control.'],
      },
      {
        id: 'bn_factory',
        name: 'Industrialist\'s Child',
        flavor: 'The sound of machinery is your lullaby. You\'re turning the gears of industry into a personal fortune.',
        starterBag: 40000,
        starterClout: 5,
        starterAura: 0,
        newsReferences: ['The factory line leads to the top.', 'Industrial power in a digital age.'],
      },
      {
        id: 'bn_investor',
        name: 'Angel Protégé',
        flavor: 'A family friend saw your potential and gave you the seed money. Don\'t let them down.',
        starterBag: 35000,
        starterClout: 15,
        starterAura: 5,
        newsReferences: ['The protégé becomes the master.', 'Early investment, eternal reward.'],
      },
    ],
  },
];

// For backward compatibility while I update other files
export const BACKGROUNDS: Background[] = BACKGROUND_CATEGORIES.flatMap(cat => cat.variations);
