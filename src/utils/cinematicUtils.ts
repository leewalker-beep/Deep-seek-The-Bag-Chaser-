import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import { analyzeBehavior } from './personalityAnalyzer';
import { type PlayerStats } from '../types/game';
import { detectIdentityEvolution } from './identitySystem';

export interface PlaystyleQuote {
  id: string;
  text: string;
  author: string;
}

export const ADVISOR_CONGRATULATIONS: Record<string, string> = {
  MUD: "Back to the grind. But this time, you have the lineage of giants.",
  STREET: "You've survived the mud, kid. Now let's see if you can claim the block.",
  STARTUP: "Incorporated and legitimate. Welcome to the real game. Make the numbers speak.",
  CORPORATE: "Suit up. We're playing with real leverage now. Institutional power is yours.",
  ELITE: "Sovereign wealth. You're entering a select club. Guard your neck; it's thin up here.",
  MOGUL: "A true empire. You've conquered commerce. Now, the ultimate seat of power beckons.",
  PRESIDENT: "Mr. President. Commander-in-Chief. You've reached the absolute peak of power.",
  LEGEND: "You've broken past the mortal grid. The sandbox is yours to reshape as you see fit."
};

export const PLAYSTYLE_QUOTES: Record<string, PlaystyleQuote[]> = {
  steady_builder: [
    { id: 'sb_1', text: "Patience and perseverance have a magical effect before which difficulties disappear and obstacles vanish.", author: "John Quincy Adams" },
    { id: 'sb_2', text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { id: 'sb_3', text: "Step by step the walk is completed.", author: "Proverb" },
    { id: 'sb_4', text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { id: 'sb_5', text: "Consistency is the true foundation of greatness.", author: "Anonymous" }
  ],
  risk_taker: [
    { id: 'rt_1', text: "Only those who will risk going too far can possibly find out how far one can go.", author: "T.S. Eliot" },
    { id: 'rt_2', text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    { id: 'rt_3', text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
    { id: 'rt_4', text: "Fortune favors the bold.", author: "Virgil" },
    { id: 'rt_5', text: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali" }
  ],
  investor: [
    { id: 'inv_1', text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
    { id: 'inv_2', text: "The best investment you can make is in yourself.", author: "Warren Buffett" },
    { id: 'inv_3', text: "Someone is sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
    { id: 'inv_4', text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein" },
    { id: 'inv_5', text: "Do not put all your eggs in one basket.", author: "Warren Buffett" }
  ],
  peoples_champion: [
    { id: 'pc_1', text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
    { id: 'pc_2', text: "We rise by lifting others.", author: "Robert Ingersoll" },
    { id: 'pc_3', text: "Life's most persistent and urgent question is, 'What are you doing for others?'", author: "Martin Luther King Jr." },
    { id: 'pc_4', text: "The greatness of a community is most accurately measured by the compassionate actions of its members.", author: "Coretta Scott King" },
    { id: 'pc_5', text: "No one has ever become poor by giving.", author: "Anne Frank" }
  ],
  crime_boss: [
    { id: 'cb_1', text: "He who has great power should use it lightly.", author: "Seneca" },
    { id: 'cb_2', text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { id: 'cb_3', text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
    { id: 'cb_4', text: "The measure of a man is what he does with power.", author: "Plato" },
    { id: 'cb_5', text: "With power comes great responsibility.", author: "Proverb" }
  ],
  celebrity: [
    { id: 'cel_1', text: "Influence is when you are not the one talking but everyone is listening.", author: "Anonymous" },
    { id: 'cel_2', text: "Fame is a vapor, popularity an accident. Only one thing endures and that is character.", author: "Horace Greeley" },
    { id: 'cel_3', text: "To be recognized is to be responsible.", author: "Proverb" },
    { id: 'cel_4', text: "The key to successful leadership today is influence, not authority.", author: "Ken Blanchard" },
    { id: 'cel_5', text: "Fame is only good if you use it to put a spotlight on things that matter.", author: "Anonymous" }
  ]
};

export function determinePlaystyle(pl: PlayerStats): { id: string; name: string; narration: string } {
  if (!pl) {
    return {
      id: 'steady_builder',
      name: 'Steady Builder',
      narration: "You chose patience over shortcuts, quietly building an empire one investment at a time."
    };
  }

  const publicReputation = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
  const behavior = analyzeBehavior(pl);

  const isCrimeBoss = publicReputation === 'The Crime Boss' || (pl.arrestCount && pl.arrestCount > 0) || pl.heat > 75;
  const isCharitable = publicReputation === 'The Philanthropist' || publicReputation === "The People's Champion" || (pl.hustleLevels?.['philanthropy_empire'] || 0) > 0 || (pl.philanthropyDonation && pl.philanthropyDonation > 10000000);
  const isCelebrity = publicReputation === 'The Celebrity' || (pl.artists && Object.keys(pl.artists).length > 0) || (pl.rolodex && pl.rolodex.length > 0) || pl.clout > 30000;
  const isInvestor = publicReputation === 'The Investor' || publicReputation === 'The Billionaire' || (pl.lastPassiveBreakdown?.finalTotal && pl.lastPassiveBreakdown.finalTotal > 50000) || pl.rentalCount > 0 || (pl.foundersBacked && pl.foundersBacked.length > 0);
  const isRiskTaker = publicReputation === 'The Controversial Tycoon' || behavior.riskCadenceRatio > 0.4 || pl.heat > 60;

  if (isCrimeBoss) {
    return {
      id: 'crime_boss',
      name: 'Crime Boss',
      narration: "Your rise was powerful, but never without controversy. Every victory came with enemies."
    };
  }
  if (isCharitable) {
    return {
      id: 'peoples_champion',
      name: "People's Champion",
      narration: "Communities remember those who helped them when times were hardest."
    };
  }
  if (isCelebrity) {
    return {
      id: 'celebrity',
      name: 'Celebrity',
      narration: "Your name became as valuable as your businesses, with influence opening doors that money alone never could."
    };
  }
  if (isInvestor) {
    return {
      id: 'investor',
      name: 'Investor',
      narration: "You learned early that ownership creates freedom, allowing your empire to grow while others continued trading time for money."
    };
  }
  if (isRiskTaker) {
    return {
      id: 'risk_taker',
      name: 'Risk Taker',
      narration: "While others hesitated, you embraced uncertainty, turning bold decisions into remarkable rewards."
    };
  }

  return {
    id: 'steady_builder',
    name: 'Steady Builder',
    narration: "You chose patience over shortcuts, quietly building an empire one investment at a time."
  };
}

export function calculateTransitionDuration(congratulatoryLine?: string, quoteText?: string): number {
  const textToRead = `${congratulatoryLine || ''} ${quoteText || ''}`.trim();
  const wordCount = textToRead.split(/\s+/).filter(Boolean).length;
  // Reading speed: ~225 words per minute = 3.75 words per second
  const readingTimeMs = (wordCount / 225) * 60 * 1000;
  // Base padding of 2000ms for intro animations and reading margin
  const calculatedDuration = Math.round(readingTimeMs + 2000);
  // Minimum floor of 4000ms
  return Math.max(4000, calculatedDuration);
}

export function generateDynamicChapterIntro(pl: PlayerStats, tier: string): string {
  if (!pl) return "Welcome to the next level of the grind.";

  const name = pl.name || "CHASER";

  // Find Origin Category Name and Variation Name
  let originName = "humble origins";
  let backgroundVariationName = "Hustler";

  const cat = BACKGROUND_CATEGORIES.find(c => c.id === pl.categoryId);
  if (cat) {
    originName = cat.name;
    const variation = cat.variations.find(v => v.id === pl.variationId);
    if (variation) {
      backgroundVariationName = variation.name;
    }
  }

  // 1. Starter & Origin Block
  const startChunk = `From your origins as a ${originName} working as a ${backgroundVariationName}, you have completely rewritten your destiny, ${name}.`;

  // 2. First Hustle & Most Played Hustle
  let firstHustleName = "";
  if (pl.actionLog && pl.actionLog.length > 0) {
    const firstHustleAction = [...pl.actionLog].sort((a, b) => a.timestamp - b.timestamp).find(act => act.hustleId && act.hustleId !== 'r_sleep' && act.hustleId !== 'power_nap');
    if (firstHustleAction) {
      firstHustleName = firstHustleAction.hustleName;
    }
  }

  let mostPlayedHustleName = "";
  if (pl.hustlePlays && Object.keys(pl.hustlePlays).length > 0) {
    const sorted = Object.entries(pl.hustlePlays).sort((a, b) => b[1] - a[1]);
    const favoriteId = sorted[0]?.[0];
    if (favoriteId) {
      const action = pl.actionLog?.find(a => a.hustleId === favoriteId);
      mostPlayedHustleName = action ? action.hustleName : favoriteId.replace(/_/g, ' ').toUpperCase();
    }
  }

  let climbChunk = "";
  if (firstHustleName && mostPlayedHustleName && firstHustleName !== mostPlayedHustleName) {
    climbChunk = ` Starting out with ${firstHustleName}, you went on to make ${mostPlayedHustleName} your trademark engine of growth.`;
  } else if (mostPlayedHustleName) {
    climbChunk = ` You built your momentum by mastering ${mostPlayedHustleName}, paving the way with absolute focus.`;
  }

  // 3. Businesses Built & Passives
  const businesses: string[] = [];
  if (pl.hustleLevels) {
    if ((pl.hustleLevels['sw'] || 0) > 0) businesses.push("Streetwear Fashion Brand");
    if ((pl.hustleLevels['audio'] || 0) > 0) businesses.push("Audio & Record Label");
    if ((pl.hustleLevels['saas_mvp'] || 0) > 0) businesses.push("SaaS Platform");
    if ((pl.hustleLevels['real_estate_empire'] || 0) > 0 || pl.rentalCount > 0) businesses.push("Real Estate Holding");
    if ((pl.hustleLevels['h_global_conglomerate'] || 0) > 0) businesses.push("Global Conglomerate");
    if ((pl.hustleLevels['venture_capital'] || 0) > 0) businesses.push("Venture Capital Fund");
  }

  let businessChunk = "";
  if (businesses.length > 0) {
    const businessList = businesses.slice(0, 2).join(" and ");
    businessChunk = ` Turning ideas into massive assets like your ${businessList}, you shifted from a simple worker to an empire builder.`;
  }

  // 4. Playstyle Recognition & Identity Trajectory
  const playstyleInfo = determinePlaystyle(pl);
  const identityTrajectory = detectIdentityEvolution(pl);
  const playstyleChunk = ` ${playstyleInfo.narration} ${identityTrajectory}`;

  // 5. Emotional Callbacks (Rare and meaningful)
  const callbacks: string[] = [];

  const isLowIncomeOrigin = pl.categoryId === 'street_kid' || pl.categoryId === 'immigrant' || pl.categoryId === 'debt_bound';
  if (isLowIncomeOrigin && (tier === 'STREET' || tier === 'STARTUP' || tier === 'CORPORATE')) {
    callbacks.push("I remember when your biggest concern was paying next week's rent.");
  }

  const ranVending = (pl.hustleLevels?.['r_vending'] || 0) > 0 || (pl.vendingCount && pl.vendingCount > 0);
  if (ranVending && (tier === 'STARTUP' || tier === 'CORPORATE' || tier === 'ELITE')) {
    callbacks.push("It wasn't long ago you celebrated your very first vending machine.");
  }

  const ranRentals = pl.rentalCount > 0 || pl.rentPortfolioCount > 0 || (pl.hustleLevels?.['real_estate_empire'] || 0) > 0;
  if (ranRentals && (tier === 'ELITE' || tier === 'MOGUL')) {
    callbacks.push("Years ago you questioned whether buying that first property was the right decision.");
  }

  const isControversial = (pl.scandalCount && pl.scandalCount > 0) || (pl.arrestCount && pl.arrestCount > 0) || pl.heat > 50 || pl.narrativeFlags?.publicReputation === 'The Controversial Tycoon';
  if (isControversial && (tier === 'CORPORATE' || tier === 'ELITE' || tier === 'MOGUL' || tier === 'PRESIDENT')) {
    callbacks.push("The newspapers once doubted your vision.");
  }

  let selectedCallback = "";
  if (callbacks.length > 0) {
    const idx = (pl.month || 1) % callbacks.length;
    selectedCallback = callbacks[idx];
  }

  const callbackChunk = selectedCallback ? ` ${selectedCallback}` : "";

  // 6. Comebacks (Greatest Comeback)
  let comebackChunk = "";
  if (pl.masteredHustles?.includes('the_phoenix') || pl.unlockedAchievements?.includes('COMEBACK_MILLIONAIRE') || pl.unlockedAchievements?.includes('COMEBACK_BILLIONAIRE')) {
    comebackChunk = " When setbacks threatened to bury you, you rose like a phoenix, turning near-ruin into your greatest comeback.";
  }

  // 7. Political / Allies / Specialization Chunks
  let legacyChunk = "";
  const specLabel = pl.activeSpecializationId ? pl.activeSpecializationId.replace(/_/g, ' ').toUpperCase() : "";
  const cabinetSize = pl.cabinet ? Object.keys(pl.cabinet).length : 0;
  const allyCount = (pl.rivals || []).filter(r => r.status === 'ally').length;

  if (tier === 'PRESIDENT') {
    legacyChunk = ` Today, Commander-in-Chief ${name}, backed by a hand-picked cabinet of ${cabinetSize} and your specialized ${specLabel || "POLITICAL"} leadership, the national stage is yours.`;
  } else if (allyCount > 0) {
    legacyChunk = ` Backed by a specialized path in ${specLabel || "finance"} and with ${allyCount} recruited former rival allies standing by your side, your grip on the city is unbreakable.`;
  } else if (specLabel) {
    legacyChunk = ` Stepping forward as a specialized ${specLabel}, your name commands immediate respect in every boardroom.`;
  }

  // Combine into highly personalized, adaptive narrative
  return `${startChunk}${climbChunk}${businessChunk}${playstyleChunk}${callbackChunk}${comebackChunk}${legacyChunk}`.trim();
}
