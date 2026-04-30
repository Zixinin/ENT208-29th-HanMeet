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
