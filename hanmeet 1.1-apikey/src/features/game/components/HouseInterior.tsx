import React, { useEffect, useState } from 'react';
import { InteriorItem } from '../../../types/domain';
import { HOUSE_ENGINE_CONFIG } from '../data/houseLayout';
import { useTileEngine } from '../hooks/useTileEngine';
import { InteractableConfig } from '../../../types/tileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  onExit: () => void;
  onSave: (item: InteriorItem) => void;
  onGainXp: (xp: number) => void;
}

export function HouseInterior({ onExit, onSave, onGainXp }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable } = useTileEngine(HOUSE_ENGINE_CONFIG);
  const [activeItem, setActiveItem] = useState<InteractableConfig | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { if (activeItem) { setActiveItem(null); } else { onExit(); } return; }
      if (key === 'e' && nearInteractable) {
        setActiveItem(nearInteractable);
        if (!discovered.has(nearInteractable.id)) {
          onGainXp(10);
          setDiscovered((d: Set<string>) => new Set([...d, nearInteractable.id]));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, activeItem, onExit, discovered, onGainXp]);

  const handleSave = () => {
    if (!activeItem) return;
    onSave({
      id: activeItem.id,
      spaceId: 'supermarket', // SpaceId workaround — 'house' not yet in domain union
      chinese: activeItem.chinese,
      pinyin: activeItem.pinyin,
      english: activeItem.english ?? '',
      xp: 10,
      icon: '🏠',
      x: activeItem.tileX,
      y: activeItem.tileY,
    });
    setActiveItem(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#1a0f00' }}>
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center', imageRendering: 'pixelated',
        }}
      />

      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        住宅 — House<br />
        WASD = MOVE · E = INSPECT<br />
        ESC = EXIT
      </div>

      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #f7c97a', color: '#ffe59a',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] · {nearInteractable.chinese}
        </div>
      )}

      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(28,18,8,0.96)',
          border: '4px solid #c8a86a', color: '#f5e7ca', padding: '14px 16px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 14, color: '#ffe59a', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 8, color: '#f0c070', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#e8d4a0', marginBottom: 10 }}>{activeItem.description}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#4a2a08', border: '2px solid #c8a86a', color: '#ffe59a', cursor: 'pointer',
            }}>+ Notebook</button>
            <button onClick={() => setActiveItem(null)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: '6px 10px',
              background: '#1a1a1a', border: '2px solid #555', color: '#aaa', cursor: 'pointer',
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
