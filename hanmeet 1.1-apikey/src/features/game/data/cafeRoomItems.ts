import { RoomItem } from '../../../types/domain';

export const CAFE_ROOM_ITEMS: RoomItem[] = [
  { id: 'cafe-barrel',    chinese: '木桶',       pinyin: 'mùtǒng',         english: 'barrel',      description: '存放咖啡豆的木质容器。',        icon: '🪣', xp: 10, xPct: 14, yPct: 19 },
  { id: 'cafe-coffee',    chinese: '咖啡',       pinyin: 'kāfēi',          english: 'coffee',      description: '用咖啡豆冲泡的提神饮料。',      icon: '☕', xp: 10, xPct: 22, yPct: 39 },
  { id: 'cafe-plant',     chinese: '植物',       pinyin: 'zhíwù',          english: 'plant',       description: '咖啡厅里摆放的绿色植物。',      icon: '🌿', xp: 10, xPct: 47, yPct: 30 },
  { id: 'cafe-bookshelf', chinese: '书架',       pinyin: 'shūjià',         english: 'bookshelf',   description: '放书的架子，旁边有壁炉。',      icon: '📚', xp: 10, xPct: 82, yPct: 28 },
  { id: 'cafe-sofa',      chinese: '沙发',       pinyin: 'shāfā',          english: 'sofa',        description: '柔软舒适的坐卧家具。',          icon: '🛋️', xp: 10, xPct: 16, yPct: 70 },
  { id: 'cafe-table',     chinese: '桌子',       pinyin: 'zhuōzi',         english: 'table',       description: '咖啡厅里的木制餐桌。',          icon: '🪑', xp: 10, xPct: 50, yPct: 55 },
  { id: 'cafe-chair',     chinese: '椅子',       pinyin: 'yǐzi',           english: 'chair',       description: '供人坐下休息的家具。',          icon: '🪑', xp: 10, xPct: 68, yPct: 65 },
  { id: 'cafe-fireplace', chinese: '壁炉',       pinyin: 'bìlú',           english: 'fireplace',   description: '燃烧木材取暖的炉子。',          icon: '🔥', xp: 15, xPct: 82, yPct: 42 },
];
