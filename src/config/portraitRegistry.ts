export interface PortraitDef {
  id: string;
  name: string;
  archetype: 'music' | 'podcast' | 'talent' | 'corporate' | 'politics' | 'elite' | 'advisor';
  gender: 'male' | 'female' | 'non-binary';
  description: string;
  url: string;
}

const getAssetUrl = (id: string): string => {
  return new URL(`../assets/avatars/${id}.svg`, import.meta.url).href;
};

export const PORTRAITS: PortraitDef[] = [
  // Music (10)
  {
    id: 'p_music_1',
    name: 'DJ Bitter',
    archetype: 'music',
    gender: 'male',
    description: 'Tech-house legend with a notorious late-night schedule.',
    url: getAssetUrl('p_music_1')
  },
  {
    id: 'p_music_2',
    name: 'Lil Spitfire',
    archetype: 'music',
    gender: 'female',
    description: 'Rapid-fire freestyle rap artist dominating bedroom streams.',
    url: getAssetUrl('p_music_2')
  },
  {
    id: 'p_music_3',
    name: 'Manager Maeve',
    archetype: 'music',
    gender: 'female',
    description: 'A sharp label executive who knows royalty law inside out.',
    url: getAssetUrl('p_music_3')
  },
  {
    id: 'p_music_4',
    name: 'Slick Beatmaker',
    archetype: 'music',
    gender: 'male',
    description: 'Grammy-winning producer with signature low-end kicks.',
    url: getAssetUrl('p_music_4')
  },
  {
    id: 'p_music_5',
    name: 'Aria Eclipse',
    archetype: 'music',
    gender: 'female',
    description: 'Indie pop singer with haunting vocal ranges.',
    url: getAssetUrl('p_music_5')
  },
  {
    id: 'p_music_6',
    name: 'Yung Synths',
    archetype: 'music',
    gender: 'male',
    description: 'Vaporwave pioneer who produces hits entirely in analog.',
    url: getAssetUrl('p_music_6')
  },
  {
    id: 'p_music_7',
    name: 'Vibe Master Jax',
    archetype: 'music',
    gender: 'male',
    description: 'Festival DJ famous for staging massive crowd surges.',
    url: getAssetUrl('p_music_7')
  },
  {
    id: 'p_music_8',
    name: 'Seraphina Star',
    archetype: 'music',
    gender: 'female',
    description: 'Classical crossover violinist touring global stadiums.',
    url: getAssetUrl('p_music_8')
  },
  {
    id: 'p_music_9',
    name: 'Executive Vance',
    archetype: 'music',
    gender: 'male',
    description: 'A traditional label president demanding premium margins.',
    url: getAssetUrl('p_music_9')
  },
  {
    id: 'p_music_10',
    name: 'Lyricist Nova',
    archetype: 'music',
    gender: 'non-binary',
    description: 'Ghostwriter behind multiple platinum-certified records.',
    url: getAssetUrl('p_music_10')
  },

  // Podcast & Media (10)
  {
    id: 'p_podcast_1',
    name: 'Host Harper',
    archetype: 'podcast',
    gender: 'female',
    description: 'High-energy investigative journalist and top-chart host.',
    url: getAssetUrl('p_podcast_1')
  },
  {
    id: 'p_podcast_2',
    name: 'Gamer Chad',
    archetype: 'podcast',
    gender: 'male',
    description: 'Viral streamer and commentary channel influencer.',
    url: getAssetUrl('p_podcast_2')
  },
  {
    id: 'p_podcast_3',
    name: 'Pundit Pierce',
    archetype: 'podcast',
    gender: 'male',
    description: 'Cynical political commentator who speaks in soundbites.',
    url: getAssetUrl('p_podcast_3')
  },
  {
    id: 'p_podcast_4',
    name: 'Chloe Vlog',
    archetype: 'podcast',
    gender: 'female',
    description: 'Social media influencer tracking lifestyle trends.',
    url: getAssetUrl('p_podcast_4')
  },
  {
    id: 'p_podcast_5',
    name: 'Tech-Pod Ted',
    archetype: 'podcast',
    gender: 'male',
    description: 'Venture-backed tech host exploring neural interfaces.',
    url: getAssetUrl('p_podcast_5')
  },
  {
    id: 'p_podcast_6',
    name: 'Reporter Reed',
    archetype: 'podcast',
    gender: 'male',
    description: 'Investigative print journalist for the Metro Gazette.',
    url: getAssetUrl('p_podcast_6')
  },
  {
    id: 'p_podcast_7',
    name: 'Analyst Anya',
    archetype: 'podcast',
    gender: 'female',
    description: 'Financial commentator tracking retail market bubbles.',
    url: getAssetUrl('p_podcast_7')
  },
  {
    id: 'p_podcast_8',
    name: 'Vlogger Victor',
    archetype: 'podcast',
    gender: 'male',
    description: 'Elusive street-style interviewer capturing viral clips.',
    url: getAssetUrl('p_podcast_8')
  },
  {
    id: 'p_podcast_9',
    name: 'Hostess Hannah',
    archetype: 'podcast',
    gender: 'female',
    description: 'Late-night radio host known for soothing vocal flows.',
    url: getAssetUrl('p_podcast_9')
  },
  {
    id: 'p_podcast_10',
    name: 'Influencer Ivy',
    archetype: 'podcast',
    gender: 'female',
    description: 'Billion-view unboxing and tech review content creator.',
    url: getAssetUrl('p_podcast_10')
  },

  // Talent & Entertainment (10)
  {
    id: 'p_talent_1',
    name: 'Actor Ashton',
    archetype: 'talent',
    gender: 'male',
    description: 'Method actor preparing for an intense action blockbuster.',
    url: getAssetUrl('p_talent_1')
  },
  {
    id: 'p_talent_2',
    name: 'Agent Arthur',
    archetype: 'talent',
    gender: 'male',
    description: 'Boutique agency manager locking in image-rights contracts.',
    url: getAssetUrl('p_talent_2')
  },
  {
    id: 'p_talent_3',
    name: 'Director Diana',
    archetype: 'talent',
    gender: 'female',
    description: 'Indie filmmaker demanding absolute perfection on set.',
    url: getAssetUrl('p_talent_3')
  },
  {
    id: 'p_talent_4',
    name: 'Promoter Pete',
    archetype: 'talent',
    gender: 'male',
    description: 'High-stakes fight promoter hosting underground matches.',
    url: getAssetUrl('p_talent_4')
  },
  {
    id: 'p_talent_5',
    name: 'Starlet Scarlett',
    archetype: 'talent',
    gender: 'female',
    description: 'Rising Hollywood starlet with immense box-office appeal.',
    url: getAssetUrl('p_talent_5')
  },
  {
    id: 'p_talent_6',
    name: 'Manager Mason',
    archetype: 'talent',
    gender: 'male',
    description: 'Tour manager famous for handling difficult personalities.',
    url: getAssetUrl('p_talent_6')
  },
  {
    id: 'p_talent_7',
    name: 'Producer Paige',
    archetype: 'talent',
    gender: 'female',
    description: 'Executive producer backing high-budget cinematic runs.',
    url: getAssetUrl('p_talent_7')
  },
  {
    id: 'p_talent_8',
    name: 'Choreographer Cole',
    archetype: 'talent',
    gender: 'male',
    description: 'Stage director designing world-tour stadium acts.',
    url: getAssetUrl('p_talent_8')
  },
  {
    id: 'p_talent_9',
    name: 'Casting Director Cora',
    archetype: 'talent',
    gender: 'female',
    description: 'Industry gatekeeper who screens raw local talent.',
    url: getAssetUrl('p_talent_9')
  },
  {
    id: 'p_talent_10',
    name: 'Host Hunter',
    archetype: 'talent',
    gender: 'male',
    description: 'Live awards host with unmatched charisma and presence.',
    url: getAssetUrl('p_talent_10')
  },

  // Corporate & Finance (10)
  {
    id: 'p_corporate_1',
    name: 'Founder Frank',
    archetype: 'corporate',
    gender: 'male',
    description: 'Aggressive tech entrepreneur deploying SaaS MVP grids.',
    url: getAssetUrl('p_corporate_1')
  },
  {
    id: 'p_corporate_2',
    name: 'Investor Irene',
    archetype: 'corporate',
    gender: 'female',
    description: 'Hedge fund manager shorting distressed assets.',
    url: getAssetUrl('p_corporate_2')
  },
  {
    id: 'p_corporate_3',
    name: 'Quant Quentin',
    archetype: 'corporate',
    gender: 'male',
    description: 'Brilliant algorithmic analyst forecasting market dips.',
    url: getAssetUrl('p_corporate_3')
  },
  {
    id: 'p_corporate_4',
    name: 'VC Valerie',
    archetype: 'corporate',
    gender: 'female',
    description: 'Venture capitalist seeding series-A software startups.',
    url: getAssetUrl('p_corporate_4')
  },
  {
    id: 'p_corporate_5',
    name: 'Exec Ethan',
    archetype: 'corporate',
    gender: 'male',
    description: 'Sleek tech CEO with extreme corporate commanding aura.',
    url: getAssetUrl('p_corporate_5')
  },
  {
    id: 'p_corporate_6',
    name: 'Auditor Audrey',
    archetype: 'corporate',
    gender: 'female',
    description: 'Forensic investigator uncovering balance-sheet frauds.',
    url: getAssetUrl('p_corporate_6')
  },
  {
    id: 'p_corporate_7',
    name: 'CEO Sterling',
    archetype: 'corporate',
    gender: 'male',
    description: 'Conglomerate director holding massive industrial shares.',
    url: getAssetUrl('p_corporate_7')
  },
  {
    id: 'p_corporate_8',
    name: 'Partner Priya',
    archetype: 'corporate',
    gender: 'female',
    description: 'Private equity partner leading hostile corporate buyouts.',
    url: getAssetUrl('p_corporate_8')
  },
  {
    id: 'p_corporate_9',
    name: 'Arbitrage Al',
    archetype: 'corporate',
    gender: 'male',
    description: 'Global logistics operator scaling shipping routes.',
    url: getAssetUrl('p_corporate_9')
  },
  {
    id: 'p_corporate_10',
    name: 'Director Dan',
    archetype: 'corporate',
    gender: 'male',
    description: 'Virtual assistant agency administrator scaling labor.',
    url: getAssetUrl('p_corporate_10')
  },

  // Politics & Government (10)
  {
    id: 'p_politics_1',
    name: 'Minister Miller',
    archetype: 'politics',
    gender: 'male',
    description: 'Cabinet press secretary managing voter approval rating.',
    url: getAssetUrl('p_politics_1')
  },
  {
    id: 'p_politics_2',
    name: 'Diplomat Daniel',
    archetype: 'politics',
    gender: 'male',
    description: 'International envoy brokering global trade alliances.',
    url: getAssetUrl('p_politics_2')
  },
  {
    id: 'p_politics_3',
    name: 'Strategist Stone',
    archetype: 'politics',
    gender: 'male',
    description: 'Ruthless campaign trail manager playing political chess.',
    url: getAssetUrl('p_politics_3')
  },
  {
    id: 'p_politics_4',
    name: 'Advisor Alice',
    archetype: 'politics',
    gender: 'female',
    description: 'Macroeconomic policy advisor forecasting federal debt.',
    url: getAssetUrl('p_politics_4')
  },
  {
    id: 'p_politics_5',
    name: 'Senator Sofia',
    archetype: 'politics',
    gender: 'female',
    description: 'Rising state senator mobilizing grassroots labor support.',
    url: getAssetUrl('p_politics_5')
  },
  {
    id: 'p_politics_6',
    name: 'General Silas',
    archetype: 'politics',
    gender: 'male',
    description: 'Military advisor directing high-security operations.',
    url: getAssetUrl('p_politics_6')
  },
  {
    id: 'p_politics_7',
    name: 'Chancellor Chen',
    archetype: 'politics',
    gender: 'female',
    description: 'Treasury secretary structuring central banking reserves.',
    url: getAssetUrl('p_politics_7')
  },
  {
    id: 'p_politics_8',
    name: 'Mayor Madison',
    archetype: 'politics',
    gender: 'female',
    description: 'Pragmatic metro mayor pushing infrastructure zoning.',
    url: getAssetUrl('p_politics_8')
  },
  {
    id: 'p_politics_9',
    name: 'Lobbyist Lance',
    archetype: 'politics',
    gender: 'male',
    description: 'Energy sector lobbyist lining political board pockets.',
    url: getAssetUrl('p_politics_9')
  },
  {
    id: 'p_politics_10',
    name: 'Justice Jenkins',
    archetype: 'politics',
    gender: 'female',
    description: 'Constitutional judge demanding absolute legal integrity.',
    url: getAssetUrl('p_politics_10')
  },

  // Elite & Rivals (10)
  {
    id: 'p_elite_1',
    name: 'Billionaire Brooks',
    archetype: 'elite',
    gender: 'male',
    description: 'Apex predator rival defending monopolistic cash flows.',
    url: getAssetUrl('p_elite_1')
  },
  {
    id: 'p_elite_2',
    name: 'Oligarch Oleg',
    archetype: 'elite',
    gender: 'male',
    description: 'Global energy operator treating nations as assets.',
    url: getAssetUrl('p_elite_2')
  },
  {
    id: 'p_elite_3',
    name: 'Mogul Monica',
    archetype: 'elite',
    gender: 'female',
    description: 'Media network president shaping the national opinion.',
    url: getAssetUrl('p_elite_3')
  },
  {
    id: 'p_elite_4',
    name: 'Broker Brandon',
    archetype: 'elite',
    gender: 'male',
    description: 'Shadow fixer coordinating private security contracts.',
    url: getAssetUrl('p_elite_4')
  },
  {
    id: 'p_elite_5',
    name: 'Heiress Helene',
    archetype: 'elite',
    gender: 'female',
    description: 'Legacy family daughter inheriting sovereign fortunes.',
    url: getAssetUrl('p_elite_5')
  },
  {
    id: 'p_elite_6',
    name: 'Copycat Kyle',
    archetype: 'elite',
    gender: 'male',
    description: 'Persistent street rival replicating your business setups.',
    url: getAssetUrl('p_elite_6')
  },
  {
    id: 'p_elite_7',
    name: 'Tycoon Trevor',
    archetype: 'elite',
    gender: 'male',
    description: 'Real estate magnate dominating the elite skyline.',
    url: getAssetUrl('p_elite_7')
  },
  {
    id: 'p_elite_8',
    name: 'Baroness Beatrice',
    archetype: 'elite',
    gender: 'female',
    description: 'Luxury conglomerate head holding elite fashion brands.',
    url: getAssetUrl('p_elite_8')
  },
  {
    id: 'p_elite_9',
    name: 'Espionage Elena',
    archetype: 'elite',
    gender: 'female',
    description: 'Underworld shadow asset executing corporate sabots.',
    url: getAssetUrl('p_elite_9')
  },
  {
    id: 'p_elite_10',
    name: 'Hacker Haze',
    archetype: 'elite',
    gender: 'non-binary',
    description: 'Elite digital operator executing cyber security breaches.',
    url: getAssetUrl('p_elite_10')
  },

  // Strategic Advisor (1)
  {
    id: 'p_advisor',
    name: 'Strategic Advisor Mentor',
    archetype: 'advisor',
    gender: 'male',
    description: 'Your strategic advisor mentor, guiding your run to absolute dominance.',
    url: getAssetUrl('p_advisor')
  }
];

export const getPortraitsByArchetype = (
  archetype: 'music' | 'podcast' | 'talent' | 'corporate' | 'politics' | 'elite' | 'advisor'
): PortraitDef[] => {
  return PORTRAITS.filter((p) => p.archetype === archetype);
};

export const getRandomPortrait = (
  archetype: 'music' | 'podcast' | 'talent' | 'corporate' | 'politics' | 'elite' | 'advisor'
): PortraitDef => {
  const pool = getPortraitsByArchetype(archetype);
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getPortraitDef = (id: string): PortraitDef | undefined => {
  return PORTRAITS.find((p) => p.id === id);
};
