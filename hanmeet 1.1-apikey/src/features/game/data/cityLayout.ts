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
