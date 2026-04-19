import { SPACE_ORDER, XP_PER_LEVEL } from './data';
import { SpaceId } from '../../types/domain';

export interface ProgressUpdate {
  level: number;
  xp: number;
  unlockedSpaces: SpaceId[];
  leveledUp: boolean;
  unlockedNewSpace: boolean;
}

export function applyXp(
  currentLevel: number,
  currentXp: number,
  currentUnlocked: SpaceId[],
  gainedXp: number,
): ProgressUpdate {
  let level = currentLevel;
  let xp = currentXp + gainedXp;
  let leveledUp = false;

  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
    leveledUp = true;
  }

  const unlockedCount = Math.min(SPACE_ORDER.length, Math.floor((level - 1) / 2) + 1);
  const targetUnlocked = SPACE_ORDER.slice(0, unlockedCount);
  const unlockedNewSpace = targetUnlocked.length > currentUnlocked.length;

  return {
    level,
    xp,
    unlockedSpaces: targetUnlocked,
    leveledUp,
    unlockedNewSpace,
  };
}

export function xpToNextLevel(xp: number): number {
  return Math.max(0, XP_PER_LEVEL - xp);
}
