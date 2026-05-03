# HanMeet — Lessons & Session Log

---

## Session: 2026-05-02

### What was completed
- Replaced all item positions in `houseRoomItems.ts` — 31 items mapped to correct rooms using user-dragged coordinates from the interactive HTML preview.
- Replaced all items in `supermarketRoomItems.ts` — 30 items with user-confirmed coordinates (sugar×2, salt×2, food, condiments, equipment, cashier×2).
- Replaced all items in `cafeRoomItems.ts` — 21 items with user-confirmed coordinates (sofa×3, chair×5, table-big×2, table-small×3, drinks, equipment, staff).
- ⚠️ `cafe-waiter-station` position is unset (xPct:100, yPct:0) — needs user to confirm correct spot.

### Bugs fixed
- Item hotspots were placed in completely wrong rooms (e.g. fireplace in living room, kitchen in top-right, balcony at bottom).

### Exact next step
- Ask user for `cafe-waiter-station` correct xPct/yPct position.
- Hard refresh `localhost:3000` to verify all room items trigger correctly in-game.

---

## Key Lesson: Editing Room Item Positions

**Always use the interactive HTML drag-and-drop preview** when editing `xPct`/`yPct` positions for any room.

### How to do it:
1. A Python HTTP server runs on **`localhost:7788`** from the project root:
   ```
   python3 -m http.server 7788
   ```
2. The drag preview files are:
   - `placement-preview.html` — House room
   - `rooms-preview.html` — Supermarket + Cafe (tabbed)
3. Open the URL in a browser, drag the dots onto the correct background spots, then paste the live code output back.
4. **Never guess coordinates** — always use the visual drag tool so the user can verify before code changes.

### Why this matters
- The background images use `objectFit: fill` stretched to 1280×720.
- xPct/yPct errors of even 10% can place a hotspot in the wrong room entirely.
- The user must visually confirm placement before the code is written.

---

## Key Lesson: Use Sprite Sheets & Tiles, NOT CSS Geometry

- CSS gradients/shapes cannot replicate pixel art quality.
- Always load actual PNG assets, never recreate them with CSS.
- Use `imageRendering: 'pixelated'` to keep sprites crisp.
- Implement proper z-ordering: `zIndex = Math.floor(tileY) + offset`.
