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

  // Actions
  resetGame: (difficulty?: 1 | 2 | 3) => void;
  setPlayerName: (name: string) => void;
  setActiveTab: (tab: Tier | 'FLEX') => void;
  setActiveHustleView: (hustleId: string | null) => void;
  dismissNarrative: () => void;
  executeHustle: (hustleId: string, minigameMultiplier?: number, forceSuccess?: boolean) => { success: boolean; netChange: number; message: string };
  executeBranch: (hustleId: string, branchId: string) => { success: boolean; message: string };
  upgradeHustle: (hustleId: string, branchId?: string) => boolean;
  advanceTier: () => boolean;
  purchaseFlexAsset: (assetId: string) => boolean;
  addTickerMessage: (text: string, colorClass?: string) => void;
  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  checkMilestones: () => void;
}
