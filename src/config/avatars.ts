export interface AvatarDef {
  id: string;
  label: string;
  gender: 'male' | 'female';
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'fade' |
             'locs' | 'bun' | 'natural';
  feature: 'beard' | 'glasses' |
           'earring' | 'none';
}

export const PLAYER_AVATARS: AvatarDef[] = [
  { id: 'av_m1', label: 'Marcus',
    gender: 'male',   skinTone: '#8D5524',
    hairColor: '#1a0800', hairStyle: 'fade',
    feature: 'beard' },
  { id: 'av_m2', label: 'Kwame',
    gender: 'male',   skinTone: '#3B1F0E',
    hairColor: '#0a0500', hairStyle: 'locs',
    feature: 'none' },
  { id: 'av_m3', label: 'Diego',
    gender: 'male',   skinTone: '#C68642',
    hairColor: '#1a0a00', hairStyle: 'short',
    feature: 'none' },
  { id: 'av_m4', label: 'Jin',
    gender: 'male',   skinTone: '#F1C27D',
    hairColor: '#0d0d0d', hairStyle: 'short',
    feature: 'glasses' },
  { id: 'av_f1', label: 'Zara',
    gender: 'female', skinTone: '#6B3A2A',
    hairColor: '#0a0500', hairStyle: 'natural',
    feature: 'earring' },
  { id: 'av_f2', label: 'Priya',
    gender: 'female', skinTone: '#C68642',
    hairColor: '#0d0d0d', hairStyle: 'long',
    feature: 'none' },
  { id: 'av_f3', label: 'Aaliyah',
    gender: 'female', skinTone: '#8D5524',
    hairColor: '#1a0800', hairStyle: 'bun',
    feature: 'earring' },
  { id: 'av_f4', label: 'Mei',
    gender: 'female', skinTone: '#F1C27D',
    hairColor: '#0d0d0d', hairStyle: 'long',
    feature: 'glasses' },
];

// Deterministically assign an avatar to a rival
// based on their name — consistent across sessions
export const getRivalAvatarId = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return PLAYER_AVATARS[
    Math.abs(hash) % PLAYER_AVATARS.length
  ].id;
};
