export type Tier = 'MUD' | 'STREET' | 'STARTUP' | 'CORPORATE' | 'ELITE' | 'MOGUL' | 'PRESIDENT' | 'OPEN';
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
  | 'SCANDAL_TRIGGERED'
  | 'ECONOMIC_EVENT'
  | 'SPECIAL_EVENT';

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
  metadata: any;
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
  marketMult?: { yield: number; expense: number; heat: number };
  marketName?: string;
  variation?: number;
}

export interface Artist {
  id: string;
  name: string;
  tier: 'local' | 'regional' | 'global';
  royaltyRate: number;
  monthsActive: number;
  hasReleased: boolean;
  isGrammyWinner?: boolean;
}

export interface Rival {
  id: string;
  name: string;
  netWorth: number;
  currentBid: number;
  isNpc: boolean;
  tier: Tier;
}

export interface Challenge {
  rivalId: string;
  rivalName: string;
  tier: Tier;
  hustlesCompleted: number;
  hustlesRequired: number;
  monthsRemaining: number;
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
}

export interface CabinetMember {
  id: string;
  name: string;
  role: string;
  loyalty: number;
  bonus: {
    type: 'approval' | 'cash' | 'clout' | 'aura';
    value: number;
  };
}

export interface PresidentCrisis {
  id: string;
  name: string;
  description: string;
  monthsRemaining?: number;
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
    buff?: string;
  };
}

export interface PlayerStats {
  name?: string;
  bag: number;
  clout: number;
  aura: number;
  mentalHealth: number;
  heat: number;
  month: number;
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
  artists: Artist[];
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
  filmGenre?: 'action' | 'comedy' | 'drama';
  filmBudget?: 'low' | 'medium' | 'high';
  spaceCompany?: 'asteroid' | 'tourism' | 'mining';
  philanthropyDonation?: number;
  loginStreak?: number;
  electoralVotes?: number;
  foreignRelations?: number;
  worldPeace?: number;
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
  }[];
  presidentMonth: number;
  isSecondTerm: boolean;
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
  rivals: Rival[];
  rivalThreats: Record<string, 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT'>;
  activeChallenges: Challenge[];
  activeSentiment: Sentiment | null;
  actionLog: GameAction[];
  milestones: Milestone[];
  events: GameEvent[];
  collectedDeathBadges: string[];
  deathCount: number;
  completedDailyChallengesCount: number;
  totalChallengesCompleted: number;
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
}

export interface Sentiment {
  category: string;
  label: string;
  multiplier: number;
  monthsRemaining: number;
}

export interface GameState {
  pl: PlayerStats;
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE';
  currentMarket: MarketType;
  news: (string | TickerMessage)[];
  unlockedHustles: Record<string, boolean>;
  activeTab: Tier | 'FLEX' | 'PRESIDENCY';
  activeHustleView: string | null;
  activeNarrative?: string | null;
  deathBadge: string | null;
  fatalCause: string | null;
  difficulty: 1 | 2 | 3;
  chosenBackground?: string;
  chosenBackgroundCategory?: string;
  chosenBackgroundVariation?: string;

  // Actions
  resetGame: (backgroundId?: string, difficulty?: 1 | 2 | 3, categoryId?: string, variationId?: string) => void;
  setPlayerName: (name: string) => void;
  setActiveTab: (tab: Tier | 'FLEX' | 'PRESIDENCY') => void;
  setActiveHustleView: (hustleId: string | null) => void;
  dismissNarrative: () => void;
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
  upgradeHustle: (hustleId: string, branchId?: string) => boolean;
  advanceTier: () => boolean;
  purchaseFlexAsset: (assetId: string) => boolean;
  scoutArtist: (tier: 'local' | 'regional' | 'global') => { success: boolean; artist?: Artist; message: string };
  dropArtist: (artistId: string) => void;
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
  resolveCrisis: (crisisId: string) => void;
  investPersonalFunds: (amount: number) => void;
  advancePresidentialMonth: () => void;
  updatePresidentialStat: (stat: string, value: number) => void;
  updateDemographicApproval: (demographic: string, value: number) => void;
  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  logEvent: (type: GameEventType, metadata?: any) => void;
  checkMilestones: () => void;
  processLogin: () => void;
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  retaliateRival: (rivalId: string) => void;
}
