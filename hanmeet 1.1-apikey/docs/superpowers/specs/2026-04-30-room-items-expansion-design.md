---
title: Room Items Expansion & Supermarket Fix
date: 2026-04-30
status: approved
---

# Room Items Expansion & Supermarket Fix

## Problem

Each room currently has exactly 8 interactable items. The supermarket positions are almost entirely wrong — coordinates don't match the objects visible in the background image. For demo day the rooms need to feel alive and explorable, with most visible objects being interactable.

## Goal

- Fix all supermarket item positions (remap from scratch)
- Expand all three rooms to cover major visible objects, including every instance of repeated objects (e.g. 3 sofas = 3 tagged hotspots)
- Reach ~68–75 total interactive items across the 3 rooms
- Zero code changes — data files only

## Scope

**Files changed:**
- `src/features/game/data/supermarketRoomItems.ts` — full rewrite
- `src/features/game/data/cafeRoomItems.ts` — expansion
- `src/features/game/data/houseRoomItems.ts` — expansion

**Files unchanged:** All components, hooks, types, and game logic stay the same.

## Data Schema (unchanged)

```ts
interface RoomItem {
  id: string;        // unique, e.g. "cafe-sofa-1"
  chinese: string;
  pinyin: string;
  english: string;
  description: string;
  icon: string;
  xp: number;
  xPct: number;      // 0–100, % of 1280px virtual width
  yPct: number;      // 0–100, % of 720px virtual height
}
```

Repeated objects share the same Chinese/pinyin/english/description/icon but get numbered IDs and distinct xPct/yPct values.

## Item Targets

### Supermarket (~15 items)
Full remap. Items derived from the pixel-art background:
- Furniture/fixtures: cashier counter, 3 shelf sections, fridge, shopping cart, basket, poster/sign
- Products: apple, milk, bread, juice, water, egg

### Cafe (~25–28 items)
Expand from 8. Items visible in background:
- 8 barrels (row along top wall)
- 3 framed posters on wall
- 2 wall lamps
- 1 counter/bar
- 4 coffee cups (one per seating area)
- 4 tables
- 8 chairs (2 per table)
- 2 sofas
- 4 plants
- 1 fireplace
- 1 bookshelf
- 3 stools

### House (~28–32 items)
Expand from 8. Multi-room layout covers kitchen, bedroom, living room, garden:
- 1 TV
- 2 sofas
- 1 armchair
- 2 beds
- 3 bookshelves
- 1 stove
- 1 fridge
- 8 plants (garden + interior)
- 3 windows
- 1 dining table
- 2 chairs
- 1 rug
- 1 fireplace
- 1 lamp

## Coordinate Strategy

- `xPct/yPct` values are estimated by visually dividing the background image into a percentage grid
- The virtual canvas is 1280×720; background is `objectFit: fill` so it fully occupies that space
- Supermarket is pixel-art and dense — positions clustered toward visible object centres
- Proximity trigger radius is 70px (fixed in `useRoomEngine`), so items 140px+ apart won't conflict

## Naming Convention

| Pattern | Example |
|---|---|
| Single instance | `cafe-fireplace` |
| Multiple instances | `cafe-sofa-1`, `cafe-sofa-2` |
| Supermarket prefix | `sm-shelf-1`, `sm-shelf-2`, `sm-shelf-3` |
| House prefix | `house-plant-1` … `house-plant-8` |

## Success Criteria

- [ ] Supermarket: all hotspots land on or adjacent to their named object in the background
- [ ] Cafe: 25+ interactable items, no two hotspots within 70px of each other
- [ ] House: 28+ interactable items covering all visible rooms
- [ ] `npm run lint && npm run build` pass with no errors
- [ ] Walking through each room in-game, pressing E near items triggers the correct Chinese label
