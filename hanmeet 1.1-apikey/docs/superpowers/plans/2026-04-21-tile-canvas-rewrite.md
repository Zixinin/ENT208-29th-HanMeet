# Tile-Based Canvas Game Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all CSS-based game rendering with HTML5 Canvas tile maps using real Sunnyside World sprite assets, and add a House interior scene alongside Supermarket, Café, and the outdoor CityMap.

**Architecture:** A shared `useTileEngine(config)` hook manages image preloading, canvas drawing via `requestAnimationFrame`, camera follow, and proximity detection for interactables. Each scene (CityMap, SupermarketInterior, HouseInterior, CafeInterior) passes its own tile map, sprite list, and interactable items to the hook and renders `<canvas>` + React UI overlays on top. `usePlayerMovement` and `useCamera` are made generic so all scenes share them.

**Tech Stack:** React 19, TypeScript, HTML5 Canvas API (`drawImage`, `requestAnimationFrame`), Sunnyside World PNG assets at 32px/tile.

---

## File Map

| Status | File | Responsibility |
|--------|------|----------------|
| 🔄 Modify | `src/features/game/hooks/usePlayerMovement.ts` | Accept optional `isBlocked`, `cols`, `rows`, `tileSize` params |
| 🔄 Modify | `src/features/game/hooks/useCamera.ts` | Accept optional `worldW`, `worldH` overrides |
| 🆕 Create | `src/types/tileEngine.ts` | `TileEngineConfig`, `SpriteConfig`, `InteractableConfig`, `BuildingEntry` types |
| 🆕 Create | `src/features/game/hooks/useTileEngine.ts` | Canvas draw loop, image preload, proximity detection |
| 🔄 Rewrite | `src/features/game/data/cityLayout.ts` | New 40×28 map (river-left, organic buildings, farm plots, cherry blossoms) |
| 🔄 Rewrite | `src/features/game/components/CityMap.tsx` | Canvas outdoor map using useTileEngine |
| 🆕 Create | `src/features/game/data/supermarketLayout.ts` | 20×15 interior map, bright beige tiles, items |
| 🔄 Rewrite | `src/features/game/components/SupermarketInterior.tsx` | Canvas interior using useTileEngine |
| 🆕 Create | `src/features/game/data/houseLayout.ts` | 20×15 interior map, warm wood tiles, 3 sections |
| 🆕 Create | `src/features/game/components/HouseInterior.tsx` | Canvas interior using useTileEngine |
| 🆕 Create | `src/features/game/data/cafeLayout.ts` | 20×15 interior map, cool teal tiles, 2 sections |
| 🔄 Rewrite | `src/features/game/components/CafeInterior.tsx` | Canvas interior using useTileEngine |
| 🔄 Modify | `src/features/game/GameTab.tsx` | Add `'house'` scene, wire HouseInterior |

---

## Task 1: Make usePlayerMovement generic

**Files:**
- Modify: `src/features/game/hooks/usePlayerMovement.ts`

- [ ] **Step 1: Add MovementOptions interface and update signature**

Replace the top of `usePlayerMovement.ts` with:

```ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerState } from '../../../types/domain';
import {
  TILE_SIZE as DEFAULT_TILE_SIZE,
  CITY_COLS as DEFAULT_COLS,
  CITY_ROWS as DEFAULT_ROWS,
  isBlocked as defaultIsBlocked,
} from '../data/cityLayout';

const SPEED = 3;

interface MovementOptions {
  cols?: number;
  rows?: number;
  tileSize?: number;
  isBlockedFn?: (tileX: number, tileY: number) => boolean;
}

export function usePlayerMovement(
  initialX = 18,
  initialY = 12,
  options?: MovementOptions,
) {
  const cols = options?.cols ?? DEFAULT_COLS;
  const rows = options?.rows ?? DEFAULT_ROWS;
  const tileSize = options?.tileSize ?? DEFAULT_TILE_SIZE;
  const isBlockedFn = options?.isBlockedFn ?? defaultIsBlocked;

  const [player, setPlayer] = useState<PlayerState>({
    x: initialX * tileSize,
    y: initialY * tileSize,
    facing: 'down',
    moving: false,
    frame: 0,
  });

  const keys = useRef<Set<string>>(new Set());
  const frameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const worldW = cols * tileSize;
  const worldH = rows * tileSize;
```

Then in the `tileCheck` lambda inside the loop, replace `isBlocked` with `isBlockedFn`:

```ts
        const tileCheck = (px: number, py: number) => {
          const tx = Math.floor(px / tileSize);
          const ty = Math.floor(py / tileSize);
          return isBlockedFn(tx, ty);
        };
```

Keep the rest of the file identical.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: 0 errors. CityMap still works (it calls `usePlayerMovement(18, 13)` with no options, so defaults apply).

- [ ] **Step 3: Commit**

```bash
git add src/features/game/hooks/usePlayerMovement.ts
git commit -m "refactor: make usePlayerMovement accept optional bounds and isBlocked"
```

---

## Task 2: Make useCamera generic

**Files:**
- Modify: `src/features/game/hooks/useCamera.ts`

- [ ] **Step 1: Add optional world dimension overrides**

Replace the entire file:

```ts
import { useMemo } from 'react';
import { PlayerState } from '../../../types/domain';
import { TILE_SIZE, CITY_COLS, CITY_ROWS } from '../data/cityLayout';

interface CameraOptions {
  worldW?: number;
  worldH?: number;
}

export function useCamera(
  player: PlayerState,
  viewW: number,
  viewH: number,
  options?: CameraOptions,
) {
  return useMemo(() => {
    const worldW = options?.worldW ?? CITY_COLS * TILE_SIZE;
    const worldH = options?.worldH ?? CITY_ROWS * TILE_SIZE;
    const halfW = viewW / 2;
    const halfH = viewH / 2;

    let camX = player.x + 12 - halfW;
    let camY = player.y + 12 - halfH;

    camX = Math.max(0, Math.min(Math.max(0, worldW - viewW), camX));
    camY = Math.max(0, Math.min(Math.max(0, worldH - viewH), camY));

    return { camX, camY };
  }, [player.x, player.y, viewW, viewH, options?.worldW, options?.worldH]);
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/hooks/useCamera.ts
git commit -m "refactor: make useCamera accept optional world dimensions"
```

---

## Task 3: TileEngine types

**Files:**
- Create: `src/types/tileEngine.ts`

- [ ] **Step 1: Create the types file**

```ts
export interface SpriteConfig {
  src: string;
  x: number;       // pixel x in world space
  y: number;       // pixel y in world space
  w: number;       // render width in pixels
  h: number;       // render height in pixels
  filter?: string; // CSS filter string (e.g. hue-rotate for colour variants)
  flipX?: boolean;
  label?: string;
  labelColor?: string;
}

export interface InteractableConfig {
  id: string;
  tileX: number;
  tileY: number;
  src?: string;    // optional sprite URL
  chinese: string;
  pinyin: string;
  description: string;
  english?: string;
}

export interface BuildingEntry {
  id: string;
  doorTileX: number;
  doorTileY: number;
  label: string;
  chineseLabel: string;
  inProgress?: boolean;
}

export interface TileEngineConfig {
  cols: number;
  rows: number;
  tileSize: number;
  tileMap: string[][];
  /** Map tile-type string → image URL */
  tileImages: Partial<Record<string, string>>;
  /** Fallback solid colours when image not yet loaded */
  tileColors: Partial<Record<string, string>>;
  sprites: SpriteConfig[];
  interactables: InteractableConfig[];
  /** Outdoor map only — buildings the player can enter */
  buildings?: BuildingEntry[];
  spawnTileX: number;
  spawnTileY: number;
  isBlocked: (tileX: number, tileY: number) => boolean;
  viewWidth: number;
  viewHeight: number;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/tileEngine.ts
git commit -m "feat: add TileEngineConfig and related types"
```

---

## Task 4: useTileEngine hook

**Files:**
- Create: `src/features/game/hooks/useTileEngine.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { TileEngineConfig, InteractableConfig, BuildingEntry } from '../../../types/tileEngine';
import { usePlayerMovement } from './usePlayerMovement';
import { useCamera } from './useCamera';

const SUNNYSIDE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_SRC = `${SUNNYSIDE}/Characters/Human/IDLE/base_idle_strip9.png`;
const WALK_SRC = `${SUNNYSIDE}/Characters/Human/WALKING/base_walk_strip8.png`;

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

function loadImage(src: string, cache: Record<string, HTMLImageElement>) {
  if (!cache[src]) {
    const img = new Image();
    img.src = src;
    cache[src] = img;
  }
}

export function useTileEngine(config: TileEngineConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);
  const animTickRef = useRef(0);
  const [scale, setScale] = useState(1);

  const { player } = usePlayerMovement(
    config.spawnTileX,
    config.spawnTileY,
    {
      cols: config.cols,
      rows: config.rows,
      tileSize: config.tileSize,
      isBlockedFn: config.isBlocked,
    },
  );

  const worldW = config.cols * config.tileSize;
  const worldH = config.rows * config.tileSize;
  const { camX, camY } = useCamera(player, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, { worldW, worldH });

  // Preload all images
  useEffect(() => {
    const srcs = [
      IDLE_SRC,
      WALK_SRC,
      ...Object.values(config.tileImages).filter(Boolean) as string[],
      ...config.sprites.map(s => s.src),
      ...config.interactables.filter(i => i.src).map(i => i.src!),
    ];
    [...new Set(srcs)].forEach(src => loadImage(src, images.current));
  }, []); // intentionally empty — config is stable per scene mount

  // Responsive scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animTickRef.current = (animTickRef.current + 1) % 240;
      const tick = animTickRef.current;
      const { tileSize: ts, cols, rows, tileMap } = config;

      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(-camX, -camY);

      // Visible tile range (culling)
      const x0 = Math.max(0, Math.floor(camX / ts));
      const x1 = Math.min(cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / ts));
      const y0 = Math.max(0, Math.floor(camY / ts));
      const y1 = Math.min(rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / ts));

      for (let ry = y0; ry <= y1; ry++) {
        for (let rx = x0; rx <= x1; rx++) {
          const tile = tileMap[ry]?.[rx] ?? 'grass';
          const imgSrc = config.tileImages[tile];
          const img = imgSrc ? images.current[imgSrc] : undefined;
          if (img?.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, rx * ts, ry * ts, ts, ts);
          } else {
            ctx.fillStyle = config.tileColors[tile] ?? '#5a9e32';
            ctx.fillRect(rx * ts, ry * ts, ts, ts);
          }
        }
      }

      // Collect depth-sorted renderables
      type Renderable = { sortY: number; draw: () => void };
      const renderables: Renderable[] = [];

      // Sprites (buildings, trees, decorations)
      for (const sprite of config.sprites) {
        renderables.push({
          sortY: sprite.y + sprite.h,
          draw: () => {
            const img = images.current[sprite.src];
            if (!img?.complete || !img.naturalWidth) return;
            ctx.save();
            if (sprite.filter) ctx.filter = sprite.filter;
            if (sprite.flipX) {
              ctx.translate(sprite.x + sprite.w, sprite.y);
              ctx.scale(-1, 1);
              ctx.drawImage(img, 0, 0, sprite.w, sprite.h);
            } else {
              ctx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h);
            }
            ctx.filter = 'none';
            ctx.restore();

            // Building label
            if (sprite.label) {
              ctx.font = "bold 8px 'Press Start 2P', monospace";
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fillRect(sprite.x, sprite.y + sprite.h + 2, sprite.w, 14);
              ctx.fillStyle = sprite.labelColor ?? '#ffe59a';
              ctx.fillText(sprite.label, sprite.x + sprite.w / 2, sprite.y + sprite.h + 13);
            }
          },
        });
      }

      // Interactables
      for (const item of config.interactables) {
        renderables.push({
          sortY: item.tileY * ts + ts,
          draw: () => {
            const img = item.src ? images.current[item.src] : undefined;
            if (img?.complete && img.naturalWidth) {
              ctx.drawImage(img, item.tileX * ts, item.tileY * ts, ts, ts);
            } else {
              ctx.fillStyle = 'rgba(200,160,80,0.75)';
              ctx.fillRect(item.tileX * ts + 4, item.tileY * ts + 4, ts - 8, ts - 8);
              ctx.fillStyle = '#000';
              ctx.font = `${ts - 6}px serif`;
              ctx.textAlign = 'center';
              ctx.fillText('?', item.tileX * ts + ts / 2, item.tileY * ts + ts - 6);
            }
          },
        });
      }

      // Player
      const idleFrames = 9, walkFrames = 8;
      const frameCount = player.moving ? walkFrames : idleFrames;
      const animFrame = Math.floor(tick / 4) % frameCount;
      const playerSrc = player.moving ? WALK_SRC : IDLE_SRC;
      const FRAME_W = 16, FRAME_H = 32;
      const RENDER_W = 24, RENDER_H = 48;

      renderables.push({
        sortY: player.y + RENDER_H,
        draw: () => {
          const img = images.current[playerSrc];
          if (!img?.complete || !img.naturalWidth) return;
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(player.x + RENDER_W / 2, player.y + RENDER_H - 4, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(
            img,
            animFrame * FRAME_W, 0,
            FRAME_W, FRAME_H,
            player.x - 6, player.y - 24,
            RENDER_W, RENDER_H,
          );
        },
      });

      renderables.sort((a, b) => a.sortY - b.sortY);
      for (const r of renderables) r.draw();

      ctx.restore(); // end camera transform
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [camX, camY, player, config]);

  // Proximity detection (player tile position)
  const ptx = Math.floor((player.x + 12) / config.tileSize);
  const pty = Math.floor((player.y + 24) / config.tileSize);

  const nearInteractable: InteractableConfig | null = useMemo(() => {
    return config.interactables.find(
      item => Math.abs(ptx - item.tileX) + Math.abs(pty - item.tileY) <= 1
    ) ?? null;
  }, [ptx, pty]); // eslint-disable-line

  const nearBuilding: BuildingEntry | null = useMemo(() => {
    return (config.buildings ?? []).find(
      b => Math.abs(ptx - b.doorTileX) <= 1 && Math.abs(pty - b.doorTileY) <= 2
    ) ?? null;
  }, [ptx, pty]); // eslint-disable-line

  return { canvasRef, containerRef, player, scale, nearInteractable, nearBuilding };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/hooks/useTileEngine.ts
git commit -m "feat: add useTileEngine canvas draw hook"
```

---

## Task 5: Rewrite cityLayout.ts

**Files:**
- Rewrite: `src/features/game/data/cityLayout.ts`

- [ ] **Step 1: Replace the file entirely**

```ts
import { Building, NpcData, TileType } from '../../../types/domain';
import { TileEngineConfig, SpriteConfig, InteractableConfig, BuildingEntry } from '../../../types/tileEngine';

export const TILE_SIZE = 32;
export const CITY_COLS = 40;
export const CITY_ROWS = 28;

// ─── Asset paths ────────────────────────────────────────────────────────────
const SUNNYSIDE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const BUILDING_SRC = '/assets/gamepack/Outdoor decoration/House_1_Wood_Base_Blue.png';
const TREE_LG = '/assets/gamepack/Outdoor decoration/Oak_Tree.png';
const TREE_SM = '/assets/gamepack/Outdoor decoration/Oak_Tree_Small.png';
const CHEST_SRC = '/assets/gamepack/Outdoor decoration/Chest.png';

// ─── Tile images & colours ───────────────────────────────────────────────────
export const TILE_IMAGES: Partial<Record<string, string>> = {
  grass:    '/assets/gamepack/tiles/Grass_Middle.png',
  farmland: '/assets/gamepack/tiles/FarmLand_Tile.png',
  path:     '/assets/gamepack/tiles/Path_Tile.png',
};

export const TILE_COLORS: Partial<Record<string, string>> = {
  grass:    '#5a9e32',
  farmland: '#c47a35',
  path:     '#a0784a',
  water:    '#4a8fbf',
  cliff:    '#5c4a30',
  wall:     'transparent',
  door:     '#c8a86a',
  cherry:   '#5a9e32', // cherry tile shows as grass; tree sprite overlaid
  flower:   '#7ec850',
  tree:     '#5a9e32',
};

// ─── Buildings (domain type for existing interfaces) ────────────────────────
export const BUILDINGS: Building[] = [
  { id: 'school',      label: 'School',      chineseLabel: '学校',   color: '#4d96ff', tileX: 4,  tileY: 1,  tileW: 8, tileH: 6, doorX: 8,  doorY: 7  },
  { id: 'supermarket', label: 'Supermarket', chineseLabel: '超市',   color: '#ff9f1c', tileX: 27, tileY: 1,  tileW: 8, tileH: 6, doorX: 31, doorY: 7  },
  { id: 'cafe',        label: 'Café',        chineseLabel: '咖啡厅', color: '#e05c5c', tileX: 24, tileY: 13, tileW: 8, tileH: 6, doorX: 28, doorY: 19 },
  { id: 'library',     label: 'Library',     chineseLabel: '图书馆', color: '#888888', tileX: 4,  tileY: 16, tileW: 7, tileH: 6, doorX: 7,  doorY: 22, inProgress: true },
  { id: 'house',       label: 'House',       chineseLabel: '住宅',   color: '#888888', tileX: 28, tileY: 15, tileW: 7, tileH: 6, doorX: 31, doorY: 21, inProgress: true },
];

// ─── BuildingEntry for TileEngine ───────────────────────────────────────────
export const BUILDING_ENTRIES: BuildingEntry[] = BUILDINGS.map(b => ({
  id: b.id,
  doorTileX: b.doorX,
  doorTileY: b.doorY,
  label: b.label,
  chineseLabel: b.chineseLabel,
  inProgress: b.inProgress,
}));

// ─── NPCs ────────────────────────────────────────────────────────────────────
export const NPCS: NpcData[] = [
  { id: 'npc1', tileX: 10, tileY: 8,  emoji: '👩‍🏫', hint: '学校 (xuéxiào) = School — Press E to enter.' },
  { id: 'npc2', tileX: 29, tileY: 8,  emoji: '🧑‍🛒', hint: '超市 (chāoshì) = Supermarket — Press E to enter.' },
  { id: 'npc3', tileX: 26, tileY: 20, emoji: '👩‍🍳', hint: '咖啡厅 (kāfēi tīng) = Café — Press E to enter.' },
];

// ─── City interactables (outdoor) ───────────────────────────────────────────
export const CITY_INTERACTABLES: InteractableConfig[] = [
  { id: 'notice-board', tileX: 10, tileY: 8,  chinese: '公告板', pinyin: 'gōnggào bǎn', description: '学校公告板，上面有课程信息。' },
  { id: 'fruit-crate',  tileX: 30, tileY: 8,  src: CHEST_SRC, chinese: '水果箱', pinyin: 'shuǐguǒ xiāng', description: '超市门口装新鲜水果的木箱。' },
  { id: 'bean-crate',   tileX: 26, tileY: 20, src: CHEST_SRC, chinese: '咖啡豆箱', pinyin: 'kāfēidòu xiāng', description: '咖啡店存放烘焙豆的箱子。' },
  { id: 'herb-bed',     tileX: 19, tileY: 12, chinese: '香草花圃', pinyin: 'xiāngcǎo huāpǔ', description: '小花圃里种着各种香草。' },
];

// ─── Grid builder ────────────────────────────────────────────────────────────
function paintH(g: string[][], y: number, x1: number, x2: number, t: string) {
  for (let x = Math.max(0, x1); x <= Math.min(CITY_COLS - 1, x2); x++) {
    if (y >= 0 && y < CITY_ROWS) g[y][x] = t;
  }
}
function paintV(g: string[][], x: number, y1: number, y2: number, t: string) {
  for (let y = Math.max(0, y1); y <= Math.min(CITY_ROWS - 1, y2); y++) {
    if (x >= 0 && x < CITY_COLS) g[y][x] = t;
  }
}
function paintRect(g: string[][], x: number, y: number, w: number, h: number, t: string) {
  for (let ry = y; ry < y + h; ry++)
    for (let rx = x; rx < x + w; rx++)
      if (ry >= 0 && ry < CITY_ROWS && rx >= 0 && rx < CITY_COLS) g[ry][rx] = t;
}

function buildGrid(): string[][] {
  const g: string[][] = Array.from({ length: CITY_ROWS }, () => Array(CITY_COLS).fill('grass'));

  // Cliff bottom
  paintH(g, 26, 0, 39, 'cliff'); paintH(g, 27, 0, 39, 'cliff');

  // River — left side
  paintRect(g, 0, 0, 3, 26, 'water');

  // Ponds
  paintRect(g, 7, 13, 4, 3, 'water');

  // Buildings → wall tiles + doors
  for (const b of BUILDINGS) {
    paintRect(g, b.tileX, b.tileY, b.tileW, b.tileH, 'wall');
    g[b.doorY][b.doorX] = b.inProgress ? 'path' : 'door';
  }

  // Farm plots
  paintRect(g, 4,  8,  6, 5, 'farmland');
  paintRect(g, 12, 3,  6, 5, 'farmland');
  paintRect(g, 12, 9,  6, 5, 'farmland');
  paintRect(g, 20, 3,  6, 5, 'farmland');
  paintRect(g, 20, 9,  5, 5, 'farmland');
  paintRect(g, 33, 9,  6, 6, 'farmland');
  paintRect(g, 15, 14, 8, 5, 'farmland');
  paintRect(g, 25, 20, 8, 5, 'farmland'); // house garden

  // Paths
  paintV(g, 11, 0, 25, 'path');
  paintV(g, 27, 0, 25, 'path');
  paintH(g, 8,  3, 39, 'path');
  paintH(g, 14, 11, 27, 'path');
  paintH(g, 25, 3, 27, 'path');
  paintV(g, 8,  7, 8,  'path'); // school door
  paintV(g, 31, 7, 8,  'path'); // supermarket door
  paintV(g, 28, 19, 20, 'path'); // café door
  paintV(g, 7,  22, 23, 'path'); // library door
  paintV(g, 31, 21, 22, 'path'); // house door
  paintH(g, 19, 11, 27, 'path');

  // Trees
  const trees: [number, number][] = [
    [3,0],[3,2],[3,5],[3,8],[3,11],[3,14],[3,18],[3,22],
    [38,0],[39,2],[38,4],[39,7],[38,10],[39,13],[38,17],[39,21],
    [12,1],[13,2],[26,1],[27,2],[12,7],[26,7],
    [3,14],[11,7],[11,13],[25,11],[32,7],[32,14],
    [3,22],[11,19],[23,17],[32,19],[38,24],
    [14,4],[20,4],[23,4],
  ];
  for (const [x, y] of trees) {
    if (g[y]?.[x] === 'grass') g[y][x] = 'tree';
  }

  // Cherry blossoms (tile = 'cherry', rendered as tree sprite with pink tint)
  const cherries: [number, number][] = [
    [4,13],[5,14],[9,3],[9,9],[10,15],[17,2],[17,7],[18,12],
    [22,2],[23,7],[24,18],[29,7],[29,13],[33,1],[33,7],[34,19],
    [14,17],[21,17],[27,18],[31,19],[6,19],[7,24],[35,23],
  ];
  for (const [x, y] of cherries) {
    if (g[y]?.[x] === 'grass') g[y][x] = 'cherry';
  }

  // Flowers
  const flowers: [number, number][] = [
    [5,9],[7,11],[9,13],[33,10],[35,12],[34,17],
    [15,4],[21,4],[12,5],[25,5],[7,18],[29,19],
  ];
  for (const [x, y] of flowers) {
    if (g[y]?.[x] === 'grass') g[y][x] = 'flower';
  }

  return g;
}

export const CITY_GRID: string[][] = buildGrid();

export function isBlocked(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= CITY_COLS || ty >= CITY_ROWS) return true;
  const t = CITY_GRID[ty]?.[tx];
  return t === 'wall' || t === 'tree' || t === 'cherry' || t === 'water' || t === 'cliff';
}

// ─── Sprite list for CityMap ─────────────────────────────────────────────────
function buildingSprites(): SpriteConfig[] {
  const LOOKS: Record<string, { w: number; h: number; filter: string; flipX: boolean }> = {
    school:      { w: 146, h: 186, filter: 'none', flipX: false },
    supermarket: { w: 148, h: 188, filter: 'hue-rotate(100deg) saturate(1.15)', flipX: true },
    cafe:        { w: 130, h: 170, filter: 'hue-rotate(-30deg) saturate(1.2)', flipX: false },
    library:     { w: 146, h: 186, filter: 'sepia(0.7) saturate(0.4) brightness(0.75)', flipX: true },
    house:       { w: 130, h: 170, filter: 'sepia(0.6) saturate(0.5) brightness(0.7)', flipX: false },
  };
  return BUILDINGS.map(b => {
    const look = LOOKS[b.id];
    const x = b.tileX * TILE_SIZE + (b.tileW * TILE_SIZE - look.w) / 2;
    const y = b.tileY * TILE_SIZE - (look.h - b.tileH * TILE_SIZE);
    return {
      src: BUILDING_SRC,
      x, y,
      w: look.w,
      h: look.h,
      filter: look.filter,
      flipX: look.flipX,
      label: `${b.label} ${b.chineseLabel}${b.inProgress ? ' 🚧' : ''}`,
      labelColor: b.inProgress ? '#b0a080' : '#ffe59a',
    };
  });
}

function treeSprites(): SpriteConfig[] {
  const sprites: SpriteConfig[] = [];
  for (let y = 0; y < CITY_ROWS; y++) {
    for (let x = 0; x < CITY_COLS; x++) {
      const tile = CITY_GRID[y]?.[x];
      if (tile === 'tree') {
        const lg = (x + y) % 3 === 0;
        const w = lg ? 96 : 64, h = lg ? 120 : 80;
        sprites.push({
          src: lg ? TREE_LG : TREE_SM,
          x: x * TILE_SIZE - (w - TILE_SIZE) / 2,
          y: y * TILE_SIZE - (h - TILE_SIZE * 0.55),
          w, h,
        });
      } else if (tile === 'cherry') {
        sprites.push({
          src: TREE_SM,
          x: x * TILE_SIZE - 16,
          y: y * TILE_SIZE - 32,
          w: 64, h: 80,
          filter: 'hue-rotate(280deg) saturate(2) brightness(1.2)',
        });
      }
    }
  }
  return sprites;
}

export const CITY_SPRITES: SpriteConfig[] = [...buildingSprites(), ...treeSprites()];

// ─── Full TileEngine config for CityMap ─────────────────────────────────────
export const CITY_ENGINE_CONFIG: TileEngineConfig = {
  cols: CITY_COLS,
  rows: CITY_ROWS,
  tileSize: TILE_SIZE,
  tileMap: CITY_GRID,
  tileImages: TILE_IMAGES,
  tileColors: TILE_COLORS,
  sprites: CITY_SPRITES,
  interactables: CITY_INTERACTABLES,
  buildings: BUILDING_ENTRIES,
  spawnTileX: 19,
  spawnTileY: 12,
  isBlocked,
  viewWidth: 1280,
  viewHeight: 720,
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 0 errors. TypeScript may flag the old `TileType` import — remove any unused imports.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/cityLayout.ts
git commit -m "feat: rewrite cityLayout with v3 river-left map and TileEngineConfig"
```

---

## Task 6: Rewrite CityMap.tsx

**Files:**
- Rewrite: `src/features/game/components/CityMap.tsx`

- [ ] **Step 1: Replace the component entirely**

```tsx
import React, { useEffect, useState } from 'react';
import { Building } from '../../../types/domain';
import { CITY_ENGINE_CONFIG, BUILDING_ENTRIES } from '../data/cityLayout';
import { useTileEngine } from '../hooks/useTileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  outfitColor: string;
  onEnterBuilding: (buildingId: Building['id']) => void;
}

export function CityMap({ onEnterBuilding }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable, nearBuilding } =
    useTileEngine(CITY_ENGINE_CONFIG);

  const [activeItem, setActiveItem] = useState<typeof nearInteractable>(null);
  const [comingSoon, setComingSoon] = useState<typeof BUILDING_ENTRIES[0] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { setActiveItem(null); setComingSoon(null); return; }
      if (key !== 'e') return;
      if (nearInteractable) { setActiveItem(nearInteractable); return; }
      if (nearBuilding) {
        if (nearBuilding.inProgress) { setComingSoon(nearBuilding); return; }
        onEnterBuilding(nearBuilding.id as Building['id']);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, nearBuilding, onEnterBuilding]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#1e3510' }}
    >
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          imageRendering: 'pixelated',
        }}
      />

      {/* HUD */}
      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        WASD / ARROWS = MOVE<br />E = ENTER / INSPECT<br />ESC = CLOSE
      </div>

      {/* Interact prompt */}
      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #83d68e', color: '#b8ffbe',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] to inspect {nearInteractable.chinese}
        </div>
      )}

      {/* Enter building prompt */}
      {!nearInteractable && nearBuilding && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.85)',
          border: `3px solid ${nearBuilding.inProgress ? '#8a6a2e' : '#dfbe69'}`,
          color: nearBuilding.inProgress ? '#c8a060' : '#ffe59a',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          {nearBuilding.inProgress
            ? `🚧 ${nearBuilding.chineseLabel} — Coming Soon`
            : `Press [E] to enter ${nearBuilding.label}`}
        </div>
      )}

      {/* Vocab popup */}
      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(17,24,28,0.94)',
          border: '4px solid #e2bc73', color: '#f5e7ca', padding: '12px 14px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 10, color: '#ffe59a', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 7, color: '#90d7ff', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#d9f4d8' }}>{activeItem.description}</div>
        </div>
      )}

      {/* Coming soon popup */}
      {comingSoon && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 340, background: 'rgba(40,24,8,0.94)', border: '4px solid #8a6a2e',
          color: '#e8d4a0', padding: '12px 14px', zIndex: 42, textAlign: 'center',
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 10, color: '#d4a84b', marginBottom: 6 }}>🚧 {comingSoon.chineseLabel}</div>
          <div style={{ fontSize: 7, color: '#c8b880' }}>{comingSoon.label} — 即将开放</div>
          <div style={{ fontSize: 6, color: '#9a8860', marginTop: 6 }}>Coming Soon · Press ESC to close</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build and visual test**

```bash
npm run build && npm run dev
```

Open the app → Game tab. Expected:
- Canvas renders the outdoor map (green grass, brown path, blue river on left)
- Player sprite walks with WASD
- Walking near a building shows the enter prompt
- Press E enters active buildings (school, supermarket, café)

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/CityMap.tsx
git commit -m "feat: rewrite CityMap as canvas tile map using useTileEngine"
```

---

## Task 7: Supermarket interior layout + rewrite SupermarketInterior.tsx

**Files:**
- Create: `src/features/game/data/supermarketLayout.ts`
- Rewrite: `src/features/game/components/SupermarketInterior.tsx`

- [ ] **Step 1: Create supermarketLayout.ts**

```ts
import { TileEngineConfig, InteractableConfig } from '../../../types/tileEngine';

export const SM_COLS = 20;
export const SM_ROWS = 15;
export const SM_TILE_SIZE = 32;

const FLOOR = '/assets/gamepack/tiles/Tileset_32x32_1.png';

export const SM_TILE_IMAGES: Partial<Record<string, string>> = {
  floor: FLOOR,
};

export const SM_TILE_COLORS: Partial<Record<string, string>> = {
  floor:  '#e8c878',
  wall:   '#8a6020',
  iwall:  '#6a4810', // inner wall / shelf back
  door:   '#c8a86a',
  shelf:  '#b07830',
  empty:  '#e8c878',
};

// 20×15 tile map
// Tile types: floor, wall, iwall, shelf, door
// Outer walls = wall; inner shelves = shelf (impassable)
function buildSMGrid(): string[][] {
  const W = SM_COLS, H = SM_ROWS;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('floor'));

  // Outer walls
  for (let x = 0; x < W; x++) { g[0][x] = 'wall'; g[H-1][x] = 'wall'; }
  for (let y = 0; y < H; y++) { g[y][0] = 'wall'; g[y][W-1] = 'wall'; }

  // Door in bottom wall (centre)
  g[H-1][9] = 'door'; g[H-1][10] = 'door';

  // Shelf rows (rows 2–3 across top — produce section)
  for (let x = 1; x <= 11; x++) g[2][x] = 'shelf';

  // Shelf row 5 — grocery section
  for (let x = 1; x <= 9; x++) g[5][x] = 'shelf';

  // Right-side checkout counter (col 14–18, rows 2–4)
  for (let y = 2; y <= 4; y++) for (let x = 14; x <= 17; x++) g[y][x] = 'iwall';

  // Aisle shelf col 12 rows 2–9
  for (let y = 2; y <= 9; y++) g[y][12] = 'shelf';

  return g;
}

export const SM_GRID: string[][] = buildSMGrid();

export function isSMBlocked(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= SM_COLS || ty >= SM_ROWS) return true;
  const t = SM_GRID[ty]?.[tx];
  return t === 'wall' || t === 'shelf' || t === 'iwall';
}

export const SM_INTERACTABLES: InteractableConfig[] = [
  { id: 'apple',    tileX: 1,  tileY: 2,  chinese: '苹果',   pinyin: 'píngguǒ',  description: '一种常见的红色或绿色水果。', english: 'apple' },
  { id: 'banana',   tileX: 2,  tileY: 2,  chinese: '香蕉',   pinyin: 'xiāngjiāo', description: '黄色弯曲的热带水果。', english: 'banana' },
  { id: 'tomato',   tileX: 3,  tileY: 2,  chinese: '西红柿', pinyin: 'xīhóngshì', description: '红色多汁的蔬菜，也是水果。', english: 'tomato' },
  { id: 'milk',     tileX: 5,  tileY: 2,  chinese: '牛奶',   pinyin: 'niúnǎi',   description: '白色营养丰富的饮料。', english: 'milk' },
  { id: 'egg',      tileX: 6,  tileY: 2,  chinese: '鸡蛋',   pinyin: 'jīdàn',    description: '鸡产的卵，常用于烹饪。', english: 'egg' },
  { id: 'water',    tileX: 7,  tileY: 2,  chinese: '水',     pinyin: 'shuǐ',     description: '无色无味的生命液体。', english: 'water' },
  { id: 'bread',    tileX: 1,  tileY: 5,  chinese: '面包',   pinyin: 'miànbāo',  description: '用小麦粉烘焙的主食。', english: 'bread' },
  { id: 'rice',     tileX: 3,  tileY: 5,  chinese: '米饭',   pinyin: 'mǐfàn',    description: '中国最常见的主食之一。', english: 'rice' },
  { id: 'cart',     tileX: 16, tileY: 8,  chinese: '购物车', pinyin: 'gòuwù chē', description: '超市里用来放商品的推车。', english: 'shopping cart' },
  { id: 'cashier',  tileX: 15, tileY: 3,  chinese: '收银台', pinyin: 'shōuyín tái', description: '超市结账的地方。', english: 'cashier' },
  { id: 'shelf',    tileX: 9,  tileY: 2,  chinese: '货架',   pinyin: 'huòjià',   description: '超市里摆放商品的架子。', english: 'shelf' },
  { id: 'poster',   tileX: 1,  tileY: 8,  chinese: '海报',   pinyin: 'hǎibào',   description: '超市促销用的宣传海报。', english: 'poster' },
];

export const SM_ENGINE_CONFIG: TileEngineConfig = {
  cols: SM_COLS,
  rows: SM_ROWS,
  tileSize: SM_TILE_SIZE,
  tileMap: SM_GRID,
  tileImages: SM_TILE_IMAGES,
  tileColors: SM_TILE_COLORS,
  sprites: [],
  interactables: SM_INTERACTABLES,
  spawnTileX: 9,
  spawnTileY: 13,
  isBlocked: isSMBlocked,
  viewWidth: 1280,
  viewHeight: 720,
};
```

- [ ] **Step 2: Rewrite SupermarketInterior.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import { InteriorItem } from '../../../types/domain';
import { SM_ENGINE_CONFIG, SM_INTERACTABLES } from '../data/supermarketLayout';
import { useTileEngine } from '../hooks/useTileEngine';
import { InteractableConfig } from '../../../types/tileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function SupermarketInterior({ onExit, onSave, onGainXp }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable } = useTileEngine(SM_ENGINE_CONFIG);
  const [activeItem, setActiveItem] = useState<InteractableConfig | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { if (activeItem) { setActiveItem(null); } else { onExit(); } return; }
      if (key === 'e' && nearInteractable) {
        setActiveItem(nearInteractable);
        if (!discovered.has(nearInteractable.id)) {
          onGainXp(10);
          setDiscovered(d => new Set([...d, nearInteractable.id]));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, activeItem, onExit, discovered, onGainXp]);

  const handleSave = () => {
    if (!activeItem) return;
    onSave({
      id: activeItem.id,
      spaceId: 'supermarket',
      chinese: activeItem.chinese,
      pinyin: activeItem.pinyin,
      english: activeItem.english ?? '',
      xp: 10,
      icon: '🛒',
      x: activeItem.tileX,
      y: activeItem.tileY,
    });
    setActiveItem(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#1a1000' }}>
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center', imageRendering: 'pixelated',
        }}
      />

      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        超市 — Supermarket<br />
        WASD = MOVE · E = INSPECT<br />
        ESC = EXIT
      </div>

      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #83d68e', color: '#b8ffbe',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] · {nearInteractable.chinese}
        </div>
      )}

      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(17,24,28,0.94)',
          border: '4px solid #e2bc73', color: '#f5e7ca', padding: '14px 16px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 14, color: '#ffe59a', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 8, color: '#90d7ff', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#d9f4d8', marginBottom: 10 }}>{activeItem.description}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#2a6a2a', border: '2px solid #4aaa4a', color: '#b8ffbe', cursor: 'pointer',
            }}>+ Notebook</button>
            <button onClick={() => setActiveItem(null)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#1a1a2a', border: '2px solid #4a4a8a', color: '#aaaaff', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build and visual test**

```bash
npm run build && npm run dev
```

Enter the supermarket → walk with WASD → approach a shelf item → Press E → see Chinese popup.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/data/supermarketLayout.ts src/features/game/components/SupermarketInterior.tsx
git commit -m "feat: supermarket interior as canvas tile room with interactable vocab items"
```

---

## Task 8: House interior layout + HouseInterior.tsx

**Files:**
- Create: `src/features/game/data/houseLayout.ts`
- Create: `src/features/game/components/HouseInterior.tsx`

- [ ] **Step 1: Create houseLayout.ts**

```ts
import { TileEngineConfig, InteractableConfig } from '../../../types/tileEngine';

export const HOUSE_COLS = 20;
export const HOUSE_ROWS = 15;
export const HOUSE_TILE_SIZE = 32;

const FLOOR = '/assets/gamepack/tiles/Tileset_32x32_9.png';

export const HOUSE_TILE_IMAGES: Partial<Record<string, string>> = {
  floor: FLOOR,
};

export const HOUSE_TILE_COLORS: Partial<Record<string, string>> = {
  floor: '#c49050',
  wall:  '#5a3010',
  iwall: '#7a4a20', // inner dividing walls
  door:  '#c8a86a',
  rug:   '#8a4a80',
};

function buildHouseGrid(): string[][] {
  const W = HOUSE_COLS, H = HOUSE_ROWS;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('floor'));

  // Outer walls
  for (let x = 0; x < W; x++) { g[0][x] = 'wall'; g[H-1][x] = 'wall'; }
  for (let y = 0; y < H; y++) { g[y][0] = 'wall'; g[y][W-1] = 'wall'; }

  // Door bottom-centre
  g[H-1][9] = 'door'; g[H-1][10] = 'door';

  // Inner wall: living room | bedroom (col 9, rows 1–6 with gap at row 4)
  for (let y = 1; y <= 6; y++) if (y !== 4) g[y][9] = 'iwall';

  // Inner wall: living/bedroom | kitchen (row 8, full width with gap at col 5 and col 14)
  for (let x = 1; x <= 18; x++) if (x !== 5 && x !== 14) g[8][x] = 'iwall';

  // Rug in living room (cols 2–7, rows 3–6)
  for (let y = 3; y <= 6; y++) for (let x = 2; x <= 7; x++) g[y][x] = 'rug';

  return g;
}

export const HOUSE_GRID: string[][] = buildHouseGrid();

export function isHouseBlocked(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= HOUSE_COLS || ty >= HOUSE_ROWS) return true;
  const t = HOUSE_GRID[ty]?.[tx];
  return t === 'wall' || t === 'iwall';
}

export const HOUSE_INTERACTABLES: InteractableConfig[] = [
  // Living room (left, rows 1–7)
  { id: 'sofa',      tileX: 2, tileY: 2,  chinese: '沙发',   pinyin: 'shāfā',      description: '客厅里用来坐或躺的家具。', english: 'sofa' },
  { id: 'tv',        tileX: 2, tileY: 6,  chinese: '电视',   pinyin: 'diànshì',    description: '用来看节目的电子设备。', english: 'TV' },
  { id: 'plant',     tileX: 7, tileY: 2,  chinese: '植物',   pinyin: 'zhíwù',      description: '摆放在家里的绿色植物。', english: 'plant' },
  { id: 'window',    tileX: 5, tileY: 1,  chinese: '窗户',   pinyin: 'chuānghù',   description: '让光线和空气进入房间的结构。', english: 'window' },
  // Bedroom (right, cols 10–18, rows 1–7)
  { id: 'bed',       tileX: 12, tileY: 2, chinese: '床',     pinyin: 'chuáng',     description: '睡觉用的家具。', english: 'bed' },
  { id: 'bookshelf', tileX: 17, tileY: 2, chinese: '书架',   pinyin: 'shūjià',     description: '放书的架子。', english: 'bookshelf' },
  { id: 'mirror',    tileX: 17, tileY: 5, chinese: '镜子',   pinyin: 'jìngzi',     description: '照出影像的玻璃。', english: 'mirror' },
  // Kitchen (rows 9–13)
  { id: 'stove',     tileX: 3,  tileY: 10, chinese: '炉灶',  pinyin: 'lúzào',      description: '用来做饭加热食物的设备。', english: 'stove' },
  { id: 'fridge',    tileX: 7,  tileY: 10, chinese: '冰箱',  pinyin: 'bīngxiāng',  description: '保持食物新鲜的电器。', english: 'fridge' },
  { id: 'table',     tileX: 12, tileY: 11, chinese: '桌子',  pinyin: 'zhuōzi',     description: '吃饭或工作用的家具。', english: 'table' },
  { id: 'bathroom',  tileX: 17, tileY: 10, chinese: '浴室',  pinyin: 'yùshì',      description: '洗澡和梳洗的房间。', english: 'bathroom' },
];

export const HOUSE_ENGINE_CONFIG: TileEngineConfig = {
  cols: HOUSE_COLS,
  rows: HOUSE_ROWS,
  tileSize: HOUSE_TILE_SIZE,
  tileMap: HOUSE_GRID,
  tileImages: HOUSE_TILE_IMAGES,
  tileColors: HOUSE_TILE_COLORS,
  sprites: [],
  interactables: HOUSE_INTERACTABLES,
  spawnTileX: 9,
  spawnTileY: 13,
  isBlocked: isHouseBlocked,
  viewWidth: 1280,
  viewHeight: 720,
};
```

- [ ] **Step 2: Create HouseInterior.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import { InteriorItem } from '../../../types/domain';
import { HOUSE_ENGINE_CONFIG } from '../data/houseLayout';
import { useTileEngine } from '../hooks/useTileEngine';
import { InteractableConfig } from '../../../types/tileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function HouseInterior({ onExit, onSave, onGainXp }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable } = useTileEngine(HOUSE_ENGINE_CONFIG);
  const [activeItem, setActiveItem] = useState<InteractableConfig | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { if (activeItem) { setActiveItem(null); } else { onExit(); } return; }
      if (key === 'e' && nearInteractable) {
        setActiveItem(nearInteractable);
        if (!discovered.has(nearInteractable.id)) {
          onGainXp(10);
          setDiscovered(d => new Set([...d, nearInteractable.id]));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, activeItem, onExit, discovered, onGainXp]);

  const handleSave = () => {
    if (!activeItem) return;
    onSave({
      id: activeItem.id,
      spaceId: 'supermarket', // closest available SpaceId
      chinese: activeItem.chinese,
      pinyin: activeItem.pinyin,
      english: activeItem.english ?? '',
      xp: 10,
      icon: '🏠',
      x: activeItem.tileX,
      y: activeItem.tileY,
    });
    setActiveItem(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#1a0f00' }}>
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center', imageRendering: 'pixelated',
        }}
      />

      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        住宅 — House<br />
        WASD = MOVE · E = INSPECT<br />
        ESC = EXIT
      </div>

      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #f7c97a', color: '#ffe59a',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] · {nearInteractable.chinese}
        </div>
      )}

      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(28,18,8,0.96)',
          border: '4px solid #c8a86a', color: '#f5e7ca', padding: '14px 16px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 14, color: '#ffe59a', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 8, color: '#f0c070', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#e8d4a0', marginBottom: 10 }}>{activeItem.description}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#4a2a08', border: '2px solid #c8a86a', color: '#ffe59a', cursor: 'pointer',
            }}>+ Notebook</button>
            <button onClick={() => setActiveItem(null)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#1a1a1a', border: '2px solid #555', color: '#aaa', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build and visual test**

```bash
npm run build && npm run dev
```

Expected: builds without errors (HouseInterior not wired into game yet — that's Task 10).

- [ ] **Step 4: Commit**

```bash
git add src/features/game/data/houseLayout.ts src/features/game/components/HouseInterior.tsx
git commit -m "feat: add House interior with warm wood tiles and furniture vocab items"
```

---

## Task 9: Café interior layout + rewrite CafeInterior.tsx

**Files:**
- Create: `src/features/game/data/cafeLayout.ts`
- Rewrite: `src/features/game/components/CafeInterior.tsx`

- [ ] **Step 1: Create cafeLayout.ts**

```ts
import { TileEngineConfig, InteractableConfig } from '../../../types/tileEngine';

export const CAFE_COLS = 20;
export const CAFE_ROWS = 15;
export const CAFE_TILE_SIZE = 32;

const FLOOR = '/assets/gamepack/tiles/Tileset_32x32_2.png';

export const CAFE_TILE_IMAGES: Partial<Record<string, string>> = {
  floor: FLOOR,
};

export const CAFE_TILE_COLORS: Partial<Record<string, string>> = {
  floor:   '#7eccc0',
  wall:    '#1a5050',
  iwall:   '#2a7070', // counter wall
  door:    '#c8a86a',
  counter: '#4a2a10',
};

function buildCafeGrid(): string[][] {
  const W = CAFE_COLS, H = CAFE_ROWS;
  const g: string[][] = Array.from({ length: H }, () => Array(W).fill('floor'));

  // Outer walls
  for (let x = 0; x < W; x++) { g[0][x] = 'wall'; g[H-1][x] = 'wall'; }
  for (let y = 0; y < H; y++) { g[y][0] = 'wall'; g[y][W-1] = 'wall'; }

  // Door bottom-centre
  g[H-1][9] = 'door'; g[H-1][10] = 'door';

  // Counter wall (row 4, full width with gap at col 10 for staff passage)
  for (let x = 1; x <= 18; x++) if (x !== 10) g[4][x] = 'iwall';

  return g;
}

export const CAFE_GRID: string[][] = buildCafeGrid();

export function isCafeBlocked(tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= CAFE_COLS || ty >= CAFE_ROWS) return true;
  const t = CAFE_GRID[ty]?.[tx];
  return t === 'wall' || t === 'iwall';
}

export const CAFE_INTERACTABLES: InteractableConfig[] = [
  // Counter zone (rows 1–3)
  { id: 'coffee',    tileX: 2,  tileY: 2, chinese: '咖啡',   pinyin: 'kāfēi',      description: '用咖啡豆冲泡的饮料，提神醒脑。', english: 'coffee' },
  { id: 'cake',      tileX: 4,  tileY: 2, chinese: '蛋糕',   pinyin: 'dàngāo',     description: '甜点，常在生日时食用。', english: 'cake' },
  { id: 'croissant', tileX: 6,  tileY: 2, chinese: '牛角包', pinyin: 'niújiǎo bāo', description: '法式酥皮糕点，呈弯月形。', english: 'croissant' },
  { id: 'menu',      tileX: 8,  tileY: 2, chinese: '菜单',   pinyin: 'càidān',     description: '列出餐厅所有食品和饮料的单子。', english: 'menu' },
  { id: 'espresso',  tileX: 12, tileY: 2, chinese: '意式浓缩咖啡', pinyin: 'yìshì nóngsùo kāfēi', description: '浓度极高的咖啡饮品。', english: 'espresso' },
  // Seating zone (rows 5–13)
  { id: 'tea',       tileX: 3,  tileY: 7,  chinese: '茶',     pinyin: 'chá',        description: '中国最传统的饮品之一。', english: 'tea' },
  { id: 'juice',     tileX: 5,  tileY: 7,  chinese: '果汁',   pinyin: 'guǒzhī',     description: '新鲜水果榨出的饮料。', english: 'juice' },
  { id: 'tart',      tileX: 10, tileY: 7,  chinese: '挞',     pinyin: 'tǎ',         description: '有馅料的酥皮小点心。', english: 'tart' },
  { id: 'chair',     tileX: 14, tileY: 9,  chinese: '椅子',   pinyin: 'yǐzi',       description: '供人坐下休息的家具。', english: 'chair' },
  { id: 'plant-c',   tileX: 17, tileY: 6,  chinese: '植物',   pinyin: 'zhíwù',      description: '咖啡厅里摆放的绿色植物。', english: 'plant' },
  { id: 'wifi',      tileX: 2,  tileY: 12, chinese: '无线网络', pinyin: 'wúxiàn wǎngluò', description: '咖啡厅提供的无线上网服务。', english: 'wifi' },
];

export const CAFE_ENGINE_CONFIG: TileEngineConfig = {
  cols: CAFE_COLS,
  rows: CAFE_ROWS,
  tileSize: CAFE_TILE_SIZE,
  tileMap: CAFE_GRID,
  tileImages: CAFE_TILE_IMAGES,
  tileColors: CAFE_TILE_COLORS,
  sprites: [],
  interactables: CAFE_INTERACTABLES,
  spawnTileX: 9,
  spawnTileY: 13,
  isBlocked: isCafeBlocked,
  viewWidth: 1280,
  viewHeight: 720,
};
```

- [ ] **Step 2: Rewrite CafeInterior.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import { InteriorItem } from '../../../types/domain';
import { CAFE_ENGINE_CONFIG } from '../data/cafeLayout';
import { useTileEngine } from '../hooks/useTileEngine';
import { InteractableConfig } from '../../../types/tileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function CafeInterior({ onExit, onSave, onGainXp }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable } = useTileEngine(CAFE_ENGINE_CONFIG);
  const [activeItem, setActiveItem] = useState<InteractableConfig | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { if (activeItem) { setActiveItem(null); } else { onExit(); } return; }
      if (key === 'e' && nearInteractable) {
        setActiveItem(nearInteractable);
        if (!discovered.has(nearInteractable.id)) {
          onGainXp(10);
          setDiscovered(d => new Set([...d, nearInteractable.id]));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, activeItem, onExit, discovered, onGainXp]);

  const handleSave = () => {
    if (!activeItem) return;
    onSave({
      id: activeItem.id,
      spaceId: 'cafe',
      chinese: activeItem.chinese,
      pinyin: activeItem.pinyin,
      english: activeItem.english ?? '',
      xp: 10,
      icon: '☕',
      x: activeItem.tileX,
      y: activeItem.tileY,
    });
    setActiveItem(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#001a14' }}>
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center', imageRendering: 'pixelated',
        }}
      />

      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        咖啡厅 — Café<br />
        WASD = MOVE · E = INSPECT<br />
        ESC = EXIT
      </div>

      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #7affdb', color: '#b8fff4',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] · {nearInteractable.chinese}
        </div>
      )}

      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(0,20,18,0.96)',
          border: '4px solid #7affdb', color: '#e0fff8', padding: '14px 16px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 14, color: '#7affdb', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 8, color: '#b8fff4', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#d0f8f0', marginBottom: 10 }}>{activeItem.description}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#083030', border: '2px solid #7affdb', color: '#7affdb', cursor: 'pointer',
            }}>+ Notebook</button>
            <button onClick={() => setActiveItem(null)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#1a1a1a', border: '2px solid #555', color: '#aaa', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build and visual test**

```bash
npm run build && npm run dev
```

Enter the café → walk with WASD → inspect items → popup shows Chinese vocab.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/data/cafeLayout.ts src/features/game/components/CafeInterior.tsx
git commit -m "feat: café interior with teal tiles, counter section, and vocab items"
```

---

## Task 10: Wire HouseInterior + final integration

**Files:**
- Modify: `src/features/game/GameTab.tsx`

- [ ] **Step 1: Update GameTab to include house scene**

In `GameTab.tsx`, update the `Scene` type and add the HouseInterior import and render:

```tsx
import { HouseInterior } from './components/HouseInterior';

type Scene = 'city' | 'supermarket' | 'school' | 'cafe' | 'house';
```

Add after the café block:

```tsx
      {scene === 'house' && (
        <HouseInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
```

- [ ] **Step 2: Final build and full play-through test**

```bash
npm run build && npm run dev
```

Test each path:
1. Open app → Game tab → outdoor map renders (river left, green farm plots, sprites)
2. WASD to supermarket door → Press E → supermarket interior loads
3. Walk near shelf item → Press E → Chinese popup with pinyin + description
4. Press `+ Notebook` → item saved → Press ESC → back to supermarket → ESC → city
5. Walk to café door → Press E → café interior loads with teal tiles
6. Walk to house door → Press E (currently in-progress, shows coming-soon) — **no crash**
7. `npm run build` passes with 0 errors

- [ ] **Step 3: Final commit**

```bash
git add src/features/game/GameTab.tsx
git commit -m "feat: wire HouseInterior into GameTab, complete canvas tile rewrite"
```

---

## Self-Review

**Spec coverage:**
- ✅ Canvas rendering via `useTileEngine` — Tasks 4, 6, 7, 8, 9
- ✅ Shared hook architecture — Task 4
- ✅ Outdoor map (river-left, organic layout, farm plots, cherry blossoms) — Task 5
- ✅ CityMap canvas rewrite — Task 6
- ✅ Supermarket interior (bright beige, sections, 12 items) — Task 7
- ✅ House interior (warm wood, 3 sections, 11 items) — Task 8
- ✅ Café interior (cool teal, counter wall, 11 items) — Task 9
- ✅ HouseInterior wired into game — Task 10
- ✅ `usePlayerMovement` generic — Task 1
- ✅ `useCamera` generic — Task 2

**Type consistency check:**
- `InteractableConfig` defined in Task 3, used consistently in Tasks 5–9 ✅
- `BuildingEntry.doorTileX/doorTileY` defined in Task 3, used in Task 4's `useTileEngine` ✅
- `TileEngineConfig.isBlocked` matches `(tileX, tileY) => boolean` in all layout files ✅
- `useTileEngine` returns `{ canvasRef, containerRef, player, scale, nearInteractable, nearBuilding }` — all consumed correctly in scene components ✅

**Note:** `HouseInterior` uses `spaceId: 'supermarket'` as a SpaceId workaround since `'house'` is not in the domain's SpaceId union. A future task can add `'house'` to the SpaceId type if needed.
