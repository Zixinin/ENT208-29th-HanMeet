export type ItemCategory = 'produce' | 'dairy' | 'bakery' | 'staples' | 'store';

export interface SupermarketItemDef {
  id: string;
  chinese: string;
  english: string;
  aisle: number;
  category: ItemCategory;
}

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  produce: 'produce',
  dairy: 'dairy',
  bakery: 'bakery',
  staples: 'staples',
  store: 'store',
};

export const SUPERMARKET_ITEMS: SupermarketItemDef[] = [
  { id: 'apple', chinese: '苹果', english: 'Apple', aisle: 1, category: 'produce' },
  { id: 'banana', chinese: '香蕉', english: 'Banana', aisle: 1, category: 'produce' },
  { id: 'tomato', chinese: '西红柿', english: 'Tomato', aisle: 1, category: 'produce' },
  { id: 'milk', chinese: '牛奶', english: 'Milk', aisle: 2, category: 'dairy' },
  { id: 'egg', chinese: '鸡蛋', english: 'Egg', aisle: 2, category: 'dairy' },
  { id: 'bread', chinese: '面包', english: 'Bread', aisle: 3, category: 'bakery' },
  { id: 'rice', chinese: '大米', english: 'Rice', aisle: 4, category: 'staples' },
  { id: 'water', chinese: '水', english: 'Water', aisle: 4, category: 'staples' },
  { id: 'poster', chinese: '海报', english: 'Poster', aisle: 5, category: 'store' },
  { id: 'shelf', chinese: '货架', english: 'Shelf', aisle: 5, category: 'store' },
  { id: 'cart', chinese: '购物车', english: 'Shopping Cart', aisle: 5, category: 'store' },
  { id: 'cashier', chinese: '收银员', english: 'Cashier', aisle: 5, category: 'store' },
];
