import { CATEGORY_LABEL, ItemCategory, SupermarketItemDef } from '../data/supermarket3d';

export type QuestObjective =
  | { kind: 'find-item'; itemId: string }
  | { kind: 'category-count'; category: ItemCategory; required: number }
  | { kind: 'combo'; itemIds: string[] }
  | { kind: 'collect-total'; required: number };

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  objective: QuestObjective;
}

export interface QuestProgress {
  current: number;
  target: number;
  isComplete: boolean;
}

export interface QuestState {
  inventoryIds: string[];
  completedQuestCount: number;
}

interface RecipeCombo {
  title: string;
  description: string;
  itemIds: string[];
  xpReward: number;
}

const COMBOS: RecipeCombo[] = [
  {
    title: 'Quick Breakfast',
    description: 'Gather 牛奶 and 鸡蛋 for a quick breakfast prep.',
    itemIds: ['milk', 'egg'],
    xpReward: 26,
  },
  {
    title: 'Simple Stir-Fry',
    description: 'Pick up 洋葱, 西红柿, and 木铲 for stir-fry prep.',
    itemIds: ['onion', 'tomato', 'spatula'],
    xpReward: 34,
  },
  {
    title: 'Noodle Night Kit',
    description: 'Find 方便面, 酱油, and 平底锅 for noodle night.',
    itemIds: ['instant-noodles', 'soy-sauce', 'frying-pan'],
    xpReward: 34,
  },
];

function pickRandom<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function serializeQuest(quest: Quest): string {
  return JSON.stringify(quest);
}

export function deserializeQuest(raw: string | null): Quest | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Quest;
    if (!parsed || !parsed.id || !parsed.objective) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function computeQuestProgress(quest: Quest, inventoryIds: string[], items: SupermarketItemDef[]): QuestProgress {
  const inventorySet = new Set(inventoryIds);

  switch (quest.objective.kind) {
    case 'find-item': {
      const objective = quest.objective;
      const hasItem = inventorySet.has(objective.itemId);
      return {
        current: hasItem ? 1 : 0,
        target: 1,
        isComplete: hasItem,
      };
    }

    case 'category-count': {
      const objective = quest.objective;
      const matchingIds = items
        .filter((item) => item.category === objective.category)
        .map((item) => item.id);
      const current = matchingIds.filter((id) => inventorySet.has(id)).length;
      return {
        current,
        target: objective.required,
        isComplete: current >= objective.required,
      };
    }

    case 'combo': {
      const objective = quest.objective;
      const current = objective.itemIds.filter((itemId) => inventorySet.has(itemId)).length;
      return {
        current,
        target: objective.itemIds.length,
        isComplete: current >= objective.itemIds.length,
      };
    }

    case 'collect-total': {
      const objective = quest.objective;
      const current = inventoryIds.length;
      return {
        current,
        target: objective.required,
        isComplete: current >= objective.required,
      };
    }

    default:
      return { current: 0, target: 1, isComplete: false };
  }
}

function buildFindItemQuest(items: SupermarketItemDef[], inventorySet: Set<string>, random: () => number): Quest {
  const candidates = items.filter((item) => !inventorySet.has(item.id));
  const pool = candidates.length ? candidates : items;
  const target = pickRandom(pool, random);

  return {
    id: `quest-find-${target.id}-${Date.now()}`,
    title: `Aisle ${target.aisle} Search`,
    description: `Look for ${target.chinese} in aisle ${target.aisle}.`,
    xpReward: 18,
    objective: {
      kind: 'find-item',
      itemId: target.id,
    },
  };
}

function buildCategoryQuest(items: SupermarketItemDef[], inventorySet: Set<string>, random: () => number): Quest {
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const viable = categories.filter((category) => {
    const total = items.filter((item) => item.category === category).length;
    return total >= 2;
  });

  const chosenCategory = pickRandom(viable.length ? viable : categories, random);
  const totalInCategory = items.filter((item) => item.category === chosenCategory).length;
  const ownedInCategory = items.filter((item) => item.category === chosenCategory && inventorySet.has(item.id)).length;
  const required = Math.min(totalInCategory, Math.max(2, ownedInCategory + 1));

  return {
    id: `quest-category-${chosenCategory}-${Date.now()}`,
    title: 'Section Sweep',
    description: `Collect ${required} ${CATEGORY_LABEL[chosenCategory]} items for restocking.`,
    xpReward: 24,
    objective: {
      kind: 'category-count',
      category: chosenCategory,
      required,
    },
  };
}

function buildComboQuest(items: SupermarketItemDef[], inventorySet: Set<string>, random: () => number): Quest {
  const byId = new Map(items.map((item) => [item.id, item]));
  const viable = COMBOS.filter((combo) => combo.itemIds.some((itemId) => !inventorySet.has(itemId) && byId.has(itemId)));
  const recipe = pickRandom(viable.length ? viable : COMBOS, random);

  return {
    id: `quest-combo-${recipe.itemIds.join('-')}-${Date.now()}`,
    title: recipe.title,
    description: recipe.description,
    xpReward: recipe.xpReward,
    objective: {
      kind: 'combo',
      itemIds: recipe.itemIds,
    },
  };
}

function buildCollectTotalQuest(items: SupermarketItemDef[], inventoryCount: number): Quest {
  const target = Math.min(items.length, inventoryCount + 3);

  return {
    id: `quest-total-${target}-${Date.now()}`,
    title: 'Basket Run',
    description: `Collect any items until your basket reaches ${target}.`,
    xpReward: 20,
    objective: {
      kind: 'collect-total',
      required: target,
    },
  };
}

export function generateQuest(state: QuestState, items: SupermarketItemDef[], random: () => number = Math.random): Quest {
  const inventorySet = new Set(state.inventoryIds);

  if (state.inventoryIds.length >= items.length) {
    const targetItem = pickRandom(items, random);
    return {
      id: `quest-victory-lap-${targetItem.id}-${Date.now()}`,
      title: 'Victory Lap',
      description: `Take one more look and interact with ${targetItem.chinese} for practice.`,
      xpReward: 16,
      objective: {
        kind: 'find-item',
        itemId: targetItem.id,
      },
    };
  }

  const builders = [
    () => buildFindItemQuest(items, inventorySet, random),
    () => buildCategoryQuest(items, inventorySet, random),
    () => buildComboQuest(items, inventorySet, random),
    () => buildCollectTotalQuest(items, state.inventoryIds.length),
  ];

  const weights = [0.35, 0.2, 0.3, 0.15];
  const roll = random();
  let acc = 0;

  for (let i = 0; i < builders.length; i += 1) {
    acc += weights[i];
    if (roll <= acc) {
      return builders[i]();
    }
  }

  return builders[0]();
}

export function describeQuestProgress(quest: Quest, progress: QuestProgress, items: SupermarketItemDef[]): string {
  if (quest.objective.kind === 'find-item') {
    const objective = quest.objective;
    const target = items.find((item) => item.id === objective.itemId);
    if (!target) return `${progress.current}/${progress.target}`;
    return `${target.chinese} (${target.english})`;
  }

  if (quest.objective.kind === 'category-count') {
    const objective = quest.objective;
    return `${progress.current}/${progress.target} ${CATEGORY_LABEL[objective.category]}`;
  }

  if (quest.objective.kind === 'combo') {
    const objective = quest.objective;
    const names = objective.itemIds
      .map((id) => items.find((item) => item.id === id)?.chinese)
      .filter(Boolean)
      .join(' + ');
    return `${progress.current}/${progress.target} • ${names}`;
  }

  return `${progress.current}/${progress.target} items`;
}
