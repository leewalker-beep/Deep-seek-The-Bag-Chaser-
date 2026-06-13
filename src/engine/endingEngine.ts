import type { PlayerStats } from '../types/game';

export interface Ending {
  id: string;
  title: string;
  description: string;
  requirement: string;
  colorClass: string;
}

export const ENDINGS: Record<string, Ending> = {
  // Balanced Endings
  WORLD_MOGUL: {
    id: 'WORLD_MOGUL',
    title: 'World Mogul',
    description: 'You balanced power, respect, and mystique to build a global empire that will last generations.',
    requirement: 'Balanced stats + High Legacy',
    colorClass: 'text-emerald-400',
  },
  // Clout-Heavy Endings
  MEDIA_TYCOON: {
    id: 'MEDIA_TYCOON',
    title: 'Media Tycoon',
    description: 'The world knows your name. You own the narrative, the screens, and the minds of billions.',
    requirement: 'Max Clout',
    colorClass: 'text-blue-400',
  },
  CLOUT_GURU: {
    id: 'CLOUT_GURU',
    title: 'The Influence Guru',
    description: 'You became more than a person; you became a brand. Your every word shifts markets.',
    requirement: 'High Clout + High Legacy',
    colorClass: 'text-cyan-400',
  },
  SCRAP_KING: {
    id: 'SCRAP_KING',
    title: 'Scrap King',
    description: 'You started in the mud and stayed there. But you own all the metal.',
    requirement: 'Low Cash + High Total Hustles',
    colorClass: 'text-zinc-500',
  },
  // Aura-Heavy Endings
  THE_GHOST: {
    id: 'THE_GHOST',
    title: 'The Ghost',
    description: 'You disappeared into the shadows, a mythic figure whose influence is felt but never seen.',
    requirement: 'Max Aura',
    colorClass: 'text-purple-400',
  },
  STREET_LEGEND: {
    id: 'STREET_LEGEND',
    title: 'Street Legend',
    description: 'The concrete jungle remembers you. A story told in whispers by those still in the mud.',
    requirement: 'High Aura + Low Cash',
    colorClass: 'text-indigo-400',
  },
  // Heat-Heavy Endings
  PRISON_EMPIRE: {
    id: 'PRISON_EMPIRE',
    title: 'Prison Empire',
    description: 'You flew too close to the sun. Now you run the yard instead of the boardroom.',
    requirement: 'High Heat at death',
    colorClass: 'text-orange-600',
  },
  CORPORATE_RAIDER: {
    id: 'CORPORATE_RAIDER',
    title: 'Corporate Raider',
    description: 'You dismantled giants and left only scorched earth and full bank accounts.',
    requirement: 'High Cash + High Heat',
    colorClass: 'text-red-500',
  },
  // Money-Heavy Endings
  SILENT_PARTNER: {
    id: 'SILENT_PARTNER',
    title: 'The Silent Partner',
    description: 'You own everything, but no one knows it. The ultimate victory of capital over ego.',
    requirement: 'High Passive Income + Low Clout',
    colorClass: 'text-slate-300',
  },
  TREASURE_HOARDER: {
    id: 'TREASURE_HOARDER',
    title: 'Treasure Hoarder',
    description: 'The bag is full, but the heart is empty. You died on a pile of gold you never spent.',
    requirement: 'Max Cash + Low Legacy',
    colorClass: 'text-yellow-600',
  },
  // Special Endings
  PRESIDENT_FOR_LIFE: {
    id: 'PRESIDENT_FOR_LIFE',
    title: 'President for Life',
    description: 'You didn\'t just win the election; you changed the game. The ultimate legacy.',
    requirement: 'Completed President Campaign',
    colorClass: 'text-yellow-400',
  },
  PHILANTHROPIST: {
    id: 'PHILANTHROPIST',
    title: 'The Great Provider',
    description: 'You gave it all back. Your name is on hospitals, libraries, and the hearts of the people.',
    requirement: 'Max Legacy + Low Final Cash',
    colorClass: 'text-emerald-500',
  },
  ASCENDED_BEING: {
    id: 'ASCENDED_BEING',
    title: 'Ascended Being',
    description: 'You surpassed the need for material wealth or social status. You just... are.',
    requirement: 'Balanced Stats + Max Everything',
    colorClass: 'text-white shadow-[0_0_20px_rgba(255,255,255,0.8)]',
  },
};

export const calculateEnding = (state: PlayerStats): Ending => {
  const { clout, aura, bag, heat, legacyPoints = 0, campaignStage = 0 } = state;

  if (campaignStage >= 7) return ENDINGS.PRESIDENT_FOR_LIFE;
  if (clout > 5000 && aura > 5000 && bag > 1000000000) return ENDINGS.ASCENDED_BEING;
  if (heat >= 90) return ENDINGS.PRISON_EMPIRE;
  if (legacyPoints > 5000 && bag < 100000) return ENDINGS.PHILANTHROPIST;
  if (bag < 1000 && (state.stats?.totalHustles || 0) > 10) return ENDINGS.SCRAP_KING;

  if (clout > aura * 2) {
    return legacyPoints > 2000 ? ENDINGS.CLOUT_GURU : ENDINGS.MEDIA_TYCOON;
  }
  if (aura > clout * 2) {
    return bag < 1000000 ? ENDINGS.STREET_LEGEND : ENDINGS.THE_GHOST;
  }

  if (bag > 500000000) {
    return heat > 50 ? ENDINGS.CORPORATE_RAIDER : ENDINGS.TREASURE_HOARDER;
  }

  if (clout < 100 && aura < 100 && bag > 100000000) return ENDINGS.SILENT_PARTNER;

  return ENDINGS.WORLD_MOGUL;
};
