import { RoomItem } from '../../../types/domain';

export const CAFE_ROOM_ITEMS: RoomItem[] = [
  // Seating — sofas
  { id: 'cafe-sofa-1',         chinese: '沙发',   pinyin: 'shāfā',      english: 'sofa',           description: '柔软舒适的坐卧家具。',         icon: '🛋️', xp: 10, xPct: 22.5, yPct: 61.4 },
  { id: 'cafe-sofa-2',         chinese: '沙发',   pinyin: 'shāfā',      english: 'sofa',           description: '柔软舒适的坐卧家具。',         icon: '🛋️', xp: 10, xPct:  8.7, yPct: 76.5 },
  { id: 'cafe-sofa-3',         chinese: '沙发',   pinyin: 'shāfā',      english: 'sofa',           description: '柔软舒适的坐卧家具。',         icon: '🛋️', xp: 10, xPct: 34.6, yPct: 77.3 },

  // Seating — chairs
  { id: 'cafe-chair-1',        chinese: '椅子',   pinyin: 'yǐzi',       english: 'chair',          description: '供人坐下休息的家具。',         icon: '🪑', xp: 10, xPct: 48.9, yPct: 44.8 },
  { id: 'cafe-chair-2',        chinese: '椅子',   pinyin: 'yǐzi',       english: 'chair',          description: '供人坐下休息的家具。',         icon: '🪑', xp: 10, xPct: 53.6, yPct: 81.8 },
  { id: 'cafe-chair-3',        chinese: '椅子',   pinyin: 'yǐzi',       english: 'chair',          description: '供人坐下休息的家具。',         icon: '🪑', xp: 10, xPct: 81.3, yPct: 63.8 },
  { id: 'cafe-chair-4',        chinese: '椅子',   pinyin: 'yǐzi',       english: 'chair',          description: '供人坐下休息的家具。',         icon: '🪑', xp: 10, xPct: 82.3, yPct: 87.4 },
  { id: 'cafe-chair-5',        chinese: '椅子',   pinyin: 'yǐzi',       english: 'chair',          description: '供人坐下休息的家具。',         icon: '🪑', xp: 10, xPct: 82.5, yPct: 75.6 },

  // Tables — big
  { id: 'cafe-table-big-1',    chinese: '大桌子', pinyin: 'dà zhuōzi',  english: 'big table',      description: '咖啡厅里的大型木制餐桌。',     icon: '🪑', xp: 10, xPct: 52.1, yPct: 52.3 },
  { id: 'cafe-table-big-2',    chinese: '大桌子', pinyin: 'dà zhuōzi',  english: 'big table',      description: '咖啡厅里的大型木制餐桌。',     icon: '🪑', xp: 10, xPct: 62.8, yPct: 76   },

  // Tables — small (round)
  { id: 'cafe-table-small-1',  chinese: '小桌子', pinyin: 'xiǎo zhuōzi', english: 'small table',   description: '咖啡厅里的小圆桌。',           icon: '🪑', xp: 10, xPct: 87.8, yPct: 61.8 },
  { id: 'cafe-table-small-2',  chinese: '小桌子', pinyin: 'xiǎo zhuōzi', english: 'small table',   description: '咖啡厅里的小圆桌。',           icon: '🪑', xp: 10, xPct: 87.2, yPct: 73.8 },
  { id: 'cafe-table-small-3',  chinese: '小桌子', pinyin: 'xiǎo zhuōzi', english: 'small table',   description: '咖啡厅里的小圆桌。',           icon: '🪑', xp: 10, xPct: 87.3, yPct: 85.4 },

  // Drinks
  { id: 'cafe-coffee',         chinese: '咖啡',   pinyin: 'kāfēi',      english: 'coffee',         description: '用咖啡豆冲泡的提神饮料。',     icon: '☕', xp: 10, xPct: 31.1, yPct: 31.6 },
  { id: 'cafe-tea',            chinese: '茶',     pinyin: 'chá',        english: 'tea',            description: '用茶叶冲泡的传统饮料。',       icon: '🍵', xp: 10, xPct: 19.2, yPct: 31.8 },

  // Equipment & decor
  { id: 'cafe-coffee-machine', chinese: '咖啡机', pinyin: 'kāfēijī',    english: 'coffee machine', description: '用于冲泡咖啡的机器。',         icon: '☕', xp: 10, xPct: 22.1, yPct: 74.9 },
  { id: 'cafe-fireplace',      chinese: '壁炉',   pinyin: 'bìlú',       english: 'fireplace',      description: '燃烧木材取暖的炉子。',         icon: '🔥', xp: 15, xPct: 78.8, yPct: 18.9 },
  { id: 'cafe-plants',         chinese: '植物',   pinyin: 'zhíwù',      english: 'plants',         description: '咖啡厅里摆放的绿色植物。',     icon: '🌿', xp: 10, xPct: 65.3, yPct: 42.5 },

  // Staff & counter
  { id: 'cafe-cashier',        chinese: '收银台', pinyin: 'shōuyíntái', english: 'cashier',        description: '咖啡厅的结账柜台。',           icon: '🏧', xp: 10, xPct:  8.4, yPct: 31.7 },
  { id: 'cafe-waiter',         chinese: '服务员', pinyin: 'fúwùyuán',   english: 'waiter',         description: '负责为客人点单的服务员。',     icon: '🧑‍🍳', xp: 10, xPct: 31.3, yPct: 54.1 },
  { id: 'cafe-waiter-station', chinese: '服务台', pinyin: 'fúwùtái',    english: 'waiter station', description: '服务员准备饮料和食物的工作台。', icon: '🍽️', xp: 10, xPct: 100,  yPct: 0    },
];
