export type Tier = 'MUD' | 'STREET' | 'STARTUP' | 'CORPORATE' | 'ELITE' | 'MOGUL' | 'PRESIDENT' | 'OPEN';

export interface RosterCharacter {
  id: string;
  characterId?: string;
  name: string;
  avatar?: string;
  avatarId?: string;
  stats?: Record<string, number>;
}

export interface Founder extends RosterCharacter {
  id: string;
  name: string;
  avatar: string;
  companyName: string;
  pitchIdea: string;
  followOnCount?: number;
  stats: {
    execution: number;
    vision: number;
    burnDiscipline: number;
    [key: string]: number;
  };
}

export interface WorldEventInstance {
  eventId: string;
  monthsRemaining: number;
}

export interface FinancialDebt {
  id: string;
  loanType: 'STUDENT' | 'EMERGENCY' | 'EQUIPMENT' | 'BUSINESS' | 'MORTGAGE';
  principal: number;
  interestRate: number; // annual rate, e.g. 0.04 for 4%
  remainingTerm: number; // months remaining
  monthlyPayment: number;
  totalTerm: number; // original term in months
}

export type MarketType = 'NORMAL' | 'RECESSION' | 'BULL_MARKET' | 'CRACKDOWN';
export type CrisisType = 'shadowban' | 'blacklist' | 'strike' | 'frozen';

export type GameEventType =
  | 'HUSTLE_COMPLETED'
  | 'PROMOTION_EARNED'
  | 'BUSINESS_PURCHASED'
  | 'PROPERTY_PURCHASED'
  | 'COMPANY_ACQUIRED'
  | 'INVESTMENT_MADE'
  | 'MARKET_WIN'
  | 'RIVAL_DEFEATED'
  | 'PRIMARY_WON'
  | 'ELECTION_WON'
  | 'CABINET_APPOINTED'
  | 'LAW_PASSED'
  | 'CRISIS_RESOLVED'
  | 'SCANDAL_TRIGGERED'
  | 'ECONOMIC_EVENT'
  | 'REFLECTION'
  | 'SPECIAL_EVENT';

export interface HustleCompletedMetadata {
  hustleId: string;
  hustleName: string;
  success: boolean;
  profit: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  heatHit: number;
  level: number;
  miniGame?: string;
  multiplier: number;
  rentDeducted?: number;
  passiveIncomeTotal?: number;
  passiveBreakdown?: PassiveBreakdown;
  passiveAdded?: number;
}

export interface PromotionEarnedMetadata {
  from: Tier;
  to: Tier;
  fee: number;
  specialization?: string;
}

export interface BusinessPurchasedMetadata {
  assetId: string;
  cost: number;
}

export interface PropertyPurchasedMetadata {
  branchId?: string;
  branchName?: string;
  type?: string;
  cost: number;
}

export interface AchievementUnlockedMetadata {
  type: 'ACHIEVEMENT_UNLOCKED';
  achievementId: string;
  achievementName: string;
}

export interface HustleMasteryMetadata {
  type: 'HUSTLE_MASTERY';
  hustleId: string;
  hustleName: string;
}

export interface TierBadgeEarnedMetadata {
  type: 'TIER_BADGE_EARNED';
  tier: Tier;
}

export interface EndingUnlockedMetadata {
  type: 'ENDING_UNLOCKED';
  title: string;
  legacyPoints: number;
}

export interface BadgeBenefitActiveMetadata {
  type: 'BADGE_BENEFIT_ACTIVE';
  message: string;
}

export interface MediaExpansionMetadata {
  type: 'MEDIA_EXPANSION';
  level: number;
  passiveAdded?: number;
}

export interface RivalRetaliationMetadata {
  type: 'RIVAL_RETALIATION';
  rivalId: string;
  rivalName: string;
  cost: number;
}

export interface RivalSabotageMetadata {
  type: 'RIVAL_SABOTAGE';
  rivalId: string;
  success: boolean;
  cost: number;
}

export interface RivalCounterBidMetadata {
  type: 'RIVAL_COUNTER_BID';
  rivalId: string;
  cost: number;
}

export interface RivalRecruitedMetadata {
  type: 'RIVAL_RECRUITED';
  rivalId: string;
  rivalName: string;
}

export interface ScandalTriggeredMetadata {
  type: 'DATA_BREACH' | 'POLICE_RAID_RISK';
  heat?: number;
}

export type SpecialEventMetadata =
  | AchievementUnlockedMetadata
  | HustleMasteryMetadata
  | TierBadgeEarnedMetadata
  | EndingUnlockedMetadata
  | BadgeBenefitActiveMetadata
  | MediaExpansionMetadata
  | RivalRetaliationMetadata
  | RivalSabotageMetadata
  | RivalCounterBidMetadata
  | RivalRecruitedMetadata;

export interface MarketWinMetadata {
  type: 'VC_EXIT' | 'TRADE_SUCCESS';
  profit: number;
}

export interface InvestmentMadeMetadata {
  type: 'ARTIST_SCOUT' | 'VC_INVESTMENT';
  tier?: string;
  artistName?: string;
  sector?: string;
  investment?: number;
  cost?: number;
}

export interface RivalDefeatedMetadata {
  rivalId?: string;
  rivalName: string;
  bonus?: number;
  bid?: number;
}

export interface EconomicEventMetadata {
  from: MarketType;
  to: MarketType;
}

export interface ReflectionMetadata {
  eventId?: string;
  choiceId?: string;
  choiceLabel?: string;
  text?: string;
  month?: number;
  tier?: Tier;
}

export interface LawPassedMetadata {
  hustleId: string;
  name: string;
  cost: number;
  cloutCost: number;
  approvalImpact: number;
}

export interface CrisisResolvedMetadata {
  name: string;
  cost: number;
}

export interface CabinetAppointedMetadata {
  role: string;
  name: string;
}

export type GameEventMetadata =
  | HustleCompletedMetadata
  | PromotionEarnedMetadata
  | BusinessPurchasedMetadata
  | PropertyPurchasedMetadata
  | SpecialEventMetadata
  | RivalDefeatedMetadata
  | EconomicEventMetadata
  | ReflectionMetadata
  | LawPassedMetadata
  | CrisisResolvedMetadata
  | CabinetAppointedMetadata
  | MarketWinMetadata
  | InvestmentMadeMetadata
  | ScandalTriggeredMetadata
  | Record<string, unknown>;

export interface GameEvent {
  id: string;
  type: GameEventType;
  timestamp: number;
  playerStats: {
    bag: number;
    clout: number;
    aura: number;
    mental: number;
    heat: number;
    tier: Tier;
  };
  metadata: GameEventMetadata;
}

export type PassiveCategory = 'BUSINESS' | 'REAL_ESTATE' | 'FLEX' | 'ROYALTY' | 'BONUS';

export interface PassiveSource {
  id: string;
  name: string;
  category: PassiveCategory;
  amount: number;
  count?: number;
}

export interface PassiveBreakdown {
  sources: PassiveSource[];
  baseTotal: number;
  multipliers: {
    legacy: number;
    market: number;
    specialization: number;
    worldEvent?: { name: string; multiplier: number };
  };
  finalTotal: number;
}

export interface GameAction {
  id: string;
  timestamp: number;
  month: number;
  tier: string;
  hustleId: string;
  hustleName: string;
  level: number;
  branchId: string;
  branchName: string;
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  netCash: number;
  success: boolean;
  passiveAdded?: number;
  rentDeducted?: number;
  passiveIncomeTotal?: number;
  passiveBreakdown?: PassiveBreakdown;
  marketMult?: { yield: number; expense: number; heat: number };
  marketName?: string;
  variation?: number;
  heatHit?: number;
  mentalHit?: number;
}

export interface Artist extends RosterCharacter {
  id: string;
  name: string;
  tier: 'local' | 'regional' | 'global';
  royaltyRate: number;
  monthsActive: number;
  hasReleased: boolean;
  isGrammyWinner?: boolean;
  status?: string;
}

export interface RecordLabelArtist extends Artist {
  avatar: string;
  contractMonthsLeft: number;
  monthlyRetainer: number;
  monthlyRevenue: number;
  hypeFactor: number;
  isTargetedByRival: boolean;
}

export interface RolodexCelebrity extends RosterCharacter {
  id: string;
  name: string;
  avatar: string;
  relationshipScore: number; // 0-100
  isUnlocked: boolean;
}

export interface Rival {
  id: string;
  characterId?: string;
  name: string;
  netWorth: number;
  currentBid: number;
  isNpc: boolean;
  tier: Tier;
  clout?: number;
  lastSabotagedMonth?: number;
  vengeance?: number; // Multiplier for aggressive bidding chance
  currentHustle?: string;
  specialty?: string;
  status?: CharacterStatus;

  // Persistent personality traits
  riskTolerance?: number;       // 0 to 1
  aggression?: number;          // 0 to 1
  intelligence?: number;        // 0 to 1
  ambition?: number;            // 0 to 1
  ethics?: number;              // 0 to 1
  politicalLeaning?: 'left' | 'right' | 'center' | 'libertarian';
  preferredIndustries?: string[];

  // Trait/state trackers
  relationshipWithPlayer?: number; // -100 to 100
  sabotagedCount?: number;
  helpedCount?: number;

  // Simulated assets/actions using existing systems or mimicking them logically
  businesses?: string[];          // e.g. ["Deli", "Logistics"]
  propertiesOwned?: number;       // e.g. Real Estate rental properties
  companiesAcquired?: string[];   // e.g. Company names or types
  mediaCompaniesOwned?: number;   // count
  employeesHired?: number;        // count
  politicalInfluence?: number;    // Clout/campaign value
  isCandidate?: boolean;
  campaignProgress?: number;      // 0 to 100
  industries?: string[];          // expanded industries
  passiveIncome?: number;         // simulated monthly passive income
}

export type CharacterStatus = 'alive' | 'disappeared' | 'rival' | 'ally' | 'deceased';

export interface Character {
  id: string;
  name: string;
  nickname?: string;
  portraitId: string;
  background: string;
  personality: string;
  profession: string;
  speakingStyle: string;
  moralAlignment: string;
  preferredIndustries: string[];
  strengths: string[];
  weaknesses: string[];
  relationshipTags: string[];
  firstAppearanceTier: Tier;
  futureAppearanceTiers: Tier[];
  initialStatus: CharacterStatus;
}

export interface Challenge {
  rivalId: string;
  rivalName: string;
  tier: Tier;
  hustlesCompleted: number;
  hustlesRequired: number;
  monthsRemaining: number;
}

export interface Consequence {
  id: string;
  source: string; // unique identifier/source e.g., "sabotage_retaliation"
  triggerCondition: string; // descriptive condition under which it triggers
  delay: number; // months remaining until it triggers/activates
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  expiry: number; // months remaining once activated (negative for permanent)
  affectedSystems: string[]; // systems affected, e.g. ["businesses", "real_estate", "politics", "clout", "aura", "mental_health"]
  status: 'pending' | 'active' | 'resolved' | 'expired';
  description: string; // user-visible explanation of the active/impending consequence
  effectModifier?: Record<string, number>; // numeric adjustments (e.g. { yieldCashMult: 0.75 })
  newsTemplates?: string[]; // news feed messages
}

export interface NarrativeChoice {
  id: string;
  label: string;
  description?: string;
  logMessage?: string;
  consequences: {
    bag?: number;
    clout?: number;
    aura?: number;
    mentalHealth?: number;
    heat?: number;
    passiveCash?: number;
    minimumYield?: number;
    specializationLock?: string;
    biographyEntry?: string;
  };
  setFlags?: Record<string, string | number | boolean>;
  requirement?: {
    stat?: { type: 'clout' | 'aura' | 'bag' | 'heat' | 'mentalHealth'; value: number };
    background?: string[];
    specialization?: string[];
  };
  createConsequences?: Consequence[];
  modifyConsequences?: { source: string; delay?: number; expiry?: number; severity?: 'minor' | 'moderate' | 'severe' | 'extreme' }[];
  resolveConsequences?: string[]; // source names to resolve
}

export type NarrativePacingCategory = 'MAJOR' | 'CHARACTER' | 'RIVAL' | 'PRESIDENCY';

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  image?: string;
  characterId?: string;
  arcId?: string;
  pacingCategory?: NarrativePacingCategory;
  trigger: {
    tier?: Tier[];
    background?: string[];
    category?: string[];
    specialization?: string[];
    minMonth?: number;
    probability: number;
    once?: boolean;
    flagReqs?: Record<string, string | number | boolean>;
  };
  requirement?: {
    stat?: { type: 'clout' | 'aura' | 'bag' | 'heat' | 'mentalHealth'; value: number };
    background?: string[];
    specialization?: string[];
  };
  choices: NarrativeChoice[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achievedAtMonth: number;
  tier: string;
}

export interface Badge {
  id: string;
  hustleId: string;
  name: string;
  description: string;
  icon: string;
  buff: {
    type: 'yield' | 'clout' | 'aura' | 'mental' | 'heat';
    value: number; // multiplier, e.g. 1.05 for +5%
  };
  futureBenefit?: string;
  relevantTier?: Tier;
}

export interface CabinetMember extends RosterCharacter {
  id: string; // Role ID (e.g., 'treasury')
  name: string;
  role: string; // Display name of role
  avatarId?: string;
  characterId?: string;
  previousCareer?: string;
  competence?: number;
  integrity?: number;
  popularity?: number;
  corruptionRisk?: number;
  ambition?: number;
  personalityTraits?: string[];
  bio?: string;
  loyalty: number;
  bonus: {
    type: 'approval' | 'cash' | 'clout' | 'aura';
    value: number;
  };
  strengths: string[];
  weaknesses: string[];
  politicalAlignment: string;
  impacts: Record<string, number>;
  monthsAtHighLoyalty?: number;
  isTrustedAlly?: boolean;
  trustedAlly?: boolean;
  hasLeaked?: boolean;
  loyaltyMonths?: number;
}

export interface RegionalExecutive extends RosterCharacter {
  id: string;
  name: string;
  avatar?: string;
  avatarId?: string;
  assignedDivision?: string; // e.g. "APAC Retail", "EU Manufacturing", "NA Technology", "LATAM Logistics"
  competence: number; // 0-100
  loyalty: number; // 0-100
  riskTolerance: number; // 0-100
  bio?: string;
  personalityTraits?: string[];
}

export interface PresidentialActivityChoice {
  id: string;
  label: string;
  description: string;
  impact: {
    approval?: number;
    gdp?: number;
    inflation?: number;
    debt?: number;
    foreignRelations?: number;
    worldPeace?: number;
    congressSupport?: number;
    bag?: number;
    federalBudget?: number;
    clout?: number;
    aura?: number;
    heat?: number;
  };
  cabinetBonus?: {
    roleId: string;
    multiplier: number;
    message: string;
  };
  requirement?: {
    stat: { type: 'aura' | 'clout' | 'relations'; value: number };
  };
}

export interface PresidentialActivity {
  id: string;
  title: string;
  description: string;
  category: 'BUDGET' | 'DIPLOMACY' | 'CRISIS' | 'CABINET' | 'ELECTION' | 'SECURITY' | 'DISASTER' | 'INTELLIGENCE';
  icon: string;
  minigameType: 'RISK' | 'PATTERN' | 'MASH' | 'SEQUENCE' | 'RHYTHM' | 'HOLD';
  choices: PresidentialActivityChoice[];
}

export interface PresidentCrisis {
  id: string;
  name: string;
  description: string;
  monthsRemaining?: number;
  type?: string;
  title?: string;
  resolved?: boolean;
  approvalImpact?: number;
  resolutionCost: {
    cash?: number;
    clout?: number;
    aura?: number;
  };
  impact: {
    approval: number;
    gdp?: number;
    inflation?: number;
    debt?: number;
    demographics?: Record<string, number>;
    cash?: number;
    clout?: number;
    aura?: number;
    heat?: number;
  };
}

export interface ExecutiveOrder {
  id: string;
  name: string;
  description: string;
  quotes?: Record<string, string>; // cabinetRoleId -> quote
  cost: {
    clout?: number;
    aura?: number;
    cash?: number;
  };
  impact: {
    approval: number;
    gdp?: number;
    inflation?: number;
    debt?: number;
    demographics?: Record<string, number>;
    passiveCash?: number;
    heat?: number;
    aura?: number;
  };
  marketEffect?: {
    type: MarketType;
    duration: number;
  };
  delayedImpacts?: {
    delay: number;
    impact: Partial<ExecutiveOrder['impact']>;
    message: string;
  }[];
  regionalImpacts?: Record<string, number>;
}

export type AppTab = Tier | 'FLEX' | 'SCOREBOARD' | 'CHALLENGES' | 'LEGACY_SHOP' | 'PRESIDENCY';

export type AchievementCategory = 'PROGRESSION' | 'HUSTLE MASTERY' | 'EARNINGS' | 'MINIGAME SKILL' | 'COLLECTION' | 'STREAKS' | 'DAILY CHALLENGES' | 'LEGACY' | 'ENDINGS';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  isUnlocked: boolean;
  unlockedAt?: number;
  reward?: {
    cash?: number;
    clout?: number;
    aura?: number;
    heat?: number;
    mentalHealth?: number;
    legacyPoints?: number;
    buff?: string;
  };
}

export interface DailyChallenge {
  id: string;
  type?: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  reward: { cash: number; aura?: number; clout?: number };
}

export interface HallOfFameEntry {
  runId: string;
  playerName?: string;
  avatarId?: string;
  tier: string;
  legacyScore: number;
  finalBag: number;
  ending: string;
  deathBadge?: string;
  lastHustle?: string;
  date: string;
  month: number;
  biography: string[];
  blueprint?: {
    primaryColor: 'CRIMSON' | 'GOLD' | 'COBALT' | 'VIOLET';
    dominantPersona: string;
    paceSeconds: number;
    paceLabel: string;
    adviceRatio: number;
    setbackRatio: number;
    riskCadenceRatio: number;
    orientationLabel: string;
    headlineSynthesis?: string;
  };
}

export type WorldFeedCategory = 'SOCIAL' | 'BUSINESS' | 'POLITICS' | 'OPINION' | 'MARKET' | 'NEWS' | 'WORLD';

export type LiveWorldEventType =
  | 'BREAKING_NEWS'
  | 'SOCIAL_TRENDING'
  | 'MARKET_FLASH'
  | 'POLICE_ALERT'
  | 'GOVERNMENT_BULLETIN'
  | 'COMMUNITY_SPOTLIGHT'
  | 'CELEBRITY_WATCH';

export interface HistoryEvent {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  category:
    | "CAREER"
    | "BUSINESS"
    | "RIVAL"
    | "CRIME"
    | "POLITICS"
    | "LEGACY"
    | "RELATIONSHIP"
    | "WORLD";
  importance: 1 | 2 | 3 | 4 | 5;
  participants?: string[];
  excludeFromBiography?: boolean;
}

export interface LiveWorldEvent {
  id: string;
  type: LiveWorldEventType;
  title: string;
  headline: string;
  body: string;
  source: string;
  likes?: number;
  shares?: number;
  avatarId?: string;
  author?: string;
  effect?: string;
  fameLevel: 'local' | 'regional' | 'national' | 'global';
  month: number;
}

export interface WorldFeedItem {
  id: string;
  category: WorldFeedCategory;
  text: string;
  source: string; // E.g. "Chirp", "Wall Street Ledger", "Capitol Press", "Public Polls"
  timestamp: number;
  month: number;
  likes?: number;
  shares?: number;
  author?: string;
  avatarId?: string;
  effect?: string;
  pinned?: boolean;
}

export interface OriginBonus {
  type: 'cash' | 'clout' | 'aura';
  multiplier: number;
  tiers: string[];
  description: string;
}

export interface PersistentNPC {
  id: string;
  name: string;
  avatar: string;
  reputation: number;
  disposition: number;
  currentRole: string;
  interactionLog: string[];
  currentHustleId?: string;
  originAge?: number;
  originHustleId?: string;
}

export interface PlayerAmbition {
  id: string;
  title: string;
  description: string;
  status: 'SUGGESTED' | 'ACTIVE' | 'IGNORED' | 'COMPLETED';
  progress: number;
  target: number;
  progressText: string;
  rewardDescription: string;
}

export interface PlayerStats {
  runId: string;
  name?: string;
  ambitions?: PlayerAmbition[];
  age?: string;
  worldFeed?: WorldFeedItem[];
  consequences?: Consequence[];
  financialDebts?: FinancialDebt[];
  activeLiveEvent?: LiveWorldEvent | null;
  completedLiveEvents?: string[];
  avatarId: string;
  bag: number;
  clout: number;
  aura: number;
  mentalHealth: number;
  heat: number;
  month: number;
  lastAdvisorPopupMonth?: number;
  advisorQueue?: any[];
  currentTier: Tier;
  hustleLevels: Record<string, number>;
  hustleBranchIds: Record<string, string>;
  masteredHustles: string[]; // hustle IDs
  flexAssets: Record<string, number>;
  unlockedAchievements: string[];
  lastExecutedHustleId?: string;
  streak?: number;
  rentalCount: number;
  rentPortfolioCount: number;
  flipCount: number;
  vendingCount: number;
  passiveLaborYield: number;
  mentalShieldTurns: number;
  artists: RecordLabelArtist[];
  scoutedTalentPool: RecordLabelArtist[];
  activeMinigame?: { panelType: string; level: number; initialHype?: number; performingArtistIds?: string[] } | null;
  endgameTracks?: {
    realEstateAcquisitions: string[];
    globalFleetCount: number;
    automatedHustleIds: string[];
    techStartupValuation: number;
  };
  synergyPool?: {
    grassrootsMarketing?: number;
    logisticsBonus?: number;
  };
  rolodex: RolodexCelebrity[];
  foundersBacked: Founder[];
  conglomerateCEOs?: Record<string, RegionalExecutive>;
  conglomerateCandidates?: RegionalExecutive[];
  npcs?: PersistentNPC[];
  rareTechStockpile: number;
  algorithmicLogs: number;
  grammyCount: number;
  recordLabelLevel: number;
  festivalChoices?: {
    headliner: 'budget' | 'premium' | 'luxury';
    venue: 'small' | 'medium' | 'large';
    marketing: 'basic' | 'standard' | 'aggressive';
    insurance: boolean;
  };
  dataAnalyticsChoice?: 'consumer' | 'financial' | 'social' | 'all';
  cryptoStrategy?: 'solo' | 'pool' | 'cloud' | 'asic';
  vaStaff?: 5 | 10 | 20;
  vaTraining?: 'none' | 'basic' | 'advanced';
  vaClient?: 'small' | 'medium' | 'large';
  realEstateType: 'residential' | 'commercial' | 'industrial';
  realEstateLeverage: 0 | 50 | 80;
  realEstateStrategy: 'hold' | 'flip';
  vcStage: 'seed' | 'seriesA' | 'growth';
  vcSector: 'tech' | 'biotech' | 'energy';
  vcInvestment: number;
  legacyPoints?: number;
  legacyScore?: number;
  unlockedLegacyUpgradeIds?: string[];
  filmGenre?: 'action' | 'comedy' | 'drama';
  filmBudget?: 'low' | 'medium' | 'high';
  spaceCompany?: 'asteroid' | 'tourism' | 'mining';
  philanthropyDonation?: number;
  loginStreak?: number;
  electoralVotes?: number;
  foreignRelations: number;
  worldPeace: number;
  voterTurnout?: number;
  campaignStage?: number;
  campaignPlatform?: 'economy' | 'healthcare' | 'foreign';
  campaignVP?: string;
  campaignDelegates?: number;
  approvalRating: number;
  gdp: number;
  inflation: number;
  nationalDebt: number;
  federalBudget: number;
  congressSupport: number;
  demographicApproval: Record<string, number>;
  presidentialDiary: {
    id: string;
    month: number;
    event: string;
    outcome: string;
    type: 'ORDER' | 'CRISIS' | 'ELECTION';
    appliedMasteryBonuses?: { name: string; bonus: number }[];
  }[];
  presidentMonth: number;
  isSecondTerm: boolean;
  isReElectionPhase: boolean;
  cabinet: Record<string, CabinetMember>;
  activeCrises: PresidentCrisis[];
  presidentialMarketControl: {
    type: MarketType;
    monthsRemaining: number;
  } | null;
  chosenBackground?: string;
  chosenBackgroundCategory?: string;
  chosenBackgroundVariation?: string;
  pendingPresidentialImpacts: {
    monthToTrigger: number;
    impact: Partial<ExecutiveOrder['impact']>;
    message: string;
  }[];
  regionalApproval: Record<string, number>;
  prePresidencyTier: Tier | null;
  crushedRivals: string[];
  marketLeaderTiers: Tier[];
  approvalFloor: number;
  scandalRiskBonus: number;
  sotuHistory: {
    month: number;
    gdp: number;
    inflation: number;
    debt: number;
    approval: number;
  }[];
  marketCycle: {
    realEstate: 'boom' | 'bust' | 'normal';
    vc: Record<string, 'boom' | 'bust' | 'normal'>;
  };
  monthsSinceCycleChange: number;
  dynamicPassives: Record<string, number>;
  lastPassiveBreakdown?: PassiveBreakdown;
  activeSpecializationId: string | null;
  specializationHistory: string[];
  rivals: Rival[];
  rivalThreats: Record<string, 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT'>;
  activeChallenges: Challenge[];
  activeSentiment: Sentiment | null;
  activeWorldEvent: WorldEventInstance | null;
  worldEventCooldown: number;
  activeNarrative: string | null;
  narrativeCooldown: number;
  lastCharacterId?: string;
  lastArcId?: string;
  arcLastFired: Record<string, number>;
  monthsSinceLastEvent: number;
  originBonus: OriginBonus | null;
  completedNarrativeEvents: string[];
  biography: string[];
  recordedBioKeys: string[];
  history?: HistoryEvent[];
  narrativeFlags: Record<string, string | number | boolean>;
  adviceGivenCount?: number;
  adviceFollowedCount?: number;
  activeAdviceTriggers?: { id: string; extraCondition?: string; hustleIds?: string[]; actionsChecked: number; resolved?: boolean }[];
  escalationCount?: number;
  retreatCount?: number;
  setbackActionsRemaining?: number;
  actionLog: GameAction[];
  milestones: Milestone[];
  events: GameEvent[];
  collectedDeathBadges: string[];
  deathCount: number;
  arrestCount: number;
  tierBadges: string[];
  pendingFlexOffer: number | null;
  flexOfferCooldown: number;
  seenFlexThresholds: number[];
  pendingAnnualStatement: boolean;
  annualCashEarned: number;
  annualCashSpent: number;
  annualHustlesRun: number;
  tierStats: Record<string, { plays: number, earnings: number, favoriteHustle: string }>;
  hustlePlays: Record<string, number>;
  completedDailyChallengesCount: number;
  totalChallengesCompleted: number;
  totalHustlesCompleted: number;
  inJail: boolean;
  isIncarcerated?: boolean;
  jailMonthsRemaining: number;
  jailSentenceTotal: number;
  jailCharge: string;
  monthsSinceLastHustle?: number;
  monthsAtZeroHeat?: number;
  termComplete?: boolean;
  pendingTermEnd?: boolean;
  termVerdict?: string;
  termVerdictEmoji?: string;
  scandalCount?: number;
  backgroundId?: string;
  categoryId?: string;
  variationId?: string;
  tutorialStep: number;
  isTutorialSkipped: boolean;
  guidanceSettings?: 'Full' | 'Recommended' | 'Minimal' | 'Off';
  deathContext?: {
    mentalHealthAtDeath: number;
    lastHustleMentalHit: number;
    lastHustleName: string;
    heatAtDeath: number;
    monthsPlayed: number;
    tier: string;
    fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
    fatalStatValue?: number;
    // Expanded transparency fields
    preStatValue?: number;
    baseDamage?: number;
    multipliers?: Record<string, number>;
    finalDamage?: number;
    postStatValue?: number;
  };
  stats?: {
    totalHustles: number;
    successfulHustles: number;
    lifetimeEarnings: number;
    bestRunTier?: Tier;
    bestRunBag?: number;
    bestRunEnding?: string;
  };
}

export interface TickerMessage {
  text: string;
  colorClass?: string;
  tier?: Tier;
  type?: string;
}

export interface Sentiment {
  category: string;
  label: string;
  multiplier: number;
  monthsRemaining: number;
}

import { type HeroArtwork } from '../config/heroArtwork';

export interface GameState {
  pl: PlayerStats;
  player?: PlayerStats;
  newsFeed?: any[];
  activeModalEvent?: any;
  advanceMonthAction?: () => void;
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE' | 'LEGACY_SHOP';
  currentMarket: MarketType;
  news: (string | TickerMessage)[];
  unlockedHustles: Record<string, boolean>;
  activeTab: AppTab;
  activeHustleView: string | null;
  activeTierBadge: string | null;
  activeNarrative?: string | null;
  showMinigame: boolean;
  deathBadge: string | null;
  fatalCause: string | null;
  pendingSpecialization: boolean;
  tutorialStep: number;
  isTutorialSkipped: boolean;
  difficulty: 1 | 2 | 3;
  activeTransition: HeroArtwork | null;
  transitionQueue: HeroArtwork[];
  chosenBackground?: string;
  chosenBackgroundCategory?: string;
  chosenBackgroundVariation?: string;

  // Actions
  resetGame: (
    backgroundId?: string,
    difficulty?: 1 | 2 | 3,
    categoryId?: string,
    variationId?: string,
    avatarId?: string,
    prologueStats?: {
      bag: number;
      clout: number;
      aura: number;
      biography: string[];
      recordedBioKeys: string[];
      hustlePlays: Record<string, number>;
      totalHustlesCompleted: number;
      actionLog: any[];
    }
  ) => void;
  setPlayerName: (name: string) => void;
  setActiveTab: (tab: AppTab) => void;
  setActiveHustleView: (hustleId: string | null) => void;
  setActiveTierBadge: (badge: string | null) => void;
  setShowMinigame: (show: boolean) => void;
  dismissNarrative: () => void;
  dismissLiveEvent: () => void;
  setTutorialStep: (step: number) => void;
  selectSpecialization: (specializationId: string) => void;
  resolveNarrativeEvent: (choiceId: string) => void;
  resolveInteractiveStoryEvent: (choiceIndex: number) => void;
  takeLoan: (loanType: 'STUDENT' | 'EMERGENCY' | 'EQUIPMENT' | 'BUSINESS' | 'MORTGAGE') => boolean;
  repayLoan: (loanId: string) => boolean;
  executeHustle: (hustleId: string, minigameMultiplier?: number, forceSuccess?: boolean) => {
    success: boolean;
    netChange: number;
    message: string;
    cost: number;
    yieldCash: number;
    yieldClout: number;
    yieldAura: number;
    mentalHit: number;
    heatHit: number;
  };
  executeBranch: (hustleId: string, branchId: string) => { success: boolean; message: string };
  executeHustleWithTimelineTick: (hustleId: string, branchId: string) => { success: boolean; message: string };
  upgradeHustle: (hustleId: string, branchId?: string) => boolean;
  advanceTier: () => boolean;
  purchaseFlexAsset: (assetId: string) => boolean;
  scoutArtist: (tier: 'local' | 'regional' | 'global') => { success: boolean; artist?: RecordLabelArtist; message: string };
  signScoutedArtist: (artistId: string) => void;
  dropArtist: (artistId: string) => void;
  collapseFounderCompany: (founderId: string) => void;
  lapseRolodexRelationship: (celebrityId: string) => void;
  addTickerMessage: (text: string, colorClass?: string) => void;
  setFestivalChoices: (choices: PlayerStats['festivalChoices']) => void;
  setDataAnalyticsChoice: (choice: PlayerStats['dataAnalyticsChoice']) => void;
  setCryptoStrategy: (strategy: PlayerStats['cryptoStrategy']) => void;
  setVASettings: (staff: PlayerStats['vaStaff'], training: PlayerStats['vaTraining'], client: PlayerStats['vaClient']) => void;
  setRealEstateChoices: (type: PlayerStats['realEstateType'], leverage: PlayerStats['realEstateLeverage'], strategy: PlayerStats['realEstateStrategy']) => void;
  setVCChoices: (stage: PlayerStats['vcStage'], sector: PlayerStats['vcSector'], investment: number) => void;
  setFilmChoices: (genre: 'action' | 'comedy' | 'drama', budget: 'low' | 'medium' | 'high') => void;
  setSpaceCompany: (company: 'asteroid' | 'tourism' | 'mining') => void;
  setPhilanthropyDonation: (amount: number) => void;
  setCampaignStage: (stage: number) => void;
  setCampaignPlatform: (platform: 'economy' | 'healthcare' | 'foreign') => void;
  setCampaignVP: (vp: string) => void;
  setCampaignDelegates: (delegates: number) => void;
  issueExecutiveOrder: (orderId: string) => void;
  appointCabinetMember: (member: CabinetMember) => void;
  fireCabinetMember: (roleId: string) => void;
  appointConglomerateCEO?: (divisionId: string, member: RegionalExecutive) => void;
  fireConglomerateCEO?: (divisionId: string) => void;
  resolveCrisis: (crisisId: string) => void;
  investPersonalFunds: (amount: number) => void;
  advancePresidentialMonth: () => void;
  updatePresidentialStat: (stat: string, value: number) => void;
  updateDemographicApproval: (demographic: string, value: number) => void;
  startPresidentialActivity: (activityId: string) => void;
  resolvePresidentialActivity: (activityId: string, choiceId: string, multiplier: number) => {
    impacts: Record<string, number>;
    diaryEntry: string;
    finalMultiplier: number;
  } | null;
  serveMonth: () => void;
  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  logEvent: (type: GameEventType, metadata?: GameEventMetadata) => void;
  registerAdvice: (insights: any[]) => void;
  triggerSetback: () => void;
  checkMilestones: () => void;
  processLogin: () => void;
  dailyChallenges: DailyChallenge[];
  loginStreak: number;
  lastLoginDate: string | null;
  checkChallenges: () => void;
  updateChallengeProgress: (idOrType: string, amount: number) => void;
  getStreakReward: (streak: number, tier?: Tier) => { cash: number; aura?: number; clout?: number };
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  retaliateRival: (rivalId: string) => void;
  sabotageRival: (rivalId: string) => void;
  helpRival?: (rivalId: string) => void;
  counterBid: (rivalId: string) => void;
  recruitRival?: (rivalId: string) => boolean;
  setTutorialSkipped: (skipped: boolean) => void;
  bankedLegacyPoints: number;
  unlockedLegacyUpgradeIds: string[];
  unlockLegacyUpgrade: (upgradeId: string) => void;
  updatePl: (updates: Partial<PlayerStats>) => void;
  triggerTransition: (artwork: HeroArtwork) => void;
  clearTransition: () => void;
  acceptAmbition: (id: string) => void;
  ignoreAmbition: (id: string) => void;
  replaceAmbition: (id: string, withId: string) => void;
}
