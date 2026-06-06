export interface FlexAsset {
  id: string;
  name: string;
  cost: number;
  icon: string;
  maxCloutBoost: number;
  maxAuraBoost: number;
  maxMentalBoost: number;
  passiveYield: number;
}

export const FLEX_ASSETS: FlexAsset[] = [
  { id: 'watch', name: 'Vintage Watch', cost: 10000, icon: '⌚', maxCloutBoost: 5, maxAuraBoost: 0, maxMentalBoost: 0, passiveYield: 0 },
  { id: 'car', name: 'Sports Car', cost: 50000, icon: '🏎️', maxCloutBoost: 0, maxAuraBoost: 10, maxMentalBoost: 0, passiveYield: 0 },
  { id: 'yacht', name: 'Yacht', cost: 500000, icon: '🛥️', maxCloutBoost: 25, maxAuraBoost: 25, maxMentalBoost: 0, passiveYield: 10000 },
  { id: 'penthouse', name: 'Penthouse', cost: 1000000, icon: '🏙️', maxCloutBoost: 50, maxAuraBoost: 50, maxMentalBoost: 0, passiveYield: 25000 },
  { id: 'jet', name: 'Private Jet', cost: 5000000, icon: '🛩️', maxCloutBoost: 100, maxAuraBoost: 100, maxMentalBoost: 0, passiveYield: 50000 },
  { id: 'island', name: 'Island Resort', cost: 25000000, icon: '🏝️', maxCloutBoost: 250, maxAuraBoost: 250, maxMentalBoost: 50, passiveYield: 100000 },
  { id: 'franchise', name: 'Sports Franchise', cost: 100000000, icon: '🏟️', maxCloutBoost: 500, maxAuraBoost: 500, maxMentalBoost: 0, passiveYield: 500000 },
  { id: 'media', name: 'Media Empire', cost: 500000000, icon: '🎙️', maxCloutBoost: 1000, maxAuraBoost: 1000, maxMentalBoost: 0, passiveYield: 2500000 },
];
