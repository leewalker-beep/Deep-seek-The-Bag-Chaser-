import type { StateCreator } from 'zustand';
import type { GameState, PlayerStats, RecordLabelArtist, PersistentNPC, RegionalExecutive, FinancialDebt } from '../../types/game';
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
  collapseFounderCompany: (founderId: string) => void;
  lapseRolodexRelationship: (celebrityId: string) => void;
  unlockLegacyUpgrade: (upgradeId: string) => void;
  updatePl: (updates: Partial<PlayerStats>) => void;
  acceptAmbition: (id: string) => void;
  ignoreAmbition: (id: string) => void;
  replaceAmbition: (id: string, withId: string) => void;
  takeLoan: (loanType: 'STUDENT' | 'EMERGENCY' | 'EQUIPMENT' | 'BUSINESS' | 'MORTGAGE') => boolean;
  repayLoan: (loanId: string) => boolean;
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

      let loyaltyPenaltyIncrement = 0;
      if (previousCEO) {
        const dismissBio = Bio.recordCEODismissal(state.pl, previousCEO.name, divisionId);
        if (dismissBio) {
          updatedBiography.push(dismissBio.entry);
          updatedRecordedBioKeys.push(dismissBio.key!);
        }
        if (previousCEO.competence >= 70 || previousCEO.loyalty >= 70) {
          loyaltyPenaltyIncrement = 15;
        }
      }

      const bioUpdate = Bio.recordCEOAppointment(state.pl, member.name, divisionId);
      if (bioUpdate) {
        updatedBiography.push(bioUpdate.entry);
        updatedRecordedBioKeys.push(bioUpdate.key!);
      }

      const updatedNarrativeFlags = {
        ...(state.pl.narrativeFlags || {}),
        reputationLoyaltyPenalty: (Number(state.pl.narrativeFlags?.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement
      };

      return {
        pl: enforceStatCaps({
          ...state.pl,
          conglomerateCEOs: ceos,
          conglomerateCandidates: updatedCandidates,
          dynamicPassives,
          biography: updatedBiography,
          recordedBioKeys: updatedRecordedBioKeys,
          narrativeFlags: updatedNarrativeFlags
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

      let updatedBiography = [...(state.pl.biography || [])];
      let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];
      const dismissBio = Bio.recordCEODismissal(state.pl, previousCEO.name, divisionId);
      if (dismissBio) {
        updatedBiography.push(dismissBio.entry);
        updatedRecordedBioKeys.push(dismissBio.key!);
      }

      let loyaltyPenaltyIncrement = 0;
      if (previousCEO.competence >= 70 || previousCEO.loyalty >= 70) {
        loyaltyPenaltyIncrement = 15;
      }

      const updatedNarrativeFlags = {
        ...(state.pl.narrativeFlags || {}),
        reputationLoyaltyPenalty: (Number(state.pl.narrativeFlags?.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement
      };

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
          dynamicPassives,
          biography: updatedBiography,
          recordedBioKeys: updatedRecordedBioKeys,
          narrativeFlags: updatedNarrativeFlags
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

    let updatedBiography = [...(state.pl.biography || [])];
    let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];
    const bioUpdate = Bio.recordArtistDropped(state.pl, artist.name);
    if (bioUpdate) {
      updatedBiography.push(bioUpdate.entry);
      updatedRecordedBioKeys.push(bioUpdate.key!);
    }

    let loyaltyPenaltyIncrement = 0;
    const isLongTenured = (artist.contractMonthsLeft !== undefined) && (artist.contractMonthsLeft <= 108);
    const isHighPerforming = (artist.royaltyRate !== undefined && artist.royaltyRate >= 40) || artist.isGrammyWinner;
    if (isLongTenured || isHighPerforming) {
      loyaltyPenaltyIncrement = 15;
    }

    const updatedNarrativeFlags = {
      ...(state.pl.narrativeFlags || {}),
      reputationLoyaltyPenalty: (Number(state.pl.narrativeFlags?.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement
    };

    set({
      pl: enforceStatCaps({
        ...state.pl,
        artists: state.pl.artists.filter(a => a.id !== artistId),
        biography: updatedBiography,
        recordedBioKeys: updatedRecordedBioKeys,
        narrativeFlags: updatedNarrativeFlags
      }),
      news: [`📉 Dropped artist: ${artist.name}`, ...state.news.slice(0, 49)]
    });
  },

  collapseFounderCompany: (founderId) => {
    const state = get();
    const founder = state.pl.foundersBacked?.find(f => f.id === founderId);
    if (!founder) return;

    let updatedBiography = [...(state.pl.biography || [])];
    let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];
    const bioUpdate = Bio.recordFounderCollapse(state.pl, founder.name, founder.companyName);
    if (bioUpdate) {
      updatedBiography.push(bioUpdate.entry);
      updatedRecordedBioKeys.push(bioUpdate.key!);
    }

    let loyaltyPenaltyIncrement = 0;
    const isHighPerforming = (founder.stats?.burnDiscipline !== undefined && founder.stats.burnDiscipline >= 70) ||
      (founder.stats?.execution !== undefined && founder.stats.execution >= 70) ||
      (founder.stats?.vision !== undefined && founder.stats.vision >= 70);

    if (isHighPerforming) {
      loyaltyPenaltyIncrement = 15;
    }

    const updatedNarrativeFlags = {
      ...(state.pl.narrativeFlags || {}),
      reputationLoyaltyPenalty: (Number(state.pl.narrativeFlags?.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement
    };

    set({
      pl: enforceStatCaps({
        ...state.pl,
        foundersBacked: (state.pl.foundersBacked || []).filter(f => f.id !== founderId),
        biography: updatedBiography,
        recordedBioKeys: updatedRecordedBioKeys,
        narrativeFlags: updatedNarrativeFlags
      }),
      news: [`🚨 COLLAPSE: ${founder.companyName} went bankrupt under ${founder.name}!`, ...state.news.slice(0, 49)]
    });
  },

  lapseRolodexRelationship: (celebrityId) => {
    const state = get();
    const celebrity = state.pl.rolodex?.find(c => c.id === celebrityId);
    if (!celebrity) return;

    let updatedBiography = [...(state.pl.biography || [])];
    let updatedRecordedBioKeys = [...(state.pl.recordedBioKeys || [])];
    const bioUpdate = Bio.recordRolodexLapse(state.pl, celebrity.name);
    if (bioUpdate) {
      updatedBiography.push(bioUpdate.entry);
      updatedRecordedBioKeys.push(bioUpdate.key!);
    }

    let loyaltyPenaltyIncrement = 0;
    const isHighPerforming = (celebrity.relationshipScore !== undefined && celebrity.relationshipScore >= 75);
    if (isHighPerforming) {
      loyaltyPenaltyIncrement = 15;
    }

    const updatedNarrativeFlags = {
      ...(state.pl.narrativeFlags || {}),
      reputationLoyaltyPenalty: (Number(state.pl.narrativeFlags?.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement
    };

    set({
      pl: enforceStatCaps({
        ...state.pl,
        rolodex: (state.pl.rolodex || []).filter(c => c.id !== celebrityId),
        biography: updatedBiography,
        recordedBioKeys: updatedRecordedBioKeys,
        narrativeFlags: updatedNarrativeFlags
      }),
      news: [`❄️ COLD: Your relationship with ${celebrity.name} has ended.`, ...state.news.slice(0, 49)]
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

  takeLoan: (loanType) => {
    const state = get();
    const pl = state.pl;

    const config = {
      STUDENT: { principal: 15000, interestRate: 0.04, term: 24, minTier: 'MUD' },
      EMERGENCY: { principal: 10000, interestRate: 0.15, term: 6, minTier: 'MUD' },
      EQUIPMENT: { principal: 75000, interestRate: 0.08, term: 18, minTier: 'STREET' },
      BUSINESS: { principal: 500000, interestRate: 0.06, term: 36, minTier: 'STARTUP' },
      MORTGAGE: { principal: 2500000, interestRate: 0.05, term: 60, minTier: 'CORPORATE' }
    };

    const loan = config[loanType];
    if (!loan) return false;

    const tierHierarchy = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];
    const plTierIndex = tierHierarchy.indexOf(pl.currentTier);
    const requiredTierIndex = tierHierarchy.indexOf(loan.minTier);

    if (plTierIndex < requiredTierIndex) {
      set({
        news: [{ text: `🚫 LOAN DENIED: Reaching ${loan.minTier} tier is required to access ${loanType} financing.`, colorClass: 'text-red-400' }, ...state.news.slice(0, 49)]
      });
      return false;
    }

    const currentDebts = pl.financialDebts || [];
    if (currentDebts.length >= 3) {
      set({
        news: [{ text: `🚫 LOAN DENIED: Debt ceiling reached (Maximum 3 active loans allowed simultaneously).`, colorClass: 'text-red-400' }, ...state.news.slice(0, 49)]
      });
      return false;
    }

    const monthlyPayment = Math.round((loan.principal * (1 + loan.interestRate)) / loan.term);

    const newDebt: FinancialDebt = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      loanType,
      principal: loan.principal,
      interestRate: loan.interestRate,
      remainingTerm: loan.term,
      monthlyPayment,
      totalTerm: loan.term
    };

    const plUpdated = enforceStatCaps({
      ...pl,
      bag: pl.bag + loan.principal,
      financialDebts: [...currentDebts, newDebt]
    });

    set({
      pl: plUpdated,
      news: [{ text: `🏦 LOAN SECURED: Borrowed $${loan.principal.toLocaleString()} via ${loanType} loan. Monthly Payment: -$${monthlyPayment.toLocaleString()}/mo.`, colorClass: 'text-emerald-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    return true;
  },

  repayLoan: (loanId) => {
    const state = get();
    const pl = state.pl;
    const debts = pl.financialDebts || [];
    const targetDebt = debts.find(d => d.id === loanId);
    if (!targetDebt) return false;

    const payoffCost = targetDebt.monthlyPayment * targetDebt.remainingTerm;
    if (pl.bag < payoffCost) {
      set({
        news: [{ text: `🚫 REPAYMENT DENIED: Insufficient cash ($${pl.bag.toLocaleString()}) to cover the total early payoff cost ($${payoffCost.toLocaleString()}).`, colorClass: 'text-red-400' }, ...state.news.slice(0, 49)]
      });
      return false;
    }

    const plUpdated = enforceStatCaps({
      ...pl,
      bag: pl.bag - payoffCost,
      financialDebts: debts.filter(d => d.id !== loanId)
    });

    set({
      pl: plUpdated,
      news: [{ text: `🎉 LOAN REPAID: Fully retired your ${targetDebt.loanType} loan early for $${payoffCost.toLocaleString()}!`, colorClass: 'text-emerald-400 font-bold' }, ...state.news.slice(0, 49)]
    });

    return true;
  },
});
