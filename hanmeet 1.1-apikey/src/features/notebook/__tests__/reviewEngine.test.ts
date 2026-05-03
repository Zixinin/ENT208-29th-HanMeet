import assert from 'node:assert/strict';
import { NotebookEntry } from '../../../types/domain';
import { buildReviewSession, getDueSortedEntries, applyReview } from '../reviewEngine';

function entry(overrides: Partial<NotebookEntry>): NotebookEntry {
  return {
    id: 'note-default',
    chinese: '书',
    pinyin: 'shu',
    english: 'book',
    source: 'space',
    aiGenerated: false,
    mastery: 0,
    intervalDays: 1,
    dueAt: 1_000,
    createdAt: 1_000,
    ...overrides,
  };
}

const now = 10_000;
const dueOld = entry({ id: 'old', chinese: '床', english: 'bed', dueAt: 1_000, createdAt: 3_000 });
const dueNew = entry({ id: 'new', chinese: '树', english: 'tree', dueAt: 2_000, createdAt: 2_000 });
const future = entry({ id: 'future', chinese: '水', english: 'water', dueAt: 30_000, createdAt: 1_000 });

assert.deepEqual(
  getDueSortedEntries([future, dueNew, dueOld], now).map((item) => item.id),
  ['old', 'new'],
);

assert.deepEqual(
  buildReviewSession([future, dueNew, dueOld], { dueOnly: true, limit: 10, now }).cards.map((item) => item.id),
  ['old', 'new'],
);

assert.deepEqual(
  buildReviewSession([future, dueNew, dueOld], { dueOnly: false, limit: 2, now }).cards.map((item) => item.id),
  ['old', 'new'],
);

assert.equal(buildReviewSession([future], { dueOnly: true, limit: 10, now }).hasDueCards, false);
assert.equal(buildReviewSession([future], { dueOnly: false, limit: 10, now }).cards[0]?.id, 'future');

const reviewed = applyReview(dueOld, 'good', now);
assert.equal(reviewed.intervalDays, 3);
assert.equal(reviewed.dueAt, now + 3 * 24 * 60 * 60 * 1000);

console.log('reviewEngine tests passed');
