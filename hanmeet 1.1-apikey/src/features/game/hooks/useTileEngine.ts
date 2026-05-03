import { useRef, useEffect, useState, useMemo } from 'react';
import { TileEngineConfig, InteractableConfig, BuildingEntry } from '../../../types/tileEngine';
import { usePlayerMovement } from './usePlayerMovement';
import { useCamera } from './useCamera';

const SUNNYSIDE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';
const IDLE_SRC = `${SUNNYSIDE}/Characters/Human/IDLE/base_idle_strip9.png`;
const WALK_SRC = `${SUNNYSIDE}/Characters/Human/WALKING/base_walk_strip8.png`;

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

function loadImage(src: string, cache: Record<string, HTMLImageElement>) {
  if (!cache[src]) {
    const img = new Image();
    img.src = src;
    cache[src] = img;
  }
}

export function useTileEngine(config: TileEngineConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);
  const animTickRef = useRef(0);
  const [scale, setScale] = useState(1);

  const { player } = usePlayerMovement(
    config.spawnTileX,
    config.spawnTileY,
    {
      cols: config.cols,
      rows: config.rows,
      tileSize: config.tileSize,
      isBlockedFn: config.isBlocked,
    },
  );

  const worldW = config.cols * config.tileSize;
  const worldH = config.rows * config.tileSize;
  const { camX, camY } = useCamera(player, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, { worldW, worldH });

  // Preload all images
  useEffect(() => {
    const srcs = [
      IDLE_SRC,
      WALK_SRC,
      ...Object.values(config.tileImages).filter(Boolean) as string[],
      ...config.sprites.map(s => s.src),
      ...config.interactables.filter(i => i.src).map(i => i.src!),
    ];
    [...new Set(srcs)].forEach(src => loadImage(src, images.current));
  }, []); // intentionally empty — config is stable per scene mount

  // Responsive scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animTickRef.current = (animTickRef.current + 1) % 240;
      const tick = animTickRef.current;
      const { tileSize: ts, cols, rows, tileMap } = config;

      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      ctx.translate(-camX, -camY);

      // Visible tile range (culling)
      const x0 = Math.max(0, Math.floor(camX / ts));
      const x1 = Math.min(cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / ts));
      const y0 = Math.max(0, Math.floor(camY / ts));
      const y1 = Math.min(rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / ts));

      for (let ry = y0; ry <= y1; ry++) {
        for (let rx = x0; rx <= x1; rx++) {
          const tile = tileMap[ry]?.[rx] ?? 'grass';
          const imgSrc = config.tileImages[tile];
          const img = imgSrc ? images.current[imgSrc] : undefined;
          if (img?.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, rx * ts, ry * ts, ts, ts);
          } else {
            ctx.fillStyle = config.tileColors[tile] ?? '#5a9e32';
            ctx.fillRect(rx * ts, ry * ts, ts, ts);
          }
        }
      }

      type Renderable = { sortY: number; draw: () => void };
      const renderables: Renderable[] = [];

      // Sprites (buildings, trees, decorations)
      for (const sprite of config.sprites) {
        renderables.push({
          sortY: sprite.y + sprite.h,
          draw: () => {
            const img = images.current[sprite.src];
            if (!img?.complete || !img.naturalWidth) return;
            ctx.save();
            if (sprite.filter) ctx.filter = sprite.filter;
            if (sprite.flipX) {
              ctx.translate(sprite.x + sprite.w, sprite.y);
              ctx.scale(-1, 1);
              ctx.drawImage(img, 0, 0, sprite.w, sprite.h);
            } else {
              ctx.drawImage(img, sprite.x, sprite.y, sprite.w, sprite.h);
            }
            ctx.filter = 'none';
            ctx.restore();

            if (sprite.label) {
              ctx.font = "bold 8px 'Press Start 2P', monospace";
              ctx.textAlign = 'center';
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fillRect(sprite.x, sprite.y + sprite.h + 2, sprite.w, 14);
              ctx.fillStyle = sprite.labelColor ?? '#ffe59a';
              ctx.fillText(sprite.label, sprite.x + sprite.w / 2, sprite.y + sprite.h + 13);
            }
          },
        });
      }

      // Interactables
      for (const item of config.interactables) {
        renderables.push({
          sortY: item.tileY * ts + ts,
          draw: () => {
            const img = item.src ? images.current[item.src] : undefined;
            if (img?.complete && img.naturalWidth) {
              ctx.drawImage(img, item.tileX * ts, item.tileY * ts, ts, ts);
            } else {
              ctx.fillStyle = 'rgba(200,160,80,0.75)';
              ctx.fillRect(item.tileX * ts + 4, item.tileY * ts + 4, ts - 8, ts - 8);
              ctx.fillStyle = '#000';
              ctx.font = `${ts - 6}px serif`;
              ctx.textAlign = 'center';
              ctx.fillText('?', item.tileX * ts + ts / 2, item.tileY * ts + ts - 6);
            }
          },
        });
      }

      // Player
      const idleFrames = 9, walkFrames = 8;
      const frameCount = player.moving ? walkFrames : idleFrames;
      const animFrame = Math.floor(tick / 4) % frameCount;
      const playerSrc = player.moving ? WALK_SRC : IDLE_SRC;
      const FRAME_W = 16, FRAME_H = 32;
      const RENDER_W = 24, RENDER_H = 48;

      renderables.push({
        sortY: player.y + RENDER_H,
        draw: () => {
          const img = images.current[playerSrc];
          if (!img?.complete || !img.naturalWidth) return;
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.ellipse(player.x + RENDER_W / 2, player.y + RENDER_H - 4, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(
            img,
            animFrame * FRAME_W, 0,
            FRAME_W, FRAME_H,
            player.x - 6, player.y - 24,
            RENDER_W, RENDER_H,
          );
        },
      });

      renderables.sort((a, b) => a.sortY - b.sortY);
      for (const r of renderables) r.draw();

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [camX, camY, player, config]);

  // Proximity detection
  const ptx = Math.floor((player.x + 12) / config.tileSize);
  const pty = Math.floor((player.y + 24) / config.tileSize);

  const nearInteractable: InteractableConfig | null = useMemo(() => {
    return config.interactables.find(
      item => Math.abs(ptx - item.tileX) + Math.abs(pty - item.tileY) <= 1
    ) ?? null;
  }, [ptx, pty, config.interactables]); // eslint-disable-line

  const nearBuilding: BuildingEntry | null = useMemo(() => {
    return (config.buildings ?? []).find(
      b => Math.abs(ptx - b.doorTileX) <= 1 && Math.abs(pty - b.doorTileY) <= 2
    ) ?? null;
  }, [ptx, pty, config.buildings]); // eslint-disable-line

  return { canvasRef, containerRef, player, scale, nearInteractable, nearBuilding };
}
