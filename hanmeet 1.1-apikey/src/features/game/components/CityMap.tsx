import React, { useEffect, useState } from 'react';
import { Building } from '../../../types/domain';
import { CITY_ENGINE_CONFIG, BUILDING_ENTRIES } from '../data/cityLayout';
import { useTileEngine } from '../hooks/useTileEngine';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

interface Props {
  outfitColor: string;
  onEnterBuilding: (buildingId: Building['id']) => void;
}

export function CityMap({ onEnterBuilding }: Props) {
  const { canvasRef, containerRef, scale, nearInteractable, nearBuilding } =
    useTileEngine(CITY_ENGINE_CONFIG);

  const [activeItem, setActiveItem] = useState<typeof nearInteractable>(null);
  const [comingSoon, setComingSoon] = useState<typeof BUILDING_ENTRIES[0] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') { setActiveItem(null); setComingSoon(null); return; }
      if (key !== 'e') return;
      if (nearInteractable) { setActiveItem(nearInteractable); return; }
      if (nearBuilding) {
        if (nearBuilding.inProgress) { setComingSoon(nearBuilding); return; }
        onEnterBuilding(nearBuilding.id as Building['id']);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearInteractable, nearBuilding, onEnterBuilding]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#1e3510' }}
    >
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          imageRendering: 'pixelated',
        }}
      />

      {/* HUD */}
      <div style={{
        position: 'absolute', left: 12, top: 12, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'Press Start 2P', monospace", fontSize: 7,
        color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)',
        border: '2px solid rgba(0,0,0,0.4)', padding: '6px 8px', lineHeight: 1.8,
      }}>
        WASD / ARROWS = MOVE<br />E = ENTER / INSPECT<br />ESC = CLOSE
      </div>

      {/* Interact prompt */}
      {nearInteractable && !activeItem && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.86)', border: '3px solid #83d68e', color: '#b8ffbe',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          Press [E] to inspect {nearInteractable.chinese}
        </div>
      )}

      {/* Enter building prompt */}
      {!nearInteractable && nearBuilding && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          background: 'rgba(0,0,0,0.85)',
          border: `3px solid ${nearBuilding.inProgress ? '#8a6a2e' : '#dfbe69'}`,
          color: nearBuilding.inProgress ? '#c8a060' : '#ffe59a',
          padding: '8px 12px', whiteSpace: 'nowrap', zIndex: 30,
        }}>
          {nearBuilding.inProgress
            ? `🚧 ${nearBuilding.chineseLabel} — Coming Soon`
            : `Press [E] to enter ${nearBuilding.label}`}
        </div>
      )}

      {/* Vocab popup */}
      {activeItem && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 360, maxWidth: 520, background: 'rgba(17,24,28,0.94)',
          border: '4px solid #e2bc73', color: '#f5e7ca', padding: '12px 14px', zIndex: 42,
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 10, color: '#ffe59a', marginBottom: 6 }}>{activeItem.chinese}</div>
          <div style={{ fontSize: 7, color: '#90d7ff', marginBottom: 8 }}>{activeItem.pinyin}</div>
          <div style={{ fontSize: 7, color: '#d9f4d8' }}>{activeItem.description}</div>
        </div>
      )}

      {/* Coming soon popup */}
      {comingSoon && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)',
          minWidth: 340, background: 'rgba(40,24,8,0.94)', border: '4px solid #8a6a2e',
          color: '#e8d4a0', padding: '12px 14px', zIndex: 42, textAlign: 'center',
          fontFamily: "'Press Start 2P', monospace", lineHeight: 1.8,
        }}>
          <div style={{ fontSize: 10, color: '#d4a84b', marginBottom: 6 }}>🚧 {comingSoon.chineseLabel}</div>
          <div style={{ fontSize: 7, color: '#c8b880' }}>{comingSoon.label} — 即将开放</div>
          <div style={{ fontSize: 6, color: '#9a8860', marginTop: 6 }}>Coming Soon · Press ESC to close</div>
        </div>
      )}
    </div>
  );
}
