import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../config/hustles/base';

/**
 * Registry of all approved minigame IDs implemented and handled in App.tsx / GameViewport.
 */
const APPROVED_MINIGAME_IDS = new Set([
  'SwipeOrder',
  'FestivalCrowdSurge',
  'CryptoMineRush',
  'PodcastFlowState',
  'SwipeUpViral',
  'ContentCreation',
  'SwipeAuthentic',
  'BeatSequence',
  'TechRepairDrag',
  'WordTap',
  'PinchToInspect',
  'TapRhythm',
  'DragScale',
  'TapAssign',
  'HoldHype',
  'ShakeToInfluence',
  'PinchToZoom',
  'CryptoLeverage',
  'SlotMachine',
  'BioFeedbackRetreat',
  'HigherLower',
  'Blackjack',
  'Roulette',
  'DiceCraps',
  'QuickReaction',
  'StruggleMash',
  'LaborBuild',
  'TrafficDodge',
  'PlasmaDonation',
  'GhostTap',
  'GhostMode',
  'StreetEats',
  'FamilyDeli',
  'ScoopThePoop',
  'PatternMemory',
  'SequenceRecall',
  'StreetwearDesign',
  'StreetwearMatch',
  'HashtagTap',
  'RunnerRoute',
  'MemeCoinPump',
  'EcomCatch',
  'TapApprove',
  'DragMerge',
  'BalanceScale',
  'ReactionGrid',
  'RiskMeter',
  'RotateToScale',
  'MarketPredictor',
  'VCPitchRoom',
  'ShakeForHype',
  'PresidentialCampaign',
  'BoardroomBattle',
  'MagneticSweep',
  'CaptchaDrone',
  'CAPTCHA_GAME',
  'ClickbaitGame',
  'CLICKBAIT_GAME',
  'ReadTheRoom',
  'CodeBreaker',
  'SignSpinner',
  'SIGN_SPINNER_GAME',
  'ReviewFarm',
  'REVIEW_FARM_GAME',
  'ConcertJam',
  'CONCERT_JAM_GAME'
]);

/**
 * Registry of all approved panelTypes implemented in App.tsx.
 */
const APPROVED_PANEL_TYPES = new Set([
  'REST',
  'MUSIC_PRODUCTION',
  'STREETWEAR',
  'FESTIVAL',
  'DATA_ANALYTICS',
  'CRYPTO_MINING',
  'VA_AGENCY',
  'REAL_ESTATE',
  'GLOBAL_CONGLOMERATE',
  'VENTURE_CAPITAL',
  'FILM_STUDIO',
  'FUND_MOVIE',
  'MARRY_CELEBRITY',
  'SPACE_INVESTMENT',
  'PHILANTHROPY',
  'PRESIDENT_CAMPAIGN',
  'CAPTCHA_GAME',
  'CLICKBAIT_GAME',
  'SIGN_SPINNER_GAME',
  'REVIEW_FARM_GAME',
  'CONCERT_JAM_GAME',
  'TALENT_AGENT_GAME'
]);

describe('Minigame and Panel Registry Integrity', () => {
  it('ensures every configured hustle miniGame resolves to an approved playable minigame component', () => {
    const unapprovedMinigames: { hustleId: string; miniGame: string }[] = [];

    Object.values(HUSTLES).forEach(hustle => {
      if (hustle.miniGame && !APPROVED_MINIGAME_IDS.has(hustle.miniGame)) {
        unapprovedMinigames.push({ hustleId: hustle.id, miniGame: hustle.miniGame });
      }

      if (hustle.branches) {
        Object.values(hustle.branches).forEach(branch => {
          if (branch.miniGame && !APPROVED_MINIGAME_IDS.has(branch.miniGame)) {
            unapprovedMinigames.push({ hustleId: `${hustle.id}:${branch.id}`, miniGame: branch.miniGame });
          }
        });
      }

      if (hustle.levels) {
        hustle.levels.forEach(level => {
          if (level.miniGame && !APPROVED_MINIGAME_IDS.has(level.miniGame)) {
            unapprovedMinigames.push({ hustleId: `${hustle.id}:lvl${level.level}`, miniGame: level.miniGame });
          }
        });
      }
    });

    expect(
      unapprovedMinigames,
      `Unapproved or unknown minigames configured in HUSTLES: ${JSON.stringify(unapprovedMinigames)}`
    ).toEqual([]);
  });

  it('ensures every configured hustle with hasPanel resolves to an approved panelType', () => {
    const unapprovedPanels: { hustleId: string; panelType?: string }[] = [];

    Object.values(HUSTLES).forEach(hustle => {
      if (hustle.hasPanel) {
        if (!hustle.panelType || !APPROVED_PANEL_TYPES.has(hustle.panelType)) {
          unapprovedPanels.push({ hustleId: hustle.id, panelType: hustle.panelType });
        }
      }
    });

    expect(
      unapprovedPanels,
      `Hustles with hasPanel having missing or unapproved panelType: ${JSON.stringify(unapprovedPanels)}`
    ).toEqual([]);
  });

  it('fails if a future configuration references an unknown minigame ID or panelType', () => {
    const testHustleWithFakeMinigame = {
      miniGame: 'NonExistentMinigame_XYZ'
    };

    expect(APPROVED_MINIGAME_IDS.has(testHustleWithFakeMinigame.miniGame)).toBe(false);

    const testHustleWithFakePanel = {
      hasPanel: true,
      panelType: 'NON_EXISTENT_PANEL'
    };

    expect(APPROVED_PANEL_TYPES.has(testHustleWithFakePanel.panelType)).toBe(false);
  });
});
