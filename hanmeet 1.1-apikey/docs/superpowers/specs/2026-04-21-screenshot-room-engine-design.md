# Screenshot Room Engine — Design Spec
**Date:** 2026-04-21

## Overview

Replace the tile-based city overworld with a direct room-selection screen. Each room uses a real screenshot as the background, with a walking animated character and proximity-triggered vocabulary popups.

---

## Screen 1 — Room Selection

A centered card grid with 3 cards: Café, Supermarket, House.

Each card contains:
- Exterior placeholder image as thumbnail
- Room name in English + Chinese (e.g. "Café / 咖啡厅")
- "Enter →" click target (whole card is clickable)

Clicking a card sets the active scene and mounts the Room Interior screen. No animation required — instant transition.

**Assets:**
- `cafe placeholder.jpeg` → Café card
- `supermarket outside placeholder.jpeg` → Supermarket card
- `house placeholder.jpeg` → House card

---

## Screen 2 — Room Interior

### Layout
- Screenshot fills the full game viewport as a static `<img>` (object-fit: cover, pointer-events: none)
- Transparent `<canvas>` sits on top at the same size — renders only the animated character sprite
- Item hotspot `<div>`s are absolutely positioned using percentage coordinates (`left: X%`, `top: Y%`) so they scale with the container

### Character
- Reuses existing `usePlayerMovement` and `useCamera` hooks unchanged
- Canvas draws the Sunnyside idle/walk sprite sheet frames (existing draw logic from `useTileEngine`)
- Free movement — no collision detection
- Spawn position: center of the room

### Item Hotspots
- Each item is a zero-opacity `<div>` with a fixed pixel hit radius (32px)
- Defined in a per-room data file: `{ id, chinese, pinyin, english, xPct, yPct }`
- `xPct` / `yPct` are percentages of the room container's width/height

### Proximity Detection
- Runs on every `requestAnimationFrame` tick inside the room engine hook
- Converts item `xPct`/`yPct` to pixel coords based on current container size
- If character center is within 60px of any item center → `nearItem` state is set
- Only one item can be `nearItem` at a time (nearest wins)

### Interaction Flow
1. `nearItem` is set → "Press [E] to inspect {chinese}" prompt appears at bottom-center
2. User presses E → `activeItem` state is set → `VocabPopup` renders
3. `VocabPopup` shows: Chinese, pinyin, English, pronunciation button, Save to Notebook
4. ESC or click outside → clears `activeItem`
5. Back button (top-left) → returns to Room Selection screen

---

## New Hook — `useRoomEngine`

Replaces `useTileEngine` for interior scenes.

**Responsibilities:**
- Owns `canvasRef` and `containerRef`
- Runs the character sprite animation draw loop (canvas only, no tile rendering)
- Tracks container size via `ResizeObserver` for scale + hotspot pixel conversion
- Computes `nearItem` from character position vs item positions each frame
- Returns: `{ canvasRef, containerRef, scale, nearItem }`

**Does NOT handle:**
- Background rendering (that's a plain `<img>` in JSX)
- Item hotspot rendering (those are DOM divs)
- Keyboard events (handled in the Room component)

---

## Data Files (per room)

Each room gets one data file exporting an array of `RoomItem`:

```ts
interface RoomItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  xPct: number; // 0–100, percentage of container width
  yPct: number; // 0–100, percentage of container height
}
```

Files:
- `src/features/game/data/cafeRoomItems.ts`
- `src/features/game/data/supermarketRoomItems.ts`
- `src/features/game/data/houseRoomItems.ts`

Initial items (~5–8 per room) mapped to visible objects in each screenshot.

---

## New Components

| Component | Purpose |
|---|---|
| `RoomSelect.tsx` | Card grid — pick a room |
| `RoomInterior.tsx` | Screenshot background + canvas + hotspots + prompts |

---

## Deletions

| File | Reason |
|---|---|
| `src/features/game/components/CityMap.tsx` | Replaced by RoomSelect + RoomInterior |
| `src/features/game/data/cityLayout.ts` | Tile grid no longer needed |
| `src/features/game/hooks/useTileEngine.ts` | Replaced by useRoomEngine |
| `src/features/game/hooks/useCamera.ts` | Camera scroll not needed (room fits viewport) |

---

## Kept Unchanged

- `usePlayerMovement` — reused inside `useRoomEngine` with `tileSize=1`, `cols=containerWidth`, `rows=containerHeight`, `isBlockedFn: () => false` for free pixel movement
- `VocabPopup.tsx` — reused as-is for the popup
- `FlashcardQuiz.tsx` — unchanged
- All existing interior vocab data (supermarket, cafe, house items) — migrated to `RoomItem` format
- Notebook, dictionary, profile tabs — untouched

---

## Assets to Copy into `public/`

| File | Destination |
|---|---|
| `cafe placeholder.jpeg` | `public/rooms/cafe-exterior.jpeg` |
| `supermarket outside placeholder.jpeg` | `public/rooms/supermarket-exterior.jpeg` |
| `house placeholder.jpeg` | `public/rooms/house-exterior.jpeg` |
| `cafe.jpeg` | `public/rooms/cafe-interior.jpeg` |
| `supermarket.png` | `public/rooms/supermarket-interior.png` |
| `house interior.jpeg` | `public/rooms/house-interior.jpeg` |

---

## Success Criteria

- Room selection screen renders 3 cards with exterior images
- Clicking a card enters the correct interior
- Character spawns in center, moves freely with WASD/arrow keys
- Walking within 60px of an item shows the "Press [E]" prompt
- Pressing E shows VocabPopup with correct Chinese/pinyin/English
- Pronunciation button plays audio via Web Speech API
- Save to Notebook works
- Back button returns to room selection
- `npm run lint && npm run build` both pass
