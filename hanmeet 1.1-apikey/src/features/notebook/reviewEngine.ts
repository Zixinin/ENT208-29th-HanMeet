import { NotebookEntry } from '../../types/domain';

export type ReviewGrade = 'again' | 'good' | 'easy';

const INTERVALS: Record<ReviewGrade, number> = {
  again: 1,
  good: 3,
  easy: 7,
};

export function isDue(entry: NotebookEntry, now = Date.now()): boolean {
  return entry.dueAt <= now;
}

export function applyReview(entry: NotebookEntry, grade: ReviewGrade, now = Date.now()): NotebookEntry {
  const intervalDays = INTERVALS[grade];
  const masteryDelta = grade === 'again' ? -1 : grade === 'good' ? 1 : 2;

  return {
    ...entry,
    intervalDays,
    mastery: Math.max(0, entry.mastery + masteryDelta),
    dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
  };
}

export function getDueSortedEntries(entries: NotebookEntry[], now = Date.now()): NotebookEntry[] {
  return entries
    .filter((entry) => isDue(entry, now))
    .sort((a, b) => a.dueAt - b.dueAt || a.createdAt - b.createdAt);
}

interface BuildReviewSessionOptions {
  dueOnly: boolean;
  limit: number;
  now?: number;
}

export function buildReviewSession(
  entries: NotebookEntry[],
  { dueOnly, limit, now = Date.now() }: BuildReviewSessionOptions,
): { cards: NotebookEntry[]; dueCount: number; hasDueCards: boolean } {
  const dueCards = getDueSortedEntries(entries, now);
  const futureCards = entries
    .filter((entry) => !isDue(entry, now))
    .sort((a, b) => a.dueAt - b.dueAt || a.createdAt - b.createdAt);
  const pool = dueOnly ? dueCards : [...dueCards, ...futureCards];

  return {
    cards: pool.slice(0, limit),
    dueCount: dueCards.length,
    hasDueCards: dueCards.length > 0,
  };
}

export function buildQuizOptions(entries: NotebookEntry[], answer: NotebookEntry): string[] {
  const pool = entries
    .filter((e) => e.id !== answer.id)
    .slice(0, 3)
    .map((e) => e.english);
  const options = [answer.english, ...pool];
  return options.sort(() => Math.random() - 0.5);
}
