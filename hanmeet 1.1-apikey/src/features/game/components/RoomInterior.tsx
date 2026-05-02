import React, { useState, useEffect, useRef } from 'react';
import { RoomItem, InteriorItem, SpaceId } from '../../../types/domain';
import { useRoomEngine, ROOM_W, ROOM_H } from '../hooks/useRoomEngine';
import { VocabPopup } from './VocabPopup';
import type { RoomId } from './RoomSelect';
import { RetroAudioSystem } from '../systems/audioSystem';
import { speakMandarin } from '../systems/speechSystem';
import type { Task, TaskProgress, DifficultyLevel } from '../types/tasks';
import { generateFindTask } from '../systems/roomTaskSystem';
import { TaskCard } from './TaskCard';

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

  const [currentTask, setCurrentTask] = useState<Task | null>(() =>
    generateFindTask(items, [])
  );
  const [foundChinese, setFoundChinese] = useState<string[]>([]);
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({ current: 0, target: 1, isComplete: false });

  // Track which item was open just before the popup closed, for LV.1 task completion
  const lastInspectedRef = useRef<RoomItem | null>(null);

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

  // LV.1: when the popup closes, award XP and advance to next task
  useEffect(() => {
    if (activeItem !== null) return; // popup just opened or still open
    const inspected = lastInspectedRef.current;
    if (!inspected || difficultyLevel !== 1) return;

    // Mark the item as found and complete the current task
    const interiorItem = toInteriorItem(inspected, roomId);
    audio.playPickup();
    onSave(interiorItem); // awards XP + adds to notebook
    // LV.2 quiz wired in Task 10
    const inspectedChinese = inspected.chinese;
    setFoundChinese(prev => [...prev, inspectedChinese]);
    setTaskProgress({ current: 1, target: 1, isComplete: true });
    lastInspectedRef.current = null; // clear so this doesn't re-fire

    setTimeout(() => {
      setFoundChinese(prev => {
        const next = generateFindTask(items, prev);
        setCurrentTask(next);
        return prev;
      });
      setTaskProgress({ current: 0, target: 1, isComplete: false });
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem]);

  const speak = (text: string) => {
    audio.playUiClick();
    speakMandarin(text);
  };

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
          onSave={(interiorItem) => {
            if (difficultyLevel !== 1) {
              // LV.1 XP is awarded on close (via useEffect); LV.2+ save is explicit
              audio.playPickup();
              onSave(interiorItem);
            }
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
    </div>
  );
}
