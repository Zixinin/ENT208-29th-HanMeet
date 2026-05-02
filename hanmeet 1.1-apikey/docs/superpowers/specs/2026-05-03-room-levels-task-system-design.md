# HanMeet — Room Levels & Task System Design

**Date:** 2026-05-03  
**Status:** Approved  

---

## Overview

Redesign HanMeet's game loop to add per-room difficulty levels and a task system. Every room now has three playable difficulty levels. The task type (explore / quiz / challenge) is chosen by the player at room entry. The vocabulary theme is determined by the room (Café, House, Supermarket).

---

## 1. Room Order & Level Assignment

Rooms are reordered in `RoomSelect.tsx` to communicate increasing vocabulary complexity:

| Order | Room | Chinese | Difficulty Theme |
|-------|------|---------|-----------------|
| 1 | Café | 咖啡厅 | Ordering, dining, service |
| 2 | House | 住宅 | Household objects, daily life |
| 3 | Supermarket | 超市 | Food, shopping, quantities |

All rooms are freely accessible from the start — no locking.

---

## 2. HUD Redesign

**Current:** `LVL 1 · WORDS 1 · SPACES 1/4`  
**New:** `ROOM CAFÉ · LVL 1 · FOUND 3/12`

- **ROOM** — name of the currently active room. Shows overall words saved when not in a room.
- **LVL** — the player's overall XP level (unchanged logic).
- **FOUND X/Y** — items discovered in this room session / total items in that room.

Change location: `App.tsx:89–92`.

---

## 3. Difficulty Levels (apply to every room)

When a player clicks a room card, a modal appears letting them choose:

| Level | Name | Task Loop |
|-------|------|-----------|
| LV.1 | Explore | Walk near item → press E → VocabPopup (Chinese + pinyin + pronunciation) → done → XP |
| LV.2 | Quiz | Walk near item → press E → VocabPopup → quiz popup → correct answer → XP |
| LV.3 | Challenge | Rotating challenge mode (see §5) → complete → XP |

The selected level is passed into `RoomInterior` as a `difficultyLevel: 1 | 2 | 3` prop.

---

## 4. LV.2 Quiz Format

After the VocabPopup closes, a quiz popup appears. Tasks **alternate** between two formats:

**Format A — Type the Pinyin**
- Show: item emoji + English label
- Input: text field, player types pinyin (e.g. `diànshì`)
- Correct: case-insensitive string match after stripping tone diacritics from both input and answer (e.g. `diànshì` → `dianshi`)

**Format B — Multiple Choice (Chinese → English)**
- Show: item emoji + Chinese characters
- Input: 4 buttons (1 correct, 3 random distractors from same room's item pool)
- Correct: player taps correct English meaning

The quiz format alternates based on how many items the player has inspected in the current session (0-indexed): even count → Format A (pinyin), odd count → Format B (MC). Both award the same XP on correct answer. Wrong answers show the correct answer and award 50% XP — no fail state, the game always continues.

---

## 5. LV.3 Challenge Modes

Three modes **rotate each session** (cycle: A → B → C → A…). State tracked in `localStorage` key `hanmeet-lv3-mode-{roomId}` (stores `0`, `1`, or `2`) so the rotation persists across sessions per room.

### A — Chinese Shopping List
- On room entry, generate a list of 3–5 room items shown **in Chinese characters only** (no pinyin, no English).
- Player must read the characters, locate each item in the room, and press E to collect.
- Completion: all list items collected → XP reward.

### B — Timed Sprint
- 60-second timer displayed prominently in the task card.
- Player finds as many items as possible before time runs out.
- Each item found = points. Timer ends → summary screen shows score + new words learned.
- No fail state — any items found count.

### C — Recipe Combo + Vocab Quiz
- Present a named combo (e.g. "Quick Breakfast", "Noodle Night Kit") from the room's item set.
- Player collects all combo items by finding them in the room.
- After collecting all: a vocab quiz appears covering all combo items (MC format, same no-fail rules as LV.2).
- Completion: all items found + quiz completed → XP reward (correct answers = full XP, wrong = 50% XP).
- (Supermarket already has COMBOS defined in `questSystem.ts`; Café and House need combo sets added to their data files.)

---

## 6. Architecture — New Files & Changes

### New files

```
src/features/game/
  types/
    tasks.ts                    ← shared Task, TaskProgress, DifficultyLevel types
  systems/
    cafeTaskSystem.ts           ← LV.1/2/3 task generators for Café items
    houseTaskSystem.ts          ← LV.1/2/3 task generators for House items
    (questSystem.ts extended)   ← LV.3 combo data added for Café & House
  components/
    TaskCard.tsx                ← bottom-right corner task UI
    DifficultyModal.tsx         ← difficulty picker shown on room click
    QuizPopup.tsx               ← LV.2 quiz (pinyin type + MC, reused across rooms)
    ChallengeTimer.tsx          ← LV.3 timed sprint countdown + score display
```

### Modified files

| File | Change |
|------|--------|
| `App.tsx:89–92` | HUD: ROOM · LVL · FOUND X/Y |
| `RoomSelect.tsx` | Reorder rooms (Café, House, Supermarket); click triggers DifficultyModal not direct entry |
| `GameTab.tsx` | Pass `difficultyLevel` to RoomInterior; track per-room found count |
| `RoomInterior.tsx` | Accept `difficultyLevel` prop; mount TaskCard; trigger QuizPopup after VocabPopup at LV.2 |
| `data/cafeRoomItems.ts` | Add combo definitions for LV.3 recipe mode |
| `data/houseRoomItems.ts` | Add combo definitions for LV.3 recipe mode |

### Shared types (`tasks.ts`)

```ts
export type DifficultyLevel = 1 | 2 | 3;

export type TaskKind =
  | 'find-item'           // LV.1 + LV.2
  | 'pinyin-quiz'         // LV.2
  | 'multiple-choice'     // LV.2 + LV.3 recipe quiz
  | 'shopping-list'       // LV.3
  | 'timed-sprint'        // LV.3
  | 'recipe-combo';       // LV.3

export interface Task {
  id: string;
  kind: TaskKind;
  title: string;
  description: string;
  xpReward: number;
}

export interface TaskProgress {
  current: number;
  target: number;
  isComplete: boolean;
}
```

---

## 7. Data Flow

```
Player clicks room card
  → DifficultyModal opens (LV.1 / LV.2 / LV.3)
  → Player selects level → RoomInterior mounts with difficultyLevel prop
  → TaskCard renders in bottom-right corner with first task
  → Player walks near item → presses E → VocabPopup shows
  → VocabPopup closes:
      LV.1 → task complete → next task generated → XP
      LV.2 → QuizPopup opens → answer → task complete → XP
      LV.3 → depends on active mode:
          shopping-list: item checked off list
          timed-sprint: item counted toward score
          recipe-combo: item added to combo; when set complete → MC quiz
  → All tasks done → completion banner → return to room select
```

---

## 8. Out of Scope

- Room locking / unlock progression (all rooms freely accessible)
- Tone mark validation in pinyin quiz (plain text match for now)
- Persistent cross-session score leaderboard
- New room vocabulary (items use existing `cafeRoomItems`, `houseRoomItems`, `supermarketRoomItems`)

---

## 9. Success Criteria

- [ ] Room Select shows Café → House → Supermarket with level badges
- [ ] Clicking a room opens DifficultyModal with LV.1/2/3 options
- [ ] HUD shows `ROOM · LVL · FOUND X/Y` inside a room
- [ ] TaskCard appears bottom-right in all rooms at all levels
- [ ] LV.1: VocabPopup only, XP awarded, next task auto-generated
- [ ] LV.2: pinyin quiz and MC quiz alternate correctly
- [ ] LV.3 shopping list: Chinese-only list, items checked off on find
- [ ] LV.3 timed sprint: 60s countdown, score tracked, summary on end
- [ ] LV.3 recipe combo: collect set → MC quiz → XP
- [ ] LV.3 mode rotates each session per room (persisted in localStorage)
- [ ] `npm run lint && npm run build` pass with no errors
