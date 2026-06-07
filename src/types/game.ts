export type Tier = 'MUD' | 'STREET' | 'STARTUP' | 'CORPORATE' | 'ELITE' | 'MOGUL' | 'PRESIDENT' | 'OPEN';
export type MarketType = 'NORMAL' | 'RECESSION' | 'BULL_MARKET' | 'CRACKDOWN';
export type CrisisType = 'shadowban' | 'blacklist' | 'strike' | 'frozen';

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
  passiveLaborYield: number;
  stats?: {
    totalHustles: number;
    successfulHustles: number;
    lifetimeEarnings: number;
  };
}

export interface GameState {
  pl: PlayerStats;
  ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE';
  currentMarket: MarketType;
  news: string[];
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
  setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => void;
}
