import React, { useEffect, useState } from 'react';
import { PlayerState } from '../../../types/domain';

interface Props {
  player: PlayerState;
  outfitColor?: string;
}

const SUNNYSIDE_BASE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_STRIP = `${SUNNYSIDE_BASE}/Characters/Human/IDLE/base_idle_strip9.png`;
const RUN_STRIP = `${SUNNYSIDE_BASE}/Characters/Human/WALKING/base_walk_strip8.png`;

export function PlayerSprite({ player }: Props) {
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setAnimTick((n) => (n + 1) % 60), 120);
    return () => window.clearInterval(t);
  }, []);

  // Idle: 9 frames at 144px wide. Walking: 8 frames at 128px wide.
  const idleFrames = animTick % 9;
  const walkFrames = animTick % 8;
  const frame = player.moving ? walkFrames : idleFrames;
  const spriteSheet = player.moving ? RUN_STRIP : IDLE_STRIP;
  const stripWidth = player.moving ? 128 : 144;

  return (
    <div
      style={{
        position: 'absolute',
        left: player.x - 6,
        top: player.y - 24,
        width: 24,
        height: 48,
        zIndex: Math.floor(player.y / 32) + 40,
        imageRendering: 'pixelated',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        left: 4,
        right: 4,
        bottom: 4,
        height: 6,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '50%',
      }} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 24,
          height: 48,
          backgroundImage: `url(${spriteSheet})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${stripWidth}px 32px`,
          backgroundPosition: `${-frame * 16}px 0`,
          transform: 'scale(1.5)',
          transformOrigin: 'top left',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
