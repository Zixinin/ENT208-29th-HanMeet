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

export function applyReview(entry: NotebookEntry, grade: ReviewGrade): NotebookEntry {
  const intervalDays = INTERVALS[grade];
  const masteryDelta = grade === 'again' ? -1 : grade === 'good' ? 1 : 2;

  return {
    ...entry,
    intervalDays,
    mastery: Math.max(0, entry.mastery + masteryDelta),
    dueAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
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
