import { getRandomPortrait } from '../portraitRegistry';

export type NPCRole = 'CREATOR' | 'EXECUTIVE' | 'RIVAL' | 'INTERN';

export interface NPCCharacter {
  id: string;
  name: string;
  role: NPCRole;
  avatar: string;
  avatarId?: string;       // Dynamic realistic portrait asset reference
  reputation: number;     // 1-100: Impact scale
  disposition: number;    // -100 to +100: Relationship tracking (Rival vs Ally)
  currentHustleId?: string;
}

export const generateGlobalNPC = (role: NPCRole, customName?: string, customAvatar?: string): NPCCharacter => {
  const namesByRole: Record<NPCRole, string[]> = {
    CREATOR: [
      'HyperX', 'DJ Bitter', 'Yung Pixels', 'Miss Vibe', 'Gamer Chad',
      'Lil Bag', 'Yung Chain', 'Big Ghost', 'MC Money', 'DJ Wave', 'The Vibe',
      'Kid Flex', 'Bad Chaser', 'Rich Mogul', 'Ice Star', 'A$AP Flow', 'Cardi Beat', 'Megan Diamond'
    ],
    EXECUTIVE: ['Suits Miller', 'CEO Sterling', 'Venture Capitalist Vic', 'Manager Maeve'],
    RIVAL: ['Clout Chaser Cody', 'Copycat Kyle', 'The Phantom Troll', 'Snitch Richie'],
    INTERN: ['Coffee Intern Sam', 'Gopher Gary', 'Assistant Alice']
  };

  const nameList = namesByRole[role];
  const finalName = customName || nameList[Math.floor(Math.random() * nameList.length)];

  // Draw dynamically from appropriate portrait category pools
  let assignedPortraitId = '';
  let fallbackEmoji = '👤';

  if (role === 'CREATOR') {
    const p = getRandomPortrait('podcast');
    assignedPortraitId = p.id;
    fallbackEmoji = '🎙️';
  } else if (role === 'RIVAL') {
    const p = getRandomPortrait('elite');
    assignedPortraitId = p.id;
    fallbackEmoji = '🐍';
  } else if (role === 'EXECUTIVE') {
    const p = getRandomPortrait('corporate');
    assignedPortraitId = p.id;
    fallbackEmoji = '💼';
  } else {
    // INTERN
    assignedPortraitId = 'p_podcast_2'; // Gamer Chad acts as a funny intern
    fallbackEmoji = '☕';
  }

  return {
    id: `npc_${role.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`,
    name: finalName,
    role: role,
    avatar: customAvatar || fallbackEmoji,
    avatarId: assignedPortraitId,
    reputation: Math.floor(Math.random() * 40) + 20,
    disposition: role === 'RIVAL' ? -50 : 20
  };
};
