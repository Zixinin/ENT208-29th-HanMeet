import React from 'react';
import { PlayerState } from '../../../types/domain';

interface Props {
  player: PlayerState;
  outfitColor?: string;
}

export function PlayerSprite({ player, outfitColor = '#4d96ff' }: Props) {
  const bob = player.moving && player.frame === 1 ? -1 : 0;
  const facingArrow = { up: '▲', down: '▼', left: '◀', right: '▶' }[player.facing];

  return (
    <div
      style={{
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: 24,
        height: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        transform: `translateY(${bob}px)`,
        zIndex: 20,
        imageRendering: 'pixelated',
        pointerEvents: 'none',
      }}
    >
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: -2,
        width: 16,
        height: 6,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '50%',
      }} />

      {/* Head */}
      <div style={{
        width: 12,
        height: 12,
        background: '#f5c3a5',
        border: '2px solid #000',
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 6,
        lineHeight: 1,
      }}>
        {facingArrow}
      </div>

      {/* Body */}
      <div style={{
        width: 14,
        height: 10,
        background: outfitColor,
        border: '2px solid #000',
        borderRadius: '3px 3px 5px 5px',
        flexShrink: 0,
      }} />
    </div>
  );
}
