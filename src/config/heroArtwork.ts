export interface HeroArtwork {
  id: string;
  title: string;
  subtitle: string;
  quote: string;
  imageUrl: string;
  color: string;
}

export const HERO_ARTWORK: Record<string, HeroArtwork> = {
  MUD: {
    id: 'MUD',
    title: 'THE MUD',
    subtitle: 'ROCK BOTTOM',
    quote: "The only way is up, if you don't drown first.",
    imageUrl: 'https://placehold.co/1200x800/1a1208/white?text=THE+MUD',
    color: '#fbbf24', // amber-400
  },
  STREET: {
    id: 'STREET',
    title: 'THE STREET',
    subtitle: 'ON THE BLOCK',
    quote: 'The asphalt remembers every step of the climb.',
    imageUrl: 'https://placehold.co/1200x800/0f172a/white?text=THE+STREET',
    color: '#10b981', // emerald-500
  },
  STARTUP: {
    id: 'STARTUP',
    title: 'THE STARTUP',
    subtitle: 'DISRUPTOR',
    quote: 'Ideas are cheap. Execution is everything.',
    imageUrl: 'https://placehold.co/1200x800/082f49/white?text=THE+STARTUP',
    color: '#06b6d4', // cyan-500
  },
  CORPORATE: {
    id: 'CORPORATE',
    title: 'THE CORPORATE',
    subtitle: 'SUIT UP',
    quote: 'Compliance is the price of institutional power.',
    imageUrl: 'https://placehold.co/1200x800/1e1b4b/white?text=THE+CORPORATE',
    color: '#6366f1', // indigo-500
  },
  ELITE: {
    id: 'ELITE',
    title: 'THE ELITE',
    subtitle: 'SYNDICATE',
    quote: 'Power is not given, it is taken behind closed doors.',
    imageUrl: 'https://placehold.co/1200x800/4c1d95/white?text=THE+ELITE',
    color: '#a855f7', // purple-500
  },
  MOGUL: {
    id: 'MOGUL',
    title: 'THE MOGUL',
    subtitle: 'GLOBAL EMPIRE',
    quote: 'The sun never sets on a diversified portfolio.',
    imageUrl: 'https://placehold.co/1200x800/451a03/white?text=THE+MOGUL',
    color: '#f59e0b', // amber-500
  },
  OPEN: {
    id: 'LEGEND',
    title: 'THE LEGEND',
    subtitle: 'IMMORTAL',
    quote: "They'll be talking about you for a century.",
    imageUrl: 'https://placehold.co/1200x800/064e3b/white?text=THE+LEGEND',
    color: '#10b981', // emerald-500
  },
  PRESIDENT: {
    id: 'PRESIDENT',
    title: 'THE PRESIDENT',
    subtitle: 'THE OVAL OFFICE',
    quote: 'The weight of the world sits on this desk.',
    imageUrl: 'https://placehold.co/1200x800/1e3a8a/white?text=THE+PRESIDENT',
    color: '#3b82f6', // blue-500
  },
  NEW_RUN: {
    id: 'NEW_RUN',
    title: 'A NEW BEGINNING',
    subtitle: 'FRESH START',
    quote: 'Every empire starts with a single dollar and a dream.',
    imageUrl: 'https://placehold.co/1200x800/0f172a/white?text=NEW+RUN',
    color: '#10b981',
  },
  LEGACY_SHOP: {
    id: 'LEGACY_SHOP',
    title: 'THE ANCESTRY',
    subtitle: 'BLOODLINE POWER',
    quote: 'What you leave behind defines what comes next.',
    imageUrl: 'https://placehold.co/1200x800/312e81/white?text=LEGACY+SHOP',
    color: '#a855f7',
  },
  HALL_OF_FAME: {
    id: 'HALL_OF_FAME',
    title: 'HALL OF FAME',
    subtitle: 'ETERNAL GLORY',
    quote: 'History is written by the victors.',
    imageUrl: 'https://placehold.co/1200x800/1e293b/white?text=HALL+OF_FAME',
    color: '#eab308',
  },
  ENDING: {
    id: 'ENDING',
    title: 'THE END',
    subtitle: 'FINAL REFLECTION',
    quote: 'At the end, only the impact remains.',
    imageUrl: 'https://placehold.co/1200x800/000000/white?text=THE+END',
    color: '#f43f5e',
  },
};
