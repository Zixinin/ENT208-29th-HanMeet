import { SPACE_ORDER } from '../features/game/data';
import { Difficulty, NotebookEntry, SpaceId, UserProfile, UserProgress } from '../types/domain';
import { supabase } from './supabaseClient';

interface PullCloudStateResult {
  profile?: UserProfile;
  progress?: UserProgress;
  notebook?: NotebookEntry[];
  hasAnyData: boolean;
}

interface PushCloudStateInput {
  profile: UserProfile;
  progress: UserProgress;
  notebook: NotebookEntry[];
}

function sanitizeDifficulty(value: unknown): Difficulty {
  if (value === 'medium' || value === 'hard') return value;
  return 'easy';
}

function sanitizeSpaces(value: unknown): SpaceId[] {
  if (!Array.isArray(value)) return [SPACE_ORDER[0]];
  const unlocked = SPACE_ORDER.filter((spaceId) => value.includes(spaceId));
  return unlocked.length > 0 ? unlocked : [SPACE_ORDER[0]];
}

function sanitizeSource(value: unknown): NotebookEntry['source'] {
  if (value === 'space' || value === 'dictionary_ai' || value === 'dictionary_local') {
    return value;
  }
  return 'dictionary_local';
}

function toTimestamp(value: unknown, fallback: number): number {
  if (typeof value !== 'string') return fallback;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function pullCloudState(userId: string): Promise<PullCloudStateResult> {
  if (!supabase) return { hasAnyData: false };

  const [profileRes, progressRes, notebookRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, avatar_preset_id, outfit_color')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('user_progress')
      .select('level, xp, unlocked_spaces, selected_difficulty')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('notebook_entries')
      .select(
        'id, source, english, chinese_simplified, pinyin, ai_generated, mastery, interval_days, due_at, created_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (progressRes.error) throw progressRes.error;
  if (notebookRes.error) throw notebookRes.error;

  const profile = profileRes.data
    ? {
        username: profileRes.data.username || 'Player',
        avatarPresetId: profileRes.data.avatar_preset_id || 'red-fox',
        outfitColor: profileRes.data.outfit_color || '#10b981',
      }
    : undefined;

  const progress = progressRes.data
    ? {
        level: Number(progressRes.data.level) || 1,
        xp: Number(progressRes.data.xp) || 0,
        unlockedSpaces: sanitizeSpaces(progressRes.data.unlocked_spaces),
        selectedDifficulty: sanitizeDifficulty(progressRes.data.selected_difficulty),
      }
    : undefined;

  const notebook = Array.isArray(notebookRes.data) && notebookRes.data.length > 0
    ? notebookRes.data.map((row) => ({
        id: String(row.id),
        chinese: row.chinese_simplified,
        pinyin: row.pinyin,
        english: row.english,
        source: sanitizeSource(row.source),
        aiGenerated: Boolean(row.ai_generated),
        mastery: Number(row.mastery) || 0,
        intervalDays: Number(row.interval_days) || 1,
        dueAt: toTimestamp(row.due_at, Date.now()),
        createdAt: toTimestamp(row.created_at, Date.now()),
      }))
    : undefined;

  return {
    profile,
    progress,
    notebook,
    hasAnyData: Boolean(profile || progress || notebook),
  };
}

export async function pushCloudState(userId: string, state: PushCloudStateInput): Promise<void> {
  if (!supabase) return;

  const profilePayload = {
    id: userId,
    username: state.profile.username,
    avatar_preset_id: state.profile.avatarPresetId,
    outfit_color: state.profile.outfitColor,
  };

  const progressPayload = {
    user_id: userId,
    level: state.progress.level,
    xp: state.progress.xp,
    unlocked_spaces: state.progress.unlockedSpaces,
    selected_difficulty: state.progress.selectedDifficulty,
  };

  const notebookPayload = state.notebook.map((entry) => ({
    user_id: userId,
    source: entry.source,
    english: entry.english,
    chinese_simplified: entry.chinese,
    pinyin: entry.pinyin,
    ai_generated: entry.aiGenerated,
    mastery: entry.mastery,
    interval_days: entry.intervalDays,
    due_at: new Date(entry.dueAt).toISOString(),
    created_at: new Date(entry.createdAt).toISOString(),
  }));

  const { error: profileError } = await supabase.from('profiles').upsert(profilePayload, {
    onConflict: 'id',
  });
  if (profileError) throw profileError;

  const { error: progressError } = await supabase.from('user_progress').upsert(progressPayload, {
    onConflict: 'user_id',
  });
  if (progressError) throw progressError;

  const { error: deleteNotebookError } = await supabase
    .from('notebook_entries')
    .delete()
    .eq('user_id', userId);
  if (deleteNotebookError) throw deleteNotebookError;

  if (notebookPayload.length > 0) {
    const { error: notebookInsertError } = await supabase
      .from('notebook_entries')
      .insert(notebookPayload);
    if (notebookInsertError) throw notebookInsertError;
  }
}

