export type TabId = 'game' | 'notebook' | 'dictionary' | 'profile';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpaceId = 'classroom' | 'supermarket' | 'dorm' | 'cafeteria';
export type ItemRarity = 'common' | 'hidden';

export interface AvatarPreset {
  id: string;
  name: string;
  emoji: string;
  accent: string;
}

export interface VocabularyItem {
  id: string;
  spaceId: SpaceId;
  chinese: string;
  pinyin: string;
  english: string;
  x: number;
  y: number;
  difficulty: Difficulty;
  rarity: ItemRarity;
  xp: number;
  icon?: string;
}

export interface Space {
  id: SpaceId;
  name: string;
  chineseName: string;
  backgroundImage?: string;
  backgroundClass: string;
  itemIds: string[];
}

export interface NotebookEntry {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  source: 'space' | 'dictionary_ai' | 'dictionary_local';
  aiGenerated: boolean;
  mastery: number;
  intervalDays: number;
  dueAt: number;
  createdAt: number;
}

export interface UserProfile {
  username: string;
  avatarPresetId: string;
  outfitColor: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  unlockedSpaces: SpaceId[];
  selectedDifficulty: Difficulty;
}
