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
  iwall: '#7a4a20',
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
  { id: 'sofa',      tileX: 2,  tileY: 2,  chinese: '沙发',   pinyin: 'shāfā',      description: '客厅里用来坐或躺的家具。', english: 'sofa' },
  { id: 'tv',        tileX: 2,  tileY: 6,  chinese: '电视',   pinyin: 'diànshì',    description: '用来看节目的电子设备。', english: 'TV' },
  { id: 'plant',     tileX: 7,  tileY: 2,  chinese: '植物',   pinyin: 'zhíwù',      description: '摆放在家里的绿色植物。', english: 'plant' },
  { id: 'window',    tileX: 5,  tileY: 1,  chinese: '窗户',   pinyin: 'chuānghù',   description: '让光线和空气进入房间的结构。', english: 'window' },
  // Bedroom (right, cols 10–18, rows 1–7)
  { id: 'bed',       tileX: 12, tileY: 2,  chinese: '床',     pinyin: 'chuáng',     description: '睡觉用的家具。', english: 'bed' },
  { id: 'bookshelf', tileX: 17, tileY: 2,  chinese: '书架',   pinyin: 'shūjià',     description: '放书的架子。', english: 'bookshelf' },
  { id: 'mirror',    tileX: 17, tileY: 5,  chinese: '镜子',   pinyin: 'jìngzi',     description: '照出影像的玻璃。', english: 'mirror' },
  // Kitchen (rows 9–13)
  { id: 'stove',     tileX: 3,  tileY: 10, chinese: '炉灶',   pinyin: 'lúzào',      description: '用来做饭加热食物的设备。', english: 'stove' },
  { id: 'fridge',    tileX: 7,  tileY: 10, chinese: '冰箱',   pinyin: 'bīngxiāng',  description: '保持食物新鲜的电器。', english: 'fridge' },
  { id: 'table',     tileX: 12, tileY: 11, chinese: '桌子',   pinyin: 'zhuōzi',     description: '吃饭或工作用的家具。', english: 'table' },
  { id: 'bathroom',  tileX: 17, tileY: 10, chinese: '浴室',   pinyin: 'yùshì',      description: '洗澡和梳洗的房间。', english: 'bathroom' },
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
