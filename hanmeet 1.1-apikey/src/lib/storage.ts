import { NotebookEntry, SpaceId, UserProfile, UserProgress } from '../types/domain';
import { SPACE_ORDER } from '../features/game/data';

const KEY = 'hanmeet-v2-state';

export interface StoredState {
  profile: UserProfile;
  progress: UserProgress;
  notebook: NotebookEntry[];
  discoveredHiddenItemIds: string[];
}

export const defaultState: StoredState = {
  profile: {
    username: 'Player',
    avatarPresetId: 'adam',
    outfitColor: '#10b981',
  },
  progress: {
    level: 1,
    xp: 0,
    unlockedSpaces: [SPACE_ORDER[0]],
    selectedDifficulty: 'easy',
  },
  notebook: [],
  discoveredHiddenItemIds: [],
};

function sanitizeUnlockedSpaces(spaces: SpaceId[]): SpaceId[] {
  const valid = SPACE_ORDER.filter((id) => spaces.includes(id));
  return valid.length > 0 ? valid : [SPACE_ORDER[0]];
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as StoredState;

    return {
      profile: {
        username: parsed.profile?.username || defaultState.profile.username,
        avatarPresetId: parsed.profile?.avatarPresetId || defaultState.profile.avatarPresetId,
        outfitColor: parsed.profile?.outfitColor || defaultState.profile.outfitColor,
      },
      progress: {
        level: Number(parsed.progress?.level) || 1,
        xp: Number(parsed.progress?.xp) || 0,
        unlockedSpaces: sanitizeUnlockedSpaces(parsed.progress?.unlockedSpaces || []),
        selectedDifficulty: parsed.progress?.selectedDifficulty || 'easy',
      },
      notebook: Array.isArray(parsed.notebook) ? parsed.notebook : [],
      discoveredHiddenItemIds: Array.isArray(parsed.discoveredHiddenItemIds)
        ? parsed.discoveredHiddenItemIds
        : [],
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: StoredState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
