import React from 'react';
import type { DifficultyLevel } from '../types/tasks';

export interface DifficultyModalProps {
  roomLabel: string;
  roomEmoji: string;
  onSelect: (level: DifficultyLevel) => void;
  onCancel: () => void;
}

interface LevelConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
  color: string;
  bg: string;
}

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'EXPLORE',
    description: 'Find items → learn vocab',
    color: '#000',
    bg: '#83d68e',
  },
  {
    level: 2,
    name: 'QUIZ',
    description: 'Find items → pinyin / MC quiz',
    color: '#000',
    bg: '#ffe59a',
  },
  {
    level: 3,
    name: 'CHALLENGE',
    description: 'Shopping list / Timed / Recipe',
    color: '#000',
    bg: '#7ec8e3',
  },
];

export function DifficultyModal({ roomLabel, roomEmoji, onSelect, onCancel }: DifficultyModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "'Press Start 2P', monospace",
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${roomLabel} — select difficulty level`}
        style={{
          background: '#1a1a2e',
          border: '3px solid #4a4a6e',
          boxShadow: '6px 6px 0 #000',
          padding: '28px 32px',
          minWidth: 340,
          maxWidth: 480,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          color: '#ffe59a',
          fontSize: 9,
          letterSpacing: 1,
          marginBottom: 24,
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          {roomEmoji} {roomLabel.toUpperCase()} — SELECT LEVEL
        </div>

        {/* Level rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LEVELS.map(({ level, name, description, color, bg }) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              style={{
                background: '#2a2a3e',
                border: '2px solid #4a4a6e',
                boxShadow: '3px 3px 0 #000',
                cursor: 'pointer',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: "'Press Start 2P', monospace",
                textAlign: 'left',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Level badge */}
              <span style={{
                background: bg,
                color,
                fontSize: 7,
                padding: '4px 8px',
                border: '2px solid #000',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                LV.{level}
              </span>

              {/* Name + description */}
              <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: bg, fontSize: 8 }}>
                  {name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 6 }}>
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 7,
              fontFamily: "'Press Start 2P', monospace",
              padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
