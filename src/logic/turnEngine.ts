import { GameState, Resources } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { Effect } from '@/types/effects';
import { calculateCollection } from './resourceEngine';
import { researchTech, getTechCost } from './techEngine';
import { collectAllEffects, extractOneShotEffects } from './effectsEngine';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { getBuildingDef } from '@/data/buildings';

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export interface CollectResult extends Partial<GameState> {
  completedTechEffects?: Effect[];
  completedTechId?: string;
}

/** Fibonacci sequence for growth thresholds: pop 1→2 costs 1, 2→3 costs 1, 3→4 costs 2, 4→5 costs 3, ... */
function growthThreshold(population: number): number {
  if (population <= 0) return 1;
  let a = 1, b = 1;
  for (let i = 1; i < population; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

export { growthThreshold };

export function processCollectPhase(state: GameState): CollectResult {
  const effects = collectAllEffects(state);

  const delta = calculateCollection({
    map: state.map,
    resources: state.resources,
    effects,
  });

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(delta)) {
    if (val !== undefined) {
      newResources[key as keyof Resources] = Math.max(0, newResources[key as keyof Resources] + val);
    }
  }

  // Population consumes food: 1 food per pop
  const foodConsumption = newResources.population;
  newResources.food = Math.max(0, newResources.food - foodConsumption);

  // Starvation: if not enough food to feed everyone, 1 pop dies
  const foodAfterProduction = state.resources.food + (delta.food ?? 0);
  let newGrowthProgress = state.growthProgress;
  let popChange = 0;

  if (foodAfterProduction < newResources.population) {
    // Not enough food — starvation
    popChange = -1;
    newGrowthProgress = 0; // reset growth on starvation
  } else {
    // Food surplus goes toward growth
    const foodSurplus = newResources.food > 0 ? Math.max(0, (delta.food ?? 0) - foodConsumption) : 0;

    // Growth bonus from effects (e.g., Healers tag)
    let growthBonus = 0;
    for (const e of effects) {
      if (e.type === 'resource_per_turn' && e.resource === 'population') {
        growthBonus += e.amount;
      }
    }

    const growthGain = foodSurplus + growthBonus;
    newGrowthProgress += growthGain;

    // Check if growth meter is full
    const threshold = growthThreshold(newResources.population);
    if (newGrowthProgress >= threshold) {
      popChange = 1;
      newGrowthProgress -= threshold; // carry over surplus
    }
  }

  newResources.population = Math.max(0, newResources.population + popChange);

  // Check loss condition
  if (newResources.population <= 0) {
    return {
      resources: newResources,
      growthProgress: 0,
      phase: 'gameOver',
      gameOver: { reason: 'Your people have perished.', victory: false },
    };
  }

  // Apply knowledge income toward active research
  const result: CollectResult = { resources: newResources, growthProgress: newGrowthProgress };

  if (state.activeResearch) {
    const knowledgeGain = delta.knowledge ?? 0;
    const newProgress = state.researchProgress + knowledgeGain;
    const cost = getTechCost(state.activeResearch, state.techs);

    if (newProgress >= cost) {
      // Research complete — apply effects
      const { techs: newTechs, effects: techEffects } = researchTech(state.activeResearch, state.techs);
      result.techs = newTechs;
      result.completedTechId = state.activeResearch;
      result.activeResearch = null;
      result.researchProgress = 0;

      // Store effects for the caller to apply (army, tags, traits, advance)
      result.completedTechEffects = techEffects;
    } else {
      result.researchProgress = newProgress;
    }
  }

  return result;
}

export function processExploreAction(state: GameState, target: HexCoord): Partial<GameState> {
  const newMap = state.map.map(t => ({ ...t }));
  const tile = newMap.find(t => t.coord.q === target.q && t.coord.r === target.r && t.coord.s === target.s);

  if (!tile) return {};

  tile.visible = true;
  tile.controlled = tile.rivalId === null;

  // Also reveal neighbors
  for (const neighbor of hexNeighbors(target)) {
    const nTile = newMap.find(t => t.coord.q === neighbor.q && t.coord.r === neighbor.r);
    if (nTile) nTile.visible = true;
  }

  return { map: newMap };
}

export function processBuildAction(state: GameState, target: HexCoord, buildingId: string): Partial<GameState> {
  const building = getBuildingDef(buildingId);
  if (!building) return {};

  // Check cost
  const newResources = { ...state.resources };
  for (const [res, cost] of Object.entries(building.cost)) {
    if (cost && newResources[res as keyof Resources] < cost) return {}; // can't afford
  }

  // Deduct cost
  for (const [res, cost] of Object.entries(building.cost)) {
    if (cost) newResources[res as keyof Resources] -= cost;
  }

  // Place building
  const newMap = state.map.map(t => {
    if (t.coord.q === target.q && t.coord.r === target.r && t.coord.s === target.s) {
      return { ...t, building: buildingId };
    }
    return t;
  });

  return { resources: newResources, map: newMap };
}
