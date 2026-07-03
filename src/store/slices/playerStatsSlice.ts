import type { StateCreator } from 'zustand';
import type { GameState, PlayerStats, Artist } from '../../types/game';
import type { LegacyUpgrade } from '../../types/legacy';
import { getInitialStats } from '../initialState';
import { enforceStatCaps } from '../../engine/statEngine';
import { LEGACY_UPGRADES } from '../../config/legacyUpgrades';
import * as Bio from '../../engine/biographyEngine';

export interface PlayerStatsSlice {
  pl: PlayerStats;
  difficulty: 1 | 2 | 3;
  chosenBackground?: string;
  bankedLegacyPoints: number;
  unlockedLegacyUpgradeIds: string[];

  setPlayerName: (name: string) => void;
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
  scoutArtist: (tier: 'local' | 'regional' | 'global') => { success: boolean; artist?: Artist; message: string };
  dropArtist: (artistId: string) => void;
  unlockLegacyUpgrade: (upgradeId: string) => void;
  updatePl: (updates: Partial<PlayerStats>) => void;
}

export const createPlayerStatsSlice: StateCreator<GameState, [], [], PlayerStatsSlice> = (set, get) => ({
  pl: getInitialStats(3, undefined, undefined, undefined, []),
  difficulty: 3,
  bankedLegacyPoints: 0,
  unlockedLegacyUpgradeIds: [],

  unlockLegacyUpgrade: (upgradeId) => {
    const state = get();
    const upgrade = LEGACY_UPGRADES.find((u: LegacyUpgrade) => u.id === upgradeId);
    if (!upgrade) return;
    if (state.bankedLegacyPoints < upgrade.cost) return;
    if (state.unlockedLegacyUpgradeIds.includes(upgradeId)) return;

    const bioUpdate = Bio.recordLegacyUnlock(state.pl, upgrade.name);
    set({
        bankedLegacyPoints: state.bankedLegacyPoints - upgrade.cost,
        unlockedLegacyUpgradeIds: [...state.unlockedLegacyUpgradeIds, upgradeId],
        pl: {
          ...state.pl,
          biography: bioUpdate ? [...(state.pl.biography || []), bioUpdate.entry] : state.pl.biography,
          recordedBioKeys: (bioUpdate && bioUpdate.key) ? [...(state.pl.recordedBioKeys || []), bioUpdate.key] : state.pl.recordedBioKeys
        }
    });
  },

  setPlayerName: (name: string) => {
    set((state) => ({
      pl: enforceStatCaps({ ...state.pl, name }),
      ph: 'PLAYING',
    }));
  },

  setFestivalChoices: (choices) => {
    set((state) => ({ pl: enforceStatCaps({ ...state.pl, festivalChoices: choices }) }));
  },

  setDataAnalyticsChoice: (choice) => {
    set((state) => ({ pl: enforceStatCaps({ ...state.pl, dataAnalyticsChoice: choice }) }));
  },

  setCryptoStrategy: (strategy) => {
    set((state) => ({ pl: enforceStatCaps({ ...state.pl, cryptoStrategy: strategy }) }));
  },

  setVASettings: (staff, training, client) => {
    set((state) => ({
      pl: enforceStatCaps({
        ...state.pl,
        vaStaff: staff,
        vaTraining: training,
        vaClient: client
      })
    }));
  },

  setRealEstateChoices: (type, leverage, strategy) => {
    set((state) => ({
      pl: enforceStatCaps({
        ...state.pl,
        realEstateType: type,
        realEstateLeverage: leverage,
        realEstateStrategy: strategy
      })
    }));
  },

  setVCChoices: (stage, sector, investment) => {
    set((state) => ({
      pl: enforceStatCaps({
        ...state.pl,
        vcStage: stage,
        vcSector: sector,
        vcInvestment: investment
      })
    }));
  },

  setFilmChoices: (genre, budget) => {
    set((state) => ({
      pl: { ...state.pl, filmGenre: genre, filmBudget: budget }
    }));
  },

  setSpaceCompany: (company) => {
    set((state) => ({
      pl: { ...state.pl, spaceCompany: company }
    }));
  },

  setPhilanthropyDonation: (amount) => {
    set((state) => ({
      pl: { ...state.pl, philanthropyDonation: amount }
    }));
  },

  setCampaignStage: (stage) => {
    set((state) => ({
      pl: { ...state.pl, campaignStage: stage }
    }));
  },

  setCampaignPlatform: (platform) => {
    set((state) => ({
      pl: { ...state.pl, campaignPlatform: platform }
    }));
  },

  setCampaignVP: (vp) => {
    set((state) => ({
      pl: { ...state.pl, campaignVP: vp }
    }));
  },

  setCampaignDelegates: (delegates) => {
    set((state) => ({
      pl: { ...state.pl, campaignDelegates: delegates }
    }));
  },

  scoutArtist: (tier) => {
    const state = get();

    if (state.pl.artists.length >= 10) {
      return { success: false, message: 'Maximum 10 artists allowed in roster' };
    }

    const config = {
      local: { cost: 10000, successRate: 0.8, royalty: 2000 },
      regional: { cost: 50000, successRate: 0.5, royalty: 10000 },
      global: { cost: 200000, successRate: 0.2, royalty: 50000 }
    };

    const { cost, successRate, royalty } = config[tier];

    if (state.pl.bag < cost) {
      return { success: false, message: `Need $${cost.toLocaleString()} to scout ${tier} talent` };
    }

    const plAfterCost = enforceStatCaps({ ...state.pl, bag: state.pl.bag - cost });
    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      set({
        pl: plAfterCost,
        news: [`❌ Scouting failed: No ${tier} talent found this month`, ...state.news.slice(0, 49)]
      });
      return { success: false, message: 'Scouting failed' };
    }

    const firstNames = ['Lil', 'Yung', 'Big', 'MC', 'DJ', 'The', 'Kid', 'Bad', 'Rich', 'Ice', 'A$AP', 'Cardi', 'Megan'];
    const lastNames = ['Bag', 'Chain', 'Ghost', 'Money', 'Wave', 'Vibe', 'Flex', 'Chaser', 'Mogul', 'Star', 'Flow', 'Beat'];
    const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    const newArtist: Artist = {
      id: Math.random().toString(36).substring(7),
      name,
      tier,
      royaltyRate: royalty,
      monthsActive: 0,
      hasReleased: false,
    };

    set({
      pl: enforceStatCaps({
        ...plAfterCost,
        artists: [...plAfterCost.artists, newArtist],
      }),
      news: [`🎤 SUCCESS! Signed ${tier} artist: ${name}`, ...state.news.slice(0, 49)]
    });

    get().logEvent('INVESTMENT_MADE', { type: 'ARTIST_SCOUT', tier, artistName: name, cost });

    return { success: true, artist: newArtist, message: 'Success' };
  },

  dropArtist: (artistId) => {
    const state = get();
    const artist = state.pl.artists.find(a => a.id === artistId);
    if (!artist) return;

    set({
      pl: enforceStatCaps({
        ...state.pl,
        artists: state.pl.artists.filter(a => a.id !== artistId),
      }),
      news: [`📉 Dropped artist: ${artist.name}`, ...state.news.slice(0, 49)]
    });
  },

  updatePl: (updates) => {
    set((state) => ({
      pl: enforceStatCaps({ ...state.pl, ...updates })
    }));
  },
});
