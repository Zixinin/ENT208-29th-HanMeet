# Room Levels & Task System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-room difficulty levels (LV.1 Explore / LV.2 Quiz / LV.3 Challenge) to all three rooms, with a DifficultyModal at room entry, a corner TaskCard HUD, and a new HUD header showing ROOM · LVL · FOUND X/Y.

**Architecture:** Per-approach #1 from the spec — shared task types in `tasks.ts`, one unified `roomTaskSystem.ts` (DRY: all rooms have identical task generation logic, only combo data differs), per-room combos defined as constants. Components (`DifficultyModal`, `TaskCard`, `QuizPopup`, `ChallengeTimer`) are pure display units. Session logic lives in a `useTaskSession` hook inside RoomInterior.

**Tech Stack:** React 19, TypeScript, Vite, `node:assert` + `tsx` for unit tests, `localStorage` for LV.3 mode rotation.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/features/game/types/tasks.ts` | DifficultyLevel, Task, TaskProgress, ChallengeMode types |
| Create | `src/features/game/systems/pinyinUtils.ts` | Strip tone diacritics for pinyin comparison |
| Create | `src/features/game/systems/__tests__/pinyinUtils.test.ts` | Tests for normalizePinyin |
| Create | `src/features/game/systems/roomTaskSystem.ts` | generateFindTask, generateShoppingList, COMBOS per room, selectChallengeMode |
| Create | `src/features/game/systems/__tests__/roomTaskSystem.test.ts` | Tests for task generation |
| Create | `src/features/game/components/DifficultyModal.tsx` | Modal shown when clicking a room card |
| Create | `src/features/game/components/TaskCard.tsx` | Bottom-right corner task display |
| Create | `src/features/game/components/QuizPopup.tsx` | LV.2 pinyin-type + MC quiz popup |
| Create | `src/features/game/components/ChallengeTimer.tsx` | LV.3 timed sprint countdown + score |
| Modify | `src/features/game/components/RoomSelect.tsx` | Reorder rooms, click → DifficultyModal |
| Modify | `src/features/game/components/RoomInterior.tsx` | Add difficultyLevel prop, TaskCard, useTaskSession |
| Modify | `src/features/game/GameTab.tsx` | Pass difficultyLevel, track found count, onRoomInfoChange |
| Modify | `src/App.tsx:89–92` | HUD: ROOM · LVL · FOUND (add activeRoomInfo state) |

---

## Task 1: Shared Types

**Files:**
- Create: `src/features/game/types/tasks.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/features/game/types/tasks.ts

export type DifficultyLevel = 1 | 2 | 3;

export type ChallengeMode = 'shopping-list' | 'timed-sprint' | 'recipe-combo';

export type TaskKind =
  | 'find-item'
  | 'pinyin-quiz'
  | 'multiple-choice'
  | 'shopping-list'
  | 'timed-sprint'
  | 'recipe-combo';

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

export interface ActiveRoomInfo {
  roomId: 'cafe' | 'house' | 'supermarket';
  found: number;
  total: number;
}
```

- [ ] **Step 2: Verify TypeScript accepts it**

```bash
cd "hanmeet 1.1-apikey" && npm run lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/types/tasks.ts
git commit -m "feat: add shared task types"
```

---

## Task 2: Pinyin Normalization Utility

**Files:**
- Create: `src/features/game/systems/pinyinUtils.ts`
- Create: `src/features/game/systems/__tests__/pinyinUtils.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/game/systems/__tests__/pinyinUtils.test.ts
import assert from 'node:assert/strict';
import { normalizePinyin } from '../pinyinUtils';

// Tone marks stripped
assert.equal(normalizePinyin('diànshì'), 'dianshi');
assert.equal(normalizePinyin('kāfēi'), 'kafei');
assert.equal(normalizePinyin('yǐzi'), 'yizi');
assert.equal(normalizePinyin('chá'), 'cha');

// Case insensitive
assert.equal(normalizePinyin('Dianshi'), 'dianshi');
assert.equal(normalizePinyin('KAFEI'), 'kafei');

// Trims whitespace
assert.equal(normalizePinyin('  dianshi  '), 'dianshi');

// Spaces preserved (multi-syllable pinyin)
assert.equal(normalizePinyin('dà zhuōzi'), 'da zhuozi');

console.log('pinyinUtils tests passed ✓');
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npx tsx "src/features/game/systems/__tests__/pinyinUtils.test.ts"
```
Expected: Error — `Cannot find module '../pinyinUtils'`

- [ ] **Step 3: Implement normalizePinyin**

```typescript
// src/features/game/systems/pinyinUtils.ts

export function normalizePinyin(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
npx tsx "src/features/game/systems/__tests__/pinyinUtils.test.ts"
```
Expected: `pinyinUtils tests passed ✓`

- [ ] **Step 5: Commit**

```bash
git add src/features/game/systems/pinyinUtils.ts src/features/game/systems/__tests__/pinyinUtils.test.ts
git commit -m "feat: add pinyin normalization utility"
```

---

## Task 3: Room Task System

**Files:**
- Create: `src/features/game/systems/roomTaskSystem.ts`
- Create: `src/features/game/systems/__tests__/roomTaskSystem.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/features/game/systems/__tests__/roomTaskSystem.test.ts
import assert from 'node:assert/strict';
import { generateFindTask, generateShoppingList, getNextChallengeMode, ROOM_COMBOS } from '../roomTaskSystem';
import { CAFE_ROOM_ITEMS } from '../../data/cafeRoomItems';
import { HOUSE_ROOM_ITEMS } from '../../data/houseRoomItems';

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

console.log('roomTaskSystem tests passed ✓');
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx tsx "src/features/game/systems/__tests__/roomTaskSystem.test.ts"
```
Expected: Error — `Cannot find module '../roomTaskSystem'`

- [ ] **Step 3: Implement roomTaskSystem.ts**

```typescript
// src/features/game/systems/roomTaskSystem.ts
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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── LV.1 / LV.2: find a single item ────────────────────────────────────────

export function generateFindTask(items: RoomItem[], foundChinese: string[]): FindTask {
  const unique = uniqueByKey(items, 'chinese');
  const foundSet = new Set(foundChinese);
  const unfound = unique.filter(i => !foundSet.has(i.chinese));
  const pool = unfound.length > 0 ? unfound : unique;
  const target = pickRandom(pool);
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
    { name: 'Study Session',      targetChinese: ['书架', '木椅', '桌子'],   xpReward: 40 },
    { name: 'Living Room Setup',  targetChinese: ['电视', '沙发', '地毯'],   xpReward: 40 },
  ],
  supermarket: [
    { name: 'Quick Breakfast', targetChinese: ['牛奶', '鸡蛋', '面包'],  xpReward: 40 },
    { name: 'Pantry Basics',   targetChinese: ['酱油', '醋', '糖', '盐'], xpReward: 50 },
  ],
};

export function generateRecipeCombo(
  roomId: 'cafe' | 'house' | 'supermarket',
): RecipeComboTask {
  const combo = pickRandom(ROOM_COMBOS[roomId]);
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

export function readChallengeModeIndex(roomId: string): number {
  return parseInt(localStorage.getItem(`hanmeet-lv3-mode-${roomId}`) ?? '0', 10);
}

export function advanceChallengeModeIndex(roomId: string): void {
  const current = readChallengeModeIndex(roomId);
  localStorage.setItem(`hanmeet-lv3-mode-${roomId}`, String((current + 1) % 3));
}
```

- [ ] **Step 4: Run tests**

```bash
npx tsx "src/features/game/systems/__tests__/roomTaskSystem.test.ts"
```
Expected: `roomTaskSystem tests passed ✓`

- [ ] **Step 5: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/game/systems/roomTaskSystem.ts src/features/game/systems/__tests__/roomTaskSystem.test.ts
git commit -m "feat: add room task system with LV1/2/3 generators"
```

---

## Task 4: HUD State in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/GameTab.tsx`

- [ ] **Step 1: Add ActiveRoomInfo state and new HUD to App.tsx**

In `src/App.tsx`, after the existing `const stats = useMemo(...)` block (around line 56), add:

```tsx
const [activeRoomInfo, setActiveRoomInfo] = useState<ActiveRoomInfo | null>(null);
```

Add the import at the top:
```tsx
import type { ActiveRoomInfo } from './features/game/types/tasks';
```

Replace the stats bar (lines 89–93, the `<div>` with `LVL`, `WORDS`, `SPACES`) with:

```tsx
<div style={{ fontSize: '8px', color: 'var(--pixel-text)', background: '#0f0f1a', border: '3px solid var(--pixel-border)', padding: '6px 12px', fontFamily: "'Press Start 2P', monospace" }}>
  {activeRoomInfo ? (
    <>
      <span className="mr-4">ROOM <strong style={{ color: 'var(--pixel-yellow)' }}>{activeRoomInfo.roomId.toUpperCase()}</strong></span>
      <span className="mr-4">LVL <strong style={{ color: 'var(--pixel-green)' }}>{stats.level}</strong></span>
      <span>FOUND <strong style={{ color: 'var(--pixel-blue)' }}>{activeRoomInfo.found}/{activeRoomInfo.total}</strong></span>
    </>
  ) : (
    <>
      <span className="mr-4">LVL <strong style={{ color: 'var(--pixel-yellow)' }}>{stats.level}</strong></span>
      <span>WORDS <strong style={{ color: 'var(--pixel-green)' }}>{stats.savedWords}</strong></span>
    </>
  )}
</div>
```

Pass `onRoomInfoChange={setActiveRoomInfo}` to `<GameTab>`. The full `<GameTab>` render line in App.tsx currently looks like:
```tsx
<GameTab
  level={progress.level}
  xp={progress.xp}
  ...
/>
```
Add `onRoomInfoChange={setActiveRoomInfo}` to it.

- [ ] **Step 2: Update GameTab to accept and forward the callback**

In `src/features/game/GameTab.tsx`, update the props interface:

```tsx
import type { ActiveRoomInfo, DifficultyLevel } from './types/tasks';

interface GameTabProps {
  // ... existing props ...
  onRoomInfoChange: (info: ActiveRoomInfo | null) => void;
}
```

Add `difficultyLevel` state to GameTab:
```tsx
const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(1);
```

Update `RoomInterior` call to pass new props:
```tsx
<RoomInterior
  roomId={scene as RoomId}
  items={ROOM_ITEMS[scene as RoomId]}
  avatarPresetId={avatarPresetId}
  difficultyLevel={difficultyLevel}
  onBack={() => {
    setScene('select');
    onRoomInfoChange(null);
  }}
  onSave={handleSave}
  onRoomInfoChange={onRoomInfoChange}
/>
```

- [ ] **Step 3: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors. (RoomInterior will show TS errors for unknown props — that's fine, we fix it in Task 8.)

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/features/game/GameTab.tsx
git commit -m "feat: add active room HUD state to App and GameTab"
```

---

## Task 5: DifficultyModal Component

**Files:**
- Create: `src/features/game/components/DifficultyModal.tsx`

- [ ] **Step 1: Create DifficultyModal**

```tsx
// src/features/game/components/DifficultyModal.tsx
import React from 'react';
import type { DifficultyLevel } from '../types/tasks';
import type { RoomId } from './RoomSelect';

const ROOM_LABEL: Record<RoomId, string> = {
  cafe: '☕ CAFÉ',
  house: '🏠 HOUSE',
  supermarket: '🛒 SUPERMARKET',
};

const LEVELS: Array<{
  level: DifficultyLevel;
  name: string;
  desc: string;
  color: string;
}> = [
  { level: 1, name: 'LV.1 · EXPLORE', desc: 'Find items → learn vocab',               color: '#83d68e' },
  { level: 2, name: 'LV.2 · QUIZ',    desc: 'Find items → pinyin / multiple-choice',  color: '#ffe59a' },
  { level: 3, name: 'LV.3 · CHALLENGE', desc: 'Shopping list / Timed / Recipe',       color: '#7ec8e3' },
];

interface Props {
  roomId: RoomId;
  onSelect: (level: DifficultyLevel) => void;
  onCancel: () => void;
}

export function DifficultyModal({ roomId, onSelect, onCancel }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f0f1a',
        border: '3px solid #ffe59a',
        padding: 20,
        minWidth: 260,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        <div style={{ color: '#ffe59a', fontSize: 9, marginBottom: 14, textAlign: 'center' }}>
          {ROOM_LABEL[roomId]} — SELECT LEVEL
        </div>

        {LEVELS.map(({ level, name, desc, color }) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            style={{
              display: 'block', width: '100%',
              background: '#2a2a3e', border: `2px solid ${color}`,
              padding: '8px 12px', marginBottom: 8,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ color, fontSize: 8, marginBottom: 3 }}>{name}</div>
            <div style={{ color: '#555', fontSize: 7 }}>{desc}</div>
          </button>
        ))}

        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none',
              color: '#555', fontSize: 7, cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            ✕ cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/DifficultyModal.tsx
git commit -m "feat: add DifficultyModal component"
```

---

## Task 6: Wire DifficultyModal into RoomSelect + GameTab

**Files:**
- Modify: `src/features/game/components/RoomSelect.tsx`
- Modify: `src/features/game/GameTab.tsx`

- [ ] **Step 1: Update RoomSelect to open DifficultyModal on room click**

Replace the full content of `src/features/game/components/RoomSelect.tsx`:

```tsx
import React, { useState } from 'react';
import type { DifficultyLevel } from '../types/tasks';
import { DifficultyModal } from './DifficultyModal';

export type RoomId = 'cafe' | 'house' | 'supermarket';

interface Room {
  id: RoomId;
  label: string;
  chinese: string;
  pinyin: string;
  exteriorSrc: string;
}

const ROOMS: Room[] = [
  { id: 'cafe',        label: 'Café',        chinese: '咖啡厅', pinyin: 'kāfēi tīng', exteriorSrc: '/rooms/cafe-exterior.jpeg' },
  { id: 'house',       label: 'House',       chinese: '住宅',   pinyin: 'zhùzhái',    exteriorSrc: '/rooms/house-exterior.jpeg' },
  { id: 'supermarket', label: 'Supermarket', chinese: '超市',   pinyin: 'chāoshì',    exteriorSrc: '/rooms/supermarket-exterior.jpeg' },
];

interface Props {
  onEnter: (roomId: RoomId, level: DifficultyLevel) => void;
}

export function RoomSelect({ onEnter }: Props) {
  const [pendingRoom, setPendingRoom] = useState<RoomId | null>(null);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#1a1a2e', gap: 32, padding: 24,
    }}>
      <h2 style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 13,
        color: '#ffe59a', margin: 0, letterSpacing: 2,
      }}>
        Choose a Location
      </h2>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => setPendingRoom(room.id)}
            style={{
              background: '#2a2a3e',
              border: '3px solid #4a4a6e',
              boxShadow: '4px 4px 0 #000',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 210,
              fontFamily: "'Press Start 2P', monospace",
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <img
              src={room.exteriorSrc}
              alt={room.label}
              style={{ width: '100%', imageRendering: 'pixelated', display: 'block', objectFit: 'cover', height: 160 }}
            />
            <div style={{ padding: '12px 10px', textAlign: 'center', width: '100%' }}>
              <div style={{ color: '#ffe59a', fontSize: 9, marginBottom: 4 }}>{room.label}</div>
              <div style={{ color: '#aaaacc', fontSize: 8, marginBottom: 2 }}>{room.chinese}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 7, marginBottom: 8 }}>{room.pinyin}</div>
              <div style={{
                color: '#000', background: '#83d68e', fontSize: 7,
                padding: '4px 8px', border: '2px solid #000', display: 'inline-block',
              }}>
                Enter →
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.25)', marginTop: 8,
      }}>
        Q = Flashcard Quiz
      </div>

      {pendingRoom && (
        <DifficultyModal
          roomId={pendingRoom}
          onSelect={(level) => {
            onEnter(pendingRoom, level);
            setPendingRoom(null);
          }}
          onCancel={() => setPendingRoom(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update GameTab to handle new RoomSelect signature**

In `src/features/game/GameTab.tsx`, update the `RoomSelect` usage:

```tsx
{scene === 'select' && (
  <RoomSelect
    onEnter={(id, level) => {
      setDifficultyLevel(level);
      setScene(id);
    }}
  />
)}
```

- [ ] **Step 3: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```
Open http://localhost:3000 → Game tab → click Café → DifficultyModal should appear → click LV.1 → should enter room. Rooms appear in order: Café, House, Supermarket.

- [ ] **Step 5: Commit**

```bash
git add src/features/game/components/RoomSelect.tsx src/features/game/GameTab.tsx
git commit -m "feat: wire DifficultyModal into room selection flow"
```

---

## Task 7: TaskCard Component

**Files:**
- Create: `src/features/game/components/TaskCard.tsx`

- [ ] **Step 1: Create TaskCard**

```tsx
// src/features/game/components/TaskCard.tsx
import React from 'react';
import type { Task, TaskProgress } from '../types/tasks';

interface Props {
  task: Task;
  progress: TaskProgress;
}

function taskTitle(task: Task): string {
  switch (task.kind) {
    case 'find-item':    return `FIND IT`;
    case 'shopping-list': return `SHOPPING LIST`;
    case 'timed-sprint': return `TIMED SPRINT`;
    case 'recipe-combo': return task.comboName.toUpperCase();
  }
}

function taskBody(task: Task, progress: TaskProgress): React.ReactNode {
  if (task.kind === 'find-item') {
    return (
      <>
        <div style={{ color: '#fff', fontSize: 8 }}>
          {task.targetIcon} {task.targetEnglish}
        </div>
        <div style={{ color: '#aaaacc', fontSize: 7 }}>{task.targetChinese}</div>
        <div style={{ color: '#83d68e', fontSize: 7, marginTop: 4 }}>
          {progress.isComplete ? '✓ done' : `${progress.current}/${progress.target}`}
        </div>
      </>
    );
  }
  if (task.kind === 'shopping-list') {
    return (
      <>
        {task.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 2 }}>
            <div style={{
              width: 8, height: 8, flexShrink: 0,
              background: i < progress.current ? '#83d68e' : 'transparent',
              border: `1px solid ${i < progress.current ? '#83d68e' : '#4a4a6e'}`,
            }} />
            <span style={{
              color: i < progress.current ? '#83d68e' : '#fff',
              fontSize: 7,
              textDecoration: i < progress.current ? 'line-through' : 'none',
            }}>
              {item.chinese}
            </span>
          </div>
        ))}
      </>
    );
  }
  if (task.kind === 'timed-sprint') {
    return (
      <div style={{ color: '#ff6b6b', fontSize: 8 }}>
        Score: {progress.current}
      </div>
    );
  }
  if (task.kind === 'recipe-combo') {
    return (
      <>
        {task.targetChinese.map((word, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 2 }}>
            <div style={{
              width: 8, height: 8, flexShrink: 0,
              background: i < progress.current ? '#83d68e' : 'transparent',
              border: `1px solid ${i < progress.current ? '#83d68e' : '#4a4a6e'}`,
            }} />
            <span style={{ color: i < progress.current ? '#83d68e' : '#fff', fontSize: 7 }}>
              {word}
            </span>
          </div>
        ))}
      </>
    );
  }
  return null;
}

function taskColor(task: Task): string {
  switch (task.kind) {
    case 'find-item':    return '#ffe59a';
    case 'shopping-list': return '#ffe59a';
    case 'timed-sprint': return '#ff6b6b';
    case 'recipe-combo': return '#c792ea';
  }
}

export function TaskCard({ task, progress }: Props) {
  return (
    <div style={{
      position: 'absolute', bottom: 10, right: 10, zIndex: 20,
      background: 'rgba(0,0,0,0.88)',
      border: `2px solid ${taskColor(task)}`,
      padding: '7px 10px',
      maxWidth: 180,
      fontFamily: "'Press Start 2P', monospace",
      pointerEvents: 'none',
    }}>
      <div style={{ color: taskColor(task), fontSize: 7, marginBottom: 5 }}>
        📋 {taskTitle(task)}
      </div>
      {taskBody(task, progress)}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/TaskCard.tsx
git commit -m "feat: add TaskCard corner HUD component"
```

---

## Task 8: Wire LV.1 Into RoomInterior

**Files:**
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Update RoomInterior props and add LV.1 task state**

Replace the full `RoomInterior.tsx` with:

```tsx
import React, { useState, useEffect } from 'react';
import { RoomItem, InteriorItem, SpaceId } from '../../../types/domain';
import { useRoomEngine, ROOM_W, ROOM_H } from '../hooks/useRoomEngine';
import { VocabPopup } from './VocabPopup';
import { TaskCard } from './TaskCard';
import type { RoomId } from './RoomSelect';
import type { DifficultyLevel, Task, TaskProgress, ActiveRoomInfo } from '../types/tasks';
import { generateFindTask } from '../systems/roomTaskSystem';

const BG: Record<RoomId, string> = {
  cafe:        '/rooms/cafe-interior.jpeg',
  supermarket: '/rooms/supermarket-interior.png',
  house:       '/rooms/house-interior.jpeg',
};

const SPACE_ID: Record<RoomId, SpaceId> = {
  cafe:        'cafe',
  supermarket: 'supermarket',
  house:       'house',
};

function toInteriorItem(item: RoomItem, roomId: RoomId): InteriorItem {
  return {
    id: item.id,
    spaceId: SPACE_ID[roomId],
    chinese: item.chinese,
    pinyin: item.pinyin,
    english: item.english,
    icon: item.icon,
    xp: item.xp,
    x: Math.round((item.xPct / 100) * ROOM_W),
    y: Math.round((item.yPct / 100) * ROOM_H),
  };
}

function NearItemHighlight({ nearItem }: { nearItem: RoomItem | null }) {
  if (!nearItem) return null;
  return (
    <div style={{
      position: 'absolute',
      left: `${nearItem.xPct}%`,
      top: `${nearItem.yPct}%`,
      transform: 'translate(-50%, -50%)',
      width: 34, height: 34, borderRadius: '50%',
      boxShadow: '0 0 30px 14px rgba(255, 220, 80, 0.9)',
      background: 'rgba(255, 220, 80, 0.2)',
      pointerEvents: 'none', zIndex: 6,
    }}>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 56, height: 56, borderRadius: '50%',
        border: '2px solid rgba(255, 234, 140, 0.95)',
        boxShadow: '0 0 18px 5px rgba(255, 215, 100, 0.7)',
        animation: 'room-near-pulse 1.2s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '100%', left: '50%',
        transform: 'translateX(-50%)', marginBottom: 14,
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: '#ffffff', background: 'rgba(0,0,0,0.75)',
        padding: '3px 6px', whiteSpace: 'nowrap', borderRadius: 2,
      }}>
        {nearItem.chinese}
      </div>
    </div>
  );
}

interface Props {
  roomId: RoomId;
  items: RoomItem[];
  avatarPresetId?: string;
  difficultyLevel: DifficultyLevel;
  onBack: () => void;
  onSave: (item: InteriorItem) => void;
  onRoomInfoChange: (info: ActiveRoomInfo | null) => void;
}

export function RoomInterior({ roomId, items, avatarPresetId, difficultyLevel, onBack, onSave, onRoomInfoChange }: Props) {
  const { canvasRef, containerRef, scale, nearItem } = useRoomEngine({ items, avatarPresetId });
  const [activeItem, setActiveItem] = useState<RoomItem | null>(null);

  // Task state (LV.1 only in this task; extended in Tasks 10–14)
  const [foundChinese, setFoundChinese] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<Task>(() => generateFindTask(items, []));

  const taskProgress: TaskProgress = {
    current: currentTask.kind === 'find-item' ? (foundChinese.includes(currentTask.targetChinese) ? 1 : 0) : 0,
    target: 1,
    isComplete: currentTask.kind === 'find-item' ? foundChinese.includes(currentTask.targetChinese) : false,
  };

  // Report room info to App HUD
  useEffect(() => {
    onRoomInfoChange({ roomId, found: foundChinese.length, total: [...new Set(items.map(i => i.chinese))].length });
  }, [foundChinese.length, roomId, items, onRoomInfoChange]);

  useEffect(() => {
    return () => onRoomInfoChange(null);
  }, [onRoomInfoChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { setActiveItem(null); return; }
      if (key === 'e' && nearItem && !activeItem) setActiveItem(nearItem);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearItem, activeItem]);

  const handleItemInspected = (item: RoomItem) => {
    const interiorItem = toInteriorItem(item, roomId);
    onSave(interiorItem);

    const updatedFound = foundChinese.includes(item.chinese)
      ? foundChinese
      : [...foundChinese, item.chinese];
    setFoundChinese(updatedFound);

    // LV.1: advance task immediately after VocabPopup
    if (difficultyLevel === 1) {
      setCurrentTask(generateFindTask(items, updatedFound));
    }
    // LV.2 and LV.3 handled in Tasks 10–14
    setActiveItem(null);
  };

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    speechSynthesis.speak(utt);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#000' }}
    >
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: ROOM_W, height: ROOM_H,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center',
      }}>
        <img
          src={BG[roomId]}
          alt="room"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'fill',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
        <style>{`
          @keyframes room-near-pulse {
            0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
          }
        `}</style>
        <NearItemHighlight nearItem={nearItem} />
        <canvas
          ref={canvasRef}
          width={ROOM_W}
          height={ROOM_H}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
        />
      </div>

      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 20,
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.75)', border: '2px solid #4a4a6e',
          color: '#aaaacc', padding: '6px 10px', cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      <div style={{
        position: 'absolute', left: 12, top: 44, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.5)',
        padding: '4px 8px', lineHeight: 1.8,
      }}>
        WASD / ARROWS = MOVE{'  '}·{'  '}E = INSPECT{'  '}·{'  '}ESC = CLOSE
      </div>

      {nearItem && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.88)', border: '3px solid #83d68e', color: '#b8ffbe',
          padding: '8px 14px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          [E] inspect {nearItem.chinese}
        </div>
      )}

      {activeItem && (
        <VocabPopup
          item={toInteriorItem(activeItem, roomId)}
          onClose={() => handleItemInspected(activeItem)}
          onSave={(interiorItem) => { onSave(interiorItem); }}
          onSpeak={speak}
        />
      )}

      <TaskCard task={currentTask} progress={taskProgress} />
    </div>
  );
}
```

- [ ] **Step 2: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
Enter Café at LV.1 → TaskCard appears bottom-right with "FIND IT + item name" → walk near item → press E → VocabPopup → close → TaskCard updates to next item. HUD in header shows `ROOM CAFÉ · LVL 1 · FOUND X/Y`.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: wire LV.1 task loop and HUD into RoomInterior"
```

---

## Task 9: QuizPopup Component

**Files:**
- Create: `src/features/game/components/QuizPopup.tsx`

- [ ] **Step 1: Create QuizPopup**

```tsx
// src/features/game/components/QuizPopup.tsx
import React, { useState } from 'react';
import { RoomItem } from '../../../types/domain';
import { normalizePinyin } from '../systems/pinyinUtils';

type QuizFormat = 'pinyin' | 'mc';

interface Props {
  item: RoomItem;
  allItems: RoomItem[];   // pool for MC distractors
  format: QuizFormat;
  onComplete: (correct: boolean) => void;
}

function pickDistractors(correct: RoomItem, allItems: RoomItem[]): string[] {
  const others = allItems
    .filter(i => i.english !== correct.english)
    .map(i => i.english);
  const unique = [...new Set(others)];
  const shuffled = unique.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function QuizPopup({ item, allItems, format, onComplete }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const checkPinyin = () => {
    const isCorrect = normalizePinyin(input) === normalizePinyin(item.pinyin);
    setCorrect(isCorrect);
    setSubmitted(true);
  };

  const handleMcChoice = (choice: string) => {
    const isCorrect = choice === item.english;
    setCorrect(isCorrect);
    setSubmitted(true);
  };

  const distractors = format === 'mc'
    ? pickDistractors(item, allItems)
    : [];
  const mcOptions = format === 'mc'
    ? [...distractors, item.english].sort(() => Math.random() - 0.5)
    : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f0f1a',
        border: `3px solid ${submitted ? (correct ? '#83d68e' : '#ff6b6b') : '#ffe59a'}`,
        padding: 20, minWidth: 280,
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>

        {format === 'pinyin' && (
          <>
            <div style={{ color: '#aaa', fontSize: 8, marginBottom: 12 }}>
              {item.english} — type the pinyin:
            </div>
            {!submitted ? (
              <>
                <input
                  autoFocus
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') checkPinyin(); }}
                  style={{
                    background: '#1a1a2e', border: '2px solid #4a4a6e',
                    color: '#fff', fontSize: 11, padding: '6px 10px',
                    width: 160, fontFamily: "'Press Start 2P', monospace",
                  }}
                  placeholder="pinyin..."
                />
                <br />
                <button
                  onClick={checkPinyin}
                  style={{
                    marginTop: 10, background: '#ffe59a', color: '#000',
                    border: 'none', padding: '6px 14px', fontSize: 8,
                    fontFamily: "'Press Start 2P', monospace", cursor: 'pointer',
                  }}
                >
                  CHECK ✓
                </button>
              </>
            ) : (
              <div style={{ color: correct ? '#83d68e' : '#ff6b6b', fontSize: 8, marginBottom: 8 }}>
                {correct ? '✓ Correct!' : `✗ Answer: ${item.pinyin}`}
              </div>
            )}
          </>
        )}

        {format === 'mc' && (
          <>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>{item.chinese}</div>
            <div style={{ color: '#aaa', fontSize: 8, marginBottom: 12 }}>What does this mean?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mcOptions.map(opt => (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => handleMcChoice(opt)}
                  style={{
                    background: submitted && opt === item.english ? '#83d68e'
                              : submitted && opt === input ? '#ff6b6b'
                              : '#2a2a3e',
                    border: `2px solid ${submitted && opt === item.english ? '#83d68e'
                              : submitted && opt === input ? '#ff6b6b'
                              : '#4a4a6e'}`,
                    color: submitted && opt === item.english ? '#000' : '#fff',
                    padding: '6px 10px', fontSize: 8,
                    fontFamily: "'Press Start 2P', monospace", cursor: submitted ? 'default' : 'pointer',
                  }}
                  // track last clicked for highlighting
                  onMouseDown={() => { if (!submitted) setInput(opt); }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {submitted && (
          <button
            onClick={() => onComplete(correct)}
            style={{
              marginTop: 14, background: '#4a4a6e', color: '#fff',
              border: '2px solid #7a7aae', padding: '6px 14px', fontSize: 8,
              fontFamily: "'Press Start 2P', monospace", cursor: 'pointer',
            }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/QuizPopup.tsx
git commit -m "feat: add QuizPopup component for LV.2 pinyin and MC quiz"
```

---

## Task 10: Wire LV.2 Into RoomInterior

**Files:**
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Add quizState and inspectedCount to RoomInterior**

After the existing task state declarations, add:

```tsx
const [inspectedCount, setInspectedCount] = useState(0);
const [quizItem, setQuizItem] = useState<RoomItem | null>(null);
```

Add the `QuizPopup` import at the top of the file:
```tsx
import { QuizPopup } from './QuizPopup';
```

Replace the entire `handleItemInspected` function with this version (it removes the unconditional `onSave` call at the top — for LV.2, XP is granted only after the quiz, not immediately):

```tsx
const handleItemInspected = (item: RoomItem) => {
  const updatedFound = foundChinese.includes(item.chinese)
    ? foundChinese
    : [...foundChinese, item.chinese];
  setFoundChinese(updatedFound);
  setInspectedCount(c => c + 1);
  setActiveItem(null);

  if (difficultyLevel === 1) {
    onSave(toInteriorItem(item, roomId));  // XP immediately for LV.1
    setCurrentTask(generateFindTask(items, updatedFound));
  } else if (difficultyLevel === 2) {
    setQuizItem(item);  // onSave (XP) deferred to quiz completion below
  }
  // LV.3 branches added in Tasks 11–13
};
```

Add the quiz format logic before the return statement:
```tsx
const quizFormat = inspectedCount % 2 === 0 ? 'pinyin' : 'mc';
```

In the JSX, after `<TaskCard task={currentTask} progress={taskProgress} />`, add:
```tsx
{quizItem && difficultyLevel === 2 && (
  <QuizPopup
    item={quizItem}
    allItems={items}
    format={quizFormat}
    onComplete={() => {
      onSave(toInteriorItem(quizItem, roomId));  // XP granted after quiz
      setCurrentTask(generateFindTask(items, foundChinese));
      setQuizItem(null);
    }}
  />
)}
```

- [ ] **Step 2: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
Enter House at LV.2 → walk near TV → press E → VocabPopup → close → QuizPopup appears. First item: pinyin input. Second item: multiple choice. Each question shows CONTINUE → after answering.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: wire LV.2 quiz loop into RoomInterior"
```

---

## Task 11: LV.3 Shopping List Mode

**Files:**
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Add LV.3 shopping list state and logic**

Import at top of `RoomInterior.tsx`:
```tsx
import {
  generateFindTask,
  generateShoppingList,
  generateTimedSprint,
  generateRecipeCombo,
  getNextChallengeMode,
  readChallengeModeIndex,
  advanceChallengeModeIndex,
} from '../systems/roomTaskSystem';
import type { ChallengeMode } from '../types/tasks';
```

Add state for LV.3 mode (initialize once on mount):
```tsx
const [challengeMode] = useState<ChallengeMode>(() => {
  if (difficultyLevel !== 3) return 'shopping-list';
  return getNextChallengeMode(readChallengeModeIndex(roomId));
});

// Initialize task based on level + mode
const [currentTask, setCurrentTask] = useState<Task>(() => {
  if (difficultyLevel === 1 || difficultyLevel === 2) return generateFindTask(items, []);
  if (challengeMode === 'shopping-list') return generateShoppingList(items, 4);
  if (challengeMode === 'timed-sprint') return generateTimedSprint();
  return generateRecipeCombo(roomId);
});
```

(Remove the earlier `useState<Task>(() => generateFindTask(items, []))` line and replace with the above block.)

Update `handleItemInspected` for the shopping list branch:
```tsx
} else if (difficultyLevel === 3 && challengeMode === 'shopping-list') {
  if (currentTask.kind === 'shopping-list') {
    const listChinese = currentTask.items.map(i => i.chinese);
    if (listChinese.includes(item.chinese)) {
      const updatedProgress = foundChinese.filter(c => listChinese.includes(c)).length + 1;
      if (updatedProgress >= currentTask.items.length) {
        // All found — task complete, advance rotation
        advanceChallengeModeIndex(roomId);
      }
    }
  }
}
```

Update `taskProgress` computation to handle shopping list:
```tsx
const taskProgress: TaskProgress = (() => {
  if (currentTask.kind === 'find-item') {
    const done = foundChinese.includes(currentTask.targetChinese);
    return { current: done ? 1 : 0, target: 1, isComplete: done };
  }
  if (currentTask.kind === 'shopping-list') {
    const listChinese = currentTask.items.map(i => i.chinese);
    const found = foundChinese.filter(c => listChinese.includes(c)).length;
    return { current: found, target: currentTask.items.length, isComplete: found >= currentTask.items.length };
  }
  if (currentTask.kind === 'timed-sprint') {
    return { current: foundChinese.length, target: Infinity, isComplete: false };
  }
  if (currentTask.kind === 'recipe-combo') {
    const found = currentTask.targetChinese.filter(c => foundChinese.includes(c)).length;
    return { current: found, target: currentTask.targetChinese.length, isComplete: found >= currentTask.targetChinese.length };
  }
  return { current: 0, target: 1, isComplete: false };
})();
```

- [ ] **Step 2: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Enter Café at LV.3 (should be shopping list on first visit) → TaskCard shows 4 Chinese words → walk near matching items → each collected item gets checked off in the TaskCard.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: add LV.3 shopping list mode to RoomInterior"
```

---

## Task 12: LV.3 Timed Sprint

**Files:**
- Create: `src/features/game/components/ChallengeTimer.tsx`
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Create ChallengeTimer component**

```tsx
// src/features/game/components/ChallengeTimer.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  durationSeconds: number;
  score: number;
  onTimeUp: () => void;
}

export function ChallengeTimer({ durationSeconds, score, onTimeUp }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return; }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onTimeUp]);

  const pct = (remaining / durationSeconds) * 100;
  const color = remaining <= 10 ? '#ff6b6b' : remaining <= 20 ? '#ffe59a' : '#83d68e';

  return (
    <div style={{
      position: 'absolute', top: 10, right: 10, zIndex: 20,
      background: 'rgba(0,0,0,0.88)', border: `2px solid ${color}`,
      padding: '8px 12px', minWidth: 140,
      fontFamily: "'Press Start 2P', monospace",
      pointerEvents: 'none',
    }}>
      <div style={{ color, fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
        {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
      </div>
      <div style={{ background: '#333', height: 5, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ background: color, width: `${pct}%`, height: '100%', transition: 'width 1s linear' }} />
      </div>
      <div style={{ color: '#aaa', fontSize: 7 }}>Score: <strong style={{ color: '#fff' }}>{score}</strong></div>
    </div>
  );
}
```

- [ ] **Step 2: Add timed sprint state and timer display to RoomInterior**

Add import:
```tsx
import { ChallengeTimer } from './ChallengeTimer';
```

Add `timerEnded` state:
```tsx
const [timerEnded, setTimerEnded] = useState(false);
```

In the JSX, after the Back button, add:
```tsx
{difficultyLevel === 3 && challengeMode === 'timed-sprint' && !timerEnded && currentTask.kind === 'timed-sprint' && (
  <ChallengeTimer
    durationSeconds={currentTask.durationSeconds}
    score={foundChinese.length}
    onTimeUp={() => {
      setTimerEnded(true);
      advanceChallengeModeIndex(roomId);
    }}
  />
)}
{timerEnded && (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Press Start 2P', monospace",
  }}>
    <div style={{ color: '#ffe59a', fontSize: 12, marginBottom: 16 }}>TIME'S UP!</div>
    <div style={{ color: '#fff', fontSize: 9, marginBottom: 24 }}>
      You found <strong style={{ color: '#83d68e' }}>{foundChinese.length}</strong> items
    </div>
    <button
      onClick={onBack}
      style={{
        background: '#83d68e', color: '#000', border: 'none',
        padding: '8px 16px', fontSize: 8,
        fontFamily: "'Press Start 2P', monospace", cursor: 'pointer',
      }}
    >
      BACK TO MAP
    </button>
  </div>
)}
```

- [ ] **Step 3: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

Enter a room at LV.3 when it's timed sprint's turn (second session in that room) → 60s countdown appears top-right → find items → timer hits 0 → "TIME'S UP!" overlay shows score.

- [ ] **Step 5: Commit**

```bash
git add src/features/game/components/ChallengeTimer.tsx src/features/game/components/RoomInterior.tsx
git commit -m "feat: add LV.3 timed sprint mode with ChallengeTimer"
```

---

## Task 13: LV.3 Recipe Combo Mode

**Files:**
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Add recipe combo logic and post-combo QuizPopup**

Add `comboQuizItems` state to RoomInterior:
```tsx
const [comboQuizItems, setComboQuizItems] = useState<RoomItem[]>([]);
const [comboQuizIndex, setComboQuizIndex] = useState(0);
const [showComboQuiz, setShowComboQuiz] = useState(false);
```

In `handleItemInspected`, add recipe-combo branch after the shopping-list branch:
```tsx
} else if (difficultyLevel === 3 && challengeMode === 'recipe-combo') {
  if (currentTask.kind === 'recipe-combo') {
    const allCollected = currentTask.targetChinese.every(c => updatedFound.includes(c));
    if (allCollected) {
      // Gather one RoomItem representative per targetChinese word for the quiz
      const quizItems = currentTask.targetChinese
        .map(c => items.find(i => i.chinese === c))
        .filter((i): i is RoomItem => i !== undefined);
      setComboQuizItems(quizItems);
      setComboQuizIndex(0);
      setShowComboQuiz(true);
    }
  }
}
```

In the JSX, add the combo quiz overlay after the regular QuizPopup:
```tsx
{showComboQuiz && comboQuizItems[comboQuizIndex] && (
  <QuizPopup
    item={comboQuizItems[comboQuizIndex]}
    allItems={items}
    format="mc"
    onComplete={() => {
      const next = comboQuizIndex + 1;
      if (next >= comboQuizItems.length) {
        setShowComboQuiz(false);
        advanceChallengeModeIndex(roomId);
      } else {
        setComboQuizIndex(next);
      }
    }}
  />
)}
```

- [ ] **Step 2: Lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Enter a room at LV.3 when it's recipe-combo's turn (third session) → TaskCard shows combo items → collect all combo items → MC quiz fires for each item in the set → after last quiz, mode advances.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: add LV.3 recipe combo mode with post-combo quiz"
```

---

## Task 14: Final Lint, Build & Manual Verification

- [ ] **Step 1: Run full checks**

```bash
npm run lint && npm run build
```
Expected: both pass with no errors.

- [ ] **Step 2: Verify success criteria checklist**

Manually test each item from the spec:

- [ ] Room Select shows Café → House → Supermarket
- [ ] Clicking a room opens DifficultyModal with LV.1/2/3 options
- [ ] HUD shows `ROOM · LVL · FOUND X/Y` inside a room; reverts to `LVL · WORDS` on exit
- [ ] TaskCard appears bottom-right in all rooms at all levels
- [ ] LV.1: VocabPopup only, next task auto-generated after closing
- [ ] LV.2: pinyin quiz appears on even items, MC quiz on odd items
- [ ] LV.3 shopping list: Chinese-only list, items checked off on find
- [ ] LV.3 timed sprint: 60s countdown, score tracked, summary on time-up
- [ ] LV.3 recipe combo: collect set → per-item MC quiz → mode advances
- [ ] LV.3 mode rotates each session (open same room 3× to cycle through all modes)

- [ ] **Step 3: Commit final state**

```bash
git add -A
git commit -m "feat: complete room levels and task system"
```
