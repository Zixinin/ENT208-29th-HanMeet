import { AvatarPreset, Space, SpaceId, VocabularyItem } from '../../types/domain';

export const SPACE_ORDER: SpaceId[] = ['classroom', 'supermarket', 'dorm', 'cafeteria'];

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'red-fox', name: 'Red Fox', emoji: '🦊', accent: '#ef4444' },
  { id: 'mint-cat', name: 'Mint Cat', emoji: '🐱', accent: '#10b981' },
  { id: 'sky-bird', name: 'Sky Bird', emoji: '🐦', accent: '#0ea5e9' },
  { id: 'sun-lion', name: 'Sun Lion', emoji: '🦁', accent: '#f59e0b' },
  { id: 'violet-panda', name: 'Violet Panda', emoji: '🐼', accent: '#8b5cf6' },
  { id: 'rose-rabbit', name: 'Rose Rabbit', emoji: '🐰', accent: '#ec4899' },
  { id: 'teal-frog', name: 'Teal Frog', emoji: '🐸', accent: '#14b8a6' },
  { id: 'amber-bear', name: 'Amber Bear', emoji: '🐻', accent: '#d97706' },
  { id: 'indigo-whale', name: 'Indigo Whale', emoji: '🐳', accent: '#6366f1' },
  { id: 'green-turtle', name: 'Green Turtle', emoji: '🐢', accent: '#22c55e' },
];

export const SPACES: Space[] = [
  {
    id: 'classroom',
    name: 'Classroom',
    chineseName: '教室 (Jiàoshì)',
    backgroundImage: '/classroom_background.jpg',
    backgroundClass: 'from-amber-100 via-yellow-50 to-stone-200',
    itemIds: [
      'clock', 'blackboard', 'desk', 'chair', 'book', 'pen',
      'window', 'backpack', 'eraser', 'ruler', 'map', 'projector'
    ],
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    chineseName: '超市 (Chāoshì)',
    backgroundImage: '/supermarket_bg.jpg',
    backgroundClass: 'from-cyan-100 via-sky-50 to-slate-200',
    itemIds: [
      'poster', 'shelf', 'apple', 'milk', 'bread', 'cart',
      'banana', 'egg', 'rice', 'water', 'tomato', 'cashier'
    ],
  },
  {
    id: 'dorm',
    name: 'Dorm',
    chineseName: '宿舍 (Sùshè)',
    backgroundClass: 'from-indigo-100 via-violet-50 to-slate-200',
    itemIds: [
      'bed', 'lamp', 'pillow', 'blanket', 'laptop', 'phone',
      'closet', 'mirror', 'fan', 'shoes', 'notebook', 'key'
    ],
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    chineseName: '食堂 (Shítáng)',
    backgroundClass: 'from-orange-100 via-amber-50 to-zinc-200',
    itemIds: [
      'tray', 'chopsticks', 'spoon', 'rice-bowl', 'soup', 'tea',
      'dumpling', 'noodles', 'table', 'menu', 'kitchen', 'receipt'
    ],
  },
];

export const ITEMS: VocabularyItem[] = [
  // Classroom
  { id: 'clock', spaceId: 'classroom', chinese: '时钟', pinyin: 'shízhōng', english: 'Clock', x: 50, y: 14, difficulty: 'easy', rarity: 'common', xp: 12, icon: '⏰' },
  { id: 'blackboard', spaceId: 'classroom', chinese: '黑板', pinyin: 'hēibǎn', english: 'Blackboard', x: 50, y: 30, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🟩' },
  { id: 'desk', spaceId: 'classroom', chinese: '课桌', pinyin: 'kèzhuō', english: 'Desk', x: 30, y: 67, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🪑' },
  { id: 'chair', spaceId: 'classroom', chinese: '椅子', pinyin: 'yǐzi', english: 'Chair', x: 20, y: 77, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🪑' },
  { id: 'book', spaceId: 'classroom', chinese: '书', pinyin: 'shū', english: 'Book', x: 35, y: 61, difficulty: 'easy', rarity: 'common', xp: 10, icon: '📘' },
  { id: 'pen', spaceId: 'classroom', chinese: '笔', pinyin: 'bǐ', english: 'Pen', x: 45, y: 62, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🖊️' },
  { id: 'window', spaceId: 'classroom', chinese: '窗户', pinyin: 'chuānghu', english: 'Window', x: 80, y: 35, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🪟' },
  { id: 'backpack', spaceId: 'classroom', chinese: '书包', pinyin: 'shūbāo', english: 'Backpack', x: 15, y: 85, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🎒' },
  { id: 'eraser', spaceId: 'classroom', chinese: '橡皮', pinyin: 'xiàngpí', english: 'Eraser', x: 40, y: 59, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🧽' },
  { id: 'ruler', spaceId: 'classroom', chinese: '尺子', pinyin: 'chǐzi', english: 'Ruler', x: 54, y: 63, difficulty: 'medium', rarity: 'common', xp: 14, icon: '📏' },
  { id: 'map', spaceId: 'classroom', chinese: '地图', pinyin: 'dìtú', english: 'Map', x: 22, y: 27, difficulty: 'hard', rarity: 'common', xp: 18, icon: '🗺️' },
  { id: 'projector', spaceId: 'classroom', chinese: '投影仪', pinyin: 'tóuyǐngyí', english: 'Projector', x: 68, y: 22, difficulty: 'hard', rarity: 'hidden', xp: 25, icon: '📽️' },

  // Supermarket
  { id: 'poster', spaceId: 'supermarket', chinese: '海报', pinyin: 'hǎibào', english: 'Poster', x: 15, y: 25, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🪧' },
  { id: 'shelf', spaceId: 'supermarket', chinese: '货架', pinyin: 'huòjià', english: 'Shelf', x: 50, y: 45, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🗄️' },
  { id: 'apple', spaceId: 'supermarket', chinese: '苹果', pinyin: 'píngguǒ', english: 'Apple', x: 25, y: 42, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🍎' },
  { id: 'milk', spaceId: 'supermarket', chinese: '牛奶', pinyin: 'niúnǎi', english: 'Milk', x: 40, y: 38, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🥛' },
  { id: 'bread', spaceId: 'supermarket', chinese: '面包', pinyin: 'miànbāo', english: 'Bread', x: 60, y: 42, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🍞' },
  { id: 'cart', spaceId: 'supermarket', chinese: '购物车', pinyin: 'gòuwùchē', english: 'Shopping Cart', x: 75, y: 80, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🛒' },
  { id: 'banana', spaceId: 'supermarket', chinese: '香蕉', pinyin: 'xiāngjiāo', english: 'Banana', x: 30, y: 46, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🍌' },
  { id: 'egg', spaceId: 'supermarket', chinese: '鸡蛋', pinyin: 'jīdàn', english: 'Egg', x: 50, y: 40, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🥚' },
  { id: 'rice', spaceId: 'supermarket', chinese: '大米', pinyin: 'dàmǐ', english: 'Rice', x: 65, y: 56, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🍚' },
  { id: 'water', spaceId: 'supermarket', chinese: '水', pinyin: 'shuǐ', english: 'Water', x: 47, y: 52, difficulty: 'medium', rarity: 'common', xp: 14, icon: '💧' },
  { id: 'tomato', spaceId: 'supermarket', chinese: '西红柿', pinyin: 'xīhóngshì', english: 'Tomato', x: 35, y: 52, difficulty: 'hard', rarity: 'common', xp: 18, icon: '🍅' },
  { id: 'cashier', spaceId: 'supermarket', chinese: '收银员', pinyin: 'shōuyínyuán', english: 'Cashier', x: 84, y: 56, difficulty: 'hard', rarity: 'hidden', xp: 25, icon: '🧾' },

  // Dorm
  { id: 'bed', spaceId: 'dorm', chinese: '床', pinyin: 'chuáng', english: 'Bed', x: 23, y: 62, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🛏️' },
  { id: 'lamp', spaceId: 'dorm', chinese: '台灯', pinyin: 'táidēng', english: 'Lamp', x: 36, y: 39, difficulty: 'easy', rarity: 'common', xp: 12, icon: '💡' },
  { id: 'pillow', spaceId: 'dorm', chinese: '枕头', pinyin: 'zhěntou', english: 'Pillow', x: 18, y: 57, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🛌' },
  { id: 'blanket', spaceId: 'dorm', chinese: '被子', pinyin: 'bèizi', english: 'Blanket', x: 29, y: 65, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🧣' },
  { id: 'laptop', spaceId: 'dorm', chinese: '笔记本电脑', pinyin: 'bǐjìběn diànnǎo', english: 'Laptop', x: 54, y: 62, difficulty: 'medium', rarity: 'common', xp: 14, icon: '💻' },
  { id: 'phone', spaceId: 'dorm', chinese: '手机', pinyin: 'shǒujī', english: 'Phone', x: 60, y: 59, difficulty: 'easy', rarity: 'common', xp: 12, icon: '📱' },
  { id: 'closet', spaceId: 'dorm', chinese: '衣柜', pinyin: 'yīguì', english: 'Closet', x: 82, y: 43, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🚪' },
  { id: 'mirror', spaceId: 'dorm', chinese: '镜子', pinyin: 'jìngzi', english: 'Mirror', x: 72, y: 30, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🪞' },
  { id: 'fan', spaceId: 'dorm', chinese: '风扇', pinyin: 'fēngshàn', english: 'Fan', x: 50, y: 19, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🌀' },
  { id: 'shoes', spaceId: 'dorm', chinese: '鞋子', pinyin: 'xiézi', english: 'Shoes', x: 41, y: 82, difficulty: 'easy', rarity: 'common', xp: 12, icon: '👟' },
  { id: 'notebook', spaceId: 'dorm', chinese: '笔记本', pinyin: 'bǐjìběn', english: 'Notebook', x: 58, y: 50, difficulty: 'hard', rarity: 'common', xp: 18, icon: '📒' },
  { id: 'key', spaceId: 'dorm', chinese: '钥匙', pinyin: 'yàoshi', english: 'Key', x: 88, y: 84, difficulty: 'hard', rarity: 'hidden', xp: 25, icon: '🔑' },

  // Cafeteria
  { id: 'tray', spaceId: 'cafeteria', chinese: '托盘', pinyin: 'tuōpán', english: 'Tray', x: 24, y: 63, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🍽️' },
  { id: 'chopsticks', spaceId: 'cafeteria', chinese: '筷子', pinyin: 'kuàizi', english: 'Chopsticks', x: 37, y: 64, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🥢' },
  { id: 'spoon', spaceId: 'cafeteria', chinese: '勺子', pinyin: 'sháozi', english: 'Spoon', x: 41, y: 63, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🥄' },
  { id: 'rice-bowl', spaceId: 'cafeteria', chinese: '米饭', pinyin: 'mǐfàn', english: 'Rice Bowl', x: 31, y: 59, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🍚' },
  { id: 'soup', spaceId: 'cafeteria', chinese: '汤', pinyin: 'tāng', english: 'Soup', x: 49, y: 58, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🥣' },
  { id: 'tea', spaceId: 'cafeteria', chinese: '茶', pinyin: 'chá', english: 'Tea', x: 56, y: 59, difficulty: 'easy', rarity: 'common', xp: 10, icon: '🍵' },
  { id: 'dumpling', spaceId: 'cafeteria', chinese: '饺子', pinyin: 'jiǎozi', english: 'Dumpling', x: 63, y: 61, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🥟' },
  { id: 'noodles', spaceId: 'cafeteria', chinese: '面条', pinyin: 'miàntiáo', english: 'Noodles', x: 72, y: 63, difficulty: 'medium', rarity: 'common', xp: 14, icon: '🍜' },
  { id: 'table', spaceId: 'cafeteria', chinese: '桌子', pinyin: 'zhuōzi', english: 'Table', x: 52, y: 74, difficulty: 'easy', rarity: 'common', xp: 12, icon: '🧱' },
  { id: 'menu', spaceId: 'cafeteria', chinese: '菜单', pinyin: 'càidān', english: 'Menu', x: 15, y: 34, difficulty: 'medium', rarity: 'common', xp: 14, icon: '📋' },
  { id: 'kitchen', spaceId: 'cafeteria', chinese: '厨房', pinyin: 'chúfáng', english: 'Kitchen', x: 86, y: 37, difficulty: 'hard', rarity: 'common', xp: 18, icon: '👨‍🍳' },
  { id: 'receipt', spaceId: 'cafeteria', chinese: '小票', pinyin: 'xiǎopiào', english: 'Receipt', x: 11, y: 82, difficulty: 'hard', rarity: 'hidden', xp: 25, icon: '🧾' },
];

export const XP_PER_LEVEL = 120;
