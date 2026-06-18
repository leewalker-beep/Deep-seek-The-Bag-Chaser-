export interface DeathMessage {
  message: string;
  badge: string;
}

export const DEATH_MESSAGES: Record<string, DeathMessage> = {
  // MUD
  r_labor: { message: "Your back finally gave out. The grind was literal.", badge: "BONE CRUSHER" },
  r_delivery: { message: "You died for a cold burger. The algorithm replaced you.", badge: "ROAD KILL" },
  r_plasma: { message: "You literally ran out of juice. Dry husk.", badge: "DRY WELL" },
  r_vending: { message: "Crushed by a snack machine you were trying to fix.", badge: "SNACK ATTACK" },
  r_ghost_mode: { message: "Vanished so hard you forgot how to exist.", badge: "GHOSTED" },
  r_scrap: { message: "Turned into scrap metal yourself.", badge: "RECYCLED" },
  r_sleep: { message: "You slept through your own expiration date.", badge: "HIBERNATOR" },
  street_eats: { message: "Food poisoning from your own taco truck.", badge: "BAD TACO" },

  // STREET
  cc: { message: "The comments finally got you.", badge: "RATIO'D" },
  pod: { message: "Nobody was listening.", badge: "DEAD AIR" },
  drop: { message: "Your supply chain broke. Warehouse tomb.", badge: "SHIP WRECK" },
  vintage: { message: "Buried alive by 90s windbreakers.", badge: "OLD SCHOOL" },
  techFlip: { message: "Electrocuting yourself with a 'refurbished' laptop.", badge: "SHORT CIRCUIT" },
  audio: { message: "Deafened by your own bad beats.", badge: "OFF KEY" },
  r_pr_campaign: { message: "Publicly shamed into oblivion.", badge: "MAIN CHARACTER" },
  power_nap: { message: "The nap that never ended.", badge: "DREAMER" },

  // STARTUP
  sw: { message: "Suffocated by your own hype.", badge: "HYPEBEAST" },
  smm: { message: "Drowned in a sea of hashtags.", badge: "HASHTAG HERO" },
  gig: { message: "Your fleet went rogue. Logistics of death.", badge: "LAST MILE" },
  meme: { message: "Rug pulled by your own coin.", badge: "DIAMOND HANDS" },
  saas_mvp: { message: "404: Legacy not found.", badge: "NULL POINTER" },
  agency_scale: { message: "Scalability reached zero.", badge: "OUTSOURCED" },
  ecom_brand: { message: "Lost in the warehouse forever.", badge: "BACKORDERED" },
  therapy_session: { message: "Too much self-reflection.", badge: "EGO DEATH" },

  // CORPORATE
  festival: { message: "The Fyre finally got you.", badge: "PROMOTER" },
  global_franchise: { message: "Corporate cog ground to dust.", badge: "CORPORATE CLONE" },
  data_analytics: { message: "Became a statistical anomaly.", badge: "OUTLIER" },
  crypto_mining: { message: "The heat from the rigs melted your soul.", badge: "OVERCLOCKED" },
  virtual_assistant_agency: { message: "Replaced by a 2kb script.", badge: "DEPRECATED" },
  lobbying: { message: "The swamp was deeper than you thought.", badge: "FIXER" },
  disaster: { message: "The recovery failed.", badge: "TOTAL LOSS" },
  wellness_retreat: { message: "Too much zen.", badge: "ENLIGHTENED" },

  // ELITE
  psychiatrist: { message: "The doctor is OUT.", badge: "STARK RAVING" },
  real_estate_empire: { message: "The bubble burst, and you were inside.", badge: "SUBPRIME" },
  venture_capital: { message: "The exit strategy was just a cliff.", badge: "DOWN ROUND" },
  hedgefund: { message: "Short squeezed into the afterlife.", badge: "MARGIN CALLED" },
  privateequity: { message: "Asset stripped of your own life.", badge: "LBO'D" },

  // MOGUL
  film_studio: { message: "Final cut: deleted.", badge: "FLOP" },
  fight_promoter: { message: "Knocked out of the game.", badge: "GLASS CHIN" },
  space_investment: { message: "Floating in the void.", badge: "SPACE JUNK" },
  philanthropy_empire: { message: "Gave it all away, including your life.", badge: "SAINT" },
  media_empire: { message: "The narrative turned against you.", badge: "MOGUL NO MORE" },
  luxury_conglomerate: { message: "Death looks expensive on you.", badge: "COUTURE" },

  // PRESIDENT
  data_monopoly: { message: "The data became sentient and deleted you.", badge: "BIG BROTHER" },
  central_bank_play: { message: "Hyperinflated out of existence.", badge: "DEVALUED" },
  legacy_fund: { message: "Your legacy was a footnote.", badge: "FORGOTTEN" },
  president_campaign: { message: "The voters chose literally anyone else.", badge: "LAME DUCK" },

  // OPEN
  open_island: { message: "Stranded on your own paradise.", badge: "CASTAWAY" },
  open_sports_league: { message: "Banned from the game of life.", badge: "RED CARD" },
  open_crypto: { message: "Lost your private key to heaven.", badge: "SATOSHI'S GHOST" },
  open_celebrity: { message: "Divorced from reality.", badge: "EX-COMMUNICATED" },
  open_movie: { message: "A box office tragedy.", badge: "BOMBED" },

  DEFAULT: { message: "You lived fast, died young.", badge: "GHOST IN THE MACHINE" },
};
