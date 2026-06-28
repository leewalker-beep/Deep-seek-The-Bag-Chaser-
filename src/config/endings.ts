export interface Ending {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: {
    legacyMin: number;
    legacyMax: number;
    dominantStat: 'clout' | 'aura' | 'heat' | 'balanced';
  };
}

export const ENDINGS: Ending[] = [
  // Low Legacy (0-999)
  { id: 'forgotten_clout', title: 'The Forgotten', description: 'You made money, but no one remembers your name. The empire crumbled within a generation.', emoji: '💸', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'clout' } },
  { id: 'forgotten_aura', title: 'The Ghost', description: 'You vanished without a trace. No statues. No stories. Nothing.', emoji: '👻', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'aura' } },
  { id: 'forgotten_heat', title: 'The Cautionary Tale', description: 'They tell stories about you... as a warning.', emoji: '⚠️', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'heat' } },
  { id: 'forgotten_balanced', title: 'The Average', description: 'You played it safe your whole life. Nobody noticed when you were gone.', emoji: '📦', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'balanced' } },

  // Medium Legacy (1000-4999)
  { id: 'local_clout', title: 'The Kingmaker', description: 'Your hometown built a statue. Local politicians seek your endorsement.', emoji: '🗳️', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'clout' } },
  { id: 'local_aura', title: 'The Beloved', description: 'They sing songs about you at the local tavern.', emoji: '🎵', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'aura' } },
  { id: 'local_heat', title: 'The Boss', description: 'They fear you. They respect you. They never cross you.', emoji: '😤', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'heat' } },
  { id: 'local_balanced', title: 'The Mayor', description: 'The community pillar. The solid citizen. Comfortable. Forgettable.', emoji: '🏛️', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'balanced' } },

  // High Legacy (5000-9999)
  { id: 'icon_clout', title: 'The Networker', description: 'Your contact list is a who\'s who of global power.', emoji: '🤝', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'clout' } },
  { id: 'icon_aura', title: 'The Visionary', description: 'They study your philosophy in schools.', emoji: '🎓', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'aura' } },
  { id: 'icon_heat', title: 'The Disruptor', description: 'You burned it all down and built something new.', emoji: '🔥', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'heat' } },
  { id: 'icon_balanced', title: 'The Titan', description: 'You had it all and played every angle. History books give you a paragraph.', emoji: '⚡', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'balanced' } },

  // Legendary Legacy (10000+)
  { id: 'immortal_clout', title: 'The Oracle', description: 'Every leader seeks your counsel. You shaped the world.', emoji: '🔮', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'clout' } },
  { id: 'immortal_aura', title: 'The Divine', description: 'They built temples in your honor.', emoji: '🕌', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'aura' } },
  { id: 'immortal_heat', title: 'The Godfather', description: 'Everyone answers to you. Even in death.', emoji: '🐍', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'heat' } },
  { id: 'immortal_balanced', title: 'The Legend', description: "You mastered everything. Bag, rep, power, soul. They'll be talking about you for a century.", emoji: '👑', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'balanced' } },
];

export const getEnding = (legacyPoints: number, dominantStat: string): Ending => {
  const found = ENDINGS.find(e =>
    legacyPoints >= e.requirement.legacyMin &&
    legacyPoints <= e.requirement.legacyMax &&
    e.requirement.dominantStat === dominantStat
  );
  return found || ENDINGS[0];
};
