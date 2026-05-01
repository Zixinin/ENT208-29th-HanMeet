import { RoomItem } from '../../../types/domain';

export const CAFE_ROOM_ITEMS: RoomItem[] = [
  // ── Barrels (top-left row, 8 instances) ──────────────────────────────
  { id: 'cafe-barrel-1', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct:  4, yPct: 21 },
  { id: 'cafe-barrel-2', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct:  9, yPct: 21 },
  { id: 'cafe-barrel-3', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 14, yPct: 21 },
  { id: 'cafe-barrel-4', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 19, yPct: 21 },
  { id: 'cafe-barrel-5', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 24, yPct: 21 },
  { id: 'cafe-barrel-6', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 29, yPct: 21 },
  { id: 'cafe-barrel-7', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 34, yPct: 21 },
  { id: 'cafe-barrel-8', chinese: '木桶', pinyin: 'mùtǒng', english: 'barrel', description: '存放咖啡豆的木质容器。', icon: '🪣', xp: 10, xPct: 39, yPct: 21 },

  // ── Wall posters (3 frames on top wall) ──────────────────────────────
  { id: 'cafe-painting-1', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 22, yPct: 6 },
  { id: 'cafe-painting-2', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 36, yPct: 6 },
  { id: 'cafe-painting-3', chinese: '画', pinyin: 'huà', english: 'painting', description: '挂在墙上的装饰画。', icon: '🖼️', xp: 10, xPct: 48, yPct: 6 },

  // ── Wall lamps (2) ───────────────────────────────────────────────────
  { id: 'cafe-lamp-1', chinese: '壁灯', pinyin: 'bìdēng', english: 'wall lamp', description: '安装在墙上的照明灯。', icon: '💡', xp: 10, xPct: 13, yPct: 9 },
  { id: 'cafe-lamp-2', chinese: '壁灯', pinyin: 'bìdēng', english: 'wall lamp', description: '安装在墙上的照明灯。', icon: '💡', xp: 10, xPct: 44, yPct: 9 },

  // ── Counter / bar ────────────────────────────────────────────────────
  { id: 'cafe-counter', chinese: '吧台', pinyin: 'bātái', english: 'counter', description: '咖啡厅的服务台。', icon: '🍵', xp: 10, xPct: 20, yPct: 35 },

  // ── Coffee cups (one per seating area, 4) ────────────────────────────
  { id: 'cafe-coffee-1', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 14, yPct: 39 },
  { id: 'cafe-coffee-2', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 28, yPct: 39 },
  { id: 'cafe-coffee-3', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 52, yPct: 50 },
  { id: 'cafe-coffee-4', chinese: '咖啡', pinyin: 'kāfēi', english: 'coffee', description: '用咖啡豆冲泡的提神饮料。', icon: '☕', xp: 10, xPct: 17, yPct: 69 },

  // ── Tables (4 in the centre area) ────────────────────────────────────
  { id: 'cafe-table-1', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 38, yPct: 53 },
  { id: 'cafe-table-2', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 52, yPct: 56 },
  { id: 'cafe-table-3', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 17, yPct: 75 },
  { id: 'cafe-table-4', chinese: '桌子', pinyin: 'zhuōzi', english: 'table', description: '咖啡厅里的木制餐桌。', icon: '🪑', xp: 10, xPct: 52, yPct: 75 },

  // ── Chairs (2 per table, 8 total) ────────────────────────────────────
  { id: 'cafe-chair-1', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 34, yPct: 50 },
  { id: 'cafe-chair-2', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 42, yPct: 56 },
  { id: 'cafe-chair-3', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 48, yPct: 53 },
  { id: 'cafe-chair-4', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 56, yPct: 53 },
  { id: 'cafe-chair-5', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 13, yPct: 78 },
  { id: 'cafe-chair-6', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 21, yPct: 78 },
  { id: 'cafe-chair-7', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 48, yPct: 78 },
  { id: 'cafe-chair-8', chinese: '椅子', pinyin: 'yǐzi', english: 'chair', description: '供人坐下休息的家具。', icon: '🪑', xp: 10, xPct: 56, yPct: 78 },

  // ── Sofas (2) ────────────────────────────────────────────────────────
  { id: 'cafe-sofa-1', chinese: '沙发', pinyin: 'shāfā', english: 'sofa', description: '柔软舒适的坐卧家具。', icon: '🛋️', xp: 10, xPct: 18, yPct: 62 },
  { id: 'cafe-sofa-2', chinese: '沙发', pinyin: 'shāfā', english: 'sofa', description: '柔软舒适的坐卧家具。', icon: '🛋️', xp: 10, xPct: 12, yPct: 82 },

  // ── Plants (4) ───────────────────────────────────────────────────────
  { id: 'cafe-plant-1', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 42, yPct: 34 },
  { id: 'cafe-plant-2', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 38, yPct: 46 },
  { id: 'cafe-plant-3', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct: 46, yPct: 78 },
  { id: 'cafe-plant-4', chinese: '植物', pinyin: 'zhíwù', english: 'plant', description: '咖啡厅里摆放的绿色植物。', icon: '🌿', xp: 10, xPct:  8, yPct: 88 },

  // ── Right-side features ───────────────────────────────────────────────
  { id: 'cafe-fireplace', chinese: '壁炉', pinyin: 'bìlú',    english: 'fireplace', description: '燃烧木材取暖的炉子。',      icon: '🔥', xp: 15, xPct: 83, yPct: 42 },
  { id: 'cafe-bookshelf', chinese: '书架', pinyin: 'shūjià',  english: 'bookshelf', description: '放书的架子，旁边有壁炉。', icon: '📚', xp: 10, xPct: 85, yPct: 26 },
  { id: 'cafe-stool-1',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 62 },
  { id: 'cafe-stool-2',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 72 },
  { id: 'cafe-stool-3',   chinese: '凳子', pinyin: 'dèngzi',  english: 'stool',     description: '没有靠背的矮凳。',          icon: '🪑', xp: 10, xPct: 90, yPct: 80 },
];
