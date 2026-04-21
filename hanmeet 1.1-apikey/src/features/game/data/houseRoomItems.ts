import { RoomItem } from '../../../types/domain';

export const HOUSE_ROOM_ITEMS: RoomItem[] = [
  { id: 'house-tv',        chinese: '电视',   pinyin: 'diànshì',   english: 'TV',        description: '用来看节目的电子设备。',          icon: '📺', xp: 10, xPct: 52, yPct: 62 },
  { id: 'house-sofa',      chinese: '沙发',   pinyin: 'shāfā',     english: 'sofa',      description: '客厅里用来坐或躺的家具。',        icon: '🛋️', xp: 10, xPct: 52, yPct: 74 },
  { id: 'house-bed',       chinese: '床',     pinyin: 'chuáng',    english: 'bed',       description: '睡觉用的家具。',                  icon: '🛏️', xp: 10, xPct: 56, yPct: 18 },
  { id: 'house-bookshelf', chinese: '书架',   pinyin: 'shūjià',    english: 'bookshelf', description: '放书的架子。',                    icon: '📚', xp: 10, xPct: 84, yPct: 16 },
  { id: 'house-plant',     chinese: '植物',   pinyin: 'zhíwù',     english: 'plant',     description: '摆放在家里的绿色植物。',          icon: '🌿', xp: 10, xPct: 24, yPct: 36 },
  { id: 'house-stove',     chinese: '炉灶',   pinyin: 'lúzào',     english: 'stove',     description: '用来做饭加热食物的设备。',        icon: '🍳', xp: 10, xPct: 18, yPct: 72 },
  { id: 'house-fridge',    chinese: '冰箱',   pinyin: 'bīngxiāng', english: 'fridge',    description: '保持食物新鲜的冷藏电器。',        icon: '🧊', xp: 10, xPct: 15, yPct: 62 },
  { id: 'house-window',    chinese: '窗户',   pinyin: 'chuānghù',  english: 'window',    description: '让光线和空气进入房间的结构。',    icon: '🪟', xp: 10, xPct: 30, yPct: 8  },
];
