import React, { useState, useEffect, useRef } from 'react';
import { RoomItem, InteriorItem, SpaceId } from '../../../types/domain';
import { useRoomEngine, ROOM_W, ROOM_H } from '../hooks/useRoomEngine';
import { VocabPopup } from './VocabPopup';
import type { RoomId } from './RoomSelect';
import { RetroAudioSystem } from '../systems/audioSystem';
import { speakMandarin } from '../systems/speechSystem';
import type { Task, TaskProgress, DifficultyLevel, ChallengeMode } from '../types/tasks';
import {
  generateFindTask,
  generateShoppingList,
  generateTimedSprint,
  generateRecipeCombo,
  getNextChallengeMode,
  readChallengeModeIndex,
  advanceChallengeModeIndex,
} from '../systems/roomTaskSystem';
import { TaskCard } from './TaskCard';
import { QuizPopup } from './QuizPopup';

const BG: Record<RoomId, string> = {
  cafe:        '/rooms/cafe-interior.jpeg',
  supermarket: '/rooms/supermarket-interior.png',
  house:       '/rooms/house-interior.jpeg',
};

const SPACE_ID: Record<RoomId, SpaceId> = {
  cafe:        'cafe',
  supermarket: 'supermarket',
  house:       'house',
};

function toInteriorItem(item: RoomItem, roomId: RoomId): InteriorItem {
  return {
    id: item.id,
    spaceId: SPACE_ID[roomId],
    chinese: item.chinese,
    pinyin: item.pinyin,
    english: item.english,
    icon: item.icon,
    xp: item.xp,
    x: Math.round((item.xPct / 100) * ROOM_W),
    y: Math.round((item.yPct / 100) * ROOM_H),
  };
}

function NearItemHighlight({ nearItem }: { nearItem: RoomItem | null }) {
  if (!nearItem) return null;
  return (
    <div style={{
      position: 'absolute',
      left: `${nearItem.xPct}%`,
      top: `${nearItem.yPct}%`,
      transform: 'translate(-50%, -50%)',
      width: 34,
      height: 34,
      borderRadius: '50%',
      boxShadow: '0 0 30px 14px rgba(255, 220, 80, 0.9)',
      background: 'rgba(255, 220, 80, 0.2)',
      pointerEvents: 'none',
      zIndex: 6,
    }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: '2px solid rgba(255, 234, 140, 0.95)',
        boxShadow: '0 0 18px 5px rgba(255, 215, 100, 0.7)',
        animation: 'room-near-pulse 1.2s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 14,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: '#ffffff',
        background: 'rgba(0,0,0,0.75)',
        padding: '3px 6px',
        whiteSpace: 'nowrap',
        borderRadius: 2,
      }}>
        {nearItem.chinese}
      </div>
    </div>
  );
}

interface Props {
  roomId: RoomId;
  items: RoomItem[];
  difficultyLevel: DifficultyLevel;
  avatarPresetId?: string;
  onBack: () => void;
  onSave: (item: InteriorItem) => void;
}

export function RoomInterior({ roomId, items, difficultyLevel, avatarPresetId, onBack, onSave }: Props) {
  const { canvasRef, containerRef, scale, nearItem } = useRoomEngine({ items, avatarPresetId });
  const [activeItem, setActiveItem] = useState<RoomItem | null>(null);
  const [audio] = useState(() => new RetroAudioSystem());

  const [challengeMode] = useState<ChallengeMode>(() => {
    if (difficultyLevel !== 3) return 'shopping-list';
    return getNextChallengeMode(readChallengeModeIndex(roomId));
  });

  const [currentTask, setCurrentTask] = useState<Task | null>(() => {
    if (difficultyLevel === 1 || difficultyLevel === 2) return generateFindTask(items, []);
    if (challengeMode === 'shopping-list') return generateShoppingList(items, 4);
    if (challengeMode === 'timed-sprint') return generateTimedSprint();
    return generateRecipeCombo(roomId);
  });
  const [foundChinese, setFoundChinese] = useState<string[]>([]);
  const [inspectedCount, setInspectedCount] = useState(0);
  const [quizItem, setQuizItem] = useState<RoomItem | null>(null);

  // Track which item was open just before the popup closed, for LV.1 task completion.
  // IMPORTANT: if a click/touch path to open the popup is added later, it must also set lastInspectedRef.current.
  const lastInspectedRef = useRef<RoomItem | null>(null);

  // Refs so the popup-close effect always sees current prop values without re-registering on every render.
  const difficultyLevelRef = useRef(difficultyLevel);
  difficultyLevelRef.current = difficultyLevel;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { setActiveItem(null); return; }
      if (key === 'e' && nearItem && !activeItem) {
        audio.playUiClick();
        lastInspectedRef.current = nearItem;
        setActiveItem(nearItem);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearItem, activeItem, audio]);

  // LV.1 / LV.2: when the popup closes, award XP (LV.1) or show quiz (LV.2)
  useEffect(() => {
    if (activeItem !== null) return; // popup just opened or still open
    const inspected = lastInspectedRef.current;
    if (!inspected) return;

    if (difficultyLevelRef.current === 1) {
      // LV.1: award XP immediately on popup close
      const interiorItem = toInteriorItem(inspected, roomIdRef.current);
      audio.playPickup();
      onSaveRef.current(interiorItem);
      const inspectedChinese = inspected.chinese;
      const nextFoundChinese = [...foundChinese, inspectedChinese];
      setFoundChinese(nextFoundChinese);
      lastInspectedRef.current = null;
      setTimeout(() => {
        setCurrentTask(generateFindTask(items, nextFoundChinese));
      }, 500);
    } else if (difficultyLevelRef.current === 2) {
      // LV.2: update found state, then show quiz (XP deferred to quiz completion)
      const inspectedChinese = inspected.chinese;
      if (!foundChinese.includes(inspectedChinese)) {
        setFoundChinese(prev => [...prev, inspectedChinese]);
      }
      setInspectedCount(c => c + 1);
      setQuizItem(inspected);
      lastInspectedRef.current = null;
    } else if (difficultyLevelRef.current === 3) {
      const inspectedChinese = inspected.chinese;
      if (!foundChinese.includes(inspectedChinese)) {
        setFoundChinese(prev => [...prev, inspectedChinese]);
      }
      // Award XP for every item inspected in LV.3
      const interiorItem = toInteriorItem(inspected, roomIdRef.current);
      audio.playPickup();
      onSaveRef.current(interiorItem);
      // Shopping list completion check
      if (challengeMode === 'shopping-list' && currentTask && currentTask.kind === 'shopping-list') {
        const listChinese = currentTask.items.map(i => i.chinese);
        if (listChinese.includes(inspectedChinese)) {
          const alreadyFound = foundChinese.filter(c => listChinese.includes(c));
          const alreadyIncludes = alreadyFound.includes(inspectedChinese);
          const newCount = alreadyIncludes ? alreadyFound.length : alreadyFound.length + 1;
          if (newCount >= currentTask.items.length) {
            advanceChallengeModeIndex(roomIdRef.current);
          }
        }
      }
      lastInspectedRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem]);

  const speak = (text: string) => {
    audio.playUiClick();
    speakMandarin(text);
  };

  const quizFormat = inspectedCount % 2 === 0 ? 'pinyin' : 'mc';

  const taskProgress: TaskProgress = (() => {
    if (!currentTask) return { current: 0, target: 1, isComplete: false };
    if (currentTask.kind === 'find-item') {
      const done = foundChinese.includes(currentTask.targetChinese);
      return { current: done ? 1 : 0, target: 1, isComplete: done };
    }
    if (currentTask.kind === 'shopping-list') {
      const listChinese = currentTask.items.map(i => i.chinese);
      const found = foundChinese.filter(c => listChinese.includes(c)).length;
      return { current: found, target: currentTask.items.length, isComplete: found >= currentTask.items.length };
    }
    if (currentTask.kind === 'timed-sprint') {
      return { current: foundChinese.length, target: Infinity, isComplete: false };
    }
    if (currentTask.kind === 'recipe-combo') {
      const found = currentTask.targetChinese.filter(c => foundChinese.includes(c)).length;
      return { current: found, target: currentTask.targetChinese.length, isComplete: found >= currentTask.targetChinese.length };
    }
    return { current: 0, target: 1, isComplete: false };
  })();

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#000' }}
    >
      {/* Scaled scene wrapper: bg image + character canvas, both in virtual 1280×720 space */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: ROOM_W, height: ROOM_H,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center',
      }}>
        <img
          src={BG[roomId]}
          alt="room"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'fill',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
        <style>{`
          @keyframes room-near-pulse {
            0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
          }
        `}</style>
        <NearItemHighlight nearItem={nearItem} />
        <canvas
          ref={canvasRef}
          width={ROOM_W}
          height={ROOM_H}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
        />
      </div>

      {/* Back button — screen space, not scaled */}
      <button
        onClick={() => {
          audio.playUiClick();
          onBack();
        }}
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 20,
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.75)', border: '2px solid #4a4a6e',
          color: '#aaaacc', padding: '6px 10px', cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      {/* HUD — screen space */}
      <div style={{
        position: 'absolute', left: 12, top: 44, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.45)', background: 'rgba(0,0,0,0.5)',
        padding: '4px 8px', lineHeight: 1.8,
      }}>
        WASD / ARROWS = MOVE{'  '}·{'  '}E = INSPECT{'  '}·{'  '}ESC = CLOSE
      </div>

      {/* Proximity prompt — screen space */}
      {nearItem && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.88)', border: '3px solid #83d68e', color: '#b8ffbe',
          padding: '8px 14px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          [E] inspect {nearItem.chinese}
        </div>
      )}

      {/* Vocab popup */}
      {activeItem && (
        <VocabPopup
          item={toInteriorItem(activeItem, roomId)}
          onClose={() => setActiveItem(null)}
          onSave={(_interiorItem) => {
            // LV.1 XP via useEffect on activeItem close; LV.2 XP via QuizPopup; LV.3 wired in Tasks 11–13
            setActiveItem(null);
          }}
          onSpeak={speak}
        />
      )}

      {/* Task card — screen space, bottom-right */}
      {currentTask && (
        <TaskCard
          task={currentTask}
          progress={taskProgress}
          difficultyLevel={difficultyLevel}
        />
      )}

      {/* LV.2 quiz — fires after VocabPopup closes */}
      {quizItem && difficultyLevel === 2 && (
        <QuizPopup
          item={quizItem}
          allItems={items}
          format={quizFormat}
          onComplete={(correct) => {
            if (correct) audio.playPickup();
            onSave(toInteriorItem(quizItem, roomIdRef.current));
            const nextFound = foundChinese.includes(quizItem.chinese)
              ? foundChinese
              : [...foundChinese, quizItem.chinese];
            setCurrentTask(generateFindTask(items, nextFound));
            setQuizItem(null);
          }}
        />
      )}
    </div>
  );
}
