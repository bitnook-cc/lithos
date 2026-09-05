import { GameState, Resources } from '@/types/game';
import { Tile } from '@/types/map';
import { calculateCollection } from './resourceEngine';
import { collectAllEffects, computeResourceBonuses } from './effectsEngine';
import { getBuildingDef } from '@/data/buildings';

export function districtYield(state: GameState, tile: Tile): Partial<Resources> {
  return calculateCollection({ map: [{ ...tile, controlled: true, worked: true }], resources: state.resources, effects: collectAllEffects(state).filter(e => e.type !== 'resource_per_turn') });
}
export function economySummary(state: GameState) {
  const effects = collectAllEffects(state);
  const produced = calculateCollection({ map: state.map, resources: state.resources, effects });
  const netFood = (produced.food ?? 0) - state.resources.population;
  const starvationIn = netFood < 0 ? Math.floor(state.resources.food / -netFood) + 1 : null;
  const districts = state.map.filter(t => t.controlled).map(tile => ({ tile, name: tile.settlementName ?? getBuildingDef(tile.building ?? '')?.name ?? `${tile.type} (${tile.coord.q}, ${tile.coord.r})`, yields: districtYield(state, tile) }));
  return { produced, netFood, starvationIn, districts, traditions: computeResourceBonuses(effects) };
}
