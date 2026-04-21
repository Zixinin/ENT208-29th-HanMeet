import { RoomItem } from '../../../types/domain';

export const SUPERMARKET_ROOM_ITEMS: RoomItem[] = [
  { id: 'sm-cashier',  chinese: '收银台', pinyin: 'shōuyín tái',  english: 'cashier',       description: '超市结账的地方。',              icon: '🏧', xp: 10, xPct: 20, yPct: 15 },
  { id: 'sm-shelf',    chinese: '货架',   pinyin: 'huòjià',       english: 'shelf',         description: '超市里摆放商品的架子。',        icon: '🗄️', xp: 10, xPct: 10, yPct: 48 },
  { id: 'sm-apple',    chinese: '苹果',   pinyin: 'píngguǒ',      english: 'apple',         description: '一种常见的红色或绿色水果。',    icon: '🍎', xp: 10, xPct: 10, yPct: 60 },
  { id: 'sm-milk',     chinese: '牛奶',   pinyin: 'niúnǎi',       english: 'milk',          description: '白色营养丰富的饮料。',          icon: '🥛', xp: 10, xPct: 10, yPct: 70 },
  { id: 'sm-bread',    chinese: '面包',   pinyin: 'miànbāo',      english: 'bread',         description: '用小麦粉烘焙的主食。',          icon: '🍞', xp: 10, xPct: 30, yPct: 48 },
  { id: 'sm-cart',     chinese: '购物车', pinyin: 'gòuwù chē',    english: 'shopping cart', description: '超市里用来放商品的推车。',      icon: '🛒', xp: 10, xPct: 72, yPct: 55 },
  { id: 'sm-poster',   chinese: '海报',   pinyin: 'hǎibào',       english: 'poster',        description: '超市促销用的宣传海报。',        icon: '📋', xp: 10, xPct: 75, yPct: 20 },
  { id: 'sm-fridge',   chinese: '冰箱',   pinyin: 'bīngxiāng',    english: 'fridge',        description: '保持食物新鲜的冷藏电器。',      icon: '🧊', xp: 10, xPct: 50, yPct: 72 },
];
