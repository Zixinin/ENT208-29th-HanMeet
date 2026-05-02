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
  iwall:  '#6a4810',
  door:   '#c8a86a',
  shelf:  '#b07830',
  empty:  '#e8c878',
};

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
  { id: 'apple',    tileX: 1,  tileY: 2,  chinese: '苹果',   pinyin: 'píngguǒ',     description: '一种常见的红色或绿色水果。', english: 'apple' },
  { id: 'banana',   tileX: 2,  tileY: 2,  chinese: '香蕉',   pinyin: 'xiāngjiāo',   description: '黄色弯曲的热带水果。', english: 'banana' },
  { id: 'tomato',   tileX: 3,  tileY: 2,  chinese: '西红柿', pinyin: 'xīhóngshì',   description: '红色多汁的蔬菜，也是水果。', english: 'tomato' },
  { id: 'milk',     tileX: 5,  tileY: 2,  chinese: '牛奶',   pinyin: 'niúnǎi',      description: '白色营养丰富的饮料。', english: 'milk' },
  { id: 'egg',      tileX: 6,  tileY: 2,  chinese: '鸡蛋',   pinyin: 'jīdàn',       description: '鸡产的卵，常用于烹饪。', english: 'egg' },
  { id: 'water',    tileX: 7,  tileY: 2,  chinese: '水',     pinyin: 'shuǐ',        description: '无色无味的生命液体。', english: 'water' },
  { id: 'bread',    tileX: 1,  tileY: 5,  chinese: '面包',   pinyin: 'miànbāo',     description: '用小麦粉烘焙的主食。', english: 'bread' },
  { id: 'rice',     tileX: 3,  tileY: 5,  chinese: '米饭',   pinyin: 'mǐfàn',       description: '中国最常见的主食之一。', english: 'rice' },
  { id: 'cart',     tileX: 16, tileY: 8,  chinese: '购物车', pinyin: 'gòuwù chē',   description: '超市里用来放商品的推车。', english: 'shopping cart' },
  { id: 'cashier',  tileX: 15, tileY: 3,  chinese: '收银台', pinyin: 'shōuyín tái', description: '超市结账的地方。', english: 'cashier' },
  { id: 'shelf',    tileX: 9,  tileY: 2,  chinese: '货架',   pinyin: 'huòjià',      description: '超市里摆放商品的架子。', english: 'shelf' },
  { id: 'poster',   tileX: 1,  tileY: 8,  chinese: '海报',   pinyin: 'hǎibào',      description: '超市促销用的宣传海报。', english: 'poster' },
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
