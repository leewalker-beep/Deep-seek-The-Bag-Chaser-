import type { StateCreator } from 'zustand';
import type { GameState, PlayerStats, RecordLabelArtist, PersistentNPC, RegionalExecutive } from '../../types/game';
import type { LegacyUpgrade } from '../../types/legacy';
import { getInitialStats } from '../initialState';
import { enforceStatCaps } from '../../engine/statEngine';
import { LEGACY_UPGRADES } from '../../config/legacyUpgrades';
import * as Bio from '../../engine/biographyEngine';
import { generateGlobalNPC } from '../../config/world/npcRegistry';
import { processWorldReaction } from '../../engine/reactiveWorldEngine';
import { HUSTLES } from '../../config/hustles/base';

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
  appointConglomerateCEO: (divisionId: string, member: RegionalExecutive) => void;
  fireConglomerateCEO: (divisionId: string) => void;
  setSpaceCompany: (company: 'asteroid' | 'tourism' | 'mining') => void;
  setPhilanthropyDonation: (amount: number) => void;
  setCampaignStage: (stage: number) => void;
  setCampaignPlatform: (platform: 'economy' | 'healthcare' | 'foreign') => void;
  setCampaignVP: (vp: string) => void;
  setCampaignDelegates: (delegates: number) => void;
  scoutArtist: (tier: 'local' | 'regional' | 'global') => { success: boolean; artist?: RecordLabelArtist; message: string };
  signScoutedArtist: (artistId: string) => void;
  dropArtist: (artistId: string) => void;
  unlockLegacyUpgrade: (upgradeId: string) => void;
  updatePl: (updates: Partial<PlayerStats>) => void;
  acceptAmbition: (id: string) => void;
  ignoreAmbition: (id: string) => void;
  replaceAmbition: (id: string, withId: string) => void;
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

  appointConglomerateCEO: (divisionId, member) => {
    set((state) => {
      const ceos = { ...(state.pl.conglomerateCEOs || {}) };
      const currentCandidatePool = [...(state.pl.conglomerateCandidates || [])];

      // If there was a previous CEO in this division, return them to the candidate pool
      const previousCEO = ceos[divisionId];
      let updatedCandidates = currentCandidatePool.filter(c => c.id !== member.id);
      if (previousCEO) {
        const returnedCEO = { ...previousCEO };
        delete returnedCEO.assignedDivision;
        updatedCandidates.push(returnedCEO);
      }

      // Assign division to new CEO
      const appointedCEO = { ...member, assignedDivision: divisionId };
      ceos[divisionId] = appointedCEO;

      // Update passive income immediately
      const currentLevel = state.pl.hustleLevels['h_global_conglomerate'] || 1;
      const hustle = HUSTLES['h_global_conglomerate'];
      const levelData = hustle?.levels?.find(l => l.level === currentLevel) || { passiveYield: 2500000 };
      const basePassive = levelData.passiveYield || 0;

      const divisions = ['na_tech', 'eu_mfg', 'apac_retail', 'latam_log'];
      let totalPassive = 0;
      divisions.forEach(id => {
        const activeCeo = ceos[id];
        const baseShare = basePassive / 4;
        let mult = 0.5;
        if (activeCeo) {
          const compMult = 0.5 + (activeCeo.competence / 100) * 1.0;
          const loyMult = 0.8 + (activeCeo.loyalty / 100) * 0.2;
          const riskMult = 1.0 + (activeCeo.riskTolerance / 100) * 0.5;
          mult = compMult * loyMult * riskMult;
        }
        totalPassive += Math.floor(baseShare * mult);
      });

      const dynamicPassives = {
        ...(state.pl.dynamicPassives || {}),
        'h_global_conglomerate': totalPassive
      };

      let updatedBiography = [...(state.pl.biography || [])];
      let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];
      const bioUpdate = Bio.recordCEOAppointment(state.pl, member.name, divisionId);
      if (bioUpdate) {
        updatedBiography.push(bioUpdate.entry);
        updatedRecordedBioKeys.push(bioUpdate.key!);
      }

      return {
        pl: enforceStatCaps({
          ...state.pl,
          conglomerateCEOs: ceos,
          conglomerateCandidates: updatedCandidates,
          dynamicPassives,
          biography: updatedBiography,
          recordedBioKeys: updatedRecordedBioKeys
        })
      };
    });
  },

  fireConglomerateCEO: (divisionId) => {
    set((state) => {
      const ceos = { ...(state.pl.conglomerateCEOs || {}) };
      const currentCandidatePool = [...(state.pl.conglomerateCandidates || [])];

      const previousCEO = ceos[divisionId];
      if (!previousCEO) return {};

      // Remove division assignment and return to candidates
      const returnedCEO = { ...previousCEO };
      delete returnedCEO.assignedDivision;
      const updatedCandidates = [...currentCandidatePool, returnedCEO];

      delete ceos[divisionId];

      // Re-calculate new conglomerate passive yield
      const currentLevel = state.pl.hustleLevels['h_global_conglomerate'] || 1;
      const hustle = HUSTLES['h_global_conglomerate'];
      const levelData = hustle?.levels?.find(l => l.level === currentLevel) || { passiveYield: 2500000 };
      const basePassive = levelData.passiveYield || 0;

      const divisions = ['na_tech', 'eu_mfg', 'apac_retail', 'latam_log'];
      let totalPassive = 0;
      divisions.forEach(id => {
        const activeCeo = ceos[id];
        const baseShare = basePassive / 4;
        let mult = 0.5;
        if (activeCeo) {
          const compMult = 0.5 + (activeCeo.competence / 100) * 1.0;
          const loyMult = 0.8 + (activeCeo.loyalty / 100) * 0.2;
          const riskMult = 1.0 + (activeCeo.riskTolerance / 100) * 0.5;
          mult = compMult * loyMult * riskMult;
        }
        totalPassive += Math.floor(baseShare * mult);
      });

      const dynamicPassives = {
        ...(state.pl.dynamicPassives || {}),
        'h_global_conglomerate': totalPassive
      };

      return {
        pl: enforceStatCaps({
          ...state.pl,
          conglomerateCEOs: ceos,
          conglomerateCandidates: updatedCandidates,
          dynamicPassives
        })
      };
    });
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

    const getTierAvatar = (tierName: string): string => {
      const pools: Record<string, string[]> = {
        LOCAL: ['🎤', '🧢', '🎧', '🎸'],
        REGIONAL: ['🥷', '🕶️', '🔥', '🕷️', '🦊'],
        GLOBAL: ['👑', '🌟', '💎', '🚀', '🔮']
      };
      const pool = pools[tierName.toUpperCase()] || pools.LOCAL;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const candidatesCount = 3;
    const candidates: RecordLabelArtist[] = [];

    for (let i = 0; i < candidatesCount; i++) {
      const tierAvatar = getTierAvatar(tier);
      const npcProfile = generateGlobalNPC('CREATOR', undefined, tierAvatar);

      const candidateArtist: RecordLabelArtist = {
        id: npcProfile.id,
        name: npcProfile.name,
        avatar: npcProfile.avatar,
        contractMonthsLeft: 120,
        monthlyRetainer: Math.floor(royalty * 0.2),
        monthlyRevenue: Math.floor(royalty * 1.2),
        hypeFactor: 1.0,
        isTargetedByRival: false,
        tier,
        royaltyRate: royalty,
        monthsActive: 0,
        hasReleased: false,
        status: 'IN STUDIO',
      };
      candidates.push(candidateArtist);
    }

    const plFinal = enforceStatCaps({
      ...plAfterCost,
      scoutedTalentPool: candidates
    });

    set({
      pl: plFinal,
      news: [`🔍 Scouting successful: Found ${candidatesCount} candidates in the talent pool!`, ...state.news.slice(0, 49)]
    });

    return { success: true, artist: candidates[0], message: 'Success' };
  },

  signScoutedArtist: (artistId) => {
    const state = get();
    const artist = state.pl.scoutedTalentPool.find(a => a.id === artistId);
    if (!artist) return;

    if (state.pl.artists.length >= 10) {
      if (typeof alert !== 'undefined') {
        alert('Maximum 10 artists allowed in roster');
      }
      return;
    }

    // Persist this character to the global NPC database so they exist in world history
    const persistentArtistNPC: PersistentNPC = {
      id: artist.id,
      name: artist.name,
      avatar: artist.avatar,
      reputation: 50,
      disposition: 50,
      currentRole: 'CREATOR',
      interactionLog: ['SCOUTED_BY_PLAYER'],
      originAge: state.pl.month,
      originHustleId: 'music_label_studio',
      currentHustleId: 'music_label_studio'
    };

    const currentNpcs = state.pl.npcs || [];
    const alreadyExists = currentNpcs.some(n => n.id === persistentArtistNPC.id);
    const updatedNpcs = alreadyExists ? currentNpcs : [
      ...currentNpcs,
      persistentArtistNPC
    ];

    const isFirstEmployee = state.pl.artists.length === 0;
    let plFinalArtist = enforceStatCaps({
      ...state.pl,
      artists: [...state.pl.artists, artist],
      scoutedTalentPool: [], // Clear unpicked candidates
      npcs: updatedNpcs,
    });

    if (isFirstEmployee) {
      plFinalArtist = processWorldReaction(plFinalArtist, 'FIRST_EMPLOYEE', { hustleName: 'Record Label' }).updatedPl;
    }

    const bioUpdate = Bio.recordArtistSigning(plFinalArtist, artist.name, artist.tier);
    if (bioUpdate) {
      plFinalArtist = {
        ...plFinalArtist,
        biography: [...(plFinalArtist.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(plFinalArtist.recordedBioKeys || []), bioUpdate.key!]
      };
    }

    set({
      pl: plFinalArtist,
      news: [`🎤 SUCCESS! Signed ${artist.tier} artist: ${artist.name}`, ...state.news.slice(0, 49)]
    });

    get().logEvent('INVESTMENT_MADE', { type: 'ARTIST_SCOUT', tier: artist.tier, artistName: artist.name, cost: 0 });
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

  acceptAmbition: (id) => {
    const state = get();
    const ambitions = state.pl.ambitions || [];
    const updated = ambitions.map(a => a.id === id ? { ...a, status: 'ACTIVE' as const } : a);
    const target = updated.find(a => a.id === id);
    const name = target ? target.title : id;

    set({
      pl: enforceStatCaps({
        ...state.pl,
        ambitions: updated
      }),
      news: [{ text: `🎯 Ambition Accepted: "${name}". Let's chase it!`, colorClass: 'text-emerald-400 font-bold' }, ...state.news.slice(0, 49)]
    });
  },

  ignoreAmbition: (id) => {
    const state = get();
    const ambitions = state.pl.ambitions || [];
    const updated = ambitions.map(a => a.id === id ? { ...a, status: 'IGNORED' as const } : a);
    const target = updated.find(a => a.id === id);
    const name = target ? target.title : id;

    set({
      pl: enforceStatCaps({
        ...state.pl,
        ambitions: updated
      }),
      news: [{ text: `🚫 Ambition Ignored: "${name}".`, colorClass: 'text-slate-400' }, ...state.news.slice(0, 49)]
    });
  },

  replaceAmbition: (id, withId) => {
    const state = get();
    const ambitions = state.pl.ambitions || [];
    const updated = ambitions.map(a => {
      if (a.id === id) {
        return { ...a, status: 'IGNORED' as const };
      }
      if (a.id === withId) {
        return { ...a, status: 'ACTIVE' as const };
      }
      return a;
    });

    const oldAmb = ambitions.find(a => a.id === id);
    const newAmb = ambitions.find(a => a.id === withId);
    const oldName = oldAmb ? oldAmb.title : id;
    const newName = newAmb ? newAmb.title : withId;

    set({
      pl: enforceStatCaps({
        ...state.pl,
        ambitions: updated
      }),
      news: [{ text: `🔄 Ambition Replaced: "${oldName}" with "${newName}".`, colorClass: 'text-blue-400 font-bold' }, ...state.news.slice(0, 49)]
    });
  },
});
