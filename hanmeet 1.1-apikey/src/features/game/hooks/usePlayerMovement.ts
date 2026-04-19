import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerState } from '../../../types/domain';
import { TILE_SIZE, CITY_COLS, CITY_ROWS, isBlocked } from '../data/cityLayout';

const SPEED = 3;

export function usePlayerMovement(initialX = 18, initialY = 12) {
  const [player, setPlayer] = useState<PlayerState>({
    x: initialX * TILE_SIZE,
    y: initialY * TILE_SIZE,
    facing: 'down',
    moving: false,
    frame: 0,
  });

  const keys = useRef<Set<string>>(new Set());
  const frameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const worldW = CITY_COLS * TILE_SIZE;
  const worldH = CITY_ROWS * TILE_SIZE;

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
      if (e.key.startsWith('Arrow')) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      frameCountRef.current++;
      setPlayer((prev) => {
        let dx = 0, dy = 0;
        const k = keys.current;
        if (k.has('arrowup') || k.has('w')) dy = -SPEED;
        if (k.has('arrowdown') || k.has('s')) dy = SPEED;
        if (k.has('arrowleft') || k.has('a')) dx = -SPEED;
        if (k.has('arrowright') || k.has('d')) dx = SPEED;

        if (dx === 0 && dy === 0) return prev.moving ? { ...prev, moving: false } : prev;

        const facing: PlayerState['facing'] =
          dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';

        const charW = 24, charH = 24;
        let nx = Math.max(0, Math.min(worldW - charW, prev.x + dx));
        let ny = Math.max(0, Math.min(worldH - charH, prev.y + dy));

        const tileCheck = (px: number, py: number) => {
          const tx = Math.floor(px / TILE_SIZE);
          const ty = Math.floor(py / TILE_SIZE);
          return isBlocked(tx, ty);
        };

        if (dx !== 0) {
          const edgeX = dx > 0 ? nx + charW - 1 : nx;
          if (tileCheck(edgeX, ny + 4) || tileCheck(edgeX, ny + charH - 5)) nx = prev.x;
        }
        if (dy !== 0) {
          const edgeY = dy > 0 ? ny + charH - 1 : ny;
          if (tileCheck(nx + 4, edgeY) || tileCheck(nx + charW - 5, edgeY)) ny = prev.y;
        }

        const frame = Math.floor(frameCountRef.current / 12) % 2;
        return { x: nx, y: ny, facing, moving: true, frame };
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [worldW, worldH]);

  const teleport = useCallback((tileX: number, tileY: number) => {
    setPlayer((p) => ({ ...p, x: tileX * TILE_SIZE, y: tileY * TILE_SIZE }));
  }, []);

  return { player, teleport };
}
