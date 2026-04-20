import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Building } from '../../../types/domain';
import {
  CITY_GRID, CITY_COLS, CITY_ROWS, TILE_SIZE,
  BUILDINGS, NPCS, CITY_INTERACTABLES, CityInteractable,
  GARDEN_PATCHES, GARDEN_SEEDLINGS, FENCE_SEGMENTS, CHEST_POSITIONS,
} from '../data/cityLayout';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useCamera } from '../hooks/useCamera';
import { PlayerSprite } from './PlayerSprite';

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 720;

const SUNNYSIDE_BASE = '/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets';

const TILE_TEXTURES: Partial<Record<string, string>> = {
  path: '/assets/gamepack/tiles/Path_Tile.png',
  farmland: '/assets/gamepack/tiles/FarmLand_Tile.png',
  cliff: '/assets/gamepack/tiles/Cliff_Tile.png',
};

const BUILDING_SPRITE = '/assets/gamepack/Outdoor decoration/House_1_Wood_Base_Blue.png';
const TREE_LARGE = '/assets/gamepack/Outdoor decoration/Oak_Tree.png';
const TREE_SMALL = '/assets/gamepack/Outdoor decoration/Oak_Tree_Small.png';
const CHEST_SPRITE = '/assets/gamepack/Outdoor decoration/Chest.png';

const CROP_IMAGES: Record<string, string> = {
  sprout: `${SUNNYSIDE_BASE}/Elements/Crops/kale_00.png`,
  flower: `${SUNNYSIDE_BASE}/Elements/Crops/sunflower_02.png`,
  carrot: `${SUNNYSIDE_BASE}/Elements/Crops/carrot_01.png`,
};

const NPC_IDLE_STRIPS = [
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/shorthair_idle_strip9.png`,
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/longhair_idle_strip9.png`,
  `${SUNNYSIDE_BASE}/Characters/Human/IDLE/curlyhair_idle_strip9.png`,
];

const BUILDING_LOOKS: Record<Building['id'], {
  spriteW: number;
  spriteH: number;
  filter: string;
  mirror: boolean;
  lift: number;
}> = {
  school: {
    spriteW: 146,
    spriteH: 186,
    filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 12,
  },
  supermarket: {
    spriteW: 148,
    spriteH: 188,
    filter: 'hue-rotate(100deg) saturate(1.15) brightness(1.02) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: true,
    lift: 8,
  },
  cafe: {
    spriteW: 130,
    spriteH: 170,
    filter: 'hue-rotate(-30deg) saturate(1.2) brightness(1.04) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 0,
  },
  library: {
    spriteW: 146,
    spriteH: 186,
    filter: 'sepia(0.7) saturate(0.4) brightness(0.75) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: true,
    lift: 12,
  },
  house: {
    spriteW: 130,
    spriteH: 170,
    filter: 'sepia(0.6) saturate(0.5) brightness(0.7) drop-shadow(0 4px 0 rgba(0,0,0,0.2))',
    mirror: false,
    lift: 0,
  },
};

const STEPPING_STONES: Array<{ x: number; y: number }> = [
  { x: 24, y: 18 }, { x: 25, y: 18 }, { x: 24, y: 19 },
  { x: 29, y: 21 }, { x: 30, y: 21 }, { x: 31, y: 21 },
  { x: 26, y: 23 }, { x: 27, y: 23 }, { x: 28, y: 23 },
  { x: 10, y: 10 }, { x: 26, y: 12 }, { x: 27, y: 12 },
];

interface Props {
  outfitColor: string;
  onEnterBuilding: (buildingId: Building['id']) => void;
}

function getTile(x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= CITY_COLS || y >= CITY_ROWS) return null;
  return CITY_GRID[y]?.[x] ?? null;
}

function isPathLike(tile: string | null): boolean {
  return tile === 'path' || tile === 'door' || tile === 'sidewalk';
}

function tileStyle(tile: string): React.CSSProperties {
  const texture = TILE_TEXTURES[tile];

  if (texture) {
    return {
      backgroundImage: `url(${texture})`,
      backgroundSize: '16px 16px',
      backgroundRepeat: 'repeat',
      imageRendering: 'pixelated',
    };
  }

  if (tile === 'water') {
    return {
      backgroundColor: '#4a9aba',
      backgroundImage:
        'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    };
  }

  if (tile === 'door') {
    return {
      backgroundColor: '#c8a86a',
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
    };
  }

  if (tile === 'wall') {
    return { background: 'transparent' };
  }

  // grass (default) — warm green base
  return { backgroundColor: '#7ec850' };
}

function interactionRange(playerTileX: number, playerTileY: number, item: CityInteractable): number {
  return Math.abs(playerTileX - item.tileX) + Math.abs(playerTileY - item.tileY);
}

export function CityMap({ outfitColor, onEnterBuilding }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const viewSize = { w: VIRTUAL_WIDTH, h: VIRTUAL_HEIGHT };
  const { player } = usePlayerMovement(18, 13);
  const { camX, camY } = useCamera(player, viewSize.w, viewSize.h);

  const [nearDoor, setNearDoor] = useState<Building | null>(null);
  const [nearItem, setNearItem] = useState<CityInteractable | null>(null);
  const [activeItem, setActiveItem] = useState<CityInteractable | null>(null);
  const [npcHint, setNpcHint] = useState<string | null>(null);
  const [comingSoonBuilding, setComingSoonBuilding] = useState<typeof BUILDINGS[number] | null>(null);
  const [animTick, setAnimTick] = useState(0);

  const treeProps = useMemo(() => {
    const trees: Array<{ x: number; y: number; type: 'tree-large' | 'tree-small' }> = [];
    for (let y = 0; y < CITY_ROWS; y++) {
      for (let x = 0; x < CITY_COLS; x++) {
        if (CITY_GRID[y]?.[x] === 'tree') {
          trees.push({
            x,
            y,
            type: (x + y) % 3 === 0 ? 'tree-large' : 'tree-small',
          });
        }
      }
    }
    return trees;
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setAnimTick((n) => (n + 1) % 60), 140);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const ratio = Math.min(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT);
      if (ratio >= 1) {
        setScale(Math.max(1, Math.floor(ratio)));
      } else {
        setScale(ratio);
      }
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

    let closestItem: CityInteractable | null = null;
    let closestRange = Infinity;
    for (const item of CITY_INTERACTABLES) {
      const range = interactionRange(px, py, item);
      if (range <= 1 && range < closestRange) {
        closestItem = item;
        closestRange = range;
      }
    }
    setNearItem(closestItem);

    const nearNpc = NPCS.find((n) =>
      Math.abs(px - n.tileX) <= 2 && Math.abs(py - n.tileY) <= 2
    );
    setNpcHint(nearNpc?.hint ?? null);

    if (activeItem && interactionRange(px, py, activeItem) > 2) {
      setActiveItem(null);
    }

    if (comingSoonBuilding) {
      const inRange = BUILDINGS.find(b => b.id === comingSoonBuilding.id &&
        Math.abs(px - b.doorX) <= 2 && Math.abs(py - b.doorY) <= 3);
      if (!inRange) setComingSoonBuilding(null);
    }
  }, [player.x, player.y, activeItem, comingSoonBuilding]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        setActiveItem(null);
        setComingSoonBuilding(null);
        return;
      }
      if (key !== 'e') return;
      if (nearItem) {
        setActiveItem(nearItem);
        return;
      }
      if (nearDoor) {
        if (nearDoor.inProgress) {
          setComingSoonBuilding(nearDoor);
          return;
        }
        onEnterBuilding(nearDoor.id as 'supermarket' | 'school' | 'cafe');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nearDoor, nearItem, onEnterBuilding]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(180deg, #2d4a1a 0%, #1e3510 46%, #142508 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
          imageRendering: 'pixelated',
          overflow: 'hidden',
          border: '4px solid #3d2b1a',
          boxShadow: '0 0 0 3px #7a5c2e',
          background: '#7ec850',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: CITY_COLS * TILE_SIZE,
            height: CITY_ROWS * TILE_SIZE,
            transform: `translate(${-camX}px, ${-camY}px)`,
          }}
        >
          {CITY_GRID.map((row, ry) =>
            row.map((tile, cx) => {
              const pathTop = tile === 'path' && !isPathLike(getTile(cx, ry - 1));
              const pathBottom = tile === 'path' && !isPathLike(getTile(cx, ry + 1));
              const pathLeft = tile === 'path' && !isPathLike(getTile(cx - 1, ry));
              const pathRight = tile === 'path' && !isPathLike(getTile(cx + 1, ry));

              const grassSpeckle = tile === 'grass' && (cx * 19 + ry * 11) % 13 === 0;
              const flowerVariant = tile === 'flower' && (cx + ry) % 2 === 0;

              return (
                <div
                  key={`${ry}-${cx}`}
                  style={{
                    position: 'absolute',
                    left: cx * TILE_SIZE,
                    top: ry * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    ...tileStyle(tile),
                  }}
                >
                  {tile === 'door' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: TILE_SIZE * 0.2,
                        top: TILE_SIZE * 0.12,
                        width: TILE_SIZE * 0.6,
                        height: TILE_SIZE * 0.88,
                        background: 'linear-gradient(90deg, #70472e, #8d5f3c)',
                        border: '2px solid rgba(0,0,0,0.25)',
                      }}
                    />
                  )}

                  {tile === 'road' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: TILE_SIZE * 0.12,
                        right: TILE_SIZE * 0.12,
                        top: TILE_SIZE * 0.48,
                        height: TILE_SIZE * 0.04,
                        background: 'rgba(255,255,255,0.18)',
                      }}
                    />
                  )}

                  {tile === 'sidewalk' && (
                    <>
                      <div style={{
                        position: 'absolute',
                        left: TILE_SIZE * 0.18,
                        top: TILE_SIZE * 0.18,
                        width: 2,
                        height: 2,
                        background: 'rgba(255,255,255,0.4)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        right: TILE_SIZE * 0.22,
                        bottom: TILE_SIZE * 0.25,
                        width: 2,
                        height: 2,
                        background: 'rgba(0,0,0,0.22)',
                      }} />
                    </>
                  )}

                  {grassSpeckle && (
                    <div style={{
                      position: 'absolute',
                      left: TILE_SIZE * 0.34,
                      top: TILE_SIZE * 0.28,
                      width: 2,
                      height: 3,
                      background: 'rgba(40,96,38,0.55)',
                    }} />
                  )}

                  {tile === 'flower' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: flowerVariant ? TILE_SIZE * 0.18 : TILE_SIZE * 0.5,
                        top: flowerVariant ? TILE_SIZE * 0.18 : TILE_SIZE * 0.4,
                        width: TILE_SIZE * 0.32,
                        height: TILE_SIZE * 0.32,
                        background: flowerVariant ? '#ffc1dd' : '#ffe17b',
                        border: '1px solid rgba(0,0,0,0.2)',
                      }}
                    />
                  )}

                  {pathTop && <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 2, background: 'rgba(122, 88, 40, 0.45)' }} />}
                  {pathBottom && <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: 2, background: 'rgba(255, 224, 158, 0.35)' }} />}
                  {pathLeft && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'rgba(122, 88, 40, 0.3)' }} />}
                  {pathRight && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, background: 'rgba(255, 224, 158, 0.25)' }} />}
                </div>
              );
            })
          )}

          {GARDEN_SEEDLINGS.map((seed, idx) => (
            <div
              key={`seed-${idx}`}
              style={{
                position: 'absolute',
                left: seed.x * TILE_SIZE + TILE_SIZE * 0.1,
                top: seed.y * TILE_SIZE + TILE_SIZE * 0.1,
                width: TILE_SIZE * 0.8,
                height: TILE_SIZE * 0.8,
                zIndex: seed.y + 6,
                pointerEvents: 'none',
              }}
            >
              <img
                src={CROP_IMAGES[seed.kind]}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          ))}

          {FENCE_SEGMENTS.map((seg, idx) => {
            const lengthPx = seg.len * TILE_SIZE;
            const isHorizontal = seg.direction === 'h';
            return (
              <div
                key={`fence-${idx}`}
                style={{
                  position: 'absolute',
                  left: seg.x * TILE_SIZE,
                  top: seg.y * TILE_SIZE + (isHorizontal ? TILE_SIZE * 0.36 : 0),
                  width: isHorizontal ? lengthPx : TILE_SIZE * 0.24,
                  height: isHorizontal ? TILE_SIZE * 0.24 : lengthPx,
                  background: 'linear-gradient(180deg, #7d4e2d, #5f361f)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
                  zIndex: seg.y + 8,
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: isHorizontal
                    ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0 2px, transparent 2px 12px)'
                    : 'repeating-linear-gradient(180deg, rgba(255,255,255,0.2) 0 2px, transparent 2px 12px)',
                }} />
              </div>
            );
          })}

          {STEPPING_STONES.map((stone, idx) => (
            <div
              key={`stone-${idx}`}
              style={{
                position: 'absolute',
                left: stone.x * TILE_SIZE + TILE_SIZE * 0.22,
                top: stone.y * TILE_SIZE + TILE_SIZE * 0.22,
                width: TILE_SIZE * 0.55,
                height: TILE_SIZE * 0.5,
                background: '#b9ad8f',
                border: '1px solid rgba(0,0,0,0.25)',
                borderRadius: 4,
                zIndex: stone.y + 3,
              }}
            />
          ))}

          {CHEST_POSITIONS.map((prop, index) => (
            <div
              key={`chest-${index}`}
              style={{
                position: 'absolute',
                left: prop.x * TILE_SIZE + 3,
                top: prop.y * TILE_SIZE + 6,
                width: 26,
                height: 24,
                zIndex: prop.y + 12,
                pointerEvents: 'none',
              }}
            >
              <img
                src={CHEST_SPRITE}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          ))}

          {treeProps.map((prop, index) => {
            const src = prop.type === 'tree-large' ? TREE_LARGE : TREE_SMALL;
            const width = prop.type === 'tree-large' ? 96 : 64;
            const height = prop.type === 'tree-large' ? 120 : 64;
            const px = prop.x * TILE_SIZE - (width - TILE_SIZE) / 2;
            const py = prop.y * TILE_SIZE - (height - TILE_SIZE * 0.55);

            return (
              <div
                key={`decor-tree-${index}`}
                style={{
                  position: 'absolute',
                  left: px,
                  top: py,
                  width,
                  height,
                  pointerEvents: 'none',
                  zIndex: prop.y + 2,
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: width * 0.22,
                  right: width * 0.22,
                  bottom: 0,
                  height: 8,
                  background: 'rgba(0,0,0,0.28)',
                  borderRadius: '50%',
                }} />
                <img
                  src={src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    position: 'relative',
                    zIndex: 2,
                  }}
                />
              </div>
            );
          })}

          {BUILDINGS.map((b) => {
            const look = BUILDING_LOOKS[b.id];
            const left = b.tileX * TILE_SIZE + (b.tileW * TILE_SIZE - look.spriteW) / 2;
            const top = b.tileY * TILE_SIZE - (look.spriteH - b.tileH * TILE_SIZE) - look.lift;

            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: look.spriteW,
                  height: look.spriteH,
                  zIndex: b.doorY + 10,
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 4,
                  height: 10,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '50%',
                }} />
                <img
                  src={BUILDING_SPRITE}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    filter: look.filter,
                    position: 'relative',
                    zIndex: 2,
                    transform: look.mirror ? 'scaleX(-1)' : 'none',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  bottom: -16,
                  textAlign: 'center',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 7,
                  color: b.inProgress ? '#b0a080' : '#f7e8b2',
                  textShadow: '1px 1px 0 #000',
                  background: 'rgba(0,0,0,0.55)',
                  border: `2px solid ${b.inProgress ? 'rgba(100,80,40,0.6)' : 'rgba(0,0,0,0.6)'}`,
                  padding: '3px 4px',
                }}>
                  {b.inProgress ? '🚧 ' : ''}{b.label} {b.chineseLabel}
                </div>

                {b.inProgress && (
                  <div style={{
                    position: 'absolute',
                    left: look.spriteW * 0.5 - 10,
                    bottom: look.spriteH * 0.15,
                    zIndex: 5,
                    pointerEvents: 'none',
                  }}>
                    <div style={{
                      width: 4,
                      height: 22,
                      background: 'linear-gradient(180deg, #7d4e2d, #5f361f)',
                      margin: '0 auto',
                    }} />
                    <div style={{
                      width: 28,
                      height: 18,
                      background: 'linear-gradient(180deg, #f7e7ba, #d6c08e)',
                      border: '2px solid #694625',
                      marginLeft: -12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 6,
                      color: '#5a3010',
                    }}>🚧</div>
                  </div>
                )}
              </div>
            );
          })}

          {CITY_INTERACTABLES.map((item) => {
            const isFocused = nearItem?.id === item.id;
            const zIndex = item.tileY + 20;
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: item.tileX * TILE_SIZE + 2,
                  top: item.tileY * TILE_SIZE + 2,
                  width: TILE_SIZE - 4,
                  height: TILE_SIZE - 4,
                  pointerEvents: 'none',
                  zIndex,
                }}
              >
                {item.kind === 'board' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 0,
                      width: 20,
                      height: 26,
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: 8,
                      top: 20,
                      width: 4,
                      height: 10,
                      background: '#7d4e2d',
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 2,
                      width: 20,
                      height: 18,
                      background: 'linear-gradient(180deg, #f7e7ba, #d6c08e)',
                      border: '2px solid #694625',
                    }} />
                  </div>
                )}
                {item.kind === 'garden' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: 7,
                      right: 2,
                      height: 16,
                      border: '2px solid #6c4327',
                      background: 'rgba(109, 69, 35, 0.45)',
                    }}
                  />
                )}
                {item.kind === 'crate' && (
                  <img
                    src={CHEST_SPRITE}
                    alt=""
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: 6,
                      width: 24,
                      height: 22,
                      imageRendering: 'pixelated',
                    }}
                  />
                )}
                {isFocused && (
                  <div style={{
                    position: 'absolute',
                    left: 4,
                    top: -6,
                    width: 20,
                    height: 4,
                    background: '#ffe17b',
                    boxShadow: '0 0 8px rgba(255,225,123,0.8)',
                  }} />
                )}
              </div>
            );
          })}

          {NPCS.map((npc, index) => {
            const frame = animTick % 9;
            return (
              <div
                key={npc.id}
                style={{
                  position: 'absolute',
                  left: npc.tileX * TILE_SIZE + 4,
                  top: npc.tileY * TILE_SIZE - 18,
                  width: 24,
                  height: 48,
                  pointerEvents: 'none',
                  zIndex: npc.tileY + 30,
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  bottom: 2,
                  height: 6,
                  background: 'rgba(0,0,0,0.28)',
                  borderRadius: '50%',
                }} />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 24,
                    height: 48,
                    backgroundImage: `url(${NPC_IDLE_STRIPS[index % NPC_IDLE_STRIPS.length]})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '144px 32px',
                    backgroundPosition: `${-frame * 16}px 0`,
                    transform: 'scale(1.5)',
                    transformOrigin: 'top left',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
            );
          })}

          <PlayerSprite player={player} outfitColor={outfitColor} />
        </div>

        <div style={{
          position: 'absolute',
          left: 12,
          top: 12,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 7,
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(0,0,0,0.45)',
          border: '2px solid rgba(0,0,0,0.5)',
          padding: '6px 8px',
          lineHeight: 1.8,
        }}>
          WASD / ARROWS = MOVE
          <br />
          E = INTERACT / ENTER
          <br />
          ESC = CLOSE POPUP
        </div>

        {nearItem && (
          <div style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            background: 'rgba(0,0,0,0.86)',
            border: '3px solid #83d68e',
            color: '#b8ffbe',
            padding: '8px 12px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            zIndex: 31,
          }}>
            Press [E] to inspect {nearItem.chinese}
          </div>
        )}

        {!nearItem && nearDoor && (
          <div style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            background: 'rgba(0,0,0,0.85)',
            border: `3px solid ${nearDoor.inProgress ? '#8a6a2e' : '#dfbe69'}`,
            color: nearDoor.inProgress ? '#c8a060' : '#ffe59a',
            padding: '8px 12px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            zIndex: 30,
          }}>
            {nearDoor.inProgress
              ? `🚧 ${nearDoor.chineseLabel} — Press [E] to inspect`
              : `Press [E] to enter ${nearDoor.label}`}
          </div>
        )}

        {npcHint && !activeItem && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            background: 'rgba(0,0,0,0.85)',
            border: '3px solid #66b969',
            color: '#9df3a1',
            padding: '8px 12px',
            textAlign: 'center',
            maxWidth: 460,
            zIndex: 30,
            lineHeight: 1.6,
          }}>
            {npcHint}
          </div>
        )}

        {activeItem && (
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 54,
            transform: 'translateX(-50%)',
            minWidth: 360,
            maxWidth: 520,
            background: 'rgba(17, 24, 28, 0.94)',
            border: '4px solid #e2bc73',
            color: '#f5e7ca',
            padding: '12px 14px',
            zIndex: 42,
            boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
            fontFamily: "'Press Start 2P', monospace",
            lineHeight: 1.8,
          }}>
            <div style={{ fontSize: 10, color: '#ffe59a', marginBottom: 6 }}>
              {activeItem.chinese}
            </div>
            <div style={{ fontSize: 7, color: '#90d7ff', marginBottom: 8 }}>
              {activeItem.pinyin}
            </div>
            <div style={{ fontSize: 7, color: '#d9f4d8' }}>
              {activeItem.description}
            </div>
          </div>
        )}

        {comingSoonBuilding && (
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 54,
            transform: 'translateX(-50%)',
            minWidth: 340,
            maxWidth: 520,
            background: 'rgba(40, 24, 8, 0.94)',
            border: '4px solid #8a6a2e',
            color: '#e8d4a0',
            padding: '12px 14px',
            zIndex: 42,
            boxShadow: '0 8px 0 rgba(0,0,0,0.3)',
            fontFamily: "'Press Start 2P', monospace",
            lineHeight: 1.8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#d4a84b', marginBottom: 6 }}>
              🚧 {comingSoonBuilding.chineseLabel}
            </div>
            <div style={{ fontSize: 7, color: '#c8b880' }}>
              {comingSoonBuilding.label} — 即将开放
            </div>
            <div style={{ fontSize: 6, color: '#9a8860', marginTop: 6 }}>
              Coming Soon! Press ESC to close
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
