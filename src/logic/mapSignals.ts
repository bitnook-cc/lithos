import { GameState } from '@/types/game';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { HexCoord } from '@/types/map';

export const districtKey = (coord: HexCoord) => `${coord.q},${coord.r}`;

/** Only warn about observed borders. This is risk, not a prediction of the RNG. */
export function frontierWarnings(state: Pick<GameState, 'map' | 'rivals'>) {
  return state.rivals.filter(rival => rival.personality === 'aggressive' && rival.disposition < 20).flatMap(rival => {
    const observedBorder = new Set(state.map.filter(t => t.visible && t.rivalId === rival.id).flatMap(t => hexNeighbors(t.coord).map(districtKey)));
    const districts = state.map.filter(t => t.visible && t.controlled && observedBorder.has(districtKey(t.coord)));
    return districts.length ? [{ rival, districts }] : [];
  });
}
