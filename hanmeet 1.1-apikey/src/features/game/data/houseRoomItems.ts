import { RoomItem } from '../../../types/domain';

export const HOUSE_ROOM_ITEMS: RoomItem[] = [
  // ── Garden / greenhouse (top-left room) ──────────────────────────────
  { id: 'house-plant-1', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct:  5, yPct: 12 },
  { id: 'house-plant-2', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct: 10, yPct: 18 },
  { id: 'house-plant-3', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct: 15, yPct: 12 },
  { id: 'house-plant-4', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '摆放在家里的绿色植物。', icon: '🌿', xp: 10, xPct:  8, yPct: 25 },

  // ── Bedroom (top-center room) ─────────────────────────────────────────
  { id: 'house-bed',       chinese: '床',     pinyin: 'chuáng',        english: 'bed',      description: '睡觉用的家具。',              icon: '🛏️', xp: 10, xPct: 43, yPct: 16 },
  { id: 'house-plant-5',   chinese: '植物',   pinyin: 'zhíwù',         english: 'plant',    description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 30, yPct: 10 },
  { id: 'house-plant-6',   chinese: '植物',   pinyin: 'zhíwù',         english: 'plant',    description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 35, yPct: 20 },
  { id: 'house-dresser',   chinese: '梳妆台', pinyin: 'shūzhuāng tái', english: 'dresser',  description: '放衣物和梳妆用品的家具。',     icon: '🪞', xp: 10, xPct: 40, yPct: 28 },
  { id: 'house-window-1',  chinese: '窗户',   pinyin: 'chuānghù',      english: 'window',   description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 52, yPct:  6 },

  // ── Cozy lounge (top-right room) ─────────────────────────────────────
  { id: 'house-armchair',    chinese: '扶手椅', pinyin: 'fúshǒu yǐ', english: 'armchair',  description: '有扶手的舒适椅子。',          icon: '🛋️', xp: 10, xPct: 82, yPct: 22 },
  { id: 'house-bookshelf-1', chinese: '书架',   pinyin: 'shūjià',    english: 'bookshelf', description: '放书的架子。',                icon: '📚', xp: 10, xPct: 87, yPct: 14 },
  { id: 'house-fireplace',   chinese: '壁炉',   pinyin: 'bìlú',      english: 'fireplace', description: '燃烧木材取暖的炉子。',        icon: '🔥', xp: 15, xPct: 88, yPct: 34 },
  { id: 'house-tv-wall',     chinese: '电视',   pinyin: 'diànshì',   english: 'TV',        description: '用来看节目的电子设备。',      icon: '📺', xp: 10, xPct: 78, yPct: 10 },
  { id: 'house-plant-7',     chinese: '植物',   pinyin: 'zhíwù',     english: 'plant',     description: '摆放在家里的绿色植物。',      icon: '🌿', xp: 10, xPct: 72, yPct: 28 },

  // ── Main living room (centre) ─────────────────────────────────────────
  { id: 'house-tv',       chinese: '电视', pinyin: 'diànshì',  english: 'TV',    description: '用来看节目的电子设备。',    icon: '📺', xp: 10, xPct: 52, yPct: 52 },
  { id: 'house-sofa-1',   chinese: '沙发', pinyin: 'shāfā',    english: 'sofa',  description: '客厅里用来坐或躺的家具。',  icon: '🛋️', xp: 10, xPct: 52, yPct: 66 },
  { id: 'house-rug',      chinese: '地毯', pinyin: 'dìtǎn',    english: 'rug',   description: '铺在地板上的织物装饰品。',  icon: '🟫', xp: 10, xPct: 52, yPct: 60 },
  { id: 'house-plant-8',  chinese: '植物', pinyin: 'zhíwù',    english: 'plant', description: '摆放在家里的绿色植物。',    icon: '🌿', xp: 10, xPct: 62, yPct: 46 },
  { id: 'house-window-2', chinese: '窗户', pinyin: 'chuānghù', english: 'window', description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 70, yPct: 48 },
  { id: 'house-chair-1',  chinese: '椅子', pinyin: 'yǐzi',     english: 'chair', description: '供人坐下休息的家具。',       icon: '🪑', xp: 10, xPct: 68, yPct: 58 },
  { id: 'house-chair-2',  chinese: '椅子', pinyin: 'yǐzi',     english: 'chair', description: '供人坐下休息的家具。',       icon: '🪑', xp: 10, xPct: 75, yPct: 58 },

  // ── Kitchen (bottom-left room) ────────────────────────────────────────
  { id: 'house-stove',    chinese: '炉灶', pinyin: 'lúzào',    english: 'stove',  description: '用来做饭加热食物的设备。',    icon: '🍳', xp: 10, xPct: 18, yPct: 72 },
  { id: 'house-fridge',   chinese: '冰箱', pinyin: 'bīngxiāng', english: 'fridge', description: '保持食物新鲜的冷藏电器。', icon: '🧊', xp: 10, xPct: 13, yPct: 62 },
  { id: 'house-shelf',    chinese: '架子', pinyin: 'jiàzi',    english: 'shelf',  description: '厨房里放物品的架子。',        icon: '🗄️', xp: 10, xPct:  7, yPct: 55 },
  { id: 'house-window-3', chinese: '窗户', pinyin: 'chuānghù', english: 'window', description: '让光线和空气进入房间的结构。', icon: '🪟', xp: 10, xPct: 28, yPct:  6 },

  // ── Study / bottom-right area ─────────────────────────────────────────
  { id: 'house-sofa-2',      chinese: '沙发', pinyin: 'shāfā',  english: 'sofa',      description: '客厅里用来坐或躺的家具。', icon: '🛋️', xp: 10, xPct: 50, yPct: 80 },
  { id: 'house-bookshelf-2', chinese: '书架', pinyin: 'shūjià', english: 'bookshelf', description: '放书的架子。',              icon: '📚', xp: 10, xPct: 88, yPct: 82 },
  { id: 'house-bookshelf-3', chinese: '书架', pinyin: 'shūjià', english: 'bookshelf', description: '放书的架子。',              icon: '📚', xp: 10, xPct: 88, yPct: 88 },
  { id: 'house-lamp',        chinese: '台灯', pinyin: 'táidēng', english: 'lamp',     description: '放在桌上照明的灯。',       icon: '💡', xp: 10, xPct: 42, yPct: 68 },
];
