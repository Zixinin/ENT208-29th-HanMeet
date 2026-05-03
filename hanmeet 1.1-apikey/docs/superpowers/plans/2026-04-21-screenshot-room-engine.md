# Screenshot Room Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tile-based city overworld with a room-selection card screen and screenshot-backed interiors where a walking character triggers Chinese vocabulary popups by proximity.

**Architecture:** `RoomSelect` renders 3 clickable cards (exterior images). Picking one mounts `RoomInterior`, which layers a static screenshot background under a transparent canvas that draws only the animated character sprite. A lightweight `useRoomEngine` hook drives movement (via the existing `usePlayerMovement`) and computes the nearest interactable item every frame. Pressing E while near an item opens `VocabPopup`.

**Tech Stack:** React 19, TypeScript, Canvas API (sprite only), existing `usePlayerMovement` hook, existing `VocabPopup` component, Web Speech API for pronunciation.

---

## File Map

**Create:**
- `public/rooms/` — 6 image assets (3 exterior + 3 interior)
- `src/features/game/data/cafeRoomItems.ts` — café vocab items with xPct/yPct positions
- `src/features/game/data/supermarketRoomItems.ts` — supermarket vocab items
- `src/features/game/data/houseRoomItems.ts` — house vocab items
- `src/features/game/hooks/useRoomEngine.ts` — movement + canvas draw + proximity detection
- `src/features/game/components/RoomSelect.tsx` — 3-card room picker
- `src/features/game/components/RoomInterior.tsx` — screenshot bg + canvas + E-key interaction

**Modify:**
- `src/types/domain.ts` — add `RoomItem` interface, add `'house'` to `SpaceId`
- `src/features/game/GameTab.tsx` — replace all scene routing with RoomSelect + RoomInterior
- `src/features/game/hooks/usePlayerMovement.ts` — remove cityLayout default imports

**Delete (after GameTab is updated):**
- `src/features/game/components/CityMap.tsx`
- `src/features/game/components/SupermarketInterior.tsx`
- `src/features/game/components/CafeInterior.tsx`
- `src/features/game/components/HouseInterior.tsx`
- `src/features/game/components/ClassroomInterior.tsx`
- `src/features/game/data/cityLayout.ts`
- `src/features/game/data/cafeLayout.ts`
- `src/features/game/data/supermarketLayout.ts`
- `src/features/game/data/houseLayout.ts`
- `src/features/game/hooks/useTileEngine.ts`
- `src/features/game/hooks/useCamera.ts`
- `src/types/tileEngine.ts`

---

## Task 1: Copy room images into public/

**Files:**
- Create: `public/rooms/` (6 image files)

- [ ] **Step 1: Create rooms directory and copy all 6 images**

```bash
mkdir -p "public/rooms"
cp "/Users/wilbert/Downloads/cafe placeholder.jpeg"              "public/rooms/cafe-exterior.jpeg"
cp "/Users/wilbert/Downloads/supermarket outside placeholder.jpeg" "public/rooms/supermarket-exterior.jpeg"
cp "/Users/wilbert/Downloads/house placeholder.jpeg"             "public/rooms/house-exterior.jpeg"
cp "/Users/wilbert/Downloads/cafe.jpeg"                          "public/rooms/cafe-interior.jpeg"
cp "/Users/wilbert/Downloads/supermarket.png"                    "public/rooms/supermarket-interior.png"
cp "/Users/wilbert/Downloads/house interior.jpeg"                "public/rooms/house-interior.jpeg"
```

- [ ] **Step 2: Verify all 6 files exist**

```bash
ls -1 public/rooms/
```
Expected output (6 lines):
```
cafe-exterior.jpeg
cafe-interior.jpeg
house-exterior.jpeg
house-interior.jpeg
supermarket-exterior.jpeg
supermarket-interior.png
```

- [ ] **Step 3: Commit**

```bash
git add public/rooms/
git commit -m "feat: add room image assets to public/rooms"
```

---

## Task 2: Update domain types

**Files:**
- Modify: `src/types/domain.ts`

- [ ] **Step 1: Add `'house'` to SpaceId and add the `RoomItem` interface**

Open `src/types/domain.ts` and make two edits:

**Edit 1** — change line 4 from:
```ts
export type SpaceId = 'classroom' | 'supermarket' | 'dorm' | 'cafeteria' | 'cafe';
```
to:
```ts
export type SpaceId = 'classroom' | 'supermarket' | 'dorm' | 'cafeteria' | 'cafe' | 'house';
```

**Edit 2** — add after the `InteriorItem` interface (after line 105):
```ts
export interface RoomItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  description: string;
  icon: string;
  xp: number;
  xPct: number;
  yPct: number;
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/domain.ts
git commit -m "feat: add RoomItem type and house SpaceId"
```

---

## Task 3: Create café room items data

**Files:**
- Create: `src/features/game/data/cafeRoomItems.ts`

- [ ] **Step 1: Create the file**

```ts
import { RoomItem } from '../../../types/domain';

export const CAFE_ROOM_ITEMS: RoomItem[] = [
  { id: 'cafe-barrel',    chinese: '木桶',       pinyin: 'mùtǒng',         english: 'barrel',      description: '存放咖啡豆的木质容器。',        icon: '🪣', xp: 10, xPct: 14, yPct: 19 },
  { id: 'cafe-coffee',    chinese: '咖啡',       pinyin: 'kāfēi',          english: 'coffee',      description: '用咖啡豆冲泡的提神饮料。',      icon: '☕', xp: 10, xPct: 22, yPct: 39 },
  { id: 'cafe-plant',     chinese: '植物',       pinyin: 'zhíwù',          english: 'plant',       description: '咖啡厅里摆放的绿色植物。',      icon: '🌿', xp: 10, xPct: 47, yPct: 30 },
  { id: 'cafe-bookshelf', chinese: '书架',       pinyin: 'shūjià',         english: 'bookshelf',   description: '放书的架子，旁边有壁炉。',      icon: '📚', xp: 10, xPct: 82, yPct: 28 },
  { id: 'cafe-sofa',      chinese: '沙发',       pinyin: 'shāfā',          english: 'sofa',        description: '柔软舒适的坐卧家具。',          icon: '🛋️', xp: 10, xPct: 16, yPct: 70 },
  { id: 'cafe-table',     chinese: '桌子',       pinyin: 'zhuōzi',         english: 'table',       description: '咖啡厅里的木制餐桌。',          icon: '🪑', xp: 10, xPct: 50, yPct: 55 },
  { id: 'cafe-chair',     chinese: '椅子',       pinyin: 'yǐzi',           english: 'chair',       description: '供人坐下休息的家具。',          icon: '🪑', xp: 10, xPct: 68, yPct: 65 },
  { id: 'cafe-fireplace', chinese: '壁炉',       pinyin: 'bìlú',           english: 'fireplace',   description: '燃烧木材取暖的炉子。',          icon: '🔥', xp: 15, xPct: 82, yPct: 42 },
];
```

- [ ] **Step 2: Verify TypeScript accepts the file**

```bash
npm run build 2>&1 | grep "cafeRoomItems" | head -5
```
Expected: no output (no errors mentioning this file).

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/cafeRoomItems.ts
git commit -m "feat: add cafe room items with screen positions"
```

---

## Task 4: Create supermarket room items data

**Files:**
- Create: `src/features/game/data/supermarketRoomItems.ts`

- [ ] **Step 1: Create the file**

```ts
import { RoomItem } from '../../../types/domain';

export const SUPERMARKET_ROOM_ITEMS: RoomItem[] = [
  { id: 'sm-cashier',  chinese: '收银台', pinyin: 'shōuyín tái',  english: 'cashier',       description: '超市结账的地方。',              icon: '🏧', xp: 10, xPct: 20, yPct: 15 },
  { id: 'sm-shelf',    chinese: '货架',   pinyin: 'huòjià',       english: 'shelf',         description: '超市里摆放商品的架子。',        icon: '🗄️', xp: 10, xPct: 10, yPct: 48 },
  { id: 'sm-apple',    chinese: '苹果',   pinyin: 'píngguǒ',      english: 'apple',         description: '一种常见的红色或绿色水果。',    icon: '🍎', xp: 10, xPct: 10, yPct: 60 },
  { id: 'sm-milk',     chinese: '牛奶',   pinyin: 'niúnǎi',       english: 'milk',          description: '白色营养丰富的饮料。',          icon: '🥛', xp: 10, xPct: 10, yPct: 70 },
  { id: 'sm-bread',    chinese: '面包',   pinyin: 'miànbāo',      english: 'bread',         description: '用小麦粉烘焙的主食。',          icon: '🍞', xp: 10, xPct: 30, yPct: 48 },
  { id: 'sm-cart',     chinese: '购物车', pinyin: 'gòuwù chē',    english: 'shopping cart', description: '超市里用来放商品的推车。',      icon: '🛒', xp: 10, xPct: 72, yPct: 55 },
  { id: 'sm-poster',   chinese: '海报',   pinyin: 'hǎibào',       english: 'poster',        description: '超市促销用的宣传海报。',        icon: '📋', xp: 10, xPct: 75, yPct: 20 },
  { id: 'sm-fridge',   chinese: '冰箱',   pinyin: 'bīngxiāng',    english: 'fridge',        description: '保持食物新鲜的冷藏电器。',      icon: '🧊', xp: 10, xPct: 50, yPct: 72 },
];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep "supermarketRoomItems" | head -5
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/supermarketRoomItems.ts
git commit -m "feat: add supermarket room items with screen positions"
```

---

## Task 5: Create house room items data

**Files:**
- Create: `src/features/game/data/houseRoomItems.ts`

- [ ] **Step 1: Create the file**

```ts
import { RoomItem } from '../../../types/domain';

export const HOUSE_ROOM_ITEMS: RoomItem[] = [
  { id: 'house-tv',        chinese: '电视',   pinyin: 'diànshì',   english: 'TV',        description: '用来看节目的电子设备。',          icon: '📺', xp: 10, xPct: 52, yPct: 62 },
  { id: 'house-sofa',      chinese: '沙发',   pinyin: 'shāfā',     english: 'sofa',      description: '客厅里用来坐或躺的家具。',        icon: '🛋️', xp: 10, xPct: 52, yPct: 74 },
  { id: 'house-bed',       chinese: '床',     pinyin: 'chuáng',    english: 'bed',       description: '睡觉用的家具。',                  icon: '🛏️', xp: 10, xPct: 56, yPct: 18 },
  { id: 'house-bookshelf', chinese: '书架',   pinyin: 'shūjià',    english: 'bookshelf', description: '放书的架子。',                    icon: '📚', xp: 10, xPct: 84, yPct: 16 },
  { id: 'house-plant',     chinese: '植物',   pinyin: 'zhíwù',     english: 'plant',     description: '摆放在家里的绿色植物。',          icon: '🌿', xp: 10, xPct: 24, yPct: 36 },
  { id: 'house-stove',     chinese: '炉灶',   pinyin: 'lúzào',     english: 'stove',     description: '用来做饭加热食物的设备。',        icon: '🍳', xp: 10, xPct: 18, yPct: 72 },
  { id: 'house-fridge',    chinese: '冰箱',   pinyin: 'bīngxiāng', english: 'fridge',    description: '保持食物新鲜的冷藏电器。',        icon: '🧊', xp: 10, xPct: 15, yPct: 62 },
  { id: 'house-window',    chinese: '窗户',   pinyin: 'chuānghù',  english: 'window',    description: '让光线和空气进入房间的结构。',    icon: '🪟', xp: 10, xPct: 30, yPct: 8  },
];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep "houseRoomItems" | head -5
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/houseRoomItems.ts
git commit -m "feat: add house room items with screen positions"
```

---

## Task 6: Create useRoomEngine hook

**Files:**
- Create: `src/features/game/hooks/useRoomEngine.ts`

This hook owns the canvas draw loop (character sprite only) and proximity detection. The background image is rendered in JSX, not here.

- [ ] **Step 1: Create the file**

```ts
import { useRef, useEffect, useState, useMemo } from 'react';
import { RoomItem } from '../../../types/domain';
import { usePlayerMovement } from './usePlayerMovement';

const SUNNYSIDE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_SRC = `${SUNNYSIDE}/Characters/Human/IDLE/base_idle_strip9.png`;
const WALK_SRC = `${SUNNYSIDE}/Characters/Human/WALKING/base_walk_strip8.png`;

export const ROOM_W = 1280;
export const ROOM_H = 720;
const PROXIMITY_PX = 70;

interface UseRoomEngineOptions {
  items: RoomItem[];
}

export function useRoomEngine({ items }: UseRoomEngineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);
  const animTickRef = useRef(0);
  const [scale, setScale] = useState(1);

  const { player } = usePlayerMovement(ROOM_W / 2, ROOM_H / 2, {
    cols: ROOM_W,
    rows: ROOM_H,
    tileSize: 1,
    isBlockedFn: () => false,
  });

  // Preload character sprite sheets
  useEffect(() => {
    [IDLE_SRC, WALK_SRC].forEach(src => {
      if (!images.current[src]) {
        const img = new Image();
        img.src = src;
        images.current[src] = img;
      }
    });
  }, []);

  // Responsive scale: fit virtual 1280×720 into the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / ROOM_W, height / ROOM_H));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw loop: renders character sprite on transparent canvas each frame
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animTickRef.current = (animTickRef.current + 1) % 240;
      const tick = animTickRef.current;
      const p = playerRef.current;

      ctx.clearRect(0, 0, ROOM_W, ROOM_H);
      ctx.imageSmoothingEnabled = false;

      const idleFrames = 9, walkFrames = 8;
      const frameCount = p.moving ? walkFrames : idleFrames;
      const animFrame = Math.floor(tick / 4) % frameCount;
      const src = p.moving ? WALK_SRC : IDLE_SRC;
      const FRAME_W = 16, FRAME_H = 32;
      const RENDER_W = 32, RENDER_H = 64;

      const img = images.current[src];
      if (img?.complete && img.naturalWidth) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(p.x + RENDER_W / 2, p.y + RENDER_H - 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(img, animFrame * FRAME_W, 0, FRAME_W, FRAME_H, p.x, p.y - RENDER_H / 2, RENDER_W, RENDER_H);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // stable: uses playerRef.current, never restarts

  // Proximity: find the closest item within PROXIMITY_PX of the character centre
  const nearItem = useMemo<RoomItem | null>(() => {
    const px = player.x + 16;
    const py = player.y + 32;
    let closest: RoomItem | null = null;
    let minDist = PROXIMITY_PX;
    for (const item of items) {
      const ix = (item.xPct / 100) * ROOM_W;
      const iy = (item.yPct / 100) * ROOM_H;
      const dist = Math.sqrt((px - ix) ** 2 + (py - iy) ** 2);
      if (dist < minDist) { minDist = dist; closest = item; }
    }
    return closest;
  }, [player.x, player.y, items]); // eslint-disable-line react-hooks/exhaustive-deps

  return { canvasRef, containerRef, scale, nearItem };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -8
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/hooks/useRoomEngine.ts
git commit -m "feat: add useRoomEngine hook for screenshot-based rooms"
```

---

## Task 7: Create RoomSelect component

**Files:**
- Create: `src/features/game/components/RoomSelect.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';

export type RoomId = 'cafe' | 'supermarket' | 'house';

interface Room {
  id: RoomId;
  label: string;
  chinese: string;
  pinyin: string;
  exteriorSrc: string;
}

const ROOMS: Room[] = [
  { id: 'cafe',        label: 'Café',        chinese: '咖啡厅', pinyin: 'kāfēi tīng', exteriorSrc: '/rooms/cafe-exterior.jpeg' },
  { id: 'supermarket', label: 'Supermarket', chinese: '超市',   pinyin: 'chāoshì',    exteriorSrc: '/rooms/supermarket-exterior.jpeg' },
  { id: 'house',       label: 'House',       chinese: '住宅',   pinyin: 'zhùzhái',    exteriorSrc: '/rooms/house-exterior.jpeg' },
];

interface Props {
  onEnter: (roomId: RoomId) => void;
}

export function RoomSelect({ onEnter }: Props) {
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
            onClick={() => onEnter(room.id)}
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
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -8
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/RoomSelect.tsx
git commit -m "feat: add RoomSelect card grid component"
```

---

## Task 8: Create RoomInterior component

**Files:**
- Create: `src/features/game/components/RoomInterior.tsx`

The background image and canvas share a scaled inner wrapper div so they stay aligned at any viewport size.

- [ ] **Step 1: Create the file**

```tsx
import React, { useState, useEffect } from 'react';
import { RoomItem, InteriorItem, SpaceId } from '../../../types/domain';
import { useRoomEngine, ROOM_W, ROOM_H } from '../hooks/useRoomEngine';
import { VocabPopup } from './VocabPopup';
import type { RoomId } from './RoomSelect';

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

interface Props {
  roomId: RoomId;
  items: RoomItem[];
  onBack: () => void;
  onSave: (item: InteriorItem) => void;
}

export function RoomInterior({ roomId, items, onBack, onSave }: Props) {
  const { canvasRef, containerRef, scale, nearItem } = useRoomEngine({ items });
  const [activeItem, setActiveItem] = useState<RoomItem | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { setActiveItem(null); return; }
      if (key === 'e' && nearItem && !activeItem) setActiveItem(nearItem);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearItem, activeItem]);

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
      {/* Scaled scene wrapper: bg image + character canvas, both in virtual 1280×720 space */}
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
        <canvas
          ref={canvasRef}
          width={ROOM_W}
          height={ROOM_H}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
        />
      </div>

      {/* Back button — screen space, not scaled */}
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

      {/* HUD — screen space */}
      <div style={{
        position: 'absolute', left: 12, top: 44, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.5)',
        padding: '4px 8px', lineHeight: 1.8,
      }}>
        WASD / ARROWS = MOVE{'  '}·{'  '}E = INSPECT{'  '}·{'  '}ESC = CLOSE
      </div>

      {/* Proximity prompt — screen space */}
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

      {/* Vocab popup */}
      {activeItem && (
        <VocabPopup
          item={toInteriorItem(activeItem, roomId)}
          onClose={() => setActiveItem(null)}
          onSave={(interiorItem) => { onSave(interiorItem); setActiveItem(null); }}
          onSpeak={speak}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -8
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: add RoomInterior screenshot + canvas + E-key popup"
```

---

## Task 9: Update GameTab to use new components

**Files:**
- Modify: `src/features/game/GameTab.tsx`

- [ ] **Step 1: Replace the entire file contents**

```tsx
import React, { useState, useEffect } from 'react';
import { InteriorItem, NotebookEntry, VocabularyItem, Difficulty, SpaceId, RoomItem } from '../../types/domain';
import { RoomSelect } from './components/RoomSelect';
import type { RoomId } from './components/RoomSelect';
import { RoomInterior } from './components/RoomInterior';
import { FlashcardQuiz } from './components/FlashcardQuiz';
import { CAFE_ROOM_ITEMS } from './data/cafeRoomItems';
import { SUPERMARKET_ROOM_ITEMS } from './data/supermarketRoomItems';
import { HOUSE_ROOM_ITEMS } from './data/houseRoomItems';

type Scene = 'select' | RoomId;

interface GameTabProps {
  level: number;
  xp: number;
  selectedDifficulty: Difficulty;
  unlockedSpaces: SpaceId[];
  avatarPresetId: string;
  outfitColor: string;
  discoveredHiddenItemIds: string[];
  onSetDifficulty: (difficulty: Difficulty) => void;
  onGainXp: (xp: number) => void;
  onAddNotebook: (item: VocabularyItem) => void;
  onDiscoverHiddenItem: (itemId: string) => void;
  notebook: NotebookEntry[];
  onGradeNotebook: (id: string, grade: number) => void;
}

const ROOM_ITEMS: Record<RoomId, RoomItem[]> = {
  cafe:        CAFE_ROOM_ITEMS,
  supermarket: SUPERMARKET_ROOM_ITEMS,
  house:       HOUSE_ROOM_ITEMS,
};

export function GameTab({ onGainXp, onAddNotebook, notebook, onGradeNotebook }: GameTabProps) {
  const [scene, setScene] = useState<Scene>('select');
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    if (scene !== 'select') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') setQuizOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene]);

  const handleSave = (item: InteriorItem) => {
    onGainXp(item.xp);
    onAddNotebook({
      id: item.id,
      spaceId: item.spaceId,
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      x: item.x,
      y: item.y,
      difficulty: 'easy',
      rarity: 'common',
      xp: item.xp,
      icon: item.icon,
    });
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {scene === 'select' && (
        <RoomSelect onEnter={(id) => setScene(id)} />
      )}

      {(scene === 'cafe' || scene === 'supermarket' || scene === 'house') && (
        <RoomInterior
          roomId={scene}
          items={ROOM_ITEMS[scene]}
          onBack={() => setScene('select')}
          onSave={handleSave}
        />
      )}

      {quizOpen && (
        <FlashcardQuiz
          entries={notebook}
          onClose={() => setQuizOpen(false)}
          onGrade={onGradeNotebook}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```
Expected: no errors (old components are still present, just unused).

- [ ] **Step 3: Commit**

```bash
git add src/features/game/GameTab.tsx
git commit -m "feat: wire up RoomSelect and RoomInterior in GameTab"
```

---

## Task 10: Update usePlayerMovement to remove cityLayout dependency

**Files:**
- Modify: `src/features/game/hooks/usePlayerMovement.ts`

- [ ] **Step 1: Replace the cityLayout import block with inline defaults**

Remove lines 1–8 (the import block):
```ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerState } from '../../../types/domain';
import {
  TILE_SIZE as DEFAULT_TILE_SIZE,
  CITY_COLS as DEFAULT_COLS,
  CITY_ROWS as DEFAULT_ROWS,
  isBlocked as defaultIsBlocked,
} from '../data/cityLayout';
```

Replace with:
```ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerState } from '../../../types/domain';

const DEFAULT_TILE_SIZE = 1;
const DEFAULT_COLS = 1280;
const DEFAULT_ROWS = 720;
const defaultIsBlocked = () => false;
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -8
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/hooks/usePlayerMovement.ts
git commit -m "refactor: remove cityLayout dependency from usePlayerMovement"
```

---

## Task 11: Delete obsolete tile engine files

All files below are now unused — no imports reference them.

**Files:**
- Delete: `src/features/game/components/CityMap.tsx`
- Delete: `src/features/game/components/SupermarketInterior.tsx`
- Delete: `src/features/game/components/CafeInterior.tsx`
- Delete: `src/features/game/components/HouseInterior.tsx`
- Delete: `src/features/game/components/ClassroomInterior.tsx`
- Delete: `src/features/game/data/cityLayout.ts`
- Delete: `src/features/game/data/cafeLayout.ts`
- Delete: `src/features/game/data/supermarketLayout.ts`
- Delete: `src/features/game/data/houseLayout.ts`
- Delete: `src/features/game/hooks/useTileEngine.ts`
- Delete: `src/features/game/hooks/useCamera.ts`
- Delete: `src/types/tileEngine.ts`

- [ ] **Step 1: Delete all obsolete files**

```bash
rm src/features/game/components/CityMap.tsx
rm src/features/game/components/SupermarketInterior.tsx
rm src/features/game/components/CafeInterior.tsx
rm src/features/game/components/HouseInterior.tsx
rm src/features/game/components/ClassroomInterior.tsx
rm src/features/game/data/cityLayout.ts
rm src/features/game/data/cafeLayout.ts
rm src/features/game/data/supermarketLayout.ts
rm src/features/game/data/houseLayout.ts
rm src/features/game/hooks/useTileEngine.ts
rm src/features/game/hooks/useCamera.ts
rm src/types/tileEngine.ts
```

- [ ] **Step 2: Verify build still passes after deletions**

```bash
npm run build 2>&1 | tail -10
```
Expected: no errors. If any error references a deleted file, check for remaining imports using `grep -r "cityLayout\|useTileEngine\|useCamera\|tileEngine" src/`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove tile engine and city overworld"
```

---

## Task 12: Final verification

- [ ] **Step 1: Run lint**

```bash
npm run lint 2>&1 | tail -10
```
Expected: no errors or warnings.

- [ ] **Step 2: Run build**

```bash
npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no errors.

- [ ] **Step 3: Start dev server and test manually**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:

1. Game tab shows 3 room cards (Café, Supermarket, House) with exterior images
2. Clicking a card enters the room interior
3. The screenshot background fills the viewport
4. Character spawns in the center and moves with WASD/arrow keys
5. Walking near an object shows "Press [E] to inspect {chinese}" at the bottom
6. Pressing E opens `VocabPopup` with Chinese, pinyin, English, Speak and Save buttons
7. Speak button pronounces the Chinese word
8. Save adds the word to the Notebook tab
9. ESC closes the popup
10. Back button returns to the room selection screen
11. Q key on the selection screen opens the Flashcard Quiz

- [ ] **Step 4: Fine-tune item positions if needed**

If any item proximity prompt appears in the wrong area of the room (too far from the visible object), adjust the `xPct`/`yPct` values in the relevant data file:
- `src/features/game/data/cafeRoomItems.ts`
- `src/features/game/data/supermarketRoomItems.ts`
- `src/features/game/data/houseRoomItems.ts`

Re-run `npm run build` after any adjustments.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: screenshot room engine — complete"
```
