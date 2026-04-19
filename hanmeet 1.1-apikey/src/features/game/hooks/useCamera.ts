import { useMemo } from 'react';
import { PlayerState } from '../../../types/domain';
import { TILE_SIZE, CITY_COLS, CITY_ROWS } from '../data/cityLayout';

export function useCamera(player: PlayerState, viewW: number, viewH: number) {
  return useMemo(() => {
    const worldW = CITY_COLS * TILE_SIZE;
    const worldH = CITY_ROWS * TILE_SIZE;
    const halfW = viewW / 2;
    const halfH = viewH / 2;

    let camX = player.x + 12 - halfW;
    let camY = player.y + 12 - halfH;

    camX = Math.max(0, Math.min(worldW - viewW, camX));
    camY = Math.max(0, Math.min(worldH - viewH, camY));

    return { camX, camY };
  }, [player.x, player.y, viewW, viewH]);
}
