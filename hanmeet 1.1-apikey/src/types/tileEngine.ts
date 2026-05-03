export interface SpriteConfig {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  filter?: string;
  flipX?: boolean;
  label?: string;
  labelColor?: string;
}

export interface InteractableConfig {
  id: string;
  tileX: number;
  tileY: number;
  src?: string;
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
  tileImages: Partial<Record<string, string>>;
  tileColors: Partial<Record<string, string>>;
  sprites: SpriteConfig[];
  interactables: InteractableConfig[];
  buildings?: BuildingEntry[];
  spawnTileX: number;
  spawnTileY: number;
  isBlocked: (tileX: number, tileY: number) => boolean;
  viewWidth: number;
  viewHeight: number;
}
