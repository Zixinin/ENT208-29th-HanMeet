import React from 'react';
import { Difficulty, SpaceId, VocabularyItem } from '../../types/domain';
import { Supermarket3DGame } from './components/Supermarket3DGame';

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

export function GameTab({ level, xp, onGainXp, onAddNotebook }: GameTabProps) {
  return (
    <div className="h-full bg-zinc-950">
      <Supermarket3DGame
        level={level}
        xp={xp}
        onGainXp={onGainXp}
        onAddNotebook={onAddNotebook}
      />
    </div>
  );
}
