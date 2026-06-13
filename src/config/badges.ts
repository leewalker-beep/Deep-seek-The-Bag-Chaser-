import type { Badge } from '../types/game';

export const HUSTLE_BADGES: Record<string, Badge> = {
  r_labor: {
    id: 'badge_labor',
    hustleId: 'r_labor',
    name: 'Land King',
    description: 'Flip 50 properties. Or just one really big one.',
    icon: '🏢',
    buff: { type: 'yield', value: 1.10 }
  },
  r_delivery: {
    id: 'badge_delivery',
    hustleId: 'r_delivery',
    name: 'Speed Demon',
    description: 'Every red light is just a suggestion.',
    icon: '🛵',
    buff: { type: 'yield', value: 1.05 }
  },
  r_plasma: {
    id: 'badge_plasma',
    hustleId: 'r_plasma',
    name: 'Essence Merchant',
    description: 'You are literally made of money. Sort of.',
    icon: '🩸',
    buff: { type: 'mental', value: 0.90 } // 10% less mental hit
  },
  r_vending: {
    id: 'badge_vending',
    hustleId: 'r_vending',
    name: 'Snack Sovereign',
    description: 'Owned every machine in the tri-state area.',
    icon: '🥤',
    buff: { type: 'yield', value: 1.05 }
  },
  r_ghost_mode: {
    id: 'badge_ghost',
    hustleId: 'r_ghost_mode',
    name: 'Untouchable',
    description: 'If they can\'t see you, they can\'t tax you.',
    icon: '👻',
    buff: { type: 'heat', value: 0.80 } // 20% less heat
  },
  r_scrap: {
    id: 'badge_scrap',
    hustleId: 'r_scrap',
    name: 'Magnet Master',
    description: 'Found 10 rare metals and 10,000 rusty nails.',
    icon: '🔧',
    buff: { type: 'yield', value: 1.15 }
  },
  r_flyers: {
    id: 'badge_flyers',
    hustleId: 'r_flyers',
    name: 'Paper Storm',
    description: 'Littering? No, I call it aggressive marketing.',
    icon: '📄',
    buff: { type: 'clout', value: 1.10 }
  },
  street_eats: {
    id: 'badge_eats',
    hustleId: 'street_eats',
    name: 'Taco Titan',
    description: 'Served 10,000 customers. Only 2 cases of food poisoning!',
    icon: '🌮',
    buff: { type: 'yield', value: 1.10 }
  },
  cc: {
    id: 'badge_cc',
    hustleId: 'cc',
    name: 'Viral Lord',
    description: 'The algorithm is your puppet.',
    icon: '📱',
    buff: { type: 'clout', value: 1.15 }
  },
  pod: {
    id: 'badge_pod',
    hustleId: 'pod',
    name: 'Voice of Reason',
    description: 'Talking for 4 hours straight actually pays off.',
    icon: '🎙️',
    buff: { type: 'clout', value: 1.10 }
  },
  drop: {
    id: 'badge_drop',
    hustleId: 'drop',
    name: 'Supply Chain God',
    description: 'Shipping air from China at a 400% markup.',
    icon: '📦',
    buff: { type: 'yield', value: 1.10 }
  },
  vintage: {
    id: 'badge_vintage',
    hustleId: 'vintage',
    name: 'Archival Ace',
    description: 'That\'s not a stain, it\'s "character".',
    icon: '🧥',
    buff: { type: 'aura', value: 1.10 }
  },
  techFlip: {
    id: 'badge_tech',
    hustleId: 'techFlip',
    name: 'Silicon Surfer',
    description: 'Reach $1M revenue from tech flipping.',
    icon: '💻',
    buff: { type: 'yield', value: 1.10 }
  },
  audio: {
    id: 'badge_audio',
    hustleId: 'audio',
    name: 'Platinum Producer',
    description: 'Win 5 Grammys. Or just buy them.',
    icon: '🎹',
    buff: { type: 'clout', value: 1.15 }
  },
  sw: {
    id: 'badge_sw',
    hustleId: 'sw',
    name: 'Hype Beast',
    description: 'You sold a plain white tee for $500. Legend.',
    icon: '👕',
    buff: { type: 'aura', value: 1.15 }
  },
  saas_mvp: {
    id: 'badge_saas',
    hustleId: 'saas_mvp',
    name: 'Code Crusader',
    description: 'Fixed one bug, created ten more. Scaled anyway.',
    icon: '💻',
    buff: { type: 'yield', value: 1.10 }
  },
  global_franchise: {
    id: 'badge_franchise',
    hustleId: 'global_franchise',
    name: 'Golden Arches',
    description: 'The sun never sets on your burger empire.',
    icon: '🍔',
    buff: { type: 'yield', value: 1.10 }
  }
};
