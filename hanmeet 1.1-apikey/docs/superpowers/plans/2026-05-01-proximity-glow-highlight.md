# Proximity Glow Highlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a faint glow marker at every tagged item's position in the room scene, brightening with a floating Chinese label when the player is nearby.

**Architecture:** Add an `ItemGlowLayer` inline component inside `RoomInterior.tsx` between the background `<img>` and the player `<canvas>`. The component consumes `items` (already a prop) and `nearItem` (already returned by `useRoomEngine`). No changes to the engine, data files, or any other component.

**Tech Stack:** React 19, TypeScript, inline CSS (box-shadow for glow, Press Start 2P font already loaded)

---

### Task 1: Add ItemGlowLayer to RoomInterior.tsx

**Files:**
- Modify: `src/features/game/components/RoomInterior.tsx`

- [ ] **Step 1: Add the ItemGlowLayer component above the RoomInterior export**

Open `src/features/game/components/RoomInterior.tsx` and insert this new component after the `toInteriorItem` function (after line 31) and before the `interface Props` declaration:

```tsx
function ItemGlowLayer({ items, nearItem }: { items: RoomItem[]; nearItem: RoomItem | null }) {
  return (
    <>
      {items.map(item => {
        const isNear = nearItem?.id === item.id;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.xPct}%`,
              top: `${item.yPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              boxShadow: isNear
                ? '0 0 20px 10px rgba(255, 220, 80, 0.75)'
                : '0 0 12px 6px rgba(255, 220, 80, 0.25)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {isNear && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 14,
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: '#ffffff',
                background: 'rgba(0,0,0,0.75)',
                padding: '3px 6px',
                whiteSpace: 'nowrap',
                borderRadius: 2,
              }}>
                {item.chinese}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
```

- [ ] **Step 2: Insert ItemGlowLayer into the scaled scene JSX**

Inside the scaled scene wrapper `<div>` (around line 67), add `<ItemGlowLayer>` between the `<img>` and the `<canvas>`:

Replace this block:
```tsx
        <img
          src={BG[roomId]}
          alt="room"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'fill',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
        <canvas
          ref={canvasRef}
          width={ROOM_W}
          height={ROOM_H}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
        />
```

With:
```tsx
        <img
          src={BG[roomId]}
          alt="room"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'fill',
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
        <ItemGlowLayer items={items} nearItem={nearItem} />
        <canvas
          ref={canvasRef}
          width={ROOM_W}
          height={ROOM_H}
          style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
        />
```

- [ ] **Step 3: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: no errors, no warnings about unused variables or missing types.

- [ ] **Step 4: Manual visual test — faint glows**

Run `npm run dev`, open a room (cafe, house, or supermarket). Without moving the character:
- You should see faint yellow glow dots scattered across the scene at item positions
- No labels visible yet
- Player sprite renders on top as normal

- [ ] **Step 5: Manual visual test — proximity highlight**

Walk the character toward a glow dot:
- When within ~70px of the item, the dot brightens to a strong yellow glow
- A floating Chinese label appears above it (e.g. `木桶`, `咖啡`, `桌子`)
- The existing "[E] inspect ..." banner still appears at the bottom
- Moving away from the item returns it to the faint state
- Test in all three rooms (cafe, house, supermarket)

- [ ] **Step 6: Commit**

```bash
git add src/features/game/components/RoomInterior.tsx
git commit -m "feat: add proximity glow highlight to room items"
```
