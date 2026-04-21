import { Building, NpcData } from '../../../types/domain';
import { TileEngineConfig, SpriteConfig, InteractableConfig, BuildingEntry } from '../../../types/tileEngine';

export const TILE_SIZE = 32;
export const CITY_COLS = 40;
export const CITY_ROWS = 28;

// ─── Asset paths ─────────────────────────────────────────────────────────────
const BUILDING_SRC = '/assets/gamepack/Outdoor decoration/House_1_Wood_Base_Blue.png';
const TREE_LG = '/assets/gamepack/Outdoor decoration/Oak_Tree.png';
const TREE_SM = '/assets/gamepack/Outdoor decoration/Oak_Tree_Small.png';
const CHEST_SRC = '/assets/gamepack/Outdoor decoration/Chest.png';

// ─── Tile images & colours ────────────────────────────────────────────────────
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
  cherry:   '#5a9e32',
  flower:   '#7ec850',
  tree:     '#5a9e32',
};

// ─── Buildings (domain type for existing interfaces) ──────────────────────────
export const BUILDINGS: Building[] = [
  { id: 'school',      label: 'School',      chineseLabel: '学校',   color: '#4d96ff', tileX: 4,  tileY: 1,  tileW: 8, tileH: 6, doorX: 8,  doorY: 7  },
  { id: 'supermarket', label: 'Supermarket', chineseLabel: '超市',   color: '#ff9f1c', tileX: 27, tileY: 1,  tileW: 8, tileH: 6, doorX: 31, doorY: 7  },
  { id: 'cafe',        label: 'Café',        chineseLabel: '咖啡厅', color: '#e05c5c', tileX: 24, tileY: 13, tileW: 8, tileH: 6, doorX: 28, doorY: 19 },
  { id: 'library',     label: 'Library',     chineseLabel: '图书馆', color: '#888888', tileX: 4,  tileY: 16, tileW: 7, tileH: 6, doorX: 7,  doorY: 22, inProgress: true },
  { id: 'house',       label: 'House',       chineseLabel: '住宅',   color: '#888888', tileX: 28, tileY: 15, tileW: 7, tileH: 6, doorX: 31, doorY: 21, inProgress: true },
];

// ─── BuildingEntry for TileEngine ─────────────────────────────────────────────
export const BUILDING_ENTRIES: BuildingEntry[] = BUILDINGS.map(b => ({
  id: b.id,
  doorTileX: b.doorX,
  doorTileY: b.doorY,
  label: b.label,
  chineseLabel: b.chineseLabel,
  inProgress: b.inProgress,
}));

// ─── NPCs ──────────────────────────────────────────────────────────────────────
export const NPCS: NpcData[] = [
  { id: 'npc1', tileX: 10, tileY: 8,  emoji: '👩‍🏫', hint: '学校 (xuéxiào) = School — Press E to enter.' },
  { id: 'npc2', tileX: 29, tileY: 8,  emoji: '🧑‍🛒', hint: '超市 (chāoshì) = Supermarket — Press E to enter.' },
  { id: 'npc3', tileX: 26, tileY: 20, emoji: '👩‍🍳', hint: '咖啡厅 (kāfēi tīng) = Café — Press E to enter.' },
];

// ─── City interactables (outdoor) ─────────────────────────────────────────────
export const CITY_INTERACTABLES: InteractableConfig[] = [
  { id: 'notice-board', tileX: 10, tileY: 8,  chinese: '公告板', pinyin: 'gōnggào bǎn', description: '学校公告板，上面有课程信息。' },
  { id: 'fruit-crate',  tileX: 30, tileY: 8,  src: CHEST_SRC, chinese: '水果箱', pinyin: 'shuǐguǒ xiāng', description: '超市门口装新鲜水果的木箱。' },
  { id: 'bean-crate',   tileX: 26, tileY: 20, src: CHEST_SRC, chinese: '咖啡豆箱', pinyin: 'kāfēidòu xiāng', description: '咖啡店存放烘焙豆的箱子。' },
  { id: 'herb-bed',     tileX: 19, tileY: 12, chinese: '香草花圃', pinyin: 'xiāngcǎo huāpǔ', description: '小花圃里种着各种香草。' },
];

// ─── Grid builder ──────────────────────────────────────────────────────────────
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
  paintRect(g, 25, 20, 8, 5, 'farmland');

  // Paths
  paintV(g, 11, 0, 25, 'path');
  paintV(g, 27, 0, 25, 'path');
  paintH(g, 8,  3, 39, 'path');
  paintH(g, 14, 11, 27, 'path');
  paintH(g, 25, 3, 27, 'path');
  paintV(g, 8,  7, 8,  'path');
  paintV(g, 31, 7, 8,  'path');
  paintV(g, 28, 19, 20, 'path');
  paintV(g, 7,  22, 23, 'path');
  paintV(g, 31, 21, 22, 'path');
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

  // Cherry blossoms
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

// ─── Sprite list for CityMap ───────────────────────────────────────────────────
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

// ─── Full TileEngine config for CityMap ───────────────────────────────────────
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
