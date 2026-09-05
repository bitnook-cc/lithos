import { GameState } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { collectAllEffects } from './effectsEngine';
import { hexDistance } from '@/game/hex/hexUtils';

const ORIGIN: HexCoord = { q: 0, r: 0, s: 0 };
const tileKey = (tile: Tile) => `${tile.coord.q},${tile.coord.r},${tile.coord.s}`;

/** Each player-controlled tile permanently reserves one person, whether currently productive or dormant. */
export function getReservedPopulation(map: Tile[]): number {
  return map.filter(tile => tile.controlled).length;
}

export function getAvailablePopulation(state: Pick<GameState, 'map' | 'resources'>): number {
  return Math.max(0, state.resources.population - getReservedPopulation(state.map));
}

export function getExplorationLevel(state: GameState): number {
  const bonuses = collectAllEffects(state)
    .filter(effect => effect.type === 'exploration_bonus')
    .reduce((sum, effect) => sum + effect.amount, 0);
  return Math.max(1, Math.min(3, state.exploration + bonuses));
}

/** Population loss keeps territory, but the most distant undeveloped districts become dormant. */
export function rebalanceWorkers(map: Tile[], population: number): Tile[] {
  const controlled = map.filter(tile => tile.controlled).sort((a, b) => {
    const aOrigin = hexDistance(ORIGIN, a.coord) === 0 ? -100 : 0;
    const bOrigin = hexDistance(ORIGIN, b.coord) === 0 ? -100 : 0;
    const aDeveloped = a.building ? -20 : 0;
    const bDeveloped = b.building ? -20 : 0;
    return aOrigin - bOrigin || (b.workPriority ?? 0) - (a.workPriority ?? 0) || (aDeveloped + hexDistance(ORIGIN, a.coord)) - (bDeveloped + hexDistance(ORIGIN, b.coord));
  });
  const staffed = new Set(controlled.slice(0, Math.max(0, population)).map(tileKey));
  return map.map(tile => {
    const worked = tile.controlled && staffed.has(tileKey(tile));
    return tile.worked === worked ? tile : { ...tile, worked };
  });
}
