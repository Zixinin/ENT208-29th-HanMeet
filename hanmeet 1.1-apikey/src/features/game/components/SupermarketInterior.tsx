import React, { useState, useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';
import { ITEMS } from '../data';
import { VocabPopup } from './VocabPopup';

const ITEM_POSITIONS: { id: string; x: number; y: number }[] = [
  { id: 'apple',    x: 80,  y: 180 },
  { id: 'banana',   x: 160, y: 180 },
  { id: 'tomato',   x: 240, y: 180 },
  { id: 'milk',     x: 380, y: 180 },
  { id: 'egg',      x: 460, y: 180 },
  { id: 'water',    x: 540, y: 180 },
  { id: 'bread',    x: 160, y: 300 },
  { id: 'rice',     x: 380, y: 300 },
  { id: 'shelf',    x: 620, y: 220 },
  { id: 'poster',   x: 60,  y: 90  },
  { id: 'cart',     x: 680, y: 400 },
  { id: 'cashier',  x: 680, y: 120 },
];

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function SupermarketInterior({ onExit, onSave, onGainXp }: Props) {
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

  // Convert VocabularyItem[] to InteriorItem[] with positioned coordinates
  const items: InteriorItem[] = ITEMS
    .filter((i) => i.spaceId === 'supermarket')
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
      background: 'linear-gradient(180deg, #c8f0ff 0%, #e8f8ff 40%, #f0f4e8 100%)',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Floor tiles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Checkerboard floor */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '55%',
        backgroundImage: 'repeating-conic-gradient(#e8d5b0 0% 25%, #d4c090 0% 50%)',
        backgroundSize: '48px 48px',
        opacity: 0.5,
      }} />

      {/* Back wall */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, #7ec0f0 0%, #b8daf0 100%)',
        borderBottom: '6px solid #5a9cc8',
      }} />

      {/* Shelf rows */}
      {[140, 250].map((y) => (
        <div key={y} style={{
          position: 'absolute',
          top: y,
          left: 60,
          right: 60,
          height: 60,
          background: '#8b6914',
          border: '4px solid #5a4010',
          boxShadow: '0 4px 0 #3a2808',
        }} />
      ))}

      {/* Ceiling lights */}
      {[100, 280, 460, 640].map((x) => (
        <div key={x} style={{
          position: 'absolute',
          top: 0,
          left: x,
          width: 80,
          height: 12,
          background: 'rgba(255,255,220,0.9)',
          boxShadow: `0 0 30px 10px rgba(255,255,200,0.3)`,
        }} />
      ))}

      {/* Vocabulary items */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: 56,
            height: 56,
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
              width: 44,
              height: 44,
              background: discovered.has(item.id) ? '#4a7a3a' : '#c8a420',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              position: 'relative',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {item.icon}
            {discovered.has(item.id) && (
              <div style={{
                position: 'absolute',
                top: -6, right: -6,
                background: 'var(--pixel-green)',
                border: '2px solid #000',
                borderRadius: '50%',
                width: 14, height: 14,
                fontSize: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          <div style={{
            fontSize: 6,
            color: '#000',
            background: 'rgba(255,255,255,0.85)',
            padding: '2px 4px',
            border: '1px solid #000',
            whiteSpace: 'nowrap',
          }}>
            {item.chinese}
          </div>
        </div>
      ))}

      {/* Exit button */}
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          padding: '8px 12px',
          background: 'var(--pixel-accent)',
          border: '3px solid #000',
          boxShadow: '3px 3px 0 #000',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 30,
        }}
      >
        ← EXIT
      </button>

      {/* Room label */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 10,
        color: '#000',
        background: 'rgba(255,255,255,0.9)',
        border: '3px solid #000',
        padding: '6px 14px',
        zIndex: 30,
      }}>
        超市 SUPERMARKET
      </div>

      {selectedItem && (
        <VocabPopup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={onSave}
          onSpeak={speak}
        />
      )}
    </div>
  );
}
