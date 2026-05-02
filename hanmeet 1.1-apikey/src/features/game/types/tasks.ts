export type DifficultyLevel = 1 | 2 | 3;

export type ChallengeMode = 'shopping-list' | 'timed-sprint' | 'recipe-combo';

export type TaskKind = Task['kind'];

export interface FindTask {
  kind: 'find-item';
  targetChinese: string;
  targetPinyin: string;
  targetEnglish: string;
  targetIcon: string;
  xpReward: number;
}

export interface ShoppingListTask {
  kind: 'shopping-list';
  items: Array<{ chinese: string; pinyin: string; english: string; icon: string }>;
  xpReward: number;
}

export interface TimedSprintTask {
  kind: 'timed-sprint';
  durationSeconds: number;
  xpPerItem: number;
}

export interface RecipeComboTask {
  kind: 'recipe-combo';
  comboName: string;
  targetChinese: string[];  // unique Chinese words to collect
  xpReward: number;
}

export type Task = FindTask | ShoppingListTask | TimedSprintTask | RecipeComboTask;

export interface TaskProgress {
  current: number;
  target: number;
  isComplete: boolean;
}

import type { RoomId } from '../components/RoomSelect';

export interface ActiveRoomInfo {
  roomId: RoomId;
  found: number;
  total: number;
}
