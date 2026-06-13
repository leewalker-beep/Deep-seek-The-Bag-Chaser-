export interface Ending {
  id: string;
  title: string;
  description: string;
  requirement: {
    legacyMin: number;
    legacyMax: number;
    dominantStat: 'clout' | 'aura' | 'heat' | 'balanced';
  };
}

export const ENDINGS: Ending[] = [
  // Low Legacy (0-999)
  { id: 'forgotten_clout', title: 'The Forgotten', description: 'You made money, but no one remembers your name. The empire crumbled within a generation.', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'clout' } },
  { id: 'forgotten_aura', title: 'The Ghost', description: 'You vanished without a trace. No statues. No stories. Nothing.', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'aura' } },
  { id: 'forgotten_heat', title: 'The Cautionary Tale', description: 'They tell stories about you... as a warning.', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'heat' } },
  { id: 'forgotten_balanced', title: 'The Average', description: 'You lived, you died, you were average.', requirement: { legacyMin: 0, legacyMax: 999, dominantStat: 'balanced' } },

  // Medium Legacy (1000-4999)
  { id: 'local_clout', title: 'The Kingmaker', description: 'Your hometown built a statue. Local politicians seek your endorsement.', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'clout' } },
  { id: 'local_aura', title: 'The Beloved', description: 'They sing songs about you at the local tavern.', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'aura' } },
  { id: 'local_heat', title: 'The Boss', description: 'They fear you. They respect you. They never cross you.', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'heat' } },
  { id: 'local_balanced', title: 'The Mayor', description: 'You became a pillar of the community.', requirement: { legacyMin: 1000, legacyMax: 4999, dominantStat: 'balanced' } },

  // High Legacy (5000-9999)
  { id: 'icon_clout', title: 'The Networker', description: 'Your contact list is a who\'s who of global power.', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'clout' } },
  { id: 'icon_aura', title: 'The Visionary', description: 'They study your philosophy in schools.', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'aura' } },
  { id: 'icon_heat', title: 'The Disruptor', description: 'You burned it all down and built something new.', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'heat' } },
  { id: 'icon_balanced', title: 'The Titan', description: 'Your name is spoken alongside the greats.', requirement: { legacyMin: 5000, legacyMax: 9999, dominantStat: 'balanced' } },

  // Legendary Legacy (10000+)
  { id: 'immortal_clout', title: 'The Oracle', description: 'Every leader seeks your counsel. You shaped the world.', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'clout' } },
  { id: 'immortal_aura', title: 'The Divine', description: 'They built temples in your honor.', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'aura' } },
  { id: 'immortal_heat', title: 'The Godfather', description: 'Everyone answers to you. Even in death.', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'heat' } },
  { id: 'immortal_balanced', title: 'The Legend', description: 'Your name will never be forgotten. Ever.', requirement: { legacyMin: 10000, legacyMax: 999999, dominantStat: 'balanced' } },
];

export const getEnding = (legacyPoints: number, dominantStat: string): Ending => {
  const found = ENDINGS.find(e =>
    legacyPoints >= e.requirement.legacyMin &&
    legacyPoints <= e.requirement.legacyMax &&
    e.requirement.dominantStat === dominantStat
  );
  return found || ENDINGS[0];
};
