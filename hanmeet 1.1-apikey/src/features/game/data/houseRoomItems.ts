import { RoomItem } from '../../../types/domain';

export const HOUSE_ROOM_ITEMS: RoomItem[] = [
  // Kitchen / dining
  { id: 'house-dining-table-chair', chinese: '餐桌和椅子', pinyin: 'cānzhuō hé yǐzi', english: 'dining table and chair', description: '吃饭用的桌椅。',           icon: '🍽️', xp: 10, xPct: 12.3, yPct: 72.5 },
  { id: 'house-kitchen',            chinese: '厨房',       pinyin: 'chúfáng',         english: 'kitchen',                description: '做饭的房间。',             icon: '🍳', xp: 10, xPct: 16.1, yPct: 56.8 },
  { id: 'house-fridge',             chinese: '冰箱',       pinyin: 'bīngxiāng',       english: 'fridge',                 description: '保持食物新鲜的冷藏电器。', icon: '🧊', xp: 10, xPct: 24,   yPct: 51   },

  // Balcony / outdoor
  { id: 'house-balcony',            chinese: '阳台',       pinyin: 'yángtái',         english: 'balcony',                description: '房屋外侧可站立休息的空间。', icon: '🌤️', xp: 10, xPct: 12.6, yPct: 93.3 },
  { id: 'house-garden',             chinese: '花园',       pinyin: 'huāyuán',         english: 'garden',                 description: '种植花草树木的室外空间。', icon: '🌳', xp: 10, xPct:  5.4, yPct: 26.7 },
  { id: 'house-chair-outdoor',      chinese: '椅子',       pinyin: 'yǐzi',            english: 'chair',                  description: '供人坐下休息的家具。',     icon: '🪑', xp: 10, xPct:  9.5, yPct: 18.9 },
  { id: 'house-plants-1',           chinese: '植物',       pinyin: 'zhíwù',           english: 'plants',                 description: '摆放在家里的绿色植物。',   icon: '🌿', xp: 10, xPct: 17.9, yPct: 31   },

  // Living room
  { id: 'house-tv',                 chinese: '电视',       pinyin: 'diànshì',         english: 'TV',                     description: '用来看节目的电子设备。',   icon: '📺', xp: 10, xPct: 42.6, yPct: 54   },
  { id: 'house-sofa-1',             chinese: '沙发',       pinyin: 'shāfā',           english: 'sofa',                   description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 34,   yPct: 65.3 },
  { id: 'house-rug-1',              chinese: '地毯',       pinyin: 'dìtǎn',           english: 'rug',                    description: '铺在地板上的织物装饰品。', icon: '🟫', xp: 10, xPct: 43.3, yPct: 66   },
  { id: 'house-lamp',               chinese: '灯',         pinyin: 'dēng',            english: 'lamps',                  description: '用于照明的灯。',           icon: '💡', xp: 10, xPct: 49,   yPct: 56.2 },
  { id: 'house-aquarium',           chinese: '鱼缸',       pinyin: 'yúgāng',          english: 'aquarium',               description: '养鱼的玻璃缸。',           icon: '🐠', xp: 10, xPct: 44.3, yPct: 77.4 },
  { id: 'house-window',             chinese: '窗户',       pinyin: 'chuānghù',        english: 'window',                 description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 56,   yPct: 69.1 },
  { id: 'house-plants-2',           chinese: '植物',       pinyin: 'zhíwù',           english: 'plants',                 description: '摆放在家里的绿色植物。',   icon: '🪴', xp: 10, xPct: 28.6, yPct: 81.9 },

  // Secondary area
  { id: 'house-sofa-3',             chinese: '沙发',       pinyin: 'shāfā',           english: 'sofa',                   description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 79.1, yPct: 72.6 },
  { id: 'house-sofa-4',             chinese: '沙发',       pinyin: 'shāfā',           english: 'sofa',                   description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 73.2, yPct: 79.4 },
  { id: 'house-rug-2',              chinese: '地毯',       pinyin: 'dìtǎn',           english: 'rug',                    description: '铺在地板上的织物装饰品。', icon: '🟫', xp: 10, xPct: 79.6, yPct: 80.2 },
  { id: 'house-bookshelf-1',        chinese: '书架',       pinyin: 'shūjià',          english: 'bookshelf',              description: '放书的架子。',             icon: '📚', xp: 10, xPct: 62.3, yPct: 91.2 },

  // Bedroom
  { id: 'house-bed',                chinese: '床',         pinyin: 'chuáng',          english: 'bed',                    description: '睡觉用的家具。',           icon: '🛏️', xp: 10, xPct: 54.5, yPct: 20.2 },
  { id: 'house-sofa-2',             chinese: '沙发',       pinyin: 'shāfā',           english: 'sofa',                   description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 68.3, yPct: 26.3 },
  { id: 'house-cabinet',            chinese: '柜子',       pinyin: 'guìzi',           english: 'cabinet',                description: '收纳物品的家具。',         icon: '🗄️', xp: 10, xPct: 46.9, yPct: 20.4 },
  { id: 'house-table',              chinese: '桌子',       pinyin: 'zhuōzi',          english: 'table',                  description: '放物品和工作的桌子。',     icon: '🪑', xp: 10, xPct: 62.5, yPct: 28   },
  { id: 'house-sofa-5',             chinese: '沙发',       pinyin: 'shāfā',           english: 'sofa',                   description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 53.6, yPct: 29.3 },
  { id: 'house-rug-3',              chinese: '地毯',       pinyin: 'dìtǎn',           english: 'rug',                    description: '铺在地板上的织物装饰品。', icon: '🟫', xp: 10, xPct: 45.4, yPct: 29.4 },

  // Study / library
  { id: 'house-wooden-chair-1',     chinese: '木椅',       pinyin: 'mùyǐ',            english: 'wooden chair',           description: '木制椅子。',               icon: '🪑', xp: 10, xPct: 64.9, yPct: 57.5 },
  { id: 'house-wooden-chair-2',     chinese: '木椅',       pinyin: 'mùyǐ',            english: 'wooden chair',           description: '木制椅子。',               icon: '🪑', xp: 10, xPct: 73.8, yPct: 56.9 },
  { id: 'house-fireplace',          chinese: '壁炉',       pinyin: 'bìlú',            english: 'fire place',             description: '燃烧木材取暖的炉子。',     icon: '🔥', xp: 15, xPct: 83.6, yPct: 17.2 },
  { id: 'house-bookshelf-2',        chinese: '书架',       pinyin: 'shūjià',          english: 'bookshelf',              description: '放书的架子。',             icon: '📚', xp: 10, xPct: 65.8, yPct: 18.6 },
  { id: 'house-sofa-2b',            chinese: '沙发',       pinyin: 'shāfā',           english: 'armchair',               description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 90.7, yPct: 19.9 },
  { id: 'house-tea-table',          chinese: '茶几',       pinyin: 'chájī',           english: 'tea table',              description: '客厅中的小桌子。',         icon: '🫖', xp: 10, xPct: 86.8, yPct: 24.5 },
  { id: 'house-telephone',          chinese: '电话',       pinyin: 'diànhuà',         english: 'telephone',              description: '用于通话的设备。',         icon: '☎️', xp: 10, xPct: 28.8, yPct: 20.4 },
];
