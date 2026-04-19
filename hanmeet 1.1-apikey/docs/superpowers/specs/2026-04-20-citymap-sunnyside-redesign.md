# CityMap Sunnyside World Redesign

**Date:** 2026-04-20  
**Scope:** `CityMap.tsx`, `cityLayout.ts` — visual overhaul only, no gameplay logic changes.

---

## Goal

Replace the current cool-tone city-grid aesthetic (gray roads, navy border, flat tiles) with a warm Stardew Valley / Sunnyside World farm aesthetic: open green farmland, sandy dirt paths, lush trees, fenced garden plots, and rustic wooden buildings.

Reference images:
- `/public/assets/gamepack/base_layout.png` — layout composition target
- `/public/assets/gamepack/Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets/Sunnyside_World_ExampleScene.png` — full visual quality target

---

## Map Layout

Grid size: ~40 cols × 28 rows of open farmland. No roads, no sidewalks, no cross-grid.

### Building Zones

| Building | Position | Status |
|----------|----------|--------|
| School (学校) | Top-left (~col 4–10, row 2–8) | **ACTIVE** — fully accessible |
| Supermarket (超市) | Top-right (~col 28–35, row 2–8) | **IN PROGRESS** — locked, construction sign |
| Café (咖啡厅) | Bottom-right (~col 28–35, row 18–24) | **IN PROGRESS** — locked, construction sign |

### Other Zones

- **Center**: Large fenced garden plot (col 14–24, row 10–18) with Sunnyside crops
- **Sandy paths**: Winding dirt paths connect player start → school door, and toward (but not into) in-progress buildings
- **Trees**: Scattered across all four corners and map edges
- **Flowers**: Sprinkled in grass areas between zones
- **Cliff edge**: Bottom 2 rows use `Cliff_Tile.png` for depth
- **Player start**: Center of map (~col 20, row 14)

---

## Tile Palette

All ground tiles use CSS `background-image` with tile assets from `public/assets/`.

| Tile ID | Visual | Asset |
|---------|--------|-------|
| `grass` | Warm green | `Sunnyside_World_ASSET_PACK_V2.1/Sunnyside_World_Assets/Tileset/spr_tileset_sunnysideworld_16px.png` (grass tile via background-position) — fallback CSS color `#6db33f` |
| `path` | Sandy tan earthy dirt | `gamepack/tiles/Path_Tile.png` |
| `farmland` | Dark tilled soil | `gamepack/tiles/FarmLand_Tile.png` |
| `cliff` | Rocky edge | `gamepack/tiles/Cliff_Tile.png` |
| `water` | Blue pond | CSS color `#4a9aba` with shimmer |
| `flower` | Pink/yellow wildflowers | CSS-rendered (existing) |
| `tree` | Round green tree | `gamepack/Outdoor decoration/Oak_Tree.png` / `Oak_Tree_Small.png` |

Remove tile types: `road`, `sidewalk`, `wall`, `door` (door replaced by building doorstep path).

---

## Asset Paths (Fixed)

Current broken references → corrected paths:

| Variable | Broken path | Correct path |
|----------|-------------|--------------|
| `BUILDING_SPRITE` | `/assets/gamepack/props/house_blue.png` | `/assets/gamepack/Outdoor decoration/House_1_Wood_Base_Blue.png` |
| `TREE_LARGE` | `/assets/gamepack/props/oak_tree.png` | `/assets/gamepack/Outdoor decoration/Oak_Tree.png` |
| `TREE_SMALL` | `/assets/gamepack/props/oak_tree_small.png` | `/assets/gamepack/Outdoor decoration/Oak_Tree_Small.png` |
| `CHEST_SPRITE` | `/assets/raw_import/Cute_Fantasy_Free/...` | `/assets/gamepack/Outdoor decoration/Chest.png` |
| `NPC_IDLE_STRIPS` | `/assets/gamepack/sprites/npc_*.png` | 3 Sunnyside strips: `Characters/Human/IDLE/shorthair_idle_strip9.png`, `longhair_idle_strip9.png`, `curlyhair_idle_strip9.png` — 9 frames × 16px wide, animated via `backgroundPosition` |
| grass tile | `/assets/gamepack/tiles/grass_16.png` | `/assets/gamepack/tiles/Grass_Middle.png` |
| path tile | `/assets/gamepack/tiles/path_16.png` | `/assets/gamepack/tiles/Path_Tile.png` |

---

## In-Progress Building Treatment

Buildings with status `inProgress: true` render with:

1. **Sprite**: same `House_1_Wood_Base_Blue.png` but with CSS `filter: sepia(0.6) opacity(0.65) brightness(0.9)`
2. **Sign overlay**: CSS-rendered construction sign post (matching existing board interactable style) — brown post, cream panel with "🚧" text
3. **E interaction**: Shows popup: `"工地 Coming Soon — 即将开放!"` in existing pixel popup style (no vocab entry, no building enter)
4. **Door tile**: Replaced by a `path` tile — no `door` entry in CITY_GRID

Building data shape gains an `inProgress` boolean field.

---

## Color Palette Changes

| Element | Before | After |
|---------|--------|-------|
| Outer container bg | `#243a68 → #1b2f56` (navy) | `#2d5a1b` (deep forest green) |
| Game world border | `4px solid #0e1628` | `4px solid #3d2b1a` (warm dark wood) |
| Border glow ring | `#344d7d` | `#7a5c2e` (warm amber) |
| World base bg | `#6ea76a` | `#7ec850` (bright warm grass) |
| Road tile | `#57607a` | removed |
| Sidewalk tile | `#8b95a8` | removed |

---

## Garden / Crop Decoration

Garden patches (from `GARDEN_PATCHES` in cityLayout.ts) use `FarmLand_Tile.png` as today. Seedlings upgraded:

- Replace CSS-drawn sprouts/flowers with Sunnyside crop images:
  - `sprout` → `Elements/Crops/kale_00.png` (seedling stage)
  - `flower` → `Elements/Crops/sunflower_02.png` (bloomed)
  - Add `carrot` → `Elements/Crops/carrot_01.png`

Crop images rendered as `<img>` with `imageRendering: pixelated`, 16×16px.

---

## Out of Scope

- Interior scenes (ClassroomInterior, CafeInterior, SupermarketInterior) — unchanged
- Flashcard quiz, vocab popup, notebook — unchanged
- Player movement physics, camera — unchanged
- Building unlock logic / progression system — not implemented (in-progress is visual only)

---

## Success Criteria

- [ ] No gray roads or sidewalks visible
- [ ] Sandy path tiles wind from player start to school door
- [ ] School is fully enterable (press E at door)
- [ ] Supermarket and Café show construction sign and "Coming Soon" popup on E
- [ ] All tree/building sprites load correctly (no broken images)
- [ ] Sunnyside crop images appear in garden zone
- [ ] Outer border is warm wood-brown, not navy
- [ ] `npm run lint && npm run build` pass
