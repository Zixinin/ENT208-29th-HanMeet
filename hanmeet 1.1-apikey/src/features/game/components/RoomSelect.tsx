import React, { useState } from 'react';
import { DifficultyModal } from './DifficultyModal';
import type { RoomId, DifficultyLevel } from '../types/tasks';

export type { RoomId };

interface Room {
  id: RoomId;
  label: string;
  emoji: string;
  chinese: string;
  pinyin: string;
  exteriorSrc: string;
}

const ROOMS: Room[] = [
  { id: 'cafe',        label: 'CAFÉ',        emoji: '☕', chinese: '咖啡厅', pinyin: 'kāfēi tīng', exteriorSrc: '/rooms/cafe-exterior.jpeg' },
  { id: 'house',       label: 'HOUSE',       emoji: '🏠', chinese: '住宅',   pinyin: 'zhùzhái',    exteriorSrc: '/rooms/house-exterior.jpeg' },
  { id: 'supermarket', label: 'SUPERMARKET', emoji: '🛒', chinese: '超市',   pinyin: 'chāoshì',    exteriorSrc: '/rooms/supermarket-exterior.jpeg' },
];

interface Props {
  onEnter: (roomId: RoomId, level: DifficultyLevel) => void;
}

export function RoomSelect({ onEnter }: Props) {
  const [pendingRoom, setPendingRoom] = useState<RoomId | null>(null);

  const pendingRoomData = pendingRoom ? ROOMS.find(r => r.id === pendingRoom) : null;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#1a1a2e', gap: 40, padding: 24,
    }}>
      <h2 style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 17,
        color: '#ffe59a', margin: 0, letterSpacing: 2,
      }}>
        Choose a Location
      </h2>

      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => setPendingRoom(room.id)}
            style={{
              background: '#2a2a3e',
              border: '4px solid #4a4a6e',
              boxShadow: '6px 6px 0 #000',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 315,
              fontFamily: "'Press Start 2P', monospace",
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <img
              src={room.exteriorSrc}
              alt={room.label}
              style={{ width: '100%', imageRendering: 'pixelated', display: 'block', objectFit: 'cover', height: 240 }}
            />
            <div style={{ padding: '18px 15px', textAlign: 'center', width: '100%' }}>
              <div style={{ color: '#ffe59a', fontSize: 14, marginBottom: 8 }}>{room.label}</div>
              <div style={{ color: '#aaaacc', fontSize: 12, marginBottom: 5 }}>{room.chinese}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 14 }}>{room.pinyin}</div>
              <div style={{
                color: '#000', background: '#83d68e', fontSize: 10,
                padding: '7px 12px', border: '3px solid #000', display: 'inline-block',
              }}>
                Enter →
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 9,
        color: 'rgba(255,255,255,0.25)', marginTop: 8,
      }}>
        Q = Flashcard Quiz
      </div>

      {pendingRoom && pendingRoomData && (
        <DifficultyModal
          roomLabel={pendingRoomData.label}
          roomEmoji={pendingRoomData.emoji}
          onSelect={(level) => {
            onEnter(pendingRoom, level);
            setPendingRoom(null);
          }}
          onCancel={() => setPendingRoom(null)}
        />
      )}
    </div>
  );
}
