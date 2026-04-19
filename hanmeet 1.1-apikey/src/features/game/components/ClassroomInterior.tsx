import React, { useState, useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';
import { ITEMS } from '../data';
import { VocabPopup } from './VocabPopup';

const ITEM_POSITIONS: { id: string; x: number; y: number }[] = [
  { id: 'blackboard', x: 280, y: 60  },
  { id: 'clock',      x: 540, y: 40  },
  { id: 'map',        x: 80,  y: 80  },
  { id: 'projector',  x: 400, y: 50  },
  { id: 'desk',       x: 120, y: 260 },
  { id: 'chair',      x: 120, y: 340 },
  { id: 'book',       x: 240, y: 280 },
  { id: 'pen',        x: 320, y: 280 },
  { id: 'eraser',     x: 400, y: 280 },
  { id: 'ruler',      x: 480, y: 280 },
  { id: 'backpack',   x: 560, y: 340 },
  { id: 'window',     x: 660, y: 160 },
];

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function ClassroomInterior({ onExit, onSave, onGainXp }: Props) {
  const [selectedItem, setSelectedItem] = useState<InteriorItem | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedItem) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, selectedItem]);

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'zh-CN';
    speechSynthesis.speak(utt);
  };

  const handleClick = (item: InteriorItem) => {
    setSelectedItem(item);
    if (!discovered.has(item.id)) {
      onGainXp(item.xp);
      setDiscovered((d) => new Set([...d, item.id]));
    }
  };

  const items: InteriorItem[] = ITEMS
    .filter((i) => i.spaceId === 'classroom')
    .map((i) => {
      const pos = ITEM_POSITIONS.find((p) => p.id === i.id);
      return {
        id: i.id,
        spaceId: i.spaceId,
        chinese: i.chinese,
        pinyin: i.pinyin,
        english: i.english,
        xp: i.xp,
        icon: i.icon ?? '📦',
        x: pos?.x ?? 100,
        y: pos?.y ?? 100,
      };
    });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#f5f0e0',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Floor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-conic-gradient(#e8dfc0 0% 25%, #d8cfa8 0% 50%)',
        backgroundSize: '48px 48px',
        opacity: 0.6,
      }} />

      {/* Back wall - green chalkboard */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '38%',
        background: 'linear-gradient(180deg, #2d5a27 0%, #3a7032 100%)',
        borderBottom: '8px solid #1a3a18',
      }} />

      {/* Chalkboard */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '15%',
        width: '60%',
        height: 100,
        background: '#1e4020',
        border: '6px solid #8b6914',
        boxShadow: '4px 4px 0 #000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
      }}>
        欢迎来到教室 Welcome to Classroom
      </div>

      {/* Window */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 40,
        width: 80,
        height: 90,
        background: 'linear-gradient(135deg, #87ceeb, #b0e0ff)',
        border: '6px solid #8b6914',
        boxShadow: '4px 4px 0 #000',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: '#8b6914' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, background: '#8b6914' }} />
      </div>

      {/* Desk rows (decorative) */}
      {[240, 310, 380].map((y) => (
        <div key={y} style={{ display: 'flex', position: 'absolute', top: y, left: 60, gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 100, height: 50,
              background: '#c8a464',
              border: '3px solid #8b6428',
              boxShadow: '3px 3px 0 #000',
            }} />
          ))}
        </div>
      ))}

      {/* Items */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 40, height: 40,
              background: discovered.has(item.id) ? '#4a7a3a' : 'var(--pixel-yellow)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              position: 'relative',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {item.icon}
            {discovered.has(item.id) && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pixel-green)', border: '2px solid #000',
                borderRadius: '50%', width: 14, height: 14,
                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          <div style={{
            fontSize: 6, color: '#000',
            background: 'rgba(255,255,255,0.85)',
            padding: '2px 4px', border: '1px solid #000',
            whiteSpace: 'nowrap',
          }}>
            {item.chinese}
          </div>
        </div>
      ))}

      <button onClick={onExit} style={{
        position: 'absolute', top: 12, left: 12, zIndex: 30,
        fontFamily: "'Press Start 2P', monospace", fontSize: 8,
        padding: '8px 12px', background: 'var(--pixel-accent)',
        border: '3px solid #000', boxShadow: '3px 3px 0 #000',
        color: '#fff', cursor: 'pointer',
      }}>← EXIT</button>

      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, color: '#000', background: 'rgba(255,255,255,0.9)',
        border: '3px solid #000', padding: '6px 14px', zIndex: 30,
      }}>教室 CLASSROOM</div>

      {selectedItem && (
        <VocabPopup item={selectedItem} onClose={() => setSelectedItem(null)} onSave={onSave} onSpeak={speak} />
      )}
    </div>
  );
}
