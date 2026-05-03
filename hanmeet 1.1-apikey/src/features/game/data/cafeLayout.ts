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
  iwall:   '#2a7070',
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
  { id: 'coffee',    tileX: 2,  tileY: 2, chinese: '咖啡',       pinyin: 'kāfēi',                   description: '用咖啡豆冲泡的饮料，提神醒脑。', english: 'coffee' },
  { id: 'cake',      tileX: 4,  tileY: 2, chinese: '蛋糕',       pinyin: 'dàngāo',                  description: '甜点，常在生日时食用。', english: 'cake' },
  { id: 'croissant', tileX: 6,  tileY: 2, chinese: '牛角包',     pinyin: 'niújiǎo bāo',             description: '法式酥皮糕点，呈弯月形。', english: 'croissant' },
  { id: 'menu',      tileX: 8,  tileY: 2, chinese: '菜单',       pinyin: 'càidān',                  description: '列出餐厅所有食品和饮料的单子。', english: 'menu' },
  { id: 'espresso',  tileX: 12, tileY: 2, chinese: '意式浓缩咖啡', pinyin: 'yìshì nóngsùo kāfēi',  description: '浓度极高的咖啡饮品。', english: 'espresso' },
  // Seating zone (rows 5–13)
  { id: 'tea',       tileX: 3,  tileY: 7,  chinese: '茶',       pinyin: 'chá',                     description: '中国最传统的饮品之一。', english: 'tea' },
  { id: 'juice',     tileX: 5,  tileY: 7,  chinese: '果汁',     pinyin: 'guǒzhī',                  description: '新鲜水果榨出的饮料。', english: 'juice' },
  { id: 'tart',      tileX: 10, tileY: 7,  chinese: '挞',       pinyin: 'tǎ',                      description: '有馅料的酥皮小点心。', english: 'tart' },
  { id: 'chair',     tileX: 14, tileY: 9,  chinese: '椅子',     pinyin: 'yǐzi',                    description: '供人坐下休息的家具。', english: 'chair' },
  { id: 'plant-c',   tileX: 17, tileY: 6,  chinese: '植物',     pinyin: 'zhíwù',                   description: '咖啡厅里摆放的绿色植物。', english: 'plant' },
  { id: 'wifi',      tileX: 2,  tileY: 12, chinese: '无线网络', pinyin: 'wúxiàn wǎngluò',          description: '咖啡厅提供的无线上网服务。', english: 'wifi' },
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
