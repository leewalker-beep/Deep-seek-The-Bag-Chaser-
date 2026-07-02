import type { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'char_marcus',
    name: 'Marcus "Mook" Miller',
    portraitId: 'av_m1',
    background: 'Childhood friend from the mud blocks. Knows where the bodies are buried, but has a heart of gold.',
    personality: 'Loyal, reckless, street-smart.',
    firstAppearanceTier: 'MUD',
    futureAppearanceTiers: ['STREET', 'STARTUP', 'CORPORATE'],
    initialStatus: 'alive'
  },
  {
    id: 'char_ashley',
    name: 'Ashley Weaver',
    portraitId: 'av_f2',
    background: 'Ambitious investigative journalist for the Metro Gazette. Always looking for the next big scoop.',
    personality: 'Persistent, ethical, inquisitive.',
    firstAppearanceTier: 'STREET',
    futureAppearanceTiers: ['STARTUP', 'CORPORATE', 'ELITE', 'PRESIDENT'],
    initialStatus: 'alive'
  },
  {
    id: 'char_cole',
    name: 'Detective Silas Cole',
    portraitId: 'av_m3',
    background: 'A veteran detective with a grudge against the "new money" taking over the city.',
    personality: 'Cynical, observant, incorruptible.',
    firstAppearanceTier: 'STREET',
    futureAppearanceTiers: ['STARTUP', 'CORPORATE', 'ELITE'],
    initialStatus: 'alive'
  },
  {
    id: 'char_chen',
    name: 'Investor Lawrence Chen',
    portraitId: 'av_m4',
    background: 'A high-stakes venture capitalist who values ROI above all else. He doesn\'t invest in businesses; he invests in people.',
    personality: 'Calculating, demanding, influential.',
    firstAppearanceTier: 'STARTUP',
    futureAppearanceTiers: ['CORPORATE', 'ELITE', 'MOGUL'],
    initialStatus: 'alive'
  },
  {
    id: 'char_maya',
    name: 'Maya Vane',
    portraitId: 'av_f1',
    background: 'Your younger sister. She wants to make a difference in the community through social work, not greed.',
    personality: 'Idealistic, grounding, brave.',
    firstAppearanceTier: 'MUD',
    futureAppearanceTiers: ['STREET', 'STARTUP', 'ELITE', 'PRESIDENT'],
    initialStatus: 'alive'
  },
  {
    id: 'char_victor',
    name: 'Victor Kane',
    portraitId: 'av_m2',
    background: 'A ruthless conglomerate CEO who sees the entire city as his personal chessboard.',
    personality: 'Arrogant, strategic, predatory.',
    firstAppearanceTier: 'CORPORATE',
    futureAppearanceTiers: ['ELITE', 'MOGUL', 'PRESIDENT'],
    initialStatus: 'rival'
  },
  {
    id: 'char_sofia',
    name: 'Sofia Ramirez',
    portraitId: 'av_f3',
    background: 'A rising political star with eyes on the Mayor\'s office and beyond. She needs powerful backers.',
    personality: 'Charismatic, ambitious, pragmatic.',
    firstAppearanceTier: 'ELITE',
    futureAppearanceTiers: ['MOGUL', 'PRESIDENT'],
    initialStatus: 'alive'
  },
  {
    id: 'char_ghost',
    name: 'Ghost',
    portraitId: 'av_f4',
    background: 'An anonymous hacker-activist who specializes in corporate espionage and digital sabotage.',
    personality: 'Enigmatic, libertarian, brilliant.',
    firstAppearanceTier: 'STARTUP',
    futureAppearanceTiers: ['CORPORATE', 'ELITE', 'MOGUL'],
    initialStatus: 'alive'
  },
  {
    id: 'char_leo',
    name: 'Leo Thorne',
    portraitId: 'av_m1',
    background: 'The world\'s most popular lifestyle influencer. He can make or break a brand with a single post.',
    personality: 'Vain, energetic, fickle.',
    firstAppearanceTier: 'CORPORATE',
    futureAppearanceTiers: ['ELITE', 'MOGUL'],
    initialStatus: 'alive'
  },
  {
    id: 'char_sarah',
    name: 'Sarah Jenkins',
    portraitId: 'av_f2',
    background: 'Leader of the United Workers Union. She\'s the only one standing between you and total labor control.',
    personality: 'Tough, uncompromising, protective.',
    firstAppearanceTier: 'CORPORATE',
    futureAppearanceTiers: ['ELITE', 'MOGUL', 'PRESIDENT'],
    initialStatus: 'alive'
  },
  {
    id: 'char_volkov',
    name: 'President Mikhail Volkov',
    portraitId: 'av_m3',
    background: 'Leader of a powerful foreign nation with significant interests in your city\'s tech sector.',
    personality: 'Stoic, nationalist, ruthless.',
    firstAppearanceTier: 'MOGUL',
    futureAppearanceTiers: ['PRESIDENT'],
    initialStatus: 'alive'
  },
  {
    id: 'char_elena',
    name: 'Elena Vance',
    portraitId: 'av_f4',
    background: 'A corporate fixer who handles the problems that money alone can\'t solve.',
    personality: 'Efficient, cold, discreet.',
    firstAppearanceTier: 'ELITE',
    futureAppearanceTiers: ['MOGUL', 'PRESIDENT'],
    initialStatus: 'alive'
  }
];
