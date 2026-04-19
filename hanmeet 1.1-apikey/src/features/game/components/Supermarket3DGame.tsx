import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RefreshCcw } from 'lucide-react';
import {
  INVENTORY_LIMIT,
  PLAYER_SETTINGS,
  SUPERMARKET_ITEMS,
  SUPERMARKET_OBSTACLES,
  SUPERMARKET_SIGNS,
  SupermarketItemDef,
  WORLD_BOUNDS,
} from '../data/supermarket3d';
import { RetroAudioSystem } from '../systems/audioSystem';
import {
  Quest,
  computeQuestProgress,
  describeQuestProgress,
  generateQuest,
} from '../systems/questSystem';
import {
  clearSupermarketSave,
  defaultSaveState,
  loadSupermarketSave,
  persistSupermarketSave,
} from '../systems/saveSystem';
import { VocabularyItem } from '../../../types/domain';

interface Supermarket3DGameProps {
  level: number;
  xp: number;
  onGainXp: (amount: number) => void;
  onAddNotebook: (item: VocabularyItem) => void;
}

interface PlayerState {
  x: number;
  z: number;
  yaw: number;
  pitch: number;
}

interface RendererBundle {
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
}

const RETRO_TONE_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    contrast: { value: 1.12 },
    saturation: { value: 1.08 },
    grainAmount: { value: 0.02 },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float contrast;
    uniform float saturation;
    uniform float grainAmount;
    uniform float time;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 color = tex.rgb;

      color = floor(color * 16.0) / 16.0;
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, saturation);
      color = (color - 0.5) * contrast + 0.5;

      float vignette = smoothstep(0.88, 0.22, distance(vUv, vec2(0.5)));
      float grain = (rand(vUv + vec2(time * 0.01, -time * 0.02)) - 0.5) * grainAmount;

      color = clamp(color * vignette + grain, 0.0, 1.0);
      gl_FragColor = vec4(color, tex.a);
    }
  `,
};

function makePixelTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to build texture canvas.');
  }

  draw(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function createFloorTexture() {
  return makePixelTexture((ctx, size) => {
    const cell = size / 8;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        const checker = (x + y) % 2 === 0;
        ctx.fillStyle = checker ? '#f2dfbc' : '#a0b7d3';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    ctx.fillStyle = 'rgba(50, 55, 65, 0.18)';
    for (let i = 0; i < 32; i += 1) {
      ctx.fillRect((i * 17) % size, (i * 37) % size, 2, 2);
    }
  });
}

function createWallTexture() {
  return makePixelTexture((ctx, size) => {
    ctx.fillStyle = '#f6efe4';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 16) {
      ctx.fillStyle = y % 32 === 0 ? '#e3d7c3' : '#dccbb3';
      ctx.fillRect(0, y, size, 4);
    }

    ctx.fillStyle = 'rgba(128, 102, 79, 0.24)';
    for (let i = 0; i < 100; i += 1) {
      ctx.fillRect((i * 13) % size, (i * 19) % size, 1, 1);
    }
  });
}

function createShelfTexture() {
  return makePixelTexture((ctx, size) => {
    ctx.fillStyle = '#80513b';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#66311f';
    for (let y = 6; y < size; y += 16) {
      ctx.fillRect(0, y, size, 3);
    }
    ctx.fillStyle = '#9a6b4d';
    for (let x = 0; x < size; x += 12) {
      ctx.fillRect(x, 0, 2, size);
    }
  });
}

function createLabelTexture(item: SupermarketItemDef): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create item label texture.');
  }

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(item.chinese, canvas.width / 2, 72);
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '24px monospace';
  ctx.fillText(item.english, canvas.width / 2, 108);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function getQuestTargetIds(quest: Quest | null): string[] {
  if (!quest) return [];
  if (quest.objective.kind === 'find-item') return [quest.objective.itemId];
  if (quest.objective.kind === 'combo') return quest.objective.itemIds;
  return [];
}

function collidesWithWorld(x: number, z: number, radius: number): boolean {
  if (
    x - radius < WORLD_BOUNDS.minX ||
    x + radius > WORLD_BOUNDS.maxX ||
    z - radius < WORLD_BOUNDS.minZ ||
    z + radius > WORLD_BOUNDS.maxZ
  ) {
    return true;
  }

  return SUPERMARKET_OBSTACLES.some((obstacle) => {
    const left = obstacle.x - obstacle.width / 2;
    const right = obstacle.x + obstacle.width / 2;
    const near = obstacle.z - obstacle.depth / 2;
    const far = obstacle.z + obstacle.depth / 2;

    return x + radius > left && x - radius < right && z + radius > near && z - radius < far;
  });
}

function clampPitch(pitch: number): number {
  return Math.max(-1.35, Math.min(1.35, pitch));
}

function createNotebookEntryFromItem(item: SupermarketItemDef): VocabularyItem {
  return {
    id: `supermarket-3d-${item.id}`,
    spaceId: 'supermarket',
    chinese: item.chinese,
    pinyin: item.pinyin,
    english: item.english,
    x: 0,
    y: 0,
    difficulty: 'easy',
    rarity: 'common',
    xp: 10,
    icon: item.icon,
  };
}

function rollQuest(inventoryIds: string[], completedQuestCount: number): Quest | null {
  if (inventoryIds.length >= SUPERMARKET_ITEMS.length) return null;

  for (let i = 0; i < 12; i += 1) {
    const quest = generateQuest({ inventoryIds, completedQuestCount }, SUPERMARKET_ITEMS);
    const progress = computeQuestProgress(quest, inventoryIds, SUPERMARKET_ITEMS);
    if (!progress.isComplete) {
      return quest;
    }
  }

  return null;
}

export function Supermarket3DGame({ level, xp, onGainXp, onAddNotebook }: Supermarket3DGameProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const rendererBundleRef = useRef<RendererBundle | null>(null);
  const itemMeshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const hoverItemIdRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef<number>(0);
  const lastToastTimerRef = useRef<number | null>(null);

  const savedRef = useRef(loadSupermarketSave());
  const [inventoryIds, setInventoryIds] = useState<string[]>(savedRef.current.inventoryIds);
  const [completedQuestCount, setCompletedQuestCount] = useState<number>(savedRef.current.completedQuestCount);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(
    savedRef.current.activeQuest ??
      rollQuest(savedRef.current.inventoryIds, savedRef.current.completedQuestCount),
  );

  const [toast, setToast] = useState<string>('Click the game view to lock mouse and start exploring.');
  const [interactionHint, setInteractionHint] = useState<string>('');
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  const inventoryRef = useRef(inventoryIds);
  const activeQuestRef = useRef(activeQuest);
  const completedQuestCountRef = useRef(completedQuestCount);

  const keyStateRef = useRef({ w: false, a: false, s: false, d: false });
  const playerRef = useRef<PlayerState>({
    x: savedRef.current.player.x,
    z: savedRef.current.player.z,
    yaw: savedRef.current.player.yaw,
    pitch: savedRef.current.player.pitch,
  });

  const raycasterRef = useRef(new THREE.Raycaster());
  const audioRef = useRef(new RetroAudioSystem());

  const itemById = useMemo(() => {
    const map = new Map<string, SupermarketItemDef>();
    SUPERMARKET_ITEMS.forEach((item) => map.set(item.id, item));
    return map;
  }, []);

  const inventorySet = useMemo(() => new Set(inventoryIds), [inventoryIds]);

  const questProgress = useMemo(() => {
    if (!activeQuest) return null;
    return computeQuestProgress(activeQuest, inventoryIds, SUPERMARKET_ITEMS);
  }, [activeQuest, inventoryIds]);

  useEffect(() => {
    inventoryRef.current = inventoryIds;
  }, [inventoryIds]);

  useEffect(() => {
    activeQuestRef.current = activeQuest;
  }, [activeQuest]);

  useEffect(() => {
    completedQuestCountRef.current = completedQuestCount;
  }, [completedQuestCount]);

  const enqueueToast = useCallback((text: string, duration = 1800) => {
    setToast(text);
    if (lastToastTimerRef.current) {
      window.clearTimeout(lastToastTimerRef.current);
    }
    lastToastTimerRef.current = window.setTimeout(() => {
      setToast('');
      lastToastTimerRef.current = null;
    }, duration);
  }, []);

  const completeQuestIfNeeded = useCallback(
    (nextInventoryIds: string[]) => {
      const quest = activeQuestRef.current;
      if (!quest) return;

      const progress = computeQuestProgress(quest, nextInventoryIds, SUPERMARKET_ITEMS);
      if (!progress.isComplete) return;

      const nextCompleted = completedQuestCountRef.current + 1;
      setCompletedQuestCount(nextCompleted);
      onGainXp(quest.xpReward);
      audioRef.current.playQuestComplete();
      enqueueToast(`Quest complete! +${quest.xpReward} XP`, 2200);

      const nextQuest = rollQuest(nextInventoryIds, nextCompleted);
      setActiveQuest(nextQuest);
    },
    [enqueueToast, onGainXp],
  );

  const tryInteractWithItem = useCallback(
    (itemId: string) => {
      const item = itemById.get(itemId);
      if (!item) return;

      const currentInventory = inventoryRef.current;
      const hasItem = currentInventory.includes(item.id);
      const inventoryFull = currentInventory.length >= INVENTORY_LIMIT;

      if (!hasItem && inventoryFull) {
        enqueueToast(`Inventory full (${INVENTORY_LIMIT}).`, 1500);
        return;
      }

      let nextInventory = currentInventory;

      if (!hasItem) {
        nextInventory = [...currentInventory, item.id];
        setInventoryIds(nextInventory);
        audioRef.current.playPickup();
        onAddNotebook(createNotebookEntryFromItem(item));
        enqueueToast(`Picked up ${item.chinese}.`, 1600);
      } else {
        enqueueToast(`Already collected ${item.chinese}.`, 1200);
      }

      completeQuestIfNeeded(nextInventory);
    },
    [completeQuestIfNeeded, enqueueToast, itemById, onAddNotebook],
  );

  const tryInteractFromCrosshair = useCallback(() => {
    const bundle = rendererBundleRef.current;
    if (!bundle) return;

    const { camera } = bundle;
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const interactableMeshes = Array.from(itemMeshMapRef.current.values());
    const hits = raycaster.intersectObjects(interactableMeshes, false);
    const nearest = hits.find((hit) => hit.distance <= PLAYER_SETTINGS.interactDistance);

    if (!nearest) {
      enqueueToast('No item in range. Move closer and try again.', 1200);
      return;
    }

    const itemId = nearest.object.userData.itemId as string | undefined;
    if (!itemId) return;

    tryInteractWithItem(itemId);
  }, [enqueueToast, tryInteractWithItem]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#9cc6db');
    scene.fog = new THREE.Fog('#88b0c3', 18, 62);

    const camera = new THREE.PerspectiveCamera(72, width / Math.max(height, 1), 0.1, 160);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.imageRendering = 'pixelated';
    renderer.domElement.style.cursor = 'crosshair';

    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const retroPass = new ShaderPass(RETRO_TONE_SHADER as THREE.Shader);
    composer.addPass(retroPass);

    rendererBundleRef.current = {
      renderer,
      composer,
      camera,
      scene,
    };

    const directional = new THREE.DirectionalLight('#fff8e6', 1.25);
    directional.position.set(8, 18, -5);
    directional.castShadow = false;
    scene.add(directional);

    const hemi = new THREE.HemisphereLight('#fff4da', '#5881a4', 0.9);
    scene.add(hemi);

    const ambient = new THREE.AmbientLight('#ffffff', 0.55);
    scene.add(ambient);

    const floorTexture = createFloorTexture();
    floorTexture.repeat.set(10, 7);
    const wallTexture = createWallTexture();
    wallTexture.repeat.set(14, 2);
    const shelfTexture = createShelfTexture();
    shelfTexture.repeat.set(2, 4);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(
        WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX,
        WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ,
      ),
      new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 1, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(
        WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX,
        WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ,
      ),
      new THREE.MeshStandardMaterial({ color: '#f7f2dd', roughness: 1, metalness: 0 }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5.2;
    scene.add(ceiling);

    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.95, metalness: 0.02 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(56, 5.2, 0.7), wallMaterial);
    backWall.position.set(0, 2.6, WORLD_BOUNDS.minZ);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(56, 5.2, 0.7), wallMaterial);
    frontWall.position.set(0, 2.6, WORLD_BOUNDS.maxZ);
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 40), wallMaterial);
    leftWall.position.set(WORLD_BOUNDS.minX, 2.6, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 40), wallMaterial);
    rightWall.position.set(WORLD_BOUNDS.maxX, 2.6, 0);
    scene.add(rightWall);

    const shelfMaterial = new THREE.MeshStandardMaterial({ map: shelfTexture, roughness: 0.9, metalness: 0.04 });
    const counterMaterial = new THREE.MeshStandardMaterial({ color: '#9d7758', roughness: 0.88, metalness: 0.05 });
    const produceMaterial = new THREE.MeshStandardMaterial({ color: '#3e5f45', roughness: 0.9, metalness: 0.03 });
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: '#d6cdc0', roughness: 0.98, metalness: 0 });

    SUPERMARKET_OBSTACLES.forEach((obstacle) => {
      const material =
        obstacle.kind === 'shelf'
          ? shelfMaterial
          : obstacle.kind === 'counter'
            ? counterMaterial
            : obstacle.kind === 'produce'
              ? produceMaterial
              : pillarMaterial;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obstacle.width, obstacle.height, obstacle.depth),
        material,
      );
      mesh.position.set(obstacle.x, obstacle.height / 2, obstacle.z);
      scene.add(mesh);
    });

    const loader = new THREE.TextureLoader();
    SUPERMARKET_SIGNS.forEach((sign) => {
      const texture = loader.load(sign.texturePath);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(sign.width, sign.height),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
      );
      mesh.position.set(sign.position.x, sign.position.y, sign.position.z);
      mesh.rotation.y = sign.rotationY;
      scene.add(mesh);
    });

    const itemGroup = new THREE.Group();
    scene.add(itemGroup);

    itemMeshMapRef.current.clear();

    SUPERMARKET_ITEMS.forEach((item) => {
      const boxMaterial = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.7, metalness: 0.08 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.54, 0.54), boxMaterial);
      box.position.set(item.position.x, item.position.y, item.position.z);
      box.userData.itemId = item.id;
      itemGroup.add(box);
      itemMeshMapRef.current.set(item.id, box);

      const labelTexture = createLabelTexture(item);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
      const label = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.54), labelMaterial);
      label.position.set(item.position.x, item.position.y + 0.8, item.position.z);
      label.lookAt(item.position.x, item.position.y + 0.8, item.position.z - 5);
      itemGroup.add(label);

      box.userData.label = label;
      box.userData.baseColor = item.color;
    });

    const player = playerRef.current;
    player.x = Math.min(WORLD_BOUNDS.maxX - 1, Math.max(WORLD_BOUNDS.minX + 1, player.x));
    player.z = Math.min(WORLD_BOUNDS.maxZ - 1, Math.max(WORLD_BOUNDS.minZ + 1, player.z));
    player.pitch = clampPitch(player.pitch);

    camera.position.set(player.x, PLAYER_SETTINGS.eyeHeight, player.z);
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    const minimap = minimapRef.current;

    const drawMinimap = () => {
      if (!minimap) return;
      const ctx = minimap.getContext('2d');
      if (!ctx) return;

      const widthPx = minimap.width;
      const heightPx = minimap.height;
      const worldW = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
      const worldH = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;

      const toMapX = (x: number) => ((x - WORLD_BOUNDS.minX) / worldW) * widthPx;
      const toMapY = (z: number) => ((z - WORLD_BOUNDS.minZ) / worldH) * heightPx;

      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, widthPx, heightPx);

      ctx.strokeStyle = '#8ecae6';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, widthPx - 2, heightPx - 2);

      SUPERMARKET_OBSTACLES.forEach((obstacle) => {
        const x = toMapX(obstacle.x - obstacle.width / 2);
        const y = toMapY(obstacle.z - obstacle.depth / 2);
        const w = (obstacle.width / worldW) * widthPx;
        const h = (obstacle.depth / worldH) * heightPx;

        ctx.fillStyle =
          obstacle.kind === 'shelf'
            ? '#8b5e3c'
            : obstacle.kind === 'counter'
              ? '#d97706'
              : obstacle.kind === 'produce'
                ? '#14532d'
                : '#94a3b8';
        ctx.fillRect(x, y, w, h);
      });

      const questTargets = new Set(getQuestTargetIds(activeQuestRef.current));

      SUPERMARKET_ITEMS.forEach((item) => {
        const collected = inventoryRef.current.includes(item.id);
        ctx.fillStyle = collected ? '#22c55e' : '#facc15';
        if (questTargets.has(item.id)) {
          ctx.fillStyle = '#ef4444';
        }

        const px = toMapX(item.position.x);
        const py = toMapY(item.position.z);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      });

      const px = toMapX(playerRef.current.x);
      const py = toMapY(playerRef.current.z);
      const angle = playerRef.current.yaw;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const handleResize = () => {
      const nextWidth = mount.clientWidth;
      const nextHeight = mount.clientHeight;
      camera.aspect = nextWidth / Math.max(1, nextHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      composer.setSize(nextWidth, nextHeight);
    };

    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keyStateRef.current[key as 'w' | 'a' | 's' | 'd'] = true;
      }

      if (key === 'e') {
        event.preventDefault();
        tryInteractFromCrosshair();
      }
    };

    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        keyStateRef.current[key as 'w' | 'a' | 's' | 'd'] = false;
      }
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsPointerLocked(locked);
      if (locked) {
        setToast('');
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;

      const playerState = playerRef.current;
      playerState.yaw -= event.movementX * PLAYER_SETTINGS.mouseSensitivity;
      playerState.pitch -= event.movementY * PLAYER_SETTINGS.mouseSensitivity;
      playerState.pitch = clampPitch(playerState.pitch);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;

      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
        audioRef.current.playUiClick();
        return;
      }

      tryInteractFromCrosshair();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    const worldUp = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const desiredMove = new THREE.Vector3();

    const animate = (time: number) => {
      const prev = previousFrameTimeRef.current || time;
      const delta = Math.min(0.05, (time - prev) / 1000);
      previousFrameTimeRef.current = time;

      const playerState = playerRef.current;

      camera.rotation.y = playerState.yaw;
      camera.rotation.x = playerState.pitch;

      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, worldUp).normalize();

      desiredMove.set(0, 0, 0);
      const keys = keyStateRef.current;

      if (keys.w) desiredMove.add(forward);
      if (keys.s) desiredMove.sub(forward);
      if (keys.d) desiredMove.add(right);
      if (keys.a) desiredMove.sub(right);

      if (desiredMove.lengthSq() > 0) {
        desiredMove.normalize().multiplyScalar(PLAYER_SETTINGS.moveSpeed * delta);

        const tryX = playerState.x + desiredMove.x;
        if (!collidesWithWorld(tryX, playerState.z, PLAYER_SETTINGS.radius)) {
          playerState.x = tryX;
        }

        const tryZ = playerState.z + desiredMove.z;
        if (!collidesWithWorld(playerState.x, tryZ, PLAYER_SETTINGS.radius)) {
          playerState.z = tryZ;
        }
      }

      camera.position.set(playerState.x, PLAYER_SETTINGS.eyeHeight, playerState.z);

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hits = raycaster.intersectObjects(Array.from(itemMeshMapRef.current.values()), false);
      const hovered = hits.find((hit) => hit.distance <= PLAYER_SETTINGS.interactDistance);

      let hint = '';
      if (hovered) {
        const itemId = hovered.object.userData.itemId as string | undefined;
        if (itemId) {
          hoverItemIdRef.current = itemId;
          const item = itemById.get(itemId);
          if (item) {
            hint = `E / Click to interact: ${item.chinese}`;
          }
        }
      } else {
        hoverItemIdRef.current = null;
      }

      setInteractionHint(hint);

      itemMeshMapRef.current.forEach((mesh, itemId) => {
        const collected = inventoryRef.current.includes(itemId);
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissive.set(collected ? '#113322' : '#000000');
        material.opacity = collected ? 0.82 : 1;
        material.transparent = collected;

        const label = mesh.userData.label as THREE.Object3D | undefined;
        if (label) {
          label.lookAt(camera.position.x, label.position.y, camera.position.z);
        }
      });

      (retroPass.uniforms.time as { value: number }).value = time;

      composer.render();
      drawMinimap();
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);

      itemMeshMapRef.current.clear();
      rendererBundleRef.current = null;

      composer.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [itemById, tryInteractFromCrosshair]);

  useEffect(() => {
    if (!activeQuest) return;

    const progress = computeQuestProgress(activeQuest, inventoryIds, SUPERMARKET_ITEMS);
    if (!progress.isComplete) return;

    const replacement = rollQuest(inventoryIds, completedQuestCount);
    setActiveQuest(replacement);
  }, [activeQuest, completedQuestCount, inventoryIds]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      persistSupermarketSave({
        inventoryIds,
        completedQuestCount,
        activeQuest,
        player: playerRef.current,
      });
    }, 900);

    return () => window.clearInterval(intervalId);
  }, [inventoryIds, completedQuestCount, activeQuest]);

  useEffect(() => {
    const flush = () => {
      persistSupermarketSave({
        inventoryIds: inventoryRef.current,
        completedQuestCount: completedQuestCountRef.current,
        activeQuest: activeQuestRef.current,
        player: playerRef.current,
      });
    };

    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, []);

  const questLabel = useMemo(() => {
    if (!activeQuest) return 'All 15 items collected. Supermarket exploration complete.';
    if (!questProgress) return activeQuest.description;
    return `${activeQuest.description} (${describeQuestProgress(activeQuest, questProgress, SUPERMARKET_ITEMS)})`;
  }, [activeQuest, questProgress]);

  return (
    <div className="relative h-[calc(100vh-170px)] min-h-[620px] bg-zinc-950 border-y-4 border-black overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-300/90 text-lg">+</div>
      </div>

      {!isPointerLocked && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/50 pointer-events-none">
          <div className="bg-zinc-900/90 border border-cyan-300 px-5 py-4 text-cyan-100 max-w-md text-sm">
            Click game view to lock mouse. Use WASD to move, mouse to look, E or left click to interact.
          </div>
        </div>
      )}

      <div className="absolute left-3 top-3 z-20 max-w-[430px] bg-black/65 border border-emerald-300 text-emerald-100 p-3 space-y-2">
        <p className="text-xs uppercase tracking-wide text-emerald-300">Current Quest</p>
        <p className="font-semibold leading-snug">{questLabel}</p>
        {activeQuest && questProgress && (
          <p className="text-xs text-emerald-200">Progress: {questProgress.current}/{questProgress.target} • Reward: {activeQuest.xpReward} XP</p>
        )}
      </div>

      <div className="absolute left-3 bottom-3 z-20 w-[360px] max-h-[44%] bg-black/65 border border-sky-300 text-sky-100 p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wide text-sky-300">Inventory</p>
          <p className="text-xs">{inventoryIds.length}/{INVENTORY_LIMIT}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs overflow-auto pr-1">
          {Array.from({ length: INVENTORY_LIMIT }).map((_, index) => {
            const itemId = inventoryIds[index];
            const item = itemId ? itemById.get(itemId) : null;
            return (
              <div
                key={`slot-${index}`}
                className={`h-11 border px-1 py-0.5 flex flex-col justify-center ${item ? 'border-sky-300 bg-sky-950/70' : 'border-sky-900 bg-black/20'}`}
              >
                {item ? (
                  <>
                    <span className="leading-none">{item.icon} {item.chinese}</span>
                    <span className="opacity-70 leading-none">{item.english}</span>
                  </>
                ) : (
                  <span className="opacity-30">empty</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-[11px] text-sky-200">Completed quests: {completedQuestCount} • Level {level} • XP {xp}</div>
      </div>

      <div className="absolute right-3 top-3 z-20 bg-black/70 border border-amber-200 p-2">
        <p className="text-[11px] text-amber-100 mb-1">Minimap</p>
        <canvas ref={minimapRef} width={220} height={160} className="w-[220px] h-[160px] border border-amber-200/50" />
      </div>

      <div className="absolute right-3 bottom-3 z-20 bg-black/65 border border-zinc-300 text-zinc-100 px-3 py-2 text-xs space-y-1">
        <p>WASD move</p>
        <p>Mouse look</p>
        <p>E / Click interact</p>
        <p>Esc release cursor</p>
      </div>

      <div className="absolute right-3 top-[188px] z-20 pointer-events-auto">
        <button
          onClick={() => {
            clearSupermarketSave();
            setInventoryIds(defaultSaveState.inventoryIds);
            setCompletedQuestCount(defaultSaveState.completedQuestCount);
            setActiveQuest(rollQuest(defaultSaveState.inventoryIds, defaultSaveState.completedQuestCount));
            playerRef.current = { ...defaultSaveState.player };
            enqueueToast('Save reset. Re-entering supermarket.', 1800);
          }}
          className="flex items-center gap-1 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-300 text-zinc-100 px-2 py-1 text-xs"
          type="button"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Reset Save
        </button>
      </div>

      {(interactionHint || toast) && (
        <div className="absolute left-1/2 bottom-5 -translate-x-1/2 z-30 text-center">
          {interactionHint && (
            <div className="mb-1 bg-black/70 border border-cyan-300 text-cyan-100 px-3 py-1.5 text-sm">{interactionHint}</div>
          )}
          {toast && <div className="bg-black/80 border border-emerald-300 text-emerald-100 px-3 py-1.5 text-sm">{toast}</div>}
        </div>
      )}
    </div>
  );
}
