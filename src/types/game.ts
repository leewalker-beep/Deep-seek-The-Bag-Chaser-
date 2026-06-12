export type Tier = 'MUD' | 'STREET' | 'STARTUP' | 'CORPORATE' | 'ELITE' | 'MOGUL' | 'PRESIDENT' | 'OPEN';
export type MarketType = 'NORMAL' | 'RECESSION' | 'BULL_MARKET' | 'CRACKDOWN';
export type CrisisType = 'shadowban' | 'blacklist' | 'strike' | 'frozen';

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
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achievedAtMonth: number;
  tier: string;
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
  flexAssets: Record<string, number>;
  unlockedAchievements: string[];
  lastExecutedHustleId?: string;
  streak?: number;
  rentalCount: number;
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
  filmStudioGenre: 'action' | 'comedy' | 'drama';
  filmStudioBudget: 'low' | 'medium' | 'high';
  spaceInvestmentCompany: 'asteroid' | 'tourism' | 'mining';
  philanthropyDonation: number;
  marketCycle: {
    realEstate: 'boom' | 'bust' | 'normal';
    vc: Record<string, 'boom' | 'bust' | 'normal'>;
  };
  monthsSinceCycleChange: number;
  dynamicPassives: Record<string, number>;
  legacyPoints: number;
  rivals: Rival[];
  actionLog: GameAction[];
  milestones: Milestone[];
  stats?: {
    totalHustles: number;
    successfulHustles: number;
    lifetimeEarnings: number;
  };
}

export interface TickerMessage {
  text: string;
  colorClass?: string;
}

export interface PendingUpdate {
  pl: PlayerStats;
  news: (string | TickerMessage)[];
  currentMarket: MarketType;
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE';
  deathBadge: string | null;
  fatalCause: string | null;
  action: Omit<GameAction, 'id' | 'timestamp'>;
}

export interface GameState {
  pl: PlayerStats;
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE';
  currentMarket: MarketType;
  news: (string | TickerMessage)[];
  unlockedHustles: Record<string, boolean>;
  activeTab: Tier | 'FLEX';
  activeHustleView: string | null;
  activeNarrative?: string | null;
  deathBadge: string | null;
  fatalCause: string | null;
  difficulty: 1 | 2 | 3;
  pendingUpdate: PendingUpdate | null;

  // Actions
  resetGame: (difficulty?: 1 | 2 | 3) => void;
  setPlayerName: (name: string) => void;
  setActiveTab: (tab: Tier | 'FLEX') => void;
  setActiveHustleView: (hustleId: string | null) => void;
  dismissNarrative: () => void;
  executeHustle: (hustleId: string, minigameMultiplier?: number, forceSuccess?: boolean, defer?: boolean) => {
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
  applyPendingUpdate: () => void;
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
  setFilmStudioChoices: (genre: PlayerStats['filmStudioGenre'], budget: PlayerStats['filmStudioBudget']) => void;
  setSpaceInvestmentChoice: (company: PlayerStats['spaceInvestmentCompany']) => void;
  setPhilanthropyChoice: (donation: number) => void;
  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  checkMilestones: () => void;
}
