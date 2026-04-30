# Room Items Expansion & Supermarket Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand all three rooms from 8 items each to 15–30+ items, fixing all supermarket hotspot positions in the process.

**Architecture:** Pure data changes — rewrite the three `*RoomItems.ts` files. No component, hook, or type changes needed. Each item has a unique `id`, shared `chinese/pinyin/english` for repeated object types, and `xPct/yPct` coordinates (0–100%) that map to positions on the 1280×720 virtual canvas. Repeated objects get numbered IDs (e.g. `cafe-sofa-1`, `cafe-sofa-2`).

**Tech Stack:** TypeScript, React, Vite. Verify with `npm run lint && npm run build`.

---

## File Map

| File | Action | Items before → after |
|---|---|---|
| `src/features/game/data/supermarketRoomItems.ts` | Full rewrite | 8 → 15 |
| `src/features/game/data/cafeRoomItems.ts` | Full rewrite | 8 → 41 |
| `src/features/game/data/houseRoomItems.ts` | Full rewrite | 8 → 29 |

---

## Task 1: Rewrite Supermarket Items

All current positions are wrong. Start fresh. 15 items mapped to the pixel-art background.

**Files:**
- Modify: `src/features/game/data/supermarketRoomItems.ts`

- [ ] **Step 1: Replace the file content**

```ts
import { RoomItem } from '../../../types/domain';

export const SUPERMARKET_ROOM_ITEMS: RoomItem[] = [
  // Counter / checkout
  { id: 'sm-cashier',   chinese: '收银台', pinyin: 'shōuyín tái',  english: 'cashier counter', description: '超市结账的地方。',              icon: '🏧', xp: 10, xPct: 78, yPct: 18 },

  // Shelving units
  { id: 'sm-shelf-1',   chinese: '货架',   pinyin: 'huòjià',       english: 'shelf',           description: '超市里摆放商品的架子。',        icon: '🗄️', xp: 10, xPct: 10, yPct: 32 },
  { id: 'sm-shelf-2',   chinese: '货架',   pinyin: 'huòjià',       english: 'shelf',           description: '超市里摆放商品的架子。',        icon: '🗄️', xp: 10, xPct: 10, yPct: 52 },
  { id: 'sm-shelf-3',   chinese: '货架',   pinyin: 'huòjià',       english: 'shelf',           description: '超市里摆放商品的架子。',        icon: '🗄️', xp: 10, xPct: 10, yPct: 70 },

  // Carts & baskets
  { id: 'sm-cart',      chinese: '购物车', pinyin: 'gòuwù chē',    english: 'shopping cart',   description: '超市里用来放商品的推车。',      icon: '🛒', xp: 10, xPct: 70, yPct: 58 },
  { id: 'sm-basket',    chinese: '购物篮', pinyin: 'gòuwù lán',    english: 'shopping basket', description: '轻便的购物手提篮。',            icon: '🧺', xp: 10, xPct: 55, yPct: 65 },

  // Signage
  { id: 'sm-poster',    chinese: '海报',   pinyin: 'hǎibào',       english: 'poster',          description: '超市促销用的宣传海报。',        icon: '📋', xp: 10, xPct: 22, yPct: 12 },

  // Cold storage
  { id: 'sm-fridge',    chinese: '冰柜',   pinyin: 'bīngguì',      english: 'refrigerator case', description: '保持食物新鲜的冷藏柜。',     icon: '🧊', xp: 10, xPct: 82, yPct: 50 },

  // Products on shelves
  { id: 'sm-apple',     chinese: '苹果',   pinyin: 'píngguǒ',      english: 'apple',           description: '一种常见的红色或绿色水果。',    icon: '🍎', xp: 10, xPct: 18, yPct: 38 },
  { id: 'sm-milk',      chinese: '牛奶',   pinyin: 'niúnǎi',       english: 'milk',            description: '白色营养丰富的饮料。',          icon: '🥛', xp: 10, xPct: 18, yPct: 55 },
  { id: 'sm-bread',     chinese: '面包',   pinyin: 'miànbāo',      english: 'bread',           description: '用小麦粉烘焙的主食。',          icon: '🍞', xp: 10, xPct: 30, yPct: 45 },
  { id: 'sm-juice',     chinese: '果汁',   pinyin: 'guǒzhī',       english: 'juice',           description: '用水果榨取的饮料。',            icon: '🧃', xp: 10, xPct: 25, yPct: 62 },
  { id: 'sm-water',     chinese: '水',     pinyin: 'shuǐ',         english: 'water',           description: '瓶装饮用水。',                  icon: '💧', xp: 10, xPct: 38, yPct: 55 },
  { id: 'sm-egg',       chinese: '鸡蛋',   pinyin: 'jīdàn',        english: 'eggs',            description: '新鲜鸡蛋，营养丰富。',          icon: '🥚', xp: 10, xPct: 30, yPct: 72 },
  { id: 'sm-display',   chinese: '展示台', pinyin: 'zhǎnshì tái',  english: 'display stand',   description: '摆放特色商品的展示台。',        icon: '🪧', xp: 10, xPct: 50, yPct: 42 },
];
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/supermarketRoomItems.ts
git commit -m "feat: remap supermarket items — 8 → 15 items, fix all positions"
```

---

## Task 2: Expand Cafe Items

Expand from 8 to 28. Add all visible instances: 8 barrels, 3 posters, 2 lamps, counter, 4 coffee cups, 4 tables, 8 chairs, 2 sofas, 4 plants, fireplace, bookshelf, 3 stools.

**Files:**
- Modify: `src/features/game/data/cafeRoomItems.ts`

- [ ] **Step 1: Replace the file content**

```ts
import { RoomItem } from '../../../types/domain';

export const CAFE_ROOM_ITEMS: RoomItem[] = [
  // ── Barrels (top-left row, 8 instances) ──────────────────────────────
  { id: 'cafe-barrel-1', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct:  4, yPct: 21 },
  { id: 'cafe-barrel-2', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct:  9, yPct: 21 },
  { id: 'cafe-barrel-3', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 14, yPct: 21 },
  { id: 'cafe-barrel-4', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 19, yPct: 21 },
  { id: 'cafe-barrel-5', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 24, yPct: 21 },
  { id: 'cafe-barrel-6', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 29, yPct: 21 },
  { id: 'cafe-barrel-7', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 34, yPct: 21 },
  { id: 'cafe-barrel-8', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 39, yPct: 21 },

  // ── Wall posters (3 frames on top wall) ──────────────────────────────
  { id: 'cafe-poster-1', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 22, yPct: 6 },
  { id: 'cafe-poster-2', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 36, yPct: 6 },
  { id: 'cafe-poster-3', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 48, yPct: 6 },

  // ── Wall lamps (2) ───────────────────────────────────────────────────
  { id: 'cafe-lamp-1', chinese: '壁灯', pinyin: 'bìdēng', english: 'wall lamp', description: '安装在墙上的照明灯。', icon: '💡', xp: 10, xPct: 13, yPct: 9 },
  { id: 'cafe-lamp-2', chinese: '壁灯', pinyin: 'bìdēng', english: 'wall lamp', description: '安装在墙上的照明灯。', icon: '💡', xp: 10, xPct: 44, yPct: 9 },

  // ── Counter / bar ────────────────────────────────────────────────────
  { id: 'cafe-counter', chinese: '吧台', pinyin: 'bātái', english: 'counter', description: '咖啡厅的服务台。', icon: '🍵', xp: 10, xPct: 20, yPct: 35 },

  // ── Coffee cups (one per seating area, 4) ────────────────────────────
  { id: 'cafe-coffee-1', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 14, yPct: 39 },
  { id: 'cafe-coffee-2', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 28, yPct: 39 },
  { id: 'cafe-coffee-3', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 52, yPct: 50 },
  { id: 'cafe-coffee-4', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 17, yPct: 69 },

  // ── Tables (4 in the centre area) ────────────────────────────────────
  { id: 'cafe-table-1', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 38, yPct: 53 },
  { id: 'cafe-table-2', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 52, yPct: 56 },
  { id: 'cafe-table-3', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 17, yPct: 75 },
  { id: 'cafe-table-4', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 52, yPct: 75 },

  // ── Chairs (2 per table, 8 total) ────────────────────────────────────
  { id: 'cafe-chair-1', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 34, yPct: 50 },
  { id: 'cafe-chair-2', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 42, yPct: 56 },
  { id: 'cafe-chair-3', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 48, yPct: 53 },
  { id: 'cafe-chair-4', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 56, yPct: 53 },
  { id: 'cafe-chair-5', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 13, yPct: 78 },
  { id: 'cafe-chair-6', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 21, yPct: 78 },
  { id: 'cafe-chair-7', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 48, yPct: 78 },
  { id: 'cafe-chair-8', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 56, yPct: 78 },

  // ── Sofas (2) ────────────────────────────────────────────────────────
  { id: 'cafe-sofa-1', chinese: '沙发', pinyin: 'shāfā', english: 'sofa', description: '柔软舒适的坐卧家具。', icon: '🛋️', xp: 10, xPct: 18, yPct: 62 },
  { id: 'cafe-sofa-2', chinese: '沙发', pinyin: 'shāfā', english: 'sofa', description: '柔软舒适的坐卧家具。', icon: '🛋️', xp: 10, xPct: 12, yPct: 82 },

  // ── Plants (4) ───────────────────────────────────────────────────────
  { id: 'cafe-plant-1', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 42, yPct: 34 },
  { id: 'cafe-plant-2', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 38, yPct: 46 },
  { id: 'cafe-plant-3', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 46, yPct: 78 },
  { id: 'cafe-plant-4', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct:  8, yPct: 88 },

  // ── Right-side features ───────────────────────────────────────────────
  { id: 'cafe-fireplace', chinese: '壁炉', pinyin: 'bìlú',    english: 'fireplace', description: '燃烧木材取暖的炉子。',      icon: '🔥', xp: 15, xPct: 83, yPct: 42 },
  { id: 'cafe-bookshelf', chinese: '书架', pinyin: 'shūjià',  english: 'bookshelf', description: '放书的架子，旁边有壁炉。', icon: '📚', xp: 10, xPct: 85, yPct: 26 },
  { id: 'cafe-stool-1',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 62 },
  { id: 'cafe-stool-2',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 72 },
  { id: 'cafe-stool-3',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 80 },
];
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/cafeRoomItems.ts
git commit -m "feat: expand cafe items — 8 → 41 items with all visible objects"
```

---

## Task 3: Expand House Items

The house background shows multiple rooms: a garden/greenhouse (top-left), a bedroom (top-center), a cozy lounge (top-right), a main living room (center), a kitchen (bottom-left), and a study area (bottom-right). Tag major objects in every room.

**Files:**
- Modify: `src/features/game/data/houseRoomItems.ts`

- [ ] **Step 1: Replace the file content**

```ts
import { RoomItem } from '../../../types/domain';

export const HOUSE_ROOM_ITEMS: RoomItem[] = [
  // ── Garden / greenhouse (top-left room) ──────────────────────────────
  { id: 'house-plant-1', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct:  5, yPct: 12 },
  { id: 'house-plant-2', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct: 10, yPct: 18 },
  { id: 'house-plant-3', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct: 15, yPct: 12 },
  { id: 'house-plant-4', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct:  8, yPct: 25 },

  // ── Bedroom (top-center room) ─────────────────────────────────────────
  { id: 'house-bed',       chinese: '床',   pinyin: 'chuáng',  english: 'bed',      description: '睡觉用的家具。',              icon: '🛏️', xp: 10, xPct: 43, yPct: 16 },
  { id: 'house-plant-5',   chinese: '植物', pinyin: 'zhíwù',   english: 'plant',    description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 30, yPct: 10 },
  { id: 'house-plant-6',   chinese: '植物', pinyin: 'zhíwù',   english: 'plant',    description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 35, yPct: 20 },
  { id: 'house-dresser',   chinese: '梳妆台', pinyin: 'shūzhuāng tái', english: 'dresser', description: '放衣物和梳妆用品的家具。', icon: '🪞', xp: 10, xPct: 40, yPct: 28 },
  { id: 'house-window-1',  chinese: '窗户', pinyin: 'chuānghù', english: 'window',  description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 52, yPct: 6  },

  // ── Cozy lounge (top-right room) ─────────────────────────────────────
  { id: 'house-armchair',    chinese: '扶手椅', pinyin: 'fúshǒu yǐ',  english: 'armchair',  description: '有扶手的舒适椅子。',          icon: '🛋️', xp: 10, xPct: 82, yPct: 22 },
  { id: 'house-bookshelf-1', chinese: '书架',   pinyin: 'shūjià',     english: 'bookshelf', description: '放书的架子。',                icon: '📚', xp: 10, xPct: 87, yPct: 14 },
  { id: 'house-fireplace',   chinese: '壁炉',   pinyin: 'bìlú',       english: 'fireplace', description: '燃烧木材取暖的炉子。',        icon: '🔥', xp: 15, xPct: 88, yPct: 34 },
  { id: 'house-tv-wall',     chinese: '电视',   pinyin: 'diànshì',    english: 'TV',        description: '用来看节目的电子设备。',      icon: '📺', xp: 10, xPct: 78, yPct: 10 },
  { id: 'house-plant-7',     chinese: '植物',   pinyin: 'zhíwù',      english: 'plant',     description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 72, yPct: 28 },

  // ── Main living room (centre) ─────────────────────────────────────────
  { id: 'house-tv',      chinese: '电视', pinyin: 'diànshì', english: 'TV',   description: '用来看节目的电子设备。',    icon: '📺', xp: 10, xPct: 52, yPct: 52 },
  { id: 'house-sofa-1',  chinese: '沙发', pinyin: 'shāfā',   english: 'sofa', description: '客厅里用来坐或躺的家具。',  icon: '🛋️', xp: 10, xPct: 52, yPct: 66 },
  { id: 'house-rug',     chinese: '地毯', pinyin: 'dìtǎn',   english: 'rug',  description: '铺在地板上的织物装饰品。',  icon: '🟫', xp: 10, xPct: 52, yPct: 60 },
  { id: 'house-plant-8', chinese: '植物', pinyin: 'zhíwù',   english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct: 62, yPct: 46 },
  { id: 'house-window-2', chinese: '窗户', pinyin: 'chuānghù', english: 'window', description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 70, yPct: 48 },
  { id: 'house-chair-1', chinese: '椅子', pinyin: 'yǐzi',    english: 'chair', description: '供人坐下休息的家具。',     icon: '🪑', xp: 10, xPct: 68, yPct: 58 },
  { id: 'house-chair-2', chinese: '椅子', pinyin: 'yǐzi',    english: 'chair', description: '供人坐下休息的家具。',     icon: '🪑', xp: 10, xPct: 75, yPct: 58 },

  // ── Kitchen (bottom-left room) ────────────────────────────────────────
  { id: 'house-stove',   chinese: '炉灶', pinyin: 'lúzào',    english: 'stove',  description: '用来做饭加热食物的设备。',    icon: '🍳', xp: 10, xPct: 18, yPct: 72 },
  { id: 'house-fridge',  chinese: '冰箱', pinyin: 'bīngxiāng', english: 'fridge', description: '保持食物新鲜的冷藏电器。', icon: '🧊', xp: 10, xPct: 13, yPct: 62 },
  { id: 'house-shelf',   chinese: '架子', pinyin: 'jiàzi',    english: 'shelf',  description: '厨房里放物品的架子。',        icon: '🗄️', xp: 10, xPct:  7, yPct: 55 },
  { id: 'house-window-3', chinese: '窗户', pinyin: 'chuānghù', english: 'window', description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 28, yPct: 6  },

  // ── Study / bottom-right area ─────────────────────────────────────────
  { id: 'house-sofa-2',      chinese: '沙发', pinyin: 'shāfā',  english: 'sofa',      description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 50, yPct: 80 },
  { id: 'house-bookshelf-2', chinese: '书架', pinyin: 'shūjià', english: 'bookshelf', description: '放书的架子。',              icon: '📚', xp: 10, xPct: 88, yPct: 82 },
  { id: 'house-bookshelf-3', chinese: '书架', pinyin: 'shūjià', english: 'bookshelf', description: '放书的架子。',              icon: '📚', xp: 10, xPct: 88, yPct: 88 },
  { id: 'house-lamp',        chinese: '台灯', pinyin: 'táidēng', english: 'lamp',     description: '放在桌上照明的灯。',       icon: '💡', xp: 10, xPct: 42, yPct: 68 },
];
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/game/data/houseRoomItems.ts
git commit -m "feat: expand house items — 8 → 29 items across all visible rooms"
```

---

## Task 4: In-game Position Verification

After all data changes are committed, walk through each room in the running dev server and verify hotspot positions feel right. Adjust any `xPct/yPct` that land on empty floor rather than on or near the intended object.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Walk through supermarket**

Enter the supermarket room. Walk the character near each of the 15 tagged items. Confirm [E] prompt appears when standing near the correct object on screen. If a hotspot is misaligned, update its `xPct/yPct` in `supermarketRoomItems.ts`.

- [ ] **Step 3: Walk through cafe**

Enter the cafe room. Verify all 38 hotspots trigger near their named objects. Pay attention to: barrel row spacing, chair/table pairing, sofa positions.

- [ ] **Step 4: Walk through house**

Enter the house room. Verify all 28 hotspots. Pay attention to room boundaries — items should be inside their respective room areas (kitchen items in kitchen quadrant, bedroom items in bedroom quadrant, etc).

- [ ] **Step 5: Commit any position fixes**

```bash
git add src/features/game/data/
git commit -m "fix: adjust item hotspot positions after in-game verification"
```
