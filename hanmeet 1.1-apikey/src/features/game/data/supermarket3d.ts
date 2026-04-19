export type ItemCategory = 'produce' | 'dairy' | 'tool' | 'staple' | 'snack' | 'condiment';

export interface SupermarketItemDef {
  id: string;
  english: string;
  chinese: string;
  pinyin: string;
  category: ItemCategory;
  aisle: number;
  color: string;
  icon: string;
  position: { x: number; y: number; z: number };
}

export interface ObstacleRect {
  id: string;
  kind: 'shelf' | 'counter' | 'produce' | 'pillar';
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
}

export interface SignDef {
  id: string;
  texturePath: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  width: number;
  height: number;
}

export const WORLD_BOUNDS = {
  minX: -27,
  maxX: 27,
  minZ: -20,
  maxZ: 20,
};

export const PLAYER_SETTINGS = {
  eyeHeight: 1.62,
  radius: 0.55,
  moveSpeed: 6,
  mouseSensitivity: 0.002,
  interactDistance: 3.4,
};

export const INVENTORY_LIMIT = 15;

export const SUPERMARKET_ITEMS: SupermarketItemDef[] = [
  {
    id: 'watermelon',
    english: 'Watermelon',
    chinese: '西瓜',
    pinyin: 'xigua',
    category: 'produce',
    aisle: 1,
    color: '#3ecf5d',
    icon: '🍉',
    position: { x: -21, y: 1.1, z: -6.5 },
  },
  {
    id: 'apple',
    english: 'Apple',
    chinese: '苹果',
    pinyin: 'pingguo',
    category: 'produce',
    aisle: 1,
    color: '#ef4444',
    icon: '🍎',
    position: { x: -20.2, y: 1.1, z: 4.5 },
  },
  {
    id: 'carrot',
    english: 'Carrot',
    chinese: '胡萝卜',
    pinyin: 'huluobo',
    category: 'produce',
    aisle: 1,
    color: '#f97316',
    icon: '🥕',
    position: { x: -16.5, y: 1.1, z: 10.2 },
  },
  {
    id: 'milk',
    english: 'Milk',
    chinese: '牛奶',
    pinyin: 'niunai',
    category: 'dairy',
    aisle: 2,
    color: '#d9f2ff',
    icon: '🥛',
    position: { x: -9.2, y: 1.1, z: -8.2 },
  },
  {
    id: 'egg',
    english: 'Egg',
    chinese: '鸡蛋',
    pinyin: 'jidan',
    category: 'dairy',
    aisle: 2,
    color: '#fde68a',
    icon: '🥚',
    position: { x: -6.8, y: 1.1, z: 8.5 },
  },
  {
    id: 'bread',
    english: 'Bread',
    chinese: '面包',
    pinyin: 'mianbao',
    category: 'snack',
    aisle: 2,
    color: '#eab308',
    icon: '🍞',
    position: { x: -3.8, y: 1.1, z: -1.5 },
  },
  {
    id: 'rice',
    english: 'Rice',
    chinese: '大米',
    pinyin: 'dami',
    category: 'staple',
    aisle: 3,
    color: '#f8fafc',
    icon: '🍚',
    position: { x: 1.2, y: 1.1, z: -7.6 },
  },
  {
    id: 'instant-noodles',
    english: 'Instant Noodles',
    chinese: '方便面',
    pinyin: 'fangbianmian',
    category: 'snack',
    aisle: 3,
    color: '#facc15',
    icon: '🍜',
    position: { x: 2.7, y: 1.1, z: 2.9 },
  },
  {
    id: 'tomato',
    english: 'Tomato',
    chinese: '西红柿',
    pinyin: 'xihongshi',
    category: 'produce',
    aisle: 3,
    color: '#dc2626',
    icon: '🍅',
    position: { x: 6.2, y: 1.1, z: 8.4 },
  },
  {
    id: 'soy-sauce',
    english: 'Soy Sauce',
    chinese: '酱油',
    pinyin: 'jiangyou',
    category: 'condiment',
    aisle: 4,
    color: '#7c3f00',
    icon: '🫙',
    position: { x: 9.1, y: 1.1, z: -8.1 },
  },
  {
    id: 'salt',
    english: 'Salt',
    chinese: '盐',
    pinyin: 'yan',
    category: 'condiment',
    aisle: 4,
    color: '#e5e7eb',
    icon: '🧂',
    position: { x: 10.8, y: 1.1, z: 3.2 },
  },
  {
    id: 'olive-oil',
    english: 'Olive Oil',
    chinese: '橄榄油',
    pinyin: 'ganlanyou',
    category: 'condiment',
    aisle: 4,
    color: '#84cc16',
    icon: '🫒',
    position: { x: 13.9, y: 1.1, z: 9.4 },
  },
  {
    id: 'frying-pan',
    english: 'Frying Pan',
    chinese: '平底锅',
    pinyin: 'pingdiguo',
    category: 'tool',
    aisle: 5,
    color: '#64748b',
    icon: '🍳',
    position: { x: 18.5, y: 1.1, z: -7.8 },
  },
  {
    id: 'spatula',
    english: 'Spatula',
    chinese: '木铲',
    pinyin: 'muchan',
    category: 'tool',
    aisle: 5,
    color: '#a16207',
    icon: '🥄',
    position: { x: 19.9, y: 1.1, z: 1.8 },
  },
  {
    id: 'onion',
    english: 'Onion',
    chinese: '洋葱',
    pinyin: 'yangcong',
    category: 'produce',
    aisle: 5,
    color: '#9333ea',
    icon: '🧅',
    position: { x: 22.1, y: 1.1, z: 9.1 },
  },
];

export const SUPERMARKET_OBSTACLES: ObstacleRect[] = [
  { id: 'shelf-a', kind: 'shelf', x: -18.5, z: 1, width: 2.4, depth: 23, height: 2.8 },
  { id: 'shelf-b', kind: 'shelf', x: -8.8, z: 1, width: 2.4, depth: 23, height: 2.8 },
  { id: 'shelf-c', kind: 'shelf', x: 1.2, z: 1, width: 2.4, depth: 23, height: 2.8 },
  { id: 'shelf-d', kind: 'shelf', x: 10.8, z: 1, width: 2.4, depth: 23, height: 2.8 },
  { id: 'shelf-e', kind: 'shelf', x: 20.4, z: 1, width: 2.4, depth: 23, height: 2.8 },
  { id: 'checkout-left', kind: 'counter', x: -12.5, z: -14.8, width: 8, depth: 2.6, height: 1.2 },
  { id: 'checkout-mid', kind: 'counter', x: 0.8, z: -14.8, width: 8, depth: 2.6, height: 1.2 },
  { id: 'checkout-right', kind: 'counter', x: 14.2, z: -14.8, width: 8, depth: 2.6, height: 1.2 },
  { id: 'produce-table-left', kind: 'produce', x: -20, z: 14.6, width: 8.4, depth: 3.2, height: 1.1 },
  { id: 'produce-table-right', kind: 'produce', x: 20, z: 14.6, width: 8.4, depth: 3.2, height: 1.1 },
  { id: 'pillar-1', kind: 'pillar', x: -24, z: -1.5, width: 1.2, depth: 1.2, height: 3.2 },
  { id: 'pillar-2', kind: 'pillar', x: 24, z: -1.5, width: 1.2, depth: 1.2, height: 3.2 },
];

export const SUPERMARKET_SIGNS: SignDef[] = [
  {
    id: 'fresh-sign',
    texturePath: '/supermarket3d/sign-fresh.svg',
    position: { x: -21, y: 3.1, z: 18.6 },
    rotationY: 0,
    width: 6,
    height: 2,
  },
  {
    id: 'checkout-sign',
    texturePath: '/supermarket3d/sign-checkout.svg',
    position: { x: 1, y: 3.3, z: -18.2 },
    rotationY: Math.PI,
    width: 7,
    height: 2,
  },
  {
    id: 'aisle-sign',
    texturePath: '/supermarket3d/sign-aisle3.svg',
    position: { x: 1.2, y: 3.35, z: -1.2 },
    rotationY: 0,
    width: 5,
    height: 1.5,
  },
];

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  produce: 'produce',
  dairy: 'dairy',
  tool: 'kitchen tools',
  staple: 'staples',
  snack: 'snacks',
  condiment: 'condiments',
};
