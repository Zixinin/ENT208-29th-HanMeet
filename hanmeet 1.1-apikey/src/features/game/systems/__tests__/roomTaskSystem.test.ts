import assert from 'node:assert/strict';
import { generateFindTask, generateShoppingList, getNextChallengeMode, ROOM_COMBOS } from '../roomTaskSystem';
import { CAFE_ROOM_ITEMS } from '../../data/cafeRoomItems';
import { HOUSE_ROOM_ITEMS } from '../../data/houseRoomItems';
import { SUPERMARKET_ROOM_ITEMS } from '../../data/supermarketRoomItems';

// --- generateFindTask ---
const cafeTask = generateFindTask(CAFE_ROOM_ITEMS, []);
assert.equal(cafeTask.kind, 'find-item');
assert.ok(cafeTask.targetChinese.length > 0);
assert.ok(cafeTask.xpReward > 0);

// Does not re-pick already-found items (by Chinese word)
const allChinese = [...new Set(CAFE_ROOM_ITEMS.map(i => i.chinese))];
const almostAllFound = allChinese.slice(1);
const lastTask = generateFindTask(CAFE_ROOM_ITEMS, almostAllFound);
assert.equal(lastTask.targetChinese, allChinese[0]);

// --- generateShoppingList ---
const list = generateShoppingList(CAFE_ROOM_ITEMS, 3);
assert.equal(list.kind, 'shopping-list');
assert.equal(list.items.length, 3);
// All items are unique Chinese words
const listChinese = list.items.map(i => i.chinese);
assert.equal(new Set(listChinese).size, 3);

// --- getNextChallengeMode ---
assert.equal(getNextChallengeMode(0), 'shopping-list');
assert.equal(getNextChallengeMode(1), 'timed-sprint');
assert.equal(getNextChallengeMode(2), 'recipe-combo');
assert.equal(getNextChallengeMode(3), 'shopping-list'); // wraps

// --- ROOM_COMBOS ---
assert.ok(ROOM_COMBOS.cafe.length > 0);
assert.ok(ROOM_COMBOS.house.length > 0);
assert.ok(ROOM_COMBOS.supermarket.length > 0);
ROOM_COMBOS.cafe.forEach(c => {
  assert.ok(c.name.length > 0);
  assert.ok(c.targetChinese.length >= 2);
});

// Verify every combo word exists in its room's item data
const cafeWords = new Set(CAFE_ROOM_ITEMS.map(i => i.chinese));
const houseWords = new Set(HOUSE_ROOM_ITEMS.map(i => i.chinese));
const supermarketWords = new Set(SUPERMARKET_ROOM_ITEMS.map(i => i.chinese));

ROOM_COMBOS.cafe.forEach(combo =>
  combo.targetChinese.forEach(word =>
    assert.ok(cafeWords.has(word), `Cafe combo word missing from data: ${word}`)
  )
);
ROOM_COMBOS.house.forEach(combo =>
  combo.targetChinese.forEach(word =>
    assert.ok(houseWords.has(word), `House combo word missing from data: ${word}`)
  )
);
ROOM_COMBOS.supermarket.forEach(combo =>
  combo.targetChinese.forEach(word =>
    assert.ok(supermarketWords.has(word), `Supermarket combo word missing from data: ${word}`)
  )
);

console.log('roomTaskSystem tests passed ✓');
