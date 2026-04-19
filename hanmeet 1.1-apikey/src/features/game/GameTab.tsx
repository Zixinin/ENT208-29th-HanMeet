import React, { useState } from 'react';
import { Difficulty, SpaceId, VocabularyItem, InteriorItem } from '../../types/domain';
import { CityMap } from './components/CityMap';
import { SupermarketInterior } from './components/SupermarketInterior';
import { ClassroomInterior } from './components/ClassroomInterior';
import { CafeInterior } from './components/CafeInterior';

type Scene = 'city' | 'supermarket' | 'school' | 'cafe';

interface GameTabProps {
  level: number;
  xp: number;
  selectedDifficulty: Difficulty;
  unlockedSpaces: SpaceId[];
  avatarPresetId: string;
  outfitColor: string;
  discoveredHiddenItemIds: string[];
  onSetDifficulty: (difficulty: Difficulty) => void;
  onGainXp: (xp: number) => void;
  onAddNotebook: (item: VocabularyItem) => void;
  onDiscoverHiddenItem: (itemId: string) => void;
}

export function GameTab({
  outfitColor,
  onGainXp,
  onAddNotebook,
}: GameTabProps) {
  const [scene, setScene] = useState<Scene>('city');

  const handleSave = (item: InteriorItem) => {
    onAddNotebook({
      id: item.id,
      spaceId: item.spaceId,
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      x: item.x,
      y: item.y,
      difficulty: 'easy',
      rarity: 'common',
      xp: item.xp,
      icon: item.icon,
    });
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {scene === 'city' && (
        <CityMap
          outfitColor={outfitColor ?? '#4d96ff'}
          onEnterBuilding={(id) => setScene(id as Scene)}
        />
      )}
      {scene === 'supermarket' && (
        <SupermarketInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
      {scene === 'school' && (
        <ClassroomInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
      {scene === 'cafe' && (
        <CafeInterior
          onExit={() => setScene('city')}
          onSave={handleSave}
          onGainXp={onGainXp}
        />
      )}
    </div>
  );
}
