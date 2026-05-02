# Proximity Glow Highlight — Design Spec

**Date:** 2026-05-01  
**Status:** Approved

---

## Problem

Items in each room are tagged by `xPct`/`yPct` coordinates but have no visual presence in the scene. Players see no indication of where interactable objects are until they accidentally walk close enough to trigger the bottom "[E] inspect" banner. Misplaced tags are also invisible and hard to diagnose.

---

## Goal

Make all tagged items subtly visible in the scene at all times, and highlight the nearest one when the player is in proximity — so players know what's interactable and are guided naturally toward objects.

---

## Architecture

Add a single new `ItemGlowLayer` inline component inside `RoomInterior.tsx`. It sits between the background PNG and the player canvas:

```
<div> 1280×720 scaled scene
  ├── <img>              ← background PNG (unchanged)
  ├── <ItemGlowLayer>    ← NEW: glow overlay for all items
  └── <canvas>           ← player sprite (unchanged)
```

No changes to `useRoomEngine.ts`, data files, `VocabPopup`, or any upstream components.

---

## Data Flow

`RoomInterior` already has all required data:

- `items: RoomItem[]` — prop passed in from `GameTab`
- `nearItem: RoomItem | null` — returned by `useRoomEngine` (already computed at 70px radius)

Both are passed directly to `ItemGlowLayer`. No new props or state needed.

---

## Visual Behaviour

Each item renders as a 24×24px invisible hotspot absolutely positioned at `left: item.xPct%, top: item.yPct%` with `transform: translate(-50%, -50%)` to center it on the tagged point.

### Default state (always visible)
- Faint yellow glow: `box-shadow: 0 0 12px 6px rgba(255, 220, 80, 0.25)`
- No label

### Near state (`item.id === nearItem?.id`)
- Bright yellow glow: `box-shadow: 0 0 20px 10px rgba(255, 220, 80, 0.75)`
- Floating label 14px above the hotspot: Chinese word only (e.g. `木桶`)
  - Font: `'Press Start 2P'`, 7px, white text
  - Background: dark semi-transparent pill (`rgba(0,0,0,0.75)`)
  - `whiteSpace: nowrap` to prevent wrapping

No pulse animation — static glow only.

---

## Scope

**In scope:**
- `RoomInterior.tsx` — add `ItemGlowLayer` (~25 lines)
- Works automatically for all three rooms (cafe, house, supermarket) since they share `RoomInterior`

**Out of scope:**
- Fixing misplaced `xPct`/`yPct` values in data files (separate task — this feature will make bad positions obvious)
- Pinyin or English in the floating label
- Difficulty/rarity-based glow colors
- Pulse animation

---

## Files Changed

| File | Change |
|------|--------|
| `src/features/game/components/RoomInterior.tsx` | Add `ItemGlowLayer` inline component, insert between `<img>` and `<canvas>` |

All other files unchanged.
