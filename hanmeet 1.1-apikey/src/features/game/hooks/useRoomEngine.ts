import { useRef, useEffect, useState, useMemo } from 'react';
import { RoomItem } from '../../../types/domain';
import { AVATAR_PRESETS } from '../data';
import { usePlayerMovement } from './usePlayerMovement';

export const ROOM_W = 1280;
export const ROOM_H = 720;
const PROXIMITY_PX = 70;

// Character sprite sheets: 4 idle frames × 16×32 px each (strip is 64×32)
const FRAME_W = 16;
const FRAME_H = 32;
const FRAME_COUNT = 4;
const RENDER_W = 64;
const RENDER_H = 128;

interface UseRoomEngineOptions {
  items: RoomItem[];
  avatarPresetId?: string;
}

export function useRoomEngine({ items, avatarPresetId }: UseRoomEngineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);
  const animTickRef = useRef(0);
  const [scale, setScale] = useState(1);

  const spriteSrc = useMemo(() => {
    const preset = AVATAR_PRESETS.find((a) => a.id === avatarPresetId) ?? AVATAR_PRESETS[0];
    return preset.spritePath;
  }, [avatarPresetId]);

  const spriteSrcRef = useRef(spriteSrc);
  spriteSrcRef.current = spriteSrc;

  const { player } = usePlayerMovement(ROOM_W / 2, ROOM_H / 2, {
    cols: ROOM_W,
    rows: ROOM_H,
    tileSize: 1,
    isBlockedFn: () => false,
  });

  // Preload all character sprites upfront
  useEffect(() => {
    AVATAR_PRESETS.forEach(({ spritePath }) => {
      if (!images.current[spritePath]) {
        const img = new Image();
        img.src = spritePath;
        images.current[spritePath] = img;
      }
    });
  }, []);

  // Responsive scale: fit virtual 1280×720 into the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / ROOM_W, height / ROOM_H));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animTickRef.current = (animTickRef.current + 1) % 240;
      const tick = animTickRef.current;
      const p = playerRef.current;

      ctx.clearRect(0, 0, ROOM_W, ROOM_H);
      ctx.imageSmoothingEnabled = false;

      // Actual sprite frame layout: 0=right, 1=down, 2=left, 3=up
      const FACING_FRAME: Record<string, number> = { down: 1, left: 2, right: 0, up: 3 };
      const animFrame = FACING_FRAME[p.facing] ?? 0;
      const src = spriteSrcRef.current;
      const img = images.current[src];

      if (img?.complete && img.naturalWidth) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(p.x + RENDER_W / 2, p.y + RENDER_H - 4, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(img, animFrame * FRAME_W, 0, FRAME_W, FRAME_H, p.x, p.y - RENDER_H / 2, RENDER_W, RENDER_H);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // stable: uses refs, never restarts

  // Proximity: find the closest item within PROXIMITY_PX of the character centre
  const nearItem = useMemo<RoomItem | null>(() => {
    const px = player.x + RENDER_W / 2;
    const py = player.y + RENDER_H / 2;
    let closest: RoomItem | null = null;
    let minDist = PROXIMITY_PX;
    for (const item of items) {
      const ix = (item.xPct / 100) * ROOM_W;
      const iy = (item.yPct / 100) * ROOM_H;
      const dist = Math.sqrt((px - ix) ** 2 + (py - iy) ** 2);
      if (dist < minDist) { minDist = dist; closest = item; }
    }
    return closest;
  }, [player.x, player.y, items]); // eslint-disable-line react-hooks/exhaustive-deps

  return { canvasRef, containerRef, scale, nearItem };
}
