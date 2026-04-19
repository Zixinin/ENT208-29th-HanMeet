import { Quest, deserializeQuest, serializeQuest } from './questSystem';

const SAVE_KEY = 'hanmeet-supermarket-3d-save-v1';

export interface SupermarketSaveState {
  inventoryIds: string[];
  completedQuestCount: number;
  activeQuest: Quest | null;
  player: {
    x: number;
    z: number;
    yaw: number;
    pitch: number;
  };
}

export const defaultSaveState: SupermarketSaveState = {
  inventoryIds: [],
  completedQuestCount: 0,
  activeQuest: null,
  player: {
    x: 0,
    z: 15,
    yaw: Math.PI,
    pitch: 0,
  },
};

interface PersistedSaveState {
  inventoryIds: string[];
  completedQuestCount: number;
  activeQuestRaw: string | null;
  player: {
    x: number;
    z: number;
    yaw: number;
    pitch: number;
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function loadSupermarketSave(): SupermarketSaveState {
  if (typeof window === 'undefined') return defaultSaveState;

  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return defaultSaveState;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedSaveState>;
    const inventoryIds = Array.isArray(parsed.inventoryIds)
      ? parsed.inventoryIds.filter((id): id is string => typeof id === 'string')
      : [];

    const completedQuestCount =
      typeof parsed.completedQuestCount === 'number' && parsed.completedQuestCount >= 0
        ? Math.floor(parsed.completedQuestCount)
        : 0;

    const player = parsed.player;
    const nextPlayer =
      player &&
      isFiniteNumber(player.x) &&
      isFiniteNumber(player.z) &&
      isFiniteNumber(player.yaw) &&
      isFiniteNumber(player.pitch)
        ? player
        : defaultSaveState.player;

    return {
      inventoryIds,
      completedQuestCount,
      activeQuest: deserializeQuest(parsed.activeQuestRaw ?? null),
      player: nextPlayer,
    };
  } catch {
    return defaultSaveState;
  }
}

export function persistSupermarketSave(state: SupermarketSaveState): void {
  if (typeof window === 'undefined') return;

  const payload: PersistedSaveState = {
    inventoryIds: state.inventoryIds,
    completedQuestCount: state.completedQuestCount,
    activeQuestRaw: state.activeQuest ? serializeQuest(state.activeQuest) : null,
    player: state.player,
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function clearSupermarketSave(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SAVE_KEY);
}
