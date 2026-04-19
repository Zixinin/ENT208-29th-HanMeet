# CityMap Sunnyside World Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cool-tone city-grid map with a warm Stardew Valley / Sunnyside World farmland aesthetic — open grass, sandy dirt paths, 5 buildings (3 active, 2 in-progress construction), fenced central garden, Sunnyside crop sprites, and correct asset paths throughout.

**Architecture:** Two files own this change: `cityLayout.ts` defines the 40×28 tile grid and all game-object positions; `CityMap.tsx` renders it using fixed asset paths. Domain types need minor widening to support 5 buildings and 2 new tile types. `PlayerSprite.tsx` gets its broken paths fixed with Sunnyside character strips.

**Tech Stack:** React 19 + TypeScript, Vite, CSS-in-JS inline styles, pixel-art sprites at 16px tile size (TILE_SIZE=32 in game units).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/domain.ts` | Modify | Add `'farmland' \| 'cliff'` to TileType; add `'library' \| 'house'` to Building.id; add `inProgress?: boolean` to Building |
| `src/features/game/data/cityLayout.ts` | Rewrite | New 40×28 farmland grid, 5-building layout, garden/fence/path design |
| `src/features/game/components/CityMap.tsx` | Modify | Fix all asset paths, update tile/building rendering, add in-progress treatment, Sunnyside NPC strips, warm palette |
| `src/features/game/components/PlayerSprite.tsx` | Modify | Fix broken sprite paths → Sunnyside IDLE/WALKING strips |

`GameTab.tsx` — **no changes needed.** It uses `setScene(id as Scene)` and we never call `onEnterBuilding` for in-progress buildings.

---

## Task 1: Extend Domain Types

**Files:**
- Modify: `src/types/domain.ts`

- [ ] **Step 1: Update TileType, Building.id, and Building interface**

Open `src/types/domain.ts` and make these three targeted edits:

```typescript
// Line 7 — add farmland and cliff:
export type TileType = 'grass' | 'path' | 'road' | 'sidewalk' | 'tree' | 'wall' | 'door' | 'water' | 'flower' | 'farmland' | 'cliff';

// Line 66 — widen Building.id union:
export interface Building {
  id: 'supermarket' | 'school' | 'cafe' | 'library' | 'house';
  label: string;
  chineseLabel: string;
  color: string;
  tileX: number;
  tileY: number;
  tileW: number;
  tileH: number;
  doorX: number;
  doorY: number;
  inProgress?: boolean;
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey"
npm run build 2>&1 | head -30
```

Expected: may show errors in cityLayout.ts and CityMap.tsx (we haven't updated them yet) — that's fine. Should NOT show errors in domain.ts itself.

- [ ] **Step 3: Commit**

```bash
git add src/types/domain.ts
git commit -m "feat: widen Building type for 5-building layout with inProgress flag"
```

---

## Task 2: Rewrite cityLayout.ts

**Files:**
- Rewrite: `src/features/game/data/cityLayout.ts`

**Map design reference:**
- Grid: 40 cols × 28 rows
- 3 active buildings: School (top-left), Supermarket (top-right), Café (bottom-center)
- 2 in-progress: Library (bottom-left), House (mid-right)
- Central garden: cols 13–27, rows 9–18 (fenced)
- Main dirt path: vertical spine col 20, horizontal crossbar row 8
- Water pond: cols 18–21, rows 0–1
- Cliff edge: rows 26–27

- [ ] **Step 1: Replace the entire file with the new layout**

```typescript
import { Building, NpcData, TileType } from '../../../types/domain';

export const TILE_SIZE = 32;
export const CITY_COLS = 40;
export const CITY_ROWS = 28;

export interface CityInteractable {
  id: string;
  tileX: number;
  tileY: number;
  kind: 'crate' | 'board' | 'garden';
  chinese: string;
  pinyin: string;
  description: string;
}

export interface GardenPatch {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FenceSegment {
  x: number;
  y: number;
  len: number;
  direction: 'h' | 'v';
}

export const BUILDINGS: Building[] = [
  {
    id: 'school',
    label: 'School',
    chineseLabel: '学校',
    color: '#4d96ff',
    tileX: 3, tileY: 1,
    tileW: 8, tileH: 6,
    doorX: 7, doorY: 7,
  },
  {
    id: 'supermarket',
    label: 'Supermarket',
    chineseLabel: '超市',
    color: '#ff9f1c',
    tileX: 27, tileY: 1,
    tileW: 8, tileH: 6,
    doorX: 31, doorY: 7,
  },
  {
    id: 'cafe',
    label: 'Café',
    chineseLabel: '咖啡厅',
    color: '#e05c5c',
    tileX: 16, tileY: 18,
    tileW: 7, tileH: 5,
    doorX: 19, doorY: 23,
  },
  {
    id: 'library',
    label: 'Library',
    chineseLabel: '图书馆',
    color: '#888888',
    tileX: 2, tileY: 17,
    tileW: 7, tileH: 6,
    doorX: 5, doorY: 23,
    inProgress: true,
  },
  {
    id: 'house',
    label: 'House',
    chineseLabel: '住宅',
    color: '#888888',
    tileX: 28, tileY: 12,
    tileW: 6, tileH: 5,
    doorX: 31, doorY: 17,
    inProgress: true,
  },
];

export const NPCS: NpcData[] = [
  { id: 'npc1', tileX: 9, tileY: 8, emoji: '👩‍🏫', hint: '学校 (xuéxiào) means School! Press E to enter.' },
  { id: 'npc2', tileX: 33, tileY: 8, emoji: '🧑‍🛒', hint: '超市 (chāoshì) means Supermarket! Press E to enter.' },
  { id: 'npc3', tileX: 21, tileY: 24, emoji: '👩‍🍳', hint: '咖啡厅 (kāfēi tīng) means Café! Press E to enter.' },
];

export const GARDEN_PATCHES: GardenPatch[] = [
  { x: 14, y: 10, w: 5, h: 4 },
  { x: 21, y: 10, w: 5, h: 4 },
  { x: 14, y: 15, w: 5, h: 3 },
  { x: 21, y: 15, w: 4, h: 3 },
];

export const GARDEN_SEEDLINGS: Array<{ x: number; y: number; kind: 'sprout' | 'flower' | 'carrot' }> = [
  { x: 14, y: 10, kind: 'sprout' }, { x: 15, y: 10, kind: 'flower' }, { x: 16, y: 10, kind: 'sprout' },
  { x: 17, y: 10, kind: 'carrot' }, { x: 18, y: 10, kind: 'sprout' },
  { x: 14, y: 11, kind: 'flower' }, { x: 15, y: 11, kind: 'sprout' }, { x: 16, y: 11, kind: 'carrot' },
  { x: 17, y: 11, kind: 'flower' }, { x: 18, y: 11, kind: 'sprout' },
  { x: 14, y: 12, kind: 'sprout' }, { x: 15, y: 12, kind: 'carrot' }, { x: 16, y: 12, kind: 'flower' },
  { x: 17, y: 12, kind: 'sprout' }, { x: 18, y: 12, kind: 'carrot' },
  { x: 14, y: 13, kind: 'carrot' }, { x: 16, y: 13, kind: 'sprout' }, { x: 18, y: 13, kind: 'flower' },
  { x: 21, y: 10, kind: 'flower' }, { x: 22, y: 10, kind: 'sprout' }, { x: 23, y: 10, kind: 'flower' },
  { x: 24, y: 10, kind: 'carrot' }, { x: 25, y: 10, kind: 'sprout' },
  { x: 21, y: 11, kind: 'carrot' }, { x: 22, y: 11, kind: 'flower' }, { x: 23, y: 11, kind: 'sprout' },
  { x: 24, y: 11, kind: 'flower' }, { x: 25, y: 11, kind: 'carrot' },
  { x: 21, y: 12, kind: 'sprout' }, { x: 22, y: 12, kind: 'carrot' }, { x: 23, y: 12, kind: 'flower' },
  { x: 24, y: 12, kind: 'sprout' }, { x: 25, y: 12, kind: 'carrot' },
  { x: 21, y: 13, kind: 'flower' }, { x: 23, y: 13, kind: 'sprout' }, { x: 25, y: 13, kind: 'flower' },
  { x: 14, y: 15, kind: 'sprout' }, { x: 15, y: 15, kind: 'flower' }, { x: 16, y: 15, kind: 'sprout' },
  { x: 17, y: 15, kind: 'carrot' }, { x: 18, y: 15, kind: 'flower' },
  { x: 14, y: 16, kind: 'carrot' }, { x: 15, y: 16, kind: 'sprout' }, { x: 16, y: 16, kind: 'flower' },
  { x: 17, y: 16, kind: 'sprout' }, { x: 18, y: 16, kind: 'carrot' },
  { x: 21, y: 15, kind: 'flower' }, { x: 22, y: 15, kind: 'carrot' }, { x: 23, y: 15, kind: 'sprout' },
  { x: 21, y: 16, kind: 'sprout' }, { x: 22, y: 16, kind: 'flower' }, { x: 23, y: 16, kind: 'carrot' },
];

export const FENCE_SEGMENTS: FenceSegment[] = [
  { x: 13, y: 9, len: 15, direction: 'h' },   // top fence
  { x: 13, y: 18, len: 15, direction: 'h' },  // bottom fence
  { x: 13, y: 9, len: 9, direction: 'v' },    // left fence
  { x: 28, y: 9, len: 9, direction: 'v' },    // right fence
];

export const CHEST_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 32, y: 8 },
  { x: 13, y: 13 },
  { x: 29, y: 13 },
];

export const CITY_INTERACTABLES: CityInteractable[] = [
  {
    id: 'school-notice-board',
    tileX: 9, tileY: 8,
    kind: 'board',
    chinese: '公告板',
    pinyin: 'gōnggào bǎn',
    description: '学校公告板，上面有课程和活动信息。',
  },
  {
    id: 'market-fruit-crate',
    tileX: 32, tileY: 8,
    kind: 'crate',
    chinese: '水果箱',
    pinyin: 'shuǐguǒ xiāng',
    description: '超市门口的木箱，通常装新鲜水果。',
  },
  {
    id: 'cafe-bean-crate',
    tileX: 19, tileY: 24,
    kind: 'crate',
    chinese: '咖啡豆箱',
    pinyin: 'kāfēidòu xiāng',
    description: '咖啡店常用来存放烘焙前的咖啡豆。',
  },
  {
    id: 'garden-herb-bed',
    tileX: 20, tileY: 13,
    kind: 'garden',
    chinese: '香草花圃',
    pinyin: 'xiāngcǎo huāpǔ',
    description: '小花圃里种着各种香草。',
  },
];

function paintH(grid: TileType[][], y: number, x1: number, x2: number, tile: TileType) {
  if (y < 0 || y >= CITY_ROWS) return;
  for (let x = Math.max(0, x1); x <= Math.min(CITY_COLS - 1, x2); x++) {
    grid[y][x] = tile;
  }
}

function paintV(grid: TileType[][], x: number, y1: number, y2: number, tile: TileType) {
  if (x < 0 || x >= CITY_COLS) return;
  for (let y = Math.max(0, y1); y <= Math.min(CITY_ROWS - 1, y2); y++) {
    grid[y][x] = tile;
  }
}

function paintRect(grid: TileType[][], x: number, y: number, w: number, h: number, tile: TileType) {
  for (let ry = y; ry < y + h; ry++) {
    for (let rx = x; rx < x + w; rx++) {
      if (ry >= 0 && ry < CITY_ROWS && rx >= 0 && rx < CITY_COLS) {
        grid[ry][rx] = tile;
      }
    }
  }
}

function buildCityGrid(): TileType[][] {
  const grid: TileType[][] = Array.from({ length: CITY_ROWS }, () =>
    Array(CITY_COLS).fill('grass' as TileType)
  );

  // Cliff edge at bottom
  paintH(grid, 26, 0, CITY_COLS - 1, 'cliff');
  paintH(grid, 27, 0, CITY_COLS - 1, 'cliff');

  // Small pond top-center
  paintRect(grid, 18, 0, 4, 2, 'water');

  // Buildings: paint wall tiles and door
  for (const b of BUILDINGS) {
    paintRect(grid, b.tileX, b.tileY, b.tileW, b.tileH, 'wall');
    // In-progress buildings get no door tile (path instead)
    if (b.inProgress) {
      grid[b.doorY][b.doorX] = 'path';
    } else {
      grid[b.doorY][b.doorX] = 'door';
    }
  }

  // Farmland patches (under garden seedlings)
  for (const p of GARDEN_PATCHES) {
    paintRect(grid, p.x, p.y, p.w, p.h, 'farmland');
  }

  // Main dirt paths
  // Vertical spine
  paintV(grid, 20, 2, 25, 'path');
  // Upper horizontal crossbar connecting school door to supermarket door
  paintH(grid, 8, 7, 33, 'path');
  // Lower connection to café
  paintV(grid, 20, 17, 25, 'path');
  paintH(grid, 23, 15, 22, 'path');
  // Short approach trail to library (in-progress)
  paintH(grid, 23, 9, 14, 'path');
  paintV(grid, 9, 8, 24, 'path');
  // Short approach trail to house (in-progress)
  paintH(grid, 13, 20, 29, 'path');

  // Path from school door down to crossbar
  paintV(grid, 7, 7, 8, 'path');
  // Path from supermarket door down to crossbar
  paintV(grid, 31, 7, 8, 'path');

  // Trees — corners, edges, and garden surrounds
  const treePositions: [number, number][] = [
    [0, 1], [1, 3], [0, 5],
    [37, 1], [38, 2], [39, 4],
    [12, 2], [13, 3], [22, 2], [25, 3],
    [0, 11], [1, 13], [0, 15],
    [38, 10], [39, 12], [38, 15],
    [11, 9], [11, 18], [29, 9], [29, 18],
    [0, 22], [1, 24], [2, 25],
    [37, 22], [38, 24], [39, 25],
    [15, 6], [24, 6],
  ];
  for (const [x, y] of treePositions) {
    if (grid[y]?.[x] === 'grass') grid[y][x] = 'tree';
  }

  // Flowers scattered in grass
  const flowerPositions: [number, number][] = [
    [5, 9], [7, 11], [10, 13],
    [33, 10], [36, 12], [35, 16],
    [16, 4], [21, 4], [23, 5],
    [8, 19], [10, 22], [7, 24],
    [26, 20], [30, 22], [34, 21],
    [2, 10], [3, 16], [4, 20],
    [37, 18], [38, 20], [36, 8],
  ];
  for (const [x, y] of flowerPositions) {
    if (grid[y]?.[x] === 'grass') grid[y][x] = 'flower';
  }

  return grid;
}

export const CITY_GRID: TileType[][] = buildCityGrid();

export function isBlocked(gridX: number, gridY: number): boolean {
  if (gridX < 0 || gridY < 0 || gridX >= CITY_COLS || gridY >= CITY_ROWS) return true;
  const tile = CITY_GRID[gridY]?.[gridX];
  return tile === 'wall' || tile === 'tree' || tile === 'water' || tile === 'cliff';
}
```

- [ ] **Step 2: Build to check for type errors**

```bash
cd "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey"
npm run build 2>&1 | head -40
```

Expected: errors in CityMap.tsx (we haven't fixed it yet) but NOT in cityLayout.ts.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/cityLayout.ts
git commit -m "feat: redesign city grid — farmland layout with 5 buildings, central garden, dirt paths"
```

---

## Task 3: Update CityMap.tsx

**Files:**
- Modify: `src/features/game/components/CityMap.tsx`

This task has 6 sub-steps. Make all changes to the same file, then commit once at the end.

- [ ] **Step 1: Fix asset path constants and add new ones**

Replace the top-of-file constant block (lines 15–30) with:

```typescript
const SUNNYSIDE_BASE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';

const TILE_TEXTURES: Partial<Record<string, string>> = {
  path: '/assets/gamepack/tiles/Path_Tile.png',
  farmland: '/assets/gamepack/tiles/FarmLand_Tile.png',
  cliff: '/assets/gamepack/tiles/Cliff_Tile.png',
};

const BUILDING_SPRITE = '/assets/gamepack/Outdoor decoration/House_1_Wood_Base_Blue.png';
const TREE_LARGE = '/assets/gamepack/Outdoor decoration/Oak_Tree.png';
const TREE_SMALL = '/assets/gamepack/Outdoor decoration/Oak_Tree_Small.png';
const CHEST_SPRITE = '/assets/gamepack/Outdoor decoration/Chest.png';

const CROP_IMAGES: Record<string, string> = {
  sprout: `${SUNNYSIDE_BASE}/Elements/Crops/kale_00.png`,
  flower: `${SUNNYSIDE_BASE}/Elements/Crops/sunflower_02.png`,
  carrot: `${SUNNYSIDE_BASE}/Elements/Crops/carrot_01.png`,
};

const NPC_IDLE_STRIPS = [
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/shorthair_idle_strip9.png`,
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/longhair_idle_strip9.png`,
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/curlyhair_idle_strip9.png`,
];
```

- [ ] **Step 2: Update BUILDING_LOOKS for 5 buildings**

Replace the `BUILDING_LOOKS` constant:

```typescript
const BUILDING_LOOKS: Record<string, {
  spriteW: number;
  spriteH: number;
  filter: string;
  mirror: boolean;
  lift: number;
}> = {
  school: {
    spriteW: 146,
    spriteH: 186,
    filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 12,
  },
  supermarket: {
    spriteW: 148,
    spriteH: 188,
    filter: 'hue-rotate(100deg) saturate(1.15) brightness(1.02) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: true,
    lift: 8,
  },
  cafe: {
    spriteW: 130,
    spriteH: 170,
    filter: 'hue-rotate(-30deg) saturate(1.2) brightness(1.04) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 0,
  },
  library: {
    spriteW: 146,
    spriteH: 186,
    filter: 'sepia(0.7) saturate(0.4) brightness(0.75) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: true,
    lift: 12,
  },
  house: {
    spriteW: 130,
    spriteH: 170,
    filter: 'sepia(0.6) saturate(0.5) brightness(0.7) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 0,
  },
};
```

- [ ] **Step 3: Update outer container and world colors**

Find the outer container div style (has `background: 'linear-gradient(180deg, #243a68...'`) and replace:

```typescript
// Outer container — deep forest green
background: 'linear-gradient(180deg, #2d4a1a 0%, #1e3510 46%, #142508 100%)',
```

Find the inner game world div style (has `background: '#6ea76a'`) and replace:

```typescript
border: '4px solid #3d2b1a',
boxShadow: '0 0 0 3px #7a5c2e',
background: '#7ec850',
```

- [ ] **Step 4: Update tileStyle() — remove road/sidewalk, add farmland/cliff/grass texture**

Replace the entire `tileStyle` function:

```typescript
function tileStyle(tile: string): React.CSSProperties {
  const texture = TILE_TEXTURES[tile];

  if (texture) {
    return {
      backgroundImage: `url(${texture})`,
      backgroundSize: '16px 16px',
      backgroundRepeat: 'repeat',
      imageRendering: 'pixelated',
    };
  }

  if (tile === 'water') {
    return {
      backgroundColor: '#4a9aba',
      backgroundImage:
        'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    };
  }

  if (tile === 'door') {
    return {
      backgroundColor: '#c8a86a',
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
    };
  }

  if (tile === 'wall') {
    return { background: 'transparent' };
  }

  // grass (default) — warm green base
  return { backgroundColor: '#7ec850' };
}
```

- [ ] **Step 5: Add in-progress building state and update building rendering**

At the top of the `CityMap` component function, add a new state variable alongside the existing ones:

```typescript
const [comingSoonBuilding, setComingSoonBuilding] = useState<typeof BUILDINGS[number] | null>(null);
```

Update the `useEffect` keydown handler that fires on `'e'` key (find `if (key !== 'e') return;`):

```typescript
if (key !== 'e') return;
if (nearItem) {
  setActiveItem(nearItem);
  return;
}
if (nearDoor) {
  if (nearDoor.inProgress) {
    setComingSoonBuilding(nearDoor);
    return;
  }
  onEnterBuilding(nearDoor.id as 'supermarket' | 'school' | 'cafe');
}
```

Also in the `'escape'` handler, add `setComingSoonBuilding(null)`:

```typescript
if (key === 'escape') {
  setActiveItem(null);
  setComingSoonBuilding(null);
  return;
}
```

Also close comingSoonBuilding when player walks away — in the `useEffect` that updates `nearDoor` (the one triggered by `player.x, player.y`), add at the end:

```typescript
if (comingSoonBuilding) {
  const inRange = BUILDINGS.find(b => b.id === comingSoonBuilding.id &&
    Math.abs(px - b.doorX) <= 2 && Math.abs(py - b.doorY) <= 3);
  if (!inRange) setComingSoonBuilding(null);
}
```

Now find the building rendering section (`{BUILDINGS.map((b) => {`) and replace the entire block:

```typescript
{BUILDINGS.map((b) => {
  const look = BUILDING_LOOKS[b.id];
  const left = b.tileX * TILE_SIZE + (b.tileW * TILE_SIZE - look.spriteW) / 2;
  const top = b.tileY * TILE_SIZE - (look.spriteH - b.tileH * TILE_SIZE) - look.lift;

  return (
    <div
      key={b.id}
      style={{
        position: 'absolute',
        left,
        top,
        width: look.spriteW,
        height: look.spriteH,
        zIndex: b.doorY + 10,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 4,
        height: 10,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '50%',
      }} />
      <img
        src={BUILDING_SPRITE}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          filter: look.filter,
          position: 'relative',
          zIndex: 2,
          transform: look.mirror ? 'scaleX(-1)' : 'none',
        }}
      />
      <div style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: -16,
        textAlign: 'center',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: b.inProgress ? '#b0a080' : '#f7e8b2',
        textShadow: '1px 1px 0 #000',
        background: 'rgba(0,0,0,0.55)',
        border: `2px solid ${b.inProgress ? 'rgba(100,80,40,0.6)' : 'rgba(0,0,0,0.6)'}`,
        padding: '3px 4px',
      }}>
        {b.inProgress ? '🚧 ' : ''}{b.label} {b.chineseLabel}
      </div>

      {b.inProgress && (
        <div style={{
          position: 'absolute',
          left: look.spriteW * 0.5 - 10,
          bottom: look.spriteH * 0.15,
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 4,
            height: 22,
            background: 'linear-gradient(180deg, #7d4e2d, #5f361f)',
            margin: '0 auto',
          }} />
          <div style={{
            width: 28,
            height: 18,
            background: 'linear-gradient(180deg, #f7e7ba, #d6c08e)',
            border: '2px solid #694625',
            marginLeft: -12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#5a3010',
          }}>🚧</div>
        </div>
      )}
    </div>
  );
})}
```

- [ ] **Step 6: Update NPC animation (9 frames) and crop seedlings (image-based)**

Find the NPC rendering section (`{NPCS.map((npc, index) => {`) and update the frame calculation and backgroundSize:

```typescript
{NPCS.map((npc, index) => {
  const frame = animTick % 9;
  return (
    <div
      key={npc.id}
      style={{
        position: 'absolute',
        left: npc.tileX * TILE_SIZE + 4,
        top: npc.tileY * TILE_SIZE - 18,
        width: 24,
        height: 48,
        pointerEvents: 'none',
        zIndex: npc.tileY + 30,
      }}
    >
      <div style={{
        position: 'absolute',
        left: 4,
        right: 4,
        bottom: 2,
        height: 6,
        background: 'rgba(0,0,0,0.28)',
        borderRadius: '50%',
      }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 24,
          height: 48,
          backgroundImage: `url(${NPC_IDLE_STRIPS[index % NPC_IDLE_STRIPS.length]})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '144px 32px',
          backgroundPosition: `${-frame * 16}px 0`,
          transform: 'scale(1.5)',
          transformOrigin: 'top left',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
})}
```

Find the seedling rendering section (`{GARDEN_SEEDLINGS.map((seed, idx) => (`) and replace the inner content:

```typescript
{GARDEN_SEEDLINGS.map((seed, idx) => (
  <div
    key={`seed-${idx}`}
    style={{
      position: 'absolute',
      left: seed.x * TILE_SIZE + TILE_SIZE * 0.1,
      top: seed.y * TILE_SIZE + TILE_SIZE * 0.1,
      width: TILE_SIZE * 0.8,
      height: TILE_SIZE * 0.8,
      zIndex: seed.y + 6,
      pointerEvents: 'none',
    }}
  >
    <img
      src={CROP_IMAGES[seed.kind]}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
      }}
    />
  </div>
))}
```

Add the "Coming Soon" popup to the overlay section (after the `{activeItem && ...}` block):

```typescript
{comingSoonBuilding && (
  <div style={{
    position: 'absolute',
    left: '50%',
    bottom: 54,
    transform: 'translateX(-50%)',
    minWidth: 340,
    maxWidth: 520,
    background: 'rgba(40, 24, 8, 0.94)',
    border: '4px solid #8a6a2e',
    color: '#e8d4a0',
    padding: '12px 14px',
    zIndex: 42,
    boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
    fontFamily: "'Press Start 2P', monospace",
    lineHeight: 1.8,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 10, color: '#d4a84b', marginBottom: 6 }}>
      🚧 {comingSoonBuilding.chineseLabel}
    </div>
    <div style={{ fontSize: 7, color: '#c8b880' }}>
      {comingSoonBuilding.label} — 即将开放
    </div>
    <div style={{ fontSize: 6, color: '#9a8860', marginTop: 6 }}>
      Coming Soon! Press ESC to close
    </div>
  </div>
)}
```

Update the bottom prompt for near-door to reflect in-progress state:

```typescript
{!nearItem && nearDoor && (
  <div style={{
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 8,
    background: 'rgba(0,0,0,0.85)',
    border: `3px solid ${nearDoor.inProgress ? '#8a6a2e' : '#dfbe69'}`,
    color: nearDoor.inProgress ? '#c8a060' : '#ffe59a',
    padding: '8px 12px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    zIndex: 30,
  }}>
    {nearDoor.inProgress
      ? `🚧 ${nearDoor.chineseLabel} — Press [E] to inspect`
      : `Press [E] to enter ${nearDoor.label}`}
  </div>
)}
```

- [ ] **Step 7: Build and check**

```bash
cd "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey"
npm run build 2>&1 | head -50
```

Expected: clean build, 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/features/game/components/CityMap.tsx
git commit -m "feat: apply Sunnyside World farmland aesthetic — warm palette, fixed assets, in-progress buildings"
```

---

## Task 4: Fix PlayerSprite.tsx

**Files:**
- Modify: `src/features/game/components/PlayerSprite.tsx`

- [ ] **Step 1: Update sprite path constants and animation for Sunnyside strips**

Replace lines 9–11 in `src/features/game/components/PlayerSprite.tsx`:

```typescript
const SUNNYSIDE_BASE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_STRIP = `${SUNNYSIDE_BASE}/Characters/Human/IDLE/base_idle_strip9.png`;
const RUN_STRIP = `${SUNNYSIDE_BASE}/Characters/Human/WALKING/base_walk_strip8.png`;
```

Replace the animation logic block (lines 27–31):

```typescript
// Idle: 9 frames at 144px wide. Walking: 8 frames at 128px wide.
const idleFrames = animTick % 9;
const walkFrames = animTick % 8;
const frame = player.moving ? walkFrames : idleFrames;
const spriteSheet = player.moving ? RUN_STRIP : IDLE_STRIP;
const stripWidth = player.moving ? 128 : 144;
```

Update the sprite div style's backgroundSize to use `stripWidth`:

```typescript
backgroundSize: `${stripWidth}px 32px`,
backgroundPosition: `${-frame * 16}px 0`,
```

Remove the `DIR_OFFSET` constant (it's no longer used — Sunnyside strips are single-direction).

- [ ] **Step 2: Build check**

```bash
cd "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey"
npm run build 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/PlayerSprite.tsx
git commit -m "fix: use Sunnyside Human IDLE/WALKING strips for player sprite"
```

---

## Task 5: Lint, Build, and Visual Verify

- [ ] **Step 1: Full lint + build**

```bash
cd "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey"
npm run lint && npm run build
```

Expected: 0 lint errors, 0 build errors.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Open the app in browser. Verify:
- [ ] No gray roads visible anywhere — open green grass throughout
- [ ] Sandy dirt path tiles visible connecting buildings
- [ ] School, Supermarket, Café buildings load (colored wooden houses, no broken image icons)
- [ ] Library and House buildings appear faded/sepia with 🚧 sign overlay
- [ ] Walk to Library or House, press E → "Coming Soon 即将开放" popup appears
- [ ] Press ESC → popup dismisses
- [ ] Walk to School/Supermarket/Café, press E → enters interior (existing behavior)
- [ ] Sunnyside crop images visible in garden center (kale seedlings, sunflowers, carrots)
- [ ] NPC characters render with Sunnyside idle animation
- [ ] Player sprite uses Sunnyside character animation
- [ ] Outer border is warm wood-brown, not navy blue
- [ ] Small water pond visible at top-center
- [ ] Cliff tiles visible at bottom edge

- [ ] **Step 3: Final commit if any fixups were needed**

```bash
git add -p  # stage only changed files
git commit -m "fix: visual adjustments after dev review"
```
