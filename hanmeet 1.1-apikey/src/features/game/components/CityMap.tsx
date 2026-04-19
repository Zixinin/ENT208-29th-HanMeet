import React, { useRef, useEffect, useState } from 'react';
import { Building } from '../../../types/domain';
import {
  CITY_GRID, CITY_COLS, CITY_ROWS, TILE_SIZE,
  BUILDINGS, NPCS,
} from '../data/cityLayout';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useCamera } from '../hooks/useCamera';
import { PlayerSprite } from './PlayerSprite';

const TILE_COLORS: Record<string, string> = {
  grass: '#5a9e4a',
  path: '#c8a96a',
  road: '#4a4a5a',
  sidewalk: '#b0a898',
  tree: '#2d7a2d',
  wall: '#6a8cb8',
  door: '#e2b96f',
  water: '#3a6ea5',
  flower: '#7ec87e',
};

const TILE_ICONS: Record<string, string> = {
  tree: '🌲',
  flower: '🌸',
  door: '🚪',
};

interface Props {
  outfitColor: string;
  onEnterBuilding: (buildingId: Building['id']) => void;
}

export function CityMap({ outfitColor, onEnterBuilding }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState({ w: 800, h: 560 });
  const { player, teleport } = usePlayerMovement(18, 12);
  const { camX, camY } = useCamera(player, viewSize.w, viewSize.h);

  const [nearDoor, setNearDoor] = useState<Building | null>(null);
  const [npcHint, setNpcHint] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const px = Math.floor(player.x / TILE_SIZE);
    const py = Math.floor(player.y / TILE_SIZE);

    const near = BUILDINGS.find((b) =>
      Math.abs(px - b.doorX) <= 1 && Math.abs(py - b.doorY) <= 2
    );
    setNearDoor(near ?? null);

    const nearNpc = NPCS.find((n) =>
      Math.abs(px - n.tileX) <= 2 && Math.abs(py - n.tileY) <= 2
    );
    setNpcHint(nearNpc?.hint ?? null);
  }, [player.x, player.y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && nearDoor) {
        onEnterBuilding(nearDoor.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearDoor, onEnterBuilding]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#1a1a2e',
        cursor: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          transform: `translate(${-camX}px, ${-camY}px)`,
          width: CITY_COLS * TILE_SIZE,
          height: CITY_ROWS * TILE_SIZE,
          imageRendering: 'pixelated',
        }}
      >
        {CITY_GRID.map((row, ry) =>
          row.map((tile, cx) => (
            <div
              key={`${ry}-${cx}`}
              style={{
                position: 'absolute',
                left: cx * TILE_SIZE,
                top: ry * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: TILE_COLORS[tile] ?? '#5a9e4a',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: TILE_SIZE * 0.55,
                lineHeight: 1,
              }}
            >
              {TILE_ICONS[tile] ?? ''}
            </div>
          ))
        )}

        {BUILDINGS.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.tileX * TILE_SIZE,
              top: (b.tileY - 1) * TILE_SIZE,
              width: b.tileW * TILE_SIZE,
              textAlign: 'center',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              color: b.color,
              textShadow: '2px 2px 0 #000',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 4px',
            }}
          >
            {b.label} {b.chineseLabel}
          </div>
        ))}

        {NPCS.map((npc) => (
          <div
            key={npc.id}
            style={{
              position: 'absolute',
              left: npc.tileX * TILE_SIZE + 8,
              top: npc.tileY * TILE_SIZE + 4,
              fontSize: 28,
              lineHeight: 1,
              filter: 'drop-shadow(2px 2px 0 #000)',
            }}
          >
            {npc.emoji}
          </div>
        ))}

        <PlayerSprite player={player} outfitColor={outfitColor} />
      </div>

      {nearDoor && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          background: 'rgba(0,0,0,0.85)',
          border: '3px solid var(--pixel-border)',
          color: 'var(--pixel-yellow)',
          padding: '10px 16px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          zIndex: 30,
        }}>
          Press [E] to enter {nearDoor.label}
        </div>
      )}

      {npcHint && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          background: 'rgba(0,0,0,0.85)',
          border: '3px solid var(--pixel-green)',
          color: 'var(--pixel-green)',
          padding: '10px 16px',
          textAlign: 'center',
          maxWidth: 320,
          zIndex: 30,
        }}>
          💬 {npcHint}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.8,
      }}>
        WASD / ↑↓←→ move<br />
        E = enter building
      </div>
    </div>
  );
}
