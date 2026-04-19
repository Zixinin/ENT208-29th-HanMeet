import { Building, NpcData, TileType } from '../../../types/domain';

export const TILE_SIZE = 48;
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

function buildCityGrid(): TileType[][] {
  const grid: TileType[][] = Array.from({ length: CITY_ROWS }, () =>
    Array(CITY_COLS).fill('grass' as TileType)
  );

  for (let x = 0; x < CITY_COLS; x++) {
    grid[12][x] = 'road';
    grid[13][x] = 'road';
  }
  for (let y = 0; y < CITY_ROWS; y++) {
    grid[y][16] = 'road';
    grid[y][17] = 'road';
  }

  for (let x = BUILDINGS[0].tileX; x <= BUILDINGS[0].doorX; x++) grid[11][x] = 'path';
  for (let x = BUILDINGS[1].tileX; x <= BUILDINGS[1].doorX; x++) grid[11][x] = 'path';
  for (let y = BUILDINGS[2].doorY; y <= 20; y++) grid[y][BUILDINGS[2].doorX] = 'path';

  for (const b of BUILDINGS) {
    for (let row = b.tileY; row < b.tileY + b.tileH; row++) {
      for (let col = b.tileX; col < b.tileX + b.tileW; col++) {
        grid[row][col] = 'wall';
      }
    }
    grid[b.doorY][b.doorX] = 'door';
  }

  const treePositions = [
    [2,2],[3,3],[38,2],[37,3],[2,25],[3,26],[38,25],[37,24],
    [10,16],[11,17],[22,16],[23,17],[5,16],[6,17],
  ];
  for (const [row, col] of treePositions) {
    if (grid[row]?.[col] === 'grass') grid[row][col] = 'tree';
  }

  const flowerPositions = [[4,10],[5,11],[14,4],[15,5],[20,20],[21,21],[35,8]];
  for (const [row, col] of flowerPositions) {
    if (grid[row]?.[col] === 'grass') grid[row][col] = 'flower';
  }

  return grid;
}

export const CITY_GRID: TileType[][] = buildCityGrid();

export function isBlocked(gridX: number, gridY: number): boolean {
  if (gridX < 0 || gridY < 0 || gridX >= CITY_COLS || gridY >= CITY_ROWS) return true;
  const tile = CITY_GRID[gridY]?.[gridX];
  return tile === 'wall' || tile === 'tree' || tile === 'water';
}
