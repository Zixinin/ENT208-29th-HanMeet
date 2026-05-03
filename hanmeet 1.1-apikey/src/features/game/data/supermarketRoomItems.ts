import { RoomItem } from '../../../types/domain';

export const SUPERMARKET_ROOM_ITEMS: RoomItem[] = [
  // Food items
  { id: 'supermarket-sugar-1',         chinese: '糖',     pinyin: 'táng',         english: 'sugar',          description: '用于烹饪和调味的甜味调料。', icon: '🍬', xp: 10, xPct: 18.7, yPct: 22.4 },
  { id: 'supermarket-sugar-2',         chinese: '糖',     pinyin: 'táng',         english: 'sugar',          description: '用于烹饪和调味的甜味调料。', icon: '🍬', xp: 10, xPct: 41.3, yPct: 23.2 },
  { id: 'supermarket-salt-1',          chinese: '盐',     pinyin: 'yán',          english: 'salt',           description: '常见的调味料，用于提鲜。',   icon: '🧂', xp: 10, xPct: 13.7, yPct: 21.9 },
  { id: 'supermarket-salt-2',          chinese: '盐',     pinyin: 'yán',          english: 'salt',           description: '常见的调味料，用于提鲜。',   icon: '🧂', xp: 10, xPct: 37,   yPct: 23.1 },
  { id: 'supermarket-burger',          chinese: '汉堡',   pinyin: 'hànbǎo',       english: 'burger',         description: '夹有肉饼和蔬菜的圆形面包。', icon: '🍔', xp: 10, xPct: 60.3, yPct: 63.3 },
  { id: 'supermarket-pizza',           chinese: '披萨',   pinyin: 'pīsà',         english: 'pizza',          description: '意大利风味的圆形烤饼。',     icon: '🍕', xp: 10, xPct: 74.1, yPct: 86.4 },
  { id: 'supermarket-bread',           chinese: '面包',   pinyin: 'miànbāo',      english: 'bread',          description: '用小麦粉烘焙的主食。',       icon: '🍞', xp: 10, xPct: 87.6, yPct: 81   },
  { id: 'supermarket-meatball',        chinese: '肉丸',   pinyin: 'ròuwán',       english: 'meatball',       description: '由肉末制成的圆形食物。',     icon: '🥩', xp: 10, xPct: 59.8, yPct: 86.7 },
  { id: 'supermarket-cheese',          chinese: '奶酪',   pinyin: 'nǎilào',       english: 'cheese',         description: '由牛奶制成的乳制品。',       icon: '🧀', xp: 10, xPct: 59.7, yPct: 80.9 },
  { id: 'supermarket-cake',            chinese: '蛋糕',   pinyin: 'dàngāo',       english: 'cake',           description: '甜味烘焙食品，常用于庆祝。', icon: '🎂', xp: 10, xPct: 78.4, yPct: 80.5 },

  // Condiments & drinks
  { id: 'supermarket-soy-sauce',       chinese: '酱油',   pinyin: 'jiàngyóu',     english: 'soy sauce',      description: '用大豆酿造的咸味调料。',     icon: '🫙', xp: 10, xPct: 27.7, yPct: 45.8 },
  { id: 'supermarket-peanuts',         chinese: '花生',   pinyin: 'huāshēng',     english: 'peanuts',        description: '富含蛋白质的坚果。',         icon: '🥜', xp: 10, xPct: 13.9, yPct: 34.6 },
  { id: 'supermarket-vinegar',         chinese: '醋',     pinyin: 'cù',           english: 'vinegar',        description: '酸味调料，常用于烹饪。',     icon: '🫙', xp: 10, xPct: 13.6, yPct: 51.8 },
  { id: 'supermarket-lemon-juice',     chinese: '柠檬汁', pinyin: 'níngménghzī',  english: 'lemon juice',    description: '由柠檬榨成的酸味果汁。',     icon: '🍋', xp: 10, xPct: 27.5, yPct: 39.6 },
  { id: 'supermarket-onion',           chinese: '洋葱',   pinyin: 'yángcōng',     english: 'onion',          description: '常用于烹饪的蔬菜。',         icon: '🧅', xp: 10, xPct: 40.9, yPct: 45.7 },
  { id: 'supermarket-water',           chinese: '水',     pinyin: 'shuǐ',         english: 'water',          description: '瓶装饮用水。',               icon: '💧', xp: 10, xPct: 41.4, yPct: 80.4 },
  { id: 'supermarket-paprika',         chinese: '辣椒粉', pinyin: 'làjiāofěn',    english: 'paprika',        description: '由干红椒磨成的香辛料。',     icon: '🌶️', xp: 10, xPct: 13.5, yPct: 62.5 },
  { id: 'supermarket-honey',           chinese: '蜂蜜',   pinyin: 'fēngmì',       english: 'honey',          description: '蜜蜂采集花蜜制成的天然甜品。', icon: '🍯', xp: 10, xPct: 13.3, yPct: 86.7 },
  { id: 'supermarket-oyster-sauce',    chinese: '蚝油',   pinyin: 'háoyóu',       english: 'oyster sauce',   description: '由牡蛎熬制的鲜味调料。',     icon: '🫙', xp: 10, xPct: 13.3, yPct: 45.5 },
  { id: 'supermarket-garlic',          chinese: '大蒜',   pinyin: 'dàsuàn',       english: 'garlic',         description: '气味强烈的调味蔬菜。',       icon: '🧄', xp: 10, xPct: 13.4, yPct: 80.7 },
  { id: 'supermarket-pickle',          chinese: '泡菜',   pinyin: 'pàocài',       english: 'pickle',         description: '用盐水或醋腌制的蔬菜。',     icon: '🥒', xp: 10, xPct: 41.5, yPct: 57.3 },
  { id: 'supermarket-tea',             chinese: '茶',     pinyin: 'chá',          english: 'tea',            description: '用茶叶冲泡的传统饮料。',     icon: '🍵', xp: 10, xPct: 27.8, yPct: 51.9 },
  { id: 'supermarket-candle',          chinese: '蜡烛',   pinyin: 'làzhú',        english: 'candle',         description: '用于照明或装饰的蜡制品。',   icon: '🕯️', xp: 10, xPct: 13.6, yPct: 39.8 },

  // Equipment & decor
  { id: 'supermarket-fridge',          chinese: '冰箱',   pinyin: 'bīngxiāng',    english: 'fridge',         description: '保持食物新鲜的冷藏电器。',   icon: '🧊', xp: 10, xPct: 32.3, yPct: 24.2 },
  { id: 'supermarket-aquarium',        chinese: '鱼缸',   pinyin: 'yúgāng',       english: 'aquarium',       description: '养鱼的玻璃缸。',             icon: '🐠', xp: 10, xPct: 52.3, yPct: 23.4 },
  { id: 'supermarket-globe',           chinese: '地球仪', pinyin: 'dìqiúyí',      english: 'globe',          description: '展示世界地图的球形模型。',   icon: '🌍', xp: 10, xPct: 66.8, yPct: 31.2 },
  { id: 'supermarket-plants',          chinese: '植物',   pinyin: 'zhíwù',        english: 'plants',         description: '摆放在超市里的绿色植物。',   icon: '🌿', xp: 10, xPct: 60.2, yPct: 25.2 },
  { id: 'supermarket-trashcan',        chinese: '垃圾桶', pinyin: 'lājītǒng',     english: 'trashcan',       description: '用于收集垃圾的容器。',       icon: '🗑️', xp: 10, xPct: 69,   yPct: 43.5 },

  // Staff / counter
  { id: 'supermarket-cashier-counter', chinese: '收银台', pinyin: 'shōuyíntái',   english: 'cashier counter', description: '超市结账的柜台。',          icon: '🏧', xp: 10, xPct: 76.7, yPct: 37.4 },
  { id: 'supermarket-cashier-person',  chinese: '收银员', pinyin: 'shōuyínyuán',  english: 'cashier',        description: '负责结账的超市工作人员。',   icon: '👩‍💼', xp: 10, xPct: 78.2, yPct: 29.2 },
];
