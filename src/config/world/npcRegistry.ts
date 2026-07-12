export type NPCRole = 'CREATOR' | 'EXECUTIVE' | 'RIVAL' | 'INTERN';

export interface NPCCharacter {
  id: string;
  name: string;
  role: NPCRole;
  avatar: string;
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

  const avatarPools: Record<NPCRole, string[]> = {
    CREATOR: ['🎧', '🎮', '🎤', '🛹', '👾', '🧢', '🎸', '🥷', '🕶️', '🔥', '🕷️', '🦊', '👑', '🌟', '💎', '🚀', '🔮'],
    EXECUTIVE: ['💼', '👓', '👠', '👔', '👑'],
    RIVAL: ['🐍', '🤡', '🦊', '👺', '👁️'],
    INTERN: ['☕', '📝', '🏃‍♂️', '📂']
  };

  const nameList = namesByRole[role];
  const avatarPool = avatarPools[role];

  const finalName = customName || nameList[Math.floor(Math.random() * nameList.length)];
  const finalAvatar = customAvatar || avatarPool[Math.floor(Math.random() * avatarPool.length)];

  return {
    id: `npc_${role.toLowerCase()}_${Math.random().toString(36).substr(2, 5)}`,
    name: finalName,
    role: role,
    avatar: finalAvatar,
    reputation: Math.floor(Math.random() * 40) + 20,
    disposition: role === 'RIVAL' ? -50 : 20
  };
};
