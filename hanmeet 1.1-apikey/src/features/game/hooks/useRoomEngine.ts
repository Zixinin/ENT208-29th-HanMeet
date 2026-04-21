import { useRef, useEffect, useState, useMemo } from 'react';
import { RoomItem } from '../../../types/domain';
import { usePlayerMovement } from './usePlayerMovement';

const SUNNYSIDE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_SRC = `${SUNNYSIDE}/Characters/Human/IDLE/base_idle_strip9.png`;
const WALK_SRC = `${SUNNYSIDE}/Characters/Human/WALKING/base_walk_strip8.png`;

export const ROOM_W = 1280;
export const ROOM_H = 720;
const PROXIMITY_PX = 70;

interface UseRoomEngineOptions {
  items: RoomItem[];
}

export function useRoomEngine({ items }: UseRoomEngineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);
  const animTickRef = useRef(0);
  const [scale, setScale] = useState(1);

  const { player } = usePlayerMovement(ROOM_W / 2, ROOM_H / 2, {
    cols: ROOM_W,
    rows: ROOM_H,
    tileSize: 1,
    isBlockedFn: () => false,
  });

  // Preload character sprite sheets
  useEffect(() => {
    [IDLE_SRC, WALK_SRC].forEach(src => {
      if (!images.current[src]) {
        const img = new Image();
        img.src = src;
        images.current[src] = img;
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

  // Draw loop: renders character sprite on transparent canvas each frame
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

      const idleFrames = 9, walkFrames = 8;
      const frameCount = p.moving ? walkFrames : idleFrames;
      const animFrame = Math.floor(tick / 4) % frameCount;
      const src = p.moving ? WALK_SRC : IDLE_SRC;
      const FRAME_W = 16, FRAME_H = 32;
      const RENDER_W = 32, RENDER_H = 64;

      const img = images.current[src];
      if (img?.complete && img.naturalWidth) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(p.x + RENDER_W / 2, p.y + RENDER_H - 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(img, animFrame * FRAME_W, 0, FRAME_W, FRAME_H, p.x, p.y - RENDER_H / 2, RENDER_W, RENDER_H);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // stable: uses playerRef.current, never restarts

  // Proximity: find the closest item within PROXIMITY_PX of the character centre
  const nearItem = useMemo<RoomItem | null>(() => {
    const px = player.x + 16;
    const py = player.y + 32;
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
