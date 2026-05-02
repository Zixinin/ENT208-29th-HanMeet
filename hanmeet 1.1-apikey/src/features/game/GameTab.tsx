import React, { useState, useEffect } from 'react';
import { InteriorItem, NotebookEntry, VocabularyItem, Difficulty, SpaceId, RoomItem } from '../../types/domain';
import { RoomSelect } from './components/RoomSelect';
import type { RoomId } from './components/RoomSelect';
import { RoomInterior } from './components/RoomInterior';
import { FlashcardQuiz } from './components/FlashcardQuiz';
import { CAFE_ROOM_ITEMS } from './data/cafeRoomItems';
import { SUPERMARKET_ROOM_ITEMS } from './data/supermarketRoomItems';
import { HOUSE_ROOM_ITEMS } from './data/houseRoomItems';
import { ReviewGrade } from '../notebook/reviewEngine';
import { ActiveRoomInfo } from './types/tasks';

type Scene = 'select' | RoomId;

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
  notebook: NotebookEntry[];
  onGradeNotebook: (id: string, grade: ReviewGrade) => void;
  onActiveRoomChange: (info: ActiveRoomInfo | null) => void;
}

const ROOM_ITEMS: Record<RoomId, RoomItem[]> = {
  cafe:        CAFE_ROOM_ITEMS,
  supermarket: SUPERMARKET_ROOM_ITEMS,
  house:       HOUSE_ROOM_ITEMS,
};

export function GameTab({ onGainXp, onAddNotebook, notebook, onGradeNotebook, avatarPresetId, onActiveRoomChange }: GameTabProps) {
  const [scene, setScene] = useState<Scene>('select');
  const [quizOpen, setQuizOpen] = useState(false);
  const [foundCount, setFoundCount] = useState(0);

  useEffect(() => {
    if (scene !== 'select') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') setQuizOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene]);

  const handleSave = (item: InteriorItem) => {
    onGainXp(item.xp);
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
    if (scene !== 'select') {
      const roomId = scene as RoomId;
      setFoundCount(prev => {
        const next = prev + 1;
        onActiveRoomChange({ roomId, found: next, total: ROOM_ITEMS[roomId].length });
        return next;
      });
    }
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', position: 'relative' }}>
      {scene === 'select' && (
        <RoomSelect
          onEnter={(id) => {
            setFoundCount(0);
            setScene(id);
            onActiveRoomChange({ roomId: id, found: 0, total: ROOM_ITEMS[id].length });
          }}
        />
      )}

      {(scene === 'cafe' || scene === 'supermarket' || scene === 'house') && (
        <RoomInterior
          roomId={scene}
          items={ROOM_ITEMS[scene]}
          avatarPresetId={avatarPresetId}
          onBack={() => {
            setFoundCount(0);
            setScene('select');
            onActiveRoomChange(null);
          }}
          onSave={handleSave}
        />
      )}

      {quizOpen && (
        <FlashcardQuiz
          entries={notebook}
          onClose={() => setQuizOpen(false)}
          onGrade={onGradeNotebook}
        />
      )}
    </div>
  );
}
