import { RoomItem } from '../../../types/domain';
import {
  FindTask, ShoppingListTask, TimedSprintTask, RecipeComboTask, ChallengeMode,
} from '../types/tasks';

// ─── Unique item helpers ─────────────────────────────────────────────────────

function uniqueByKey<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return items.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

function pickRandom<T>(arr: T[], context = 'unknown'): T {
  if (arr.length === 0) throw new Error(`pickRandom called with empty array: ${context}`);
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── LV.1 / LV.2: find a single item ────────────────────────────────────────

export function generateFindTask(items: RoomItem[], foundChinese: string[]): FindTask {
  const unique = uniqueByKey(items, 'chinese');
  const foundSet = new Set(foundChinese);
  const unfound = unique.filter(i => !foundSet.has(i.chinese));
  const pool = unfound.length > 0 ? unfound : unique;
  const target = pickRandom(pool, 'generateFindTask: no items available');
  return {
    kind: 'find-item',
    targetChinese: target.chinese,
    targetPinyin: target.pinyin,
    targetEnglish: target.english,
    targetIcon: target.icon,
    xpReward: target.xp,
  };
}

// ─── LV.3 mode A: shopping list ──────────────────────────────────────────────

export function generateShoppingList(items: RoomItem[], count: number): ShoppingListTask {
  const unique = uniqueByKey(items, 'chinese');
  const shuffled = [...unique].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, unique.length));
  return {
    kind: 'shopping-list',
    items: selected.map(i => ({
      chinese: i.chinese,
      pinyin: i.pinyin,
      english: i.english,
      icon: i.icon,
    })),
    xpReward: selected.length * 15,
  };
}

// ─── LV.3 mode B: timed sprint ───────────────────────────────────────────────

export function generateTimedSprint(): TimedSprintTask {
  return { kind: 'timed-sprint', durationSeconds: 60, xpPerItem: 12 };
}

// ─── LV.3 mode C: recipe combo ───────────────────────────────────────────────

export interface ComboDefinition {
  name: string;
  targetChinese: string[];
  xpReward: number;
}

export const ROOM_COMBOS: Record<'cafe' | 'house' | 'supermarket', ComboDefinition[]> = {
  cafe: [
    { name: 'Morning Order', targetChinese: ['咖啡', '服务员', '收银台'], xpReward: 40 },
    { name: 'Cozy Corner',   targetChinese: ['沙发', '植物', '壁炉'],    xpReward: 40 },
  ],
  house: [
    { name: 'Study Session',     targetChinese: ['书架', '木椅', '桌子'],  xpReward: 40 },
    { name: 'Living Room Setup', targetChinese: ['电视', '沙发', '地毯'],  xpReward: 40 },
  ],
  supermarket: [
    { name: 'Quick Breakfast', targetChinese: ['面包', '奶酪', '蜂蜜'],        xpReward: 40 },
    { name: 'Pantry Basics',   targetChinese: ['酱油', '醋', '糖', '盐'],      xpReward: 50 },
  ],
};

export function generateRecipeCombo(
  roomId: 'cafe' | 'house' | 'supermarket',
): RecipeComboTask {
  const combo = pickRandom(ROOM_COMBOS[roomId], `generateRecipeCombo: no combos for room "${roomId}"`);
  return {
    kind: 'recipe-combo',
    comboName: combo.name,
    targetChinese: combo.targetChinese,
    xpReward: combo.xpReward,
  };
}

// ─── LV.3 mode rotation ──────────────────────────────────────────────────────

const CHALLENGE_CYCLE: ChallengeMode[] = ['shopping-list', 'timed-sprint', 'recipe-combo'];

export function getNextChallengeMode(storedIndex: number): ChallengeMode {
  return CHALLENGE_CYCLE[storedIndex % CHALLENGE_CYCLE.length];
}

// NOTE: readChallengeModeIndex and advanceChallengeModeIndex use localStorage
// and are intentionally not tested (no localStorage in Node.js test environment).

export function readChallengeModeIndex(roomId: string): number {
  const val = parseInt(localStorage.getItem(`hanmeet-lv3-mode-${roomId}`) ?? '0', 10);
  return isNaN(val) ? 0 : val;
}

export function advanceChallengeModeIndex(roomId: string): void {
  const current = readChallengeModeIndex(roomId);
  localStorage.setItem(
    `hanmeet-lv3-mode-${roomId}`,
    String((current + 1) % CHALLENGE_CYCLE.length),
  );
}
