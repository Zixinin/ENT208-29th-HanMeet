import React, { useState, useEffect } from 'react';
import { InteriorItem } from '../../../types/domain';
import { CAFE_ITEMS } from '../data/cafeVocab';
import { VocabPopup } from './VocabPopup';

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function CafeInterior({ onExit, onSave, onGainXp }: Props) {
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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#2d1b0e',
      fontFamily: "'Press Start 2P', monospace",
      imageRendering: 'pixelated',
    }}>
      {/* Warm wood floor stripes */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,200,100,0.06) 0px, rgba(255,200,100,0.06) 1px, transparent 1px, transparent 60px)',
        backgroundSize: '60px 100%',
      }} />

      {/* Back wall - warm brick */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, #8b3a1a 0%, #a04820 100%)',
        borderBottom: '6px solid #5a2010',
      }} />

      {/* Counter */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '15%',
        width: '70%',
        height: 60,
        background: '#6b3a10',
        border: '4px solid #3a1808',
        boxShadow: '0 4px 0 #1a0804',
      }}>
        <div style={{
          position: 'absolute', top: 4, left: 8,
          fontSize: 9, color: 'var(--pixel-yellow)',
          fontFamily: "'Press Start 2P', monospace",
        }}>
          ☕ MENU: 菜单
        </div>
      </div>

      {/* Tables */}
      {[[120, 280], [340, 280], [560, 280], [240, 400], [460, 400]].map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          width: 80, height: 60,
          background: '#8b5a20',
          border: '3px solid #5a3010',
          boxShadow: '3px 3px 0 #000',
        }} />
      ))}

      {/* Items — percent-based positioning */}
      {CAFE_ITEMS.map((item) => (
        <div
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
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
              width: 44, height: 44,
              background: discovered.has(item.id) ? '#4a7a3a' : '#d4a420',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pixel-green)', border: '2px solid #000',
                borderRadius: '50%', width: 14, height: 14,
                fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</div>
            )}
          </div>
          <div style={{
            fontSize: 6, color: '#fff',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 4px', border: '1px solid var(--pixel-border)',
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
        fontSize: 10, color: 'var(--pixel-yellow)',
        background: 'rgba(0,0,0,0.85)',
        border: '3px solid var(--pixel-border)', padding: '6px 14px', zIndex: 30,
      }}>咖啡店 CAFÉ</div>

      {selectedItem && (
        <VocabPopup item={selectedItem} onClose={() => setSelectedItem(null)} onSave={onSave} onSpeak={speak} />
      )}
    </div>
  );
}
