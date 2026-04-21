export type TabId = 'game' | 'notebook' | 'dictionary' | 'profile';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpaceId = 'classroom' | 'supermarket' | 'dorm' | 'cafeteria' | 'cafe' | 'house';
export type ItemRarity = 'common' | 'hidden';

export type TileType = 'grass' | 'path' | 'road' | 'sidewalk' | 'tree' | 'wall' | 'door' | 'water' | 'flower' | 'farmland' | 'cliff';

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

export interface Building {
  id: 'supermarket' | 'school' | 'cafe' | 'library' | 'house';
  label: string;
  chineseLabel: string;
  color: string;
  tileX: number;
  tileY: number;
  tileW: number;
  tileH: number;
  doorX: number;
  doorY: number;
  inProgress?: boolean;
}

export interface NpcData {
  id: string;
  tileX: number;
  tileY: number;
  emoji: string;
  hint: string;
}

export interface PlayerState {
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  frame: number;
}

export interface InteriorItem {
  id: string;
  spaceId: SpaceId;
  chinese: string;
  pinyin: string;
  english: string;
  xp: number;
  icon: string;
  x: number;
  y: number;
}

export interface RoomItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  description: string;
  icon: string;
  xp: number;
  xPct: number;
  yPct: number;
}
