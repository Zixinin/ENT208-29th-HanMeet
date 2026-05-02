# 2D Retro City Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark 3D first-person game with a vibrant Stardew Valley-style 2D top-down pixel art city where the player walks around (WASD), enters 3 buildings (Supermarket, School, Café), and clicks objects to learn Chinese vocabulary.

**Architecture:** Pure CSS tile-based top-down map — no canvas, no Three.js. Player position stored in `useState`, keyboard input via `useEffect` + `requestAnimationFrame`. Camera is a CSS `transform: translate()` on the map container that follows the player. Collision is rectangle-based tile lookup. All pixel art drawn with CSS/emoji, no image sprites needed.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Web Speech API (pronunciation), existing XP/notebook state from `useAppState`

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `src/features/game/hooks/usePlayerMovement.ts` | WASD input, position state, collision check, animation frame loop |
| `src/features/game/hooks/useCamera.ts` | Compute camera offset so player stays centered in viewport |
| `src/features/game/data/cityLayout.ts` | City tile map (40×28 grid), building rects, NPC positions, door tiles |
| `src/features/game/data/cafeVocab.ts` | Café-specific vocabulary items (reuses cafeteria data) |
| `src/features/game/components/CityMap.tsx` | Renders the exterior city: tiles, trees, paths, buildings |
| `src/features/game/components/PlayerSprite.tsx` | Top-down CSS pixel character, 4-direction walking frames |
| `src/features/game/components/NpcSprite.tsx` | Static NPC with speech bubble on approach |
| `src/features/game/components/BuildingDoor.tsx` | Door hitbox + enter-building prompt ("Press E") |
| `src/features/game/components/SupermarketInterior.tsx` | 2D top-down supermarket interior with shelf items |
| `src/features/game/components/ClassroomInterior.tsx` | 2D top-down classroom interior with desk items |
| `src/features/game/components/CafeInterior.tsx` | 2D top-down café interior with table/counter items |
| `src/features/game/components/VocabPopup.tsx` | Retro pixel popup: Chinese + pinyin + English + speak + save |
| `src/features/game/components/FlashcardQuiz.tsx` | Notebook flashcard quiz overlay (press Q to open) |
| `src/features/ui/PixelFrame.tsx` | Reusable retro border box used by all panels |

### Modified files
| File | Change |
|------|--------|
| `src/App.tsx` | Retro pixel header + tab buttons skin |
| `src/features/game/GameTab.tsx` | Replace 3D game with city/interior router |
| `src/features/game/data.ts` | No change to vocab; remove 3D-specific fields if any |
| `src/types/domain.ts` | Add `'cafe'` to `SpaceId`; add `TileType`, `Building`, `NpcData` types |
| `src/features/notebook/NotebookTab.tsx` | Apply retro pixel skin |
| `src/features/dictionary/DictionaryTab.tsx` | Apply retro pixel skin |
| `src/features/profile/ProfileTab.tsx` | Apply retro pixel skin |
| `src/index.css` | Add pixel font import + global pixel-art CSS vars |

### Deleted files
| File | Reason |
|------|--------|
| `src/features/game/components/Supermarket3DGame.tsx` | Replaced by 2D interior |
| `src/features/game/data/supermarket3d.ts` | 3D-only data no longer needed |

---

## Task 1: Retro Pixel UI Skin — Global + App Shell

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Create: `src/features/ui/PixelFrame.tsx`

- [ ] **Step 1: Add pixel font + CSS variables to `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

:root {
  --pixel-bg: #1a1a2e;
  --pixel-panel: #16213e;
  --pixel-border: #e2b96f;
  --pixel-accent: #ff6b6b;
  --pixel-green: #6bcb77;
  --pixel-blue: #4d96ff;
  --pixel-yellow: #ffd166;
  --pixel-text: #f0e6d3;
  --pixel-shadow: 4px 4px 0px #000;
}

body {
  font-family: 'Press Start 2P', monospace;
  background: var(--pixel-bg);
  color: var(--pixel-text);
  image-rendering: pixelated;
}
```

- [ ] **Step 2: Create `src/features/ui/PixelFrame.tsx`**

```tsx
interface PixelFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function PixelFrame({ children, className = '', color = 'var(--pixel-border)' }: PixelFrameProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'var(--pixel-panel)',
        border: `4px solid ${color}`,
        boxShadow: `4px 4px 0px #000, inset 0 0 0 2px rgba(255,255,255,0.05)`,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Restyle `src/App.tsx` header and tabs**

Replace the header JSX with:

```tsx
<header className="sticky top-0 z-40" style={{ background: 'var(--pixel-panel)', borderBottom: '4px solid var(--pixel-border)' }}>
  <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 style={{ fontSize: '14px', color: 'var(--pixel-yellow)', textShadow: '2px 2px 0 #000' }}>
        ★ HanMeet ★
      </h1>
      <p style={{ fontSize: '7px', color: 'var(--pixel-text)', opacity: 0.7, marginTop: 4 }}>
        EXPLORE · LEARN · MASTER
      </p>
    </div>
    <div style={{ fontSize: '8px', color: 'var(--pixel-text)', background: '#0f0f1a', border: '3px solid var(--pixel-border)', padding: '6px 12px' }}>
      <span className="mr-4">LVL <strong style={{ color: 'var(--pixel-yellow)' }}>{stats.level}</strong></span>
      <span className="mr-4">WORDS <strong style={{ color: 'var(--pixel-green)' }}>{stats.savedWords}</strong></span>
      <span>SPACES <strong style={{ color: 'var(--pixel-blue)' }}>{stats.unlockedSpaces}/4</strong></span>
    </div>
  </div>
  <nav className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        style={{
          fontSize: '8px',
          padding: '8px 14px',
          border: '3px solid var(--pixel-border)',
          background: activeTab === tab.id ? 'var(--pixel-border)' : 'var(--pixel-panel)',
          color: activeTab === tab.id ? '#000' : 'var(--pixel-text)',
          boxShadow: activeTab === tab.id ? 'none' : '3px 3px 0 #000',
          transform: activeTab === tab.id ? 'translate(2px,2px)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {tab.icon}
        {tab.label.toUpperCase()}
      </button>
    ))}
  </nav>
</header>
```

- [ ] **Step 4: Update `main` wrapper background in `src/App.tsx`**

Change the outer div class to:
```tsx
<div className="min-h-screen flex flex-col" style={{ background: 'var(--pixel-bg)', color: 'var(--pixel-text)' }}>
```

- [ ] **Step 5: Run checks**

```bash
npm run lint && npm run build
```
Expected: no TypeScript errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/App.tsx src/features/ui/PixelFrame.tsx
git commit -m "feat: retro pixel art UI skin for app shell and header"
```

---

## Task 2: Domain Types for City + Café

**Files:**
- Modify: `src/types/domain.ts`
- Create: `src/features/game/data/cityLayout.ts`
- Create: `src/features/game/data/cafeVocab.ts`

- [ ] **Step 1: Extend `src/types/domain.ts`**

Add after the existing type exports:

```ts
export type TileType = 'grass' | 'path' | 'road' | 'sidewalk' | 'tree' | 'wall' | 'door' | 'water' | 'flower';

export interface Building {
  id: 'supermarket' | 'school' | 'cafe';
  label: string;
  chineseLabel: string;
  color: string;
  /** Top-left tile position in city grid */
  tileX: number;
  tileY: number;
  /** Width/height in tiles */
  tileW: number;
  tileH: number;
  /** Door tile position (absolute grid coords) */
  doorX: number;
  doorY: number;
}

export interface NpcData {
  id: string;
  tileX: number;
  tileY: number;
  emoji: string;
  hint: string;
}

export interface PlayerState {
  x: number; // pixel x in world space
  y: number; // pixel y in world space
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  frame: number; // 0 or 1 for walk animation
}

export interface InteriorItem {
  id: string;
  spaceId: SpaceId;
  chinese: string;
  pinyin: string;
  english: string;
  xp: number;
  icon: string;
  /** Pixel position within interior (0-100 percent of interior size) */
  x: number;
  y: number;
}
```

Also extend `SpaceId`:
```ts
export type SpaceId = 'classroom' | 'supermarket' | 'dorm' | 'cafeteria' | 'cafe';
```

- [ ] **Step 2: Create `src/features/game/data/cityLayout.ts`**

```ts
import { Building, NpcData, TileType } from '../../../types/domain';

export const TILE_SIZE = 48; // px
export const CITY_COLS = 40;
export const CITY_ROWS = 28;

export const BUILDINGS: Building[] = [
  {
    id: 'supermarket',
    label: 'Supermarket',
    chineseLabel: '超市',
    color: '#4d96ff',
    tileX: 5, tileY: 4,
    tileW: 8, tileH: 6,
    doorX: 9, doorY: 10,
  },
  {
    id: 'school',
    label: 'School',
    chineseLabel: '学校',
    color: '#ff6b6b',
    tileX: 20, tileY: 4,
    tileW: 8, tileH: 6,
    doorX: 24, doorY: 10,
  },
  {
    id: 'cafe',
    label: 'Café',
    chineseLabel: '咖啡店',
    color: '#ffd166',
    tileX: 30, tileY: 14,
    tileW: 7, tileH: 5,
    doorX: 33, doorY: 19,
  },
];

export const NPCS: NpcData[] = [
  { id: 'npc1', tileX: 14, tileY: 12, emoji: '👩', hint: '超市 (chāoshì) means Supermarket!' },
  { id: 'npc2', tileX: 25, tileY: 14, emoji: '👨‍🏫', hint: '学校 (xuéxiào) means School!' },
  { id: 'npc3', tileX: 28, tileY: 18, emoji: '👩‍🍳', hint: '咖啡店 (kāfēi diàn) means Café!' },
];

/** Build a 2D tile grid: 'grass' everywhere, roads and paths overlaid */
function buildCityGrid(): TileType[][] {
  const grid: TileType[][] = Array.from({ length: CITY_ROWS }, () =>
    Array(CITY_COLS).fill('grass' as TileType)
  );

  // Horizontal road (y=12,13)
  for (let x = 0; x < CITY_COLS; x++) {
    grid[12][x] = 'road';
    grid[13][x] = 'road';
  }
  // Vertical road (x=16,17)
  for (let y = 0; y < CITY_ROWS; y++) {
    grid[y][16] = 'road';
    grid[y][17] = 'road';
  }

  // Paths to building doors
  for (let x = BUILDINGS[0].tileX; x <= BUILDINGS[0].doorX; x++) grid[11][x] = 'path';
  for (let x = BUILDINGS[1].tileX; x <= BUILDINGS[1].doorX; x++) grid[11][x] = 'path';
  for (let y = BUILDINGS[2].doorY; y <= 20; y++) grid[y][BUILDINGS[2].doorX] = 'path';

  // Place buildings (walls)
  for (const b of BUILDINGS) {
    for (let row = b.tileY; row < b.tileY + b.tileH; row++) {
      for (let col = b.tileX; col < b.tileX + b.tileW; col++) {
        grid[row][col] = 'wall';
      }
    }
    grid[b.doorY][b.doorX] = 'door';
  }

  // Scatter trees on grass areas
  const treePositions = [
    [2,2],[3,3],[38,2],[37,3],[2,25],[3,26],[38,25],[37,24],
    [10,16],[11,17],[22,16],[23,17],[5,16],[6,17],
  ];
  for (const [row, col] of treePositions) {
    if (grid[row]?.[col] === 'grass') grid[row][col] = 'tree';
  }

  // Flower patches
  const flowerPositions = [[4,10],[5,11],[14,4],[15,5],[20,20],[21,21],[35,8]];
  for (const [row, col] of flowerPositions) {
    if (grid[row]?.[col] === 'grass') grid[row][col] = 'flower';
  }

  return grid;
}

export const CITY_GRID: TileType[][] = buildCityGrid();

/** Returns true if a tile blocks movement */
export function isBlocked(gridX: number, gridY: number): boolean {
  if (gridX < 0 || gridY < 0 || gridX >= CITY_COLS || gridY >= CITY_ROWS) return true;
  const tile = CITY_GRID[gridY]?.[gridX];
  return tile === 'wall' || tile === 'tree' || tile === 'water';
}
```

- [ ] **Step 3: Create `src/features/game/data/cafeVocab.ts`**

```ts
import { InteriorItem } from '../../../types/domain';

export const CAFE_ITEMS: InteriorItem[] = [
  { id: 'coffee', spaceId: 'cafe', chinese: '咖啡', pinyin: 'kāfēi', english: 'Coffee', xp: 12, icon: '☕', x: 20, y: 30 },
  { id: 'cake', spaceId: 'cafe', chinese: '蛋糕', pinyin: 'dàngāo', english: 'Cake', xp: 12, icon: '🎂', x: 35, y: 32 },
  { id: 'tea', spaceId: 'cafe', chinese: '茶', pinyin: 'chá', english: 'Tea', xp: 10, icon: '🍵', x: 50, y: 30 },
  { id: 'juice', spaceId: 'cafe', chinese: '果汁', pinyin: 'guǒzhī', english: 'Juice', xp: 10, icon: '🧃', x: 65, y: 32 },
  { id: 'cookie', spaceId: 'cafe', chinese: '饼干', pinyin: 'bǐnggān', english: 'Cookie', xp: 14, icon: '🍪', x: 25, y: 55 },
  { id: 'menu-cafe', spaceId: 'cafe', chinese: '菜单', pinyin: 'càidān', english: 'Menu', xp: 14, icon: '📋', x: 75, y: 45 },
  { id: 'chair-cafe', spaceId: 'cafe', chinese: '椅子', pinyin: 'yǐzi', english: 'Chair', xp: 10, icon: '🪑', x: 40, y: 65 },
  { id: 'table-cafe', spaceId: 'cafe', chinese: '桌子', pinyin: 'zhuōzi', english: 'Table', xp: 10, icon: '🪵', x: 55, y: 65 },
  { id: 'counter', spaceId: 'cafe', chinese: '柜台', pinyin: 'guìtái', english: 'Counter', xp: 18, icon: '🏪', x: 50, y: 20 },
];
```

- [ ] **Step 4: Run checks**

```bash
npm run lint && npm run build
```
Expected: passes with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/domain.ts src/features/game/data/cityLayout.ts src/features/game/data/cafeVocab.ts
git commit -m "feat: add city layout data, café vocab, and extended domain types"
```

---

## Task 3: Player Movement Hook

**Files:**
- Create: `src/features/game/hooks/usePlayerMovement.ts`
- Create: `src/features/game/hooks/useCamera.ts`

- [ ] **Step 1: Create `src/features/game/hooks/usePlayerMovement.ts`**

```ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerState } from '../../../types/domain';
import { TILE_SIZE, CITY_COLS, CITY_ROWS, isBlocked } from '../data/cityLayout';

const SPEED = 3; // pixels per frame

export function usePlayerMovement(initialX = 18, initialY = 12) {
  const [player, setPlayer] = useState<PlayerState>({
    x: initialX * TILE_SIZE,
    y: initialY * TILE_SIZE,
    facing: 'down',
    moving: false,
    frame: 0,
  });

  const keys = useRef<Set<string>>(new Set());
  const frameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const worldW = CITY_COLS * TILE_SIZE;
  const worldH = CITY_ROWS * TILE_SIZE;

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      e.key.startsWith('Arrow') && e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      frameCountRef.current++;
      setPlayer((prev) => {
        let dx = 0, dy = 0;
        const k = keys.current;
        if (k.has('arrowup') || k.has('w')) dy = -SPEED;
        if (k.has('arrowdown') || k.has('s')) dy = SPEED;
        if (k.has('arrowleft') || k.has('a')) dx = -SPEED;
        if (k.has('arrowright') || k.has('d')) dx = SPEED;

        if (dx === 0 && dy === 0) return prev.moving ? { ...prev, moving: false } : prev;

        const facing: PlayerState['facing'] =
          dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';

        // Collision: check leading edge of character (16px wide)
        const charW = 24, charH = 24;
        let nx = Math.max(0, Math.min(worldW - charW, prev.x + dx));
        let ny = Math.max(0, Math.min(worldH - charH, prev.y + dy));

        const tileCheck = (px: number, py: number) => {
          const tx = Math.floor(px / TILE_SIZE);
          const ty = Math.floor(py / TILE_SIZE);
          return isBlocked(tx, ty);
        };

        if (dx !== 0) {
          const edgeX = dx > 0 ? nx + charW - 1 : nx;
          if (tileCheck(edgeX, ny + 4) || tileCheck(edgeX, ny + charH - 5)) nx = prev.x;
        }
        if (dy !== 0) {
          const edgeY = dy > 0 ? ny + charH - 1 : ny;
          if (tileCheck(nx + 4, edgeY) || tileCheck(nx + charW - 5, edgeY)) ny = prev.y;
        }

        const frame = Math.floor(frameCountRef.current / 12) % 2;
        return { x: nx, y: ny, facing, moving: true, frame };
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [worldW, worldH]);

  const teleport = useCallback((tileX: number, tileY: number) => {
    setPlayer((p) => ({ ...p, x: tileX * TILE_SIZE, y: tileY * TILE_SIZE }));
  }, []);

  return { player, teleport };
}
```

- [ ] **Step 2: Create `src/features/game/hooks/useCamera.ts`**

```ts
import { useMemo } from 'react';
import { PlayerState } from '../../../types/domain';
import { TILE_SIZE, CITY_COLS, CITY_ROWS } from '../data/cityLayout';

export function useCamera(player: PlayerState, viewW: number, viewH: number) {
  return useMemo(() => {
    const worldW = CITY_COLS * TILE_SIZE;
    const worldH = CITY_ROWS * TILE_SIZE;
    const halfW = viewW / 2;
    const halfH = viewH / 2;

    let camX = player.x + 12 - halfW; // 12 = half char width
    let camY = player.y + 12 - halfH;

    camX = Math.max(0, Math.min(worldW - viewW, camX));
    camY = Math.max(0, Math.min(worldH - viewH, camY));

    return { camX, camY };
  }, [player.x, player.y, viewW, viewH]);
}
```

- [ ] **Step 3: Run checks**

```bash
npm run lint && npm run build
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/game/hooks/usePlayerMovement.ts src/features/game/hooks/useCamera.ts
git commit -m "feat: WASD player movement hook with collision and camera follow"
```

---

## Task 4: Player Sprite Component

**Files:**
- Create: `src/features/game/components/PlayerSprite.tsx`

- [ ] **Step 1: Create `src/features/game/components/PlayerSprite.tsx`**

This draws a simple top-down pixel human using CSS/divs — a round head, body oval, and facing indicator.

```tsx
import { PlayerState } from '../../../types/domain';

interface Props {
  player: PlayerState;
  outfitColor?: string;
}

export function PlayerSprite({ player, outfitColor = '#4d96ff' }: Props) {
  // Walking bob: shift body slightly on frame change
  const bob = player.moving && player.frame === 1 ? -1 : 0;

  const facingArrow = { up: '▲', down: '▼', left: '◀', right: '▶' }[player.facing];

  return (
    <div
      style={{
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: 24,
        height: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        transform: `translateY(${bob}px)`,
        transition: 'left 0.05s linear, top 0.05s linear',
        zIndex: 20,
        imageRendering: 'pixelated',
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: -2,
        width: 16,
        height: 6,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '50%',
      }} />

      {/* Head */}
      <div style={{
        width: 12,
        height: 12,
        background: '#f5c3a5',
        border: '2px solid #000',
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 6,
        lineHeight: 1,
      }}>
        {facingArrow}
      </div>

      {/* Body */}
      <div style={{
        width: 14,
        height: 10,
        background: outfitColor,
        border: '2px solid #000',
        borderRadius: '3px 3px 5px 5px',
        flexShrink: 0,
      }} />
    </div>
  );
}
```

- [ ] **Step 2: Run checks**

```bash
npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/PlayerSprite.tsx
git commit -m "feat: top-down CSS pixel player sprite with facing direction"
```

---

## Task 5: City Map Component

**Files:**
- Create: `src/features/game/components/CityMap.tsx`

- [ ] **Step 1: Create `src/features/game/components/CityMap.tsx`**

```tsx
import { useRef, useEffect, useState } from 'react';
import { Building } from '../../../types/domain';
import {
  CITY_GRID, CITY_COLS, CITY_ROWS, TILE_SIZE,
  BUILDINGS, NPCS,
} from '../data/cityLayout';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useCamera } from '../hooks/useCamera';
import { PlayerSprite } from './PlayerSprite';

const TILE_COLORS: Record<string, string> = {
  grass: '#5a9e4a',
  path: '#c8a96a',
  road: '#4a4a5a',
  sidewalk: '#b0a898',
  tree: '#2d7a2d',
  wall: '#6a8cb8',
  door: '#e2b96f',
  water: '#3a6ea5',
  flower: '#7ec87e',
};

const TILE_ICONS: Record<string, string> = {
  tree: '🌲',
  flower: '🌸',
  door: '🚪',
};

interface Props {
  outfitColor: string;
  onEnterBuilding: (buildingId: Building['id']) => void;
}

export function CityMap({ outfitColor, onEnterBuilding }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState({ w: 800, h: 560 });
  const { player, teleport } = usePlayerMovement(18, 12);
  const { camX, camY } = useCamera(player, viewSize.w, viewSize.h);

  const [nearDoor, setNearDoor] = useState<Building | null>(null);
  const [npcHint, setNpcHint] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Check proximity to doors and NPCs
  useEffect(() => {
    const px = Math.floor(player.x / TILE_SIZE);
    const py = Math.floor(player.y / TILE_SIZE);

    const near = BUILDINGS.find((b) =>
      Math.abs(px - b.doorX) <= 1 && Math.abs(py - b.doorY) <= 2
    );
    setNearDoor(near ?? null);

    const nearNpc = NPCS.find((n) =>
      Math.abs(px - n.tileX) <= 2 && Math.abs(py - n.tileY) <= 2
    );
    setNpcHint(nearNpc?.hint ?? null);
  }, [player.x, player.y]);

  // E key to enter building
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && nearDoor) {
        onEnterBuilding(nearDoor.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearDoor, onEnterBuilding]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#1a1a2e',
        cursor: 'none',
      }}
    >
      {/* World container: shifted by camera */}
      <div
        style={{
          position: 'absolute',
          transform: `translate(${-camX}px, ${-camY}px)`,
          width: CITY_COLS * TILE_SIZE,
          height: CITY_ROWS * TILE_SIZE,
          imageRendering: 'pixelated',
        }}
      >
        {/* Tiles */}
        {CITY_GRID.map((row, ry) =>
          row.map((tile, cx) => (
            <div
              key={`${ry}-${cx}`}
              style={{
                position: 'absolute',
                left: cx * TILE_SIZE,
                top: ry * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: TILE_COLORS[tile] ?? '#5a9e4a',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: TILE_SIZE * 0.55,
                lineHeight: 1,
              }}
            >
              {TILE_ICONS[tile] ?? ''}
            </div>
          ))
        )}

        {/* Building signs */}
        {BUILDINGS.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.tileX * TILE_SIZE,
              top: (b.tileY - 1) * TILE_SIZE,
              width: b.tileW * TILE_SIZE,
              textAlign: 'center',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              color: b.color,
              textShadow: '2px 2px 0 #000',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 4px',
            }}
          >
            {b.label} {b.chineseLabel}
          </div>
        ))}

        {/* NPCs */}
        {NPCS.map((npc) => (
          <div
            key={npc.id}
            style={{
              position: 'absolute',
              left: npc.tileX * TILE_SIZE + 8,
              top: npc.tileY * TILE_SIZE + 4,
              fontSize: 28,
              lineHeight: 1,
              filter: 'drop-shadow(2px 2px 0 #000)',
            }}
          >
            {npc.emoji}
          </div>
        ))}

        {/* Player */}
        <PlayerSprite player={player} outfitColor={outfitColor} />
      </div>

      {/* HUD overlays (in screen space) */}
      {nearDoor && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          background: 'rgba(0,0,0,0.85)',
          border: '3px solid var(--pixel-border)',
          color: 'var(--pixel-yellow)',
          padding: '10px 16px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          Press [E] to enter {nearDoor.label}
        </div>
      )}

      {npcHint && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          background: 'rgba(0,0,0,0.85)',
          border: '3px solid var(--pixel-green)',
          color: 'var(--pixel-green)',
          padding: '10px 16px',
          textAlign: 'center',
          maxWidth: 320,
        }}>
          💬 {npcHint}
        </div>
      )}

      {/* Controls reminder */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.8,
      }}>
        WASD / ↑↓←→ move<br />
        E = enter building
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run checks**

```bash
npm run lint && npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/CityMap.tsx
git commit -m "feat: 2D top-down pixel city map with tiles, buildings, NPCs, and camera"
```

---

## Task 6: Retro Vocabulary Popup

**Files:**
- Create: `src/features/game/components/VocabPopup.tsx`

- [ ] **Step 1: Create `src/features/game/components/VocabPopup.tsx`**

```tsx
import { useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';

interface Props {
  item: InteriorItem;
  onClose: () => void;
  onSave: (item: InteriorItem) => void;
  onSpeak: (text: string) => void;
}

export function VocabPopup({ item, onClose, onSave, onSpeak }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        fontFamily: "'Press Start 2P', monospace",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--pixel-panel)',
          border: '4px solid var(--pixel-border)',
          boxShadow: '6px 6px 0 #000',
          padding: '28px 32px',
          minWidth: 300,
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{item.icon}</div>

        {/* Chinese */}
        <div style={{ fontSize: 28, color: 'var(--pixel-yellow)', marginBottom: 8, letterSpacing: 4 }}>
          {item.chinese}
        </div>

        {/* Pinyin */}
        <div style={{ fontSize: 11, color: 'var(--pixel-blue)', marginBottom: 16 }}>
          {item.pinyin}
        </div>

        {/* English */}
        <div style={{ fontSize: 10, color: 'var(--pixel-text)', marginBottom: 24, opacity: 0.9 }}>
          {item.english}
        </div>

        {/* XP badge */}
        <div style={{
          display: 'inline-block',
          background: 'var(--pixel-green)',
          color: '#000',
          fontSize: 8,
          padding: '4px 10px',
          border: '2px solid #000',
          marginBottom: 20,
        }}>
          +{item.xp} XP
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSpeak(item.chinese)}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-blue)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            🔊 SPEAK
          </button>

          <button
            onClick={() => { onSave(item); onClose(); }}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-green)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#000',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            📒 SAVE
          </button>

          <button
            onClick={onClose}
            style={{
              fontSize: 8,
              padding: '10px 14px',
              background: 'var(--pixel-accent)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
          ESC to close
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run checks + commit**

```bash
npm run lint && npm run build
git add src/features/game/components/VocabPopup.tsx
git commit -m "feat: retro pixel vocabulary popup with speak, save, and XP display"
```

---

## Task 7: Supermarket Interior

**Files:**
- Create: `src/features/game/components/SupermarketInterior.tsx`

- [ ] **Step 1: Create `src/features/game/components/SupermarketInterior.tsx`**

The interior is a fixed-size 2D top-down room. Items are pixel crates/shelves placed around the room. Player can walk up to them and press E to open VocabPopup.

```tsx
import { useState, useEffect, useRef } from 'react';
import { InteriorItem } from '../../../types/domain';
import { ITEMS } from '../data';
import { VocabPopup } from './VocabPopup';

const SUPERMARKET_ITEMS: InteriorItem[] = ITEMS
  .filter((i) => i.spaceId === 'supermarket')
  .map((i) => ({ ...i, icon: i.icon ?? '📦' }));

// Fixed interior layout positions (px relative to 800x560 room)
const ITEM_POSITIONS: { id: string; x: number; y: number }[] = [
  { id: 'apple',    x: 80,  y: 180 },
  { id: 'banana',   x: 160, y: 180 },
  { id: 'tomato',   x: 240, y: 180 },
  { id: 'milk',     x: 380, y: 180 },
  { id: 'egg',      x: 460, y: 180 },
  { id: 'water',    x: 540, y: 180 },
  { id: 'bread',    x: 160, y: 300 },
  { id: 'rice',     x: 380, y: 300 },
  { id: 'shelf',    x: 620, y: 220 },
  { id: 'poster',   x: 60,  y: 90  },
  { id: 'cart',     x: 680, y: 400 },
  { id: 'cashier',  x: 680, y: 120 },
];

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function SupermarketInterior({ onExit, onSave, onGainXp }: Props) {
  const [selectedItem, setSelectedItem] = useState<InteriorItem | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key.toLowerCase() === 'q') && !selectedItem) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, selectedItem]);

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    speechSynthesis.speak(utt);
  };

  const handleClick = (item: InteriorItem) => {
    setSelectedItem(item);
    if (!discovered.has(item.id)) {
      onGainXp(item.xp);
      setDiscovered((d) => new Set([...d, item.id]));
    }
  };

  const items = SUPERMARKET_ITEMS.map((si) => {
    const pos = ITEM_POSITIONS.find((p) => p.id === si.id);
    return { ...si, x: pos?.x ?? 100, y: pos?.y ?? 100 };
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #c8f0ff 0%, #e8f8ff 40%, #f0f4e8 100%)',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Floor tiles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Checkerboard floor accent */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '55%',
        backgroundImage: 'repeating-conic-gradient(#e8d5b0 0% 25%, #d4c090 0% 50%)',
        backgroundSize: '48px 48px',
        opacity: 0.5,
      }} />

      {/* Back wall */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, #7ec0f0 0%, #b8daf0 100%)',
        borderBottom: '6px solid #5a9cc8',
      }} />

      {/* Shelf rows (decorative) */}
      {[140, 250].map((y) => (
        <div key={y} style={{
          position: 'absolute',
          top: y,
          left: 60,
          right: 60,
          height: 60,
          background: '#8b6914',
          border: '4px solid #5a4010',
          boxShadow: '0 4px 0 #3a2808',
        }} />
      ))}

      {/* Ceiling lights */}
      {[100, 280, 460, 640].map((x) => (
        <div key={x} style={{
          position: 'absolute',
          top: 0,
          left: x,
          width: 80,
          height: 12,
          background: 'rgba(255,255,220,0.9)',
          boxShadow: `0 0 30px 10px rgba(255,255,200,0.3)`,
        }} />
      ))}

      {/* Vocabulary items */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: 56,
            height: 56,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          {/* Crate */}
          <div style={{
            width: 44,
            height: 44,
            background: discovered.has(item.id) ? '#4a7a3a' : '#c8a420',
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            position: 'relative',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {item.icon}
            {discovered.has(item.id) && (
              <div style={{
                position: 'absolute',
                top: -6, right: -6,
                background: 'var(--pixel-green)',
                border: '2px solid #000',
                borderRadius: '50%',
                width: 14, height: 14,
                fontSize: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          {/* Label */}
          <div style={{
            fontSize: 6,
            color: '#000',
            background: 'rgba(255,255,255,0.85)',
            padding: '2px 4px',
            border: '1px solid #000',
            whiteSpace: 'nowrap',
          }}>
            {item.chinese}
          </div>
        </div>
      ))}

      {/* Exit button */}
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          padding: '8px 12px',
          background: 'var(--pixel-accent)',
          border: '3px solid #000',
          boxShadow: '3px 3px 0 #000',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 30,
        }}
      >
        ← EXIT
      </button>

      {/* Room label */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 10,
        color: '#000',
        background: 'rgba(255,255,255,0.9)',
        border: '3px solid #000',
        padding: '6px 14px',
        zIndex: 30,
      }}>
        超市 SUPERMARKET
      </div>

      {/* Vocab popup */}
      {selectedItem && (
        <VocabPopup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={onSave}
          onSpeak={speak}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run checks + commit**

```bash
npm run lint && npm run build
git add src/features/game/components/SupermarketInterior.tsx
git commit -m "feat: 2D top-down pixel supermarket interior with clickable vocab crates"
```

---

## Task 8: Classroom Interior

**Files:**
- Create: `src/features/game/components/ClassroomInterior.tsx`

- [ ] **Step 1: Create `src/features/game/components/ClassroomInterior.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';
import { ITEMS } from '../data';
import { VocabPopup } from './VocabPopup';

const CLASSROOM_ITEMS: InteriorItem[] = ITEMS
  .filter((i) => i.spaceId === 'classroom')
  .map((i) => ({ ...i, icon: i.icon ?? '📦' }));

const ITEM_POSITIONS: { id: string; x: number; y: number }[] = [
  { id: 'blackboard', x: 280, y: 60  },
  { id: 'clock',      x: 540, y: 40  },
  { id: 'map',        x: 80,  y: 80  },
  { id: 'projector',  x: 400, y: 50  },
  { id: 'desk',       x: 120, y: 260 },
  { id: 'chair',      x: 120, y: 340 },
  { id: 'book',       x: 240, y: 280 },
  { id: 'pen',        x: 320, y: 280 },
  { id: 'eraser',     x: 400, y: 280 },
  { id: 'ruler',      x: 480, y: 280 },
  { id: 'backpack',   x: 560, y: 340 },
  { id: 'window',     x: 660, y: 160 },
];

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function ClassroomInterior({ onExit, onSave, onGainXp }: Props) {
  const [selectedItem, setSelectedItem] = useState<InteriorItem | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedItem) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, selectedItem]);

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    speechSynthesis.speak(utt);
  };

  const handleClick = (item: InteriorItem) => {
    setSelectedItem(item);
    if (!discovered.has(item.id)) {
      onGainXp(item.xp);
      setDiscovered((d) => new Set([...d, item.id]));
    }
  };

  const items = CLASSROOM_ITEMS.map((si) => {
    const pos = ITEM_POSITIONS.find((p) => p.id === si.id);
    return { ...si, x: pos?.x ?? 100, y: pos?.y ?? 100 };
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#f5f0e0',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Floor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-conic-gradient(#e8dfc0 0% 25%, #d8cfa8 0% 50%)',
        backgroundSize: '48px 48px',
        opacity: 0.6,
      }} />

      {/* Back wall - green chalkboard color */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '38%',
        background: 'linear-gradient(180deg, #2d5a27 0%, #3a7032 100%)',
        borderBottom: '8px solid #1a3a18',
      }} />

      {/* Chalkboard surface */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '15%',
        width: '60%',
        height: 100,
        background: '#1e4020',
        border: '6px solid #8b6914',
        boxShadow: '4px 4px 0 #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
      }}>
        欢迎来到教室 Welcome to Classroom
      </div>

      {/* Window */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 40,
        width: 80,
        height: 90,
        background: 'linear-gradient(135deg, #87ceeb, #b0e0ff)',
        border: '6px solid #8b6914',
        boxShadow: '4px 4px 0 #000',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: '#8b6914' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, background: '#8b6914' }} />
      </div>

      {/* Desk rows (decorative) */}
      {[240, 310, 380].map((y) => (
        <div key={y} style={{ display: 'flex', position: 'absolute', top: y, left: 60, gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 100, height: 50,
              background: '#c8a464',
              border: '3px solid #8b6428',
              boxShadow: '3px 3px 0 #000',
            }} />
          ))}
        </div>
      ))}

      {/* Items */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          <div style={{
            width: 40, height: 40,
            background: discovered.has(item.id) ? '#4a7a3a' : 'var(--pixel-yellow)',
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {item.icon}
            {discovered.has(item.id) && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pixel-green)', border: '2px solid #000',
                borderRadius: '50%', width: 14, height: 14,
                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          <div style={{ fontSize: 6, color: '#000', background: 'rgba(255,255,255,0.85)', padding: '2px 4px', border: '1px solid #000', whiteSpace: 'nowrap' }}>
            {item.chinese}
          </div>
        </div>
      ))}

      <button onClick={onExit} style={{
        position: 'absolute', top: 12, left: 12, zIndex: 30,
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        padding: '8px 12px', background: 'var(--pixel-accent)',
        border: '3px solid #000', boxShadow: '3px 3px 0 #000',
        color: '#fff', cursor: 'pointer',
      }}>← EXIT</button>

      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, color: '#000', background: 'rgba(255,255,255,0.9)',
        border: '3px solid #000', padding: '6px 14px', zIndex: 30,
      }}>教室 CLASSROOM</div>

      {selectedItem && (
        <VocabPopup item={selectedItem} onClose={() => setSelectedItem(null)} onSave={onSave} onSpeak={speak} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run checks + commit**

```bash
npm run lint && npm run build
git add src/features/game/components/ClassroomInterior.tsx
git commit -m "feat: 2D top-down pixel classroom interior with chalkboard and desk items"
```

---

## Task 9: Café Interior

**Files:**
- Create: `src/features/game/components/CafeInterior.tsx`

- [ ] **Step 1: Create `src/features/game/components/CafeInterior.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';
import { CAFE_ITEMS } from '../data/cafeVocab';
import { VocabPopup } from './VocabPopup';

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function CafeInterior({ onExit, onSave, onGainXp }: Props) {
  const [selectedItem, setSelectedItem] = useState<InteriorItem | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedItem) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, selectedItem]);

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    speechSynthesis.speak(utt);
  };

  const handleClick = (item: InteriorItem) => {
    setSelectedItem(item);
    if (!discovered.has(item.id)) {
      onGainXp(item.xp);
      setDiscovered((d) => new Set([...d, item.id]));
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#2d1b0e',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Warm wood floor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,200,100,0.06) 0px, rgba(255,200,100,0.06) 1px, transparent 1px, transparent 60px)',
        backgroundSize: '60px 100%',
      }} />

      {/* Back wall - warm brick */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, #8b3a1a 0%, #a04820 100%)',
        borderBottom: '6px solid #5a2010',
      }} />

      {/* Counter */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '15%',
        width: '70%',
        height: 60,
        background: '#6b3a10',
        border: '4px solid #3a1808',
        boxShadow: '0 4px 0 #1a0804',
      }}>
        <div style={{
          position: 'absolute', top: 4, left: 8,
          fontSize: 9, color: 'var(--pixel-yellow)',
        }}>
          ☕ MENU: 菜单
        </div>
      </div>

      {/* Tables */}
      {[[120, 280], [340, 280], [560, 280], [240, 400], [460, 400]].map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          width: 80, height: 60,
          background: '#8b5a20',
          border: '3px solid #5a3010',
          boxShadow: '3px 3px 0 #000',
        }} />
      ))}

      {/* Items */}
      {CAFE_ITEMS.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          <div style={{
            width: 44, height: 44,
            background: discovered.has(item.id) ? '#4a7a3a' : '#d4a420',
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {item.icon}
            {discovered.has(item.id) && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pixel-green)', border: '2px solid #000',
                borderRadius: '50%', width: 14, height: 14,
                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          <div style={{
            fontSize: 6, color: '#fff',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 4px', border: '1px solid var(--pixel-border)',
            whiteSpace: 'nowrap',
          }}>
            {item.chinese}
          </div>
        </div>
      ))}

      <button onClick={onExit} style={{
        position: 'absolute', top: 12, left: 12, zIndex: 30,
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        padding: '8px 12px', background: 'var(--pixel-accent)',
        border: '3px solid #000', boxShadow: '3px 3px 0 #000',
        color: '#fff', cursor: 'pointer',
      }}>← EXIT</button>

      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, color: 'var(--pixel-yellow)',
        background: 'rgba(0,0,0,0.85)',
        border: '3px solid var(--pixel-border)', padding: '6px 14px', zIndex: 30,
      }}>咖啡店 CAFÉ</div>

      {selectedItem && (
        <VocabPopup item={selectedItem} onClose={() => setSelectedItem(null)} onSave={onSave} onSpeak={speak} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run checks + commit**

```bash
npm run lint && npm run build
git add src/features/game/components/CafeInterior.tsx
git commit -m "feat: 2D top-down pixel café interior with warm aesthetic"
```

---

## Task 10: Wire Up GameTab — City Router

**Files:**
- Modify: `src/features/game/GameTab.tsx`
- Delete: `src/features/game/components/Supermarket3DGame.tsx`
- Delete: `src/features/game/data/supermarket3d.ts`

- [ ] **Step 1: Read current `src/features/game/GameTab.tsx`**

Read the file to understand its current interface before modifying.

- [ ] **Step 2: Replace `GameTab.tsx` with city router**

```tsx
import { useState, VocabularyItem } from 'react';
import { CityMap } from './components/CityMap';
import { SupermarketInterior } from './components/SupermarketInterior';
import { ClassroomInterior } from './components/ClassroomInterior';
import { CafeInterior } from './components/CafeInterior';
import { InteriorItem } from '../../types/domain';
import { Building } from '../../types/domain';

type Scene = 'city' | Building['id'];

interface Props {
  level: number;
  xp: number;
  outfitColor: string;
  onGainXp: (xp: number) => void;
  onAddNotebook: (item: VocabularyItem) => void;
  // keep remaining existing props for compatibility
  [key: string]: unknown;
}

export function GameTab({ level, xp, outfitColor = '#4d96ff', onGainXp, onAddNotebook }: Props) {
  const [scene, setScene] = useState<Scene>('city');

  const handleSave = (item: InteriorItem) => {
    onAddNotebook({
      id: item.id,
      spaceId: item.spaceId,
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      x: 0, y: 0,
      difficulty: 'easy',
      rarity: 'common',
      xp: item.xp,
      icon: item.icon,
    });
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {scene === 'city' && (
        <CityMap
          outfitColor={outfitColor}
          onEnterBuilding={(id) => setScene(id)}
        />
      )}
      {scene === 'supermarket' && (
        <SupermarketInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
      {scene === 'school' && (
        <ClassroomInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
      {scene === 'cafe' && (
        <CafeInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Delete 3D files**

```bash
rm "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey/src/features/game/components/Supermarket3DGame.tsx"
rm "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey/src/features/game/data/supermarket3d.ts"
```

- [ ] **Step 4: Run checks**

```bash
npm run lint && npm run build
```
Fix any TypeScript errors about removed imports or prop mismatches.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire up city/building router in GameTab, remove 3D components"
```

---

## Task 11: Retro Skin — Notebook, Dictionary, Profile Tabs

**Files:**
- Modify: `src/features/notebook/NotebookTab.tsx`
- Modify: `src/features/dictionary/DictionaryTab.tsx`
- Modify: `src/features/profile/ProfileTab.tsx`

- [ ] **Step 1: Read all three tab files**

Read each file in full before modifying.

- [ ] **Step 2: Wrap NotebookTab content in retro skin**

In `NotebookTab.tsx`, replace the top-level wrapper div's className with:

```tsx
<div style={{
  minHeight: '100%',
  background: 'var(--pixel-bg)',
  color: 'var(--pixel-text)',
  fontFamily: "'Press Start 2P', monospace",
  padding: '16px',
}}>
```

Replace any `bg-white`, `bg-zinc-*`, `border-black` Tailwind classes on cards with:
```tsx
style={{
  background: 'var(--pixel-panel)',
  border: '3px solid var(--pixel-border)',
  boxShadow: '3px 3px 0 #000',
  padding: 16,
}}
```

Replace button `className` patterns with inline style objects using `var(--pixel-*)` colors and `'Press Start 2P'` font. Maintain all existing click handlers and logic — only change visual styling.

- [ ] **Step 3: Apply same retro skin to DictionaryTab.tsx**

Same approach: replace background/border/font Tailwind classes with inline pixel style vars. Keep all search logic, AI fallback, and save handlers untouched.

- [ ] **Step 4: Apply retro skin to ProfileTab.tsx**

Same approach: pixel skin on wrapper, cards, and buttons. Keep avatar/username logic intact.

- [ ] **Step 5: Run checks**

```bash
npm run lint && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/features/notebook/NotebookTab.tsx src/features/dictionary/DictionaryTab.tsx src/features/profile/ProfileTab.tsx
git commit -m "feat: apply retro pixel skin to Notebook, Dictionary, and Profile tabs"
```

---

## Task 12: Flashcard Quiz Mode

**Files:**
- Create: `src/features/game/components/FlashcardQuiz.tsx`
- Modify: `src/features/game/GameTab.tsx`

- [ ] **Step 1: Create `src/features/game/components/FlashcardQuiz.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { NotebookEntry } from '../../../types/domain';

interface Props {
  entries: NotebookEntry[];
  onClose: () => void;
  onGrade: (id: string, grade: number) => void;
}

export function FlashcardQuiz({ entries, onClose, onGrade }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const cards = entries.slice(0, 10); // max 10 cards per session

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (cards.length === 0) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, fontFamily: "'Press Start 2P', monospace",
      }}>
        <div style={{
          background: 'var(--pixel-panel)', border: '4px solid var(--pixel-border)',
          boxShadow: '6px 6px 0 #000', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--pixel-yellow)', marginBottom: 16 }}>
            No words in notebook yet!
          </div>
          <div style={{ fontSize: 9, color: 'var(--pixel-text)', marginBottom: 20 }}>
            Explore buildings to learn words first.
          </div>
          <button onClick={onClose} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            padding: '10px 18px', background: 'var(--pixel-accent)',
            border: '3px solid #000', boxShadow: '3px 3px 0 #000',
            color: '#fff', cursor: 'pointer',
          }}>CLOSE</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, fontFamily: "'Press Start 2P', monospace",
      }}>
        <div style={{
          background: 'var(--pixel-panel)', border: '4px solid var(--pixel-green)',
          boxShadow: '6px 6px 0 #000', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 11, color: 'var(--pixel-green)', marginBottom: 20 }}>
            Quiz Complete!
          </div>
          <button onClick={onClose} style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            padding: '10px 18px', background: 'var(--pixel-green)',
            border: '3px solid #000', boxShadow: '3px 3px 0 #000',
            color: '#000', cursor: 'pointer',
          }}>BACK TO CITY</button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  const grade = (score: number) => {
    onGrade(card.id, score);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{
        background: 'var(--pixel-panel)', border: '4px solid var(--pixel-border)',
        boxShadow: '6px 6px 0 #000', padding: 32,
        minWidth: 340, maxWidth: 440, textAlign: 'center',
      }}>
        {/* Progress */}
        <div style={{ fontSize: 8, color: 'var(--pixel-text)', marginBottom: 20, opacity: 0.6 }}>
          {index + 1} / {cards.length}
        </div>

        {/* Chinese character */}
        <div style={{ fontSize: 40, color: 'var(--pixel-yellow)', marginBottom: 12, letterSpacing: 4 }}>
          {card.chinese}
        </div>

        {revealed ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--pixel-blue)', marginBottom: 8 }}>{card.pinyin}</div>
            <div style={{ fontSize: 10, color: 'var(--pixel-text)', marginBottom: 24 }}>{card.english}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>How well did you know it?</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => grade(1)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-accent)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#fff', cursor: 'pointer',
              }}>😕 HARD</button>
              <button onClick={() => grade(3)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-yellow)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#000', cursor: 'pointer',
              }}>🤔 OK</button>
              <button onClick={() => grade(5)} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                padding: '10px', background: 'var(--pixel-green)',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                color: '#000', cursor: 'pointer',
              }}>😊 EASY</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              What does this mean?
            </div>
            <button onClick={() => setRevealed(true)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              padding: '12px 20px', background: 'var(--pixel-blue)',
              border: '3px solid #000', boxShadow: '3px 3px 0 #000',
              color: '#fff', cursor: 'pointer',
            }}>REVEAL ANSWER</button>
          </>
        )}

        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 10,
          fontFamily: "'Press Start 2P', monospace", fontSize: 7,
          padding: '6px 8px', background: 'transparent',
          border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
        }}>✕</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Q key to open quiz in `GameTab.tsx`**

Import `FlashcardQuiz` and `NotebookEntry`. Add:

```tsx
const [quizOpen, setQuizOpen] = useState(false);

// In the city scene only, listen for Q key
useEffect(() => {
  if (scene !== 'city') return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'q') setQuizOpen(true);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [scene]);
```

Render `{quizOpen && <FlashcardQuiz entries={notebook} onClose={() => setQuizOpen(false)} onGrade={gradeNotebook} />}` at the end of the GameTab return.

Add a small HUD hint in city view: `Press [Q] for Quiz`.

- [ ] **Step 3: Thread notebook + gradeNotebook props through GameTab**

In `App.tsx`, pass `notebook` and `gradeNotebook` to `GameTab`:

```tsx
<GameTab
  ...
  notebook={notebook}
  onGradeNotebook={gradeNotebook}
/>
```

Update `GameTab` Props interface accordingly.

- [ ] **Step 4: Run checks**

```bash
npm run lint && npm run build
```
Fix any prop mismatches.

- [ ] **Step 5: Commit**

```bash
git add src/features/game/components/FlashcardQuiz.tsx src/features/game/GameTab.tsx src/App.tsx
git commit -m "feat: flashcard quiz mode (Q key) with spaced-repetition grading"
```

---

## Task 13: Final Integration Check + Cleanup

- [ ] **Step 1: Remove unused `three` import and 3D dependencies from usage**

```bash
grep -r "three" "/Users/wilbert/Documents/GitHub/ENT208-29th-HanMeet/hanmeet 1.1-apikey/src" --include="*.ts" --include="*.tsx" -l
```

Remove any remaining `three` imports. (three can stay in package.json for now — don't `npm uninstall` without checking nothing else uses it.)

- [ ] **Step 2: Run full checks**

```bash
npm run lint && npm run build
```
Both must pass with zero errors.

- [ ] **Step 3: Manual happy-path test**

```
1. npm run dev
2. Open http://localhost:3000
3. Game tab opens → city map visible, player visible
4. WASD moves player around the city
5. Walk near Supermarket door → "Press [E] to enter" prompt appears
6. Press E → Supermarket interior loads
7. Click a crate → VocabPopup opens with Chinese/pinyin/English/XP
8. Click SPEAK → pronunciation plays
9. Click SAVE → word added (check Notebook tab)
10. Click EXIT → back to city
11. Repeat for School and Café buildings
12. Press Q in city → Flashcard quiz opens
13. Check Notebook, Dictionary, Profile tabs all have retro pixel skin
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete 2D retro pixel city redesign — city map, 3 interiors, vocab system, flashcard quiz"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Vibrant pixel art skin for all UI | Task 1, Task 11 |
| Top-down 2D view (Stardew style) | Task 5 |
| WASD movement | Task 3 |
| Collision detection | Task 3 |
| Camera follow | Task 3 |
| Player character (simple pixel human) | Task 4 |
| Walking animation (frame toggle) | Task 3 + 4 |
| Small city exterior with 3 buildings | Task 5 |
| Press E to enter buildings | Task 5 |
| Supermarket interior | Task 7 |
| Classroom interior | Task 8 |
| Café interior + vocab | Task 2 + 9 |
| Clickable items → vocab popup | Task 6, 7, 8, 9 |
| Retro-styled vocab popup | Task 6 |
| XP gain on discovery | Task 7, 8, 9 |
| NPC hints in city | Task 5 |
| Flashcard quiz mode | Task 12 |
| Notebook/Dictionary/Profile retro skin | Task 11 |
| App stays light (no canvas/heavy libs) | All tasks — pure CSS |
