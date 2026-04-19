import React, { useState, useEffect } from 'react';
import { Difficulty, SpaceId, VocabularyItem, InteriorItem, NotebookEntry } from '../../types/domain';
import { CityMap } from './components/CityMap';
import { SupermarketInterior } from './components/SupermarketInterior';
import { ClassroomInterior } from './components/ClassroomInterior';
import { CafeInterior } from './components/CafeInterior';
import { FlashcardQuiz } from './components/FlashcardQuiz';

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
  notebook: NotebookEntry[];
  onGradeNotebook: (id: string, grade: number) => void;
}

export function GameTab({
  outfitColor,
  onGainXp,
  onAddNotebook,
  notebook,
  onGradeNotebook,
}: GameTabProps) {
  const [scene, setScene] = useState<Scene>('city');
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    if (scene !== 'city') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') setQuizOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene]);

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
        <>
          <CityMap
            outfitColor={outfitColor ?? '#4d96ff'}
            onEnterBuilding={(id) => setScene(id as Scene)}
          />
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            fontFamily: "'Press Start 2P', monospace", fontSize: 7,
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, zIndex: 10, pointerEvents: 'none',
          }}>
            Q = Flashcard Quiz
          </div>
        </>
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
