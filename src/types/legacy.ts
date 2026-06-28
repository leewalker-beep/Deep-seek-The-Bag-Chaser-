export type LegacyUpgradeCategory = 'STARTING_STATS' | 'ASSETS' | 'HUSTLES' | 'ORIGINS' | 'PERKS';

export interface LegacyUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: LegacyUpgradeCategory;
  icon: string;
}
