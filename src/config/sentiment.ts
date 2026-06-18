export interface SentimentCategory {
  id: string;
  name: string;
  hustleIds: string[];
}

export const SENTIMENT_CATEGORIES: SentimentCategory[] = [
  {
    id: 'crypto',
    name: 'Crypto',
    hustleIds: ['meme', 'crypto_mining', 'open_crypto']
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    hustleIds: ['r_labor', 'real_estate_empire'] // r_labor covers House Flip/Rent Portfolio
  },
  {
    id: 'tech',
    name: 'Tech',
    hustleIds: ['saas_mvp', 'techFlip']
  },
  {
    id: 'media',
    name: 'Media',
    hustleIds: ['media_empire', 'cc', 'audio']
  },
  {
    id: 'labor',
    name: 'Labor',
    hustleIds: ['r_labor', 'r_scrap'] // Manual labor branch of r_labor
  },
  {
    id: 'delivery',
    name: 'Delivery',
    hustleIds: ['r_delivery', 'gig']
  },
  {
    id: 'music',
    name: 'Music',
    hustleIds: ['audio']
  }
];

export const SENTIMENT_TEMPLATES = {
  hype: [
    "{category} Boom: {category} yields increased by 50% for {duration} months",
    "{category} Mania: Profits from {category} sector up 1.5x for {duration} months",
    "{category} Gold Rush: Market sentiment for {category} is through the roof! (+50% yield, {duration} months)"
  ],
  fud: [
    "{category} Winter: {category} yields reduced by 50% for {duration} months",
    "{category} Crash: Investors fleeing {category} sector. Yields down 0.5x for {duration} months",
    "{category} Crackdown: Regulatory pressure on {category} reduces profits by 50% for {duration} months"
  ]
};
