export type Sector =
  | 'Technology'
  | 'Retail'
  | 'Construction'
  | 'Real Estate'
  | 'Entertainment'
  | 'Politics'
  | 'Finance'
  | 'Transport'
  | 'Manufacturing'
  | 'Food';

export const HUSTLE_SECTORS: Record<string, Sector> = {
  // MUD
  r_labor: 'Construction',
  r_delivery: 'Transport',
  r_vending: 'Retail',
  r_scrap: 'Manufacturing',
  street_eats: 'Food',
  unique_hustle_deli: 'Food',

  // STREET
  cc: 'Entertainment',
  pod: 'Entertainment',
  drop: 'Retail',
  vintage: 'Retail',
  techFlip: 'Technology',
  audio: 'Entertainment',
  r_pr_campaign: 'Entertainment',

  // STARTUP
  sw: 'Retail',
  smm: 'Technology',
  gig: 'Transport',
  meme: 'Finance',
  saas_mvp: 'Technology',
  ecom_brand: 'Retail',
  agency_scale: 'Retail',

  // CORPORATE
  festival: 'Entertainment',
  global_franchise: 'Food',
  data_analytics: 'Technology',
  crypto_mining: 'Finance',
  lobbying: 'Politics',
  disaster: 'Finance',
  virtual_assistant_agency: 'Technology',

  // ELITE
  real_estate_empire: 'Real Estate',
  venture_capital: 'Finance',
  hedgefund: 'Finance',
  privateequity: 'Finance',

  // MOGUL
  film_studio: 'Entertainment',
  fight_promoter: 'Entertainment',
  space_investment: 'Technology',
  media_empire: 'Entertainment',
  luxury_conglomerate: 'Retail',

  // PRESIDENT
  data_monopoly: 'Technology',
  central_bank_play: 'Finance',
  president_campaign: 'Politics',

  // OPEN
  open_island: 'Real Estate',
  open_sports_league: 'Entertainment',
  open_crypto: 'Finance',
  open_celebrity: 'Entertainment',
  open_movie: 'Entertainment',
};
