import { GameState, Resources } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { Effect } from '@/types/effects';
import { calculateCollection } from './resourceEngine';
import { researchTech, getTechCost } from './techEngine';
import { collectAllEffects, extractOneShotEffects } from './effectsEngine';
import { hexDistance, hexNeighbors } from '@/game/hex/hexUtils';
import { getBuildingDef } from '@/data/buildings';
import { getLandmark } from '@/data/mapFeatures';
import { getAvailablePopulation, getExplorationLevel, rebalanceWorkers } from './populationEngine';
import { getUnlockedBuildings } from './buildingEngine';

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
  if (state.resources.population <= 0) {
    return { phase: 'gameOver', gameOver: { reason: 'Your people have perished.', victory: false } };
  }

  const effects = collectAllEffects(state);
  const balancedMap = rebalanceWorkers(state.map, state.resources.population);

  const delta = calculateCollection({
    map: balancedMap,
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
      map: rebalanceWorkers(state.map, 0),
      growthProgress: 0,
      phase: 'gameOver',
      gameOver: { reason: 'Your people have perished.', victory: false },
    };
  }

  // Apply knowledge income toward active research
  const result: CollectResult = { resources: newResources, map: rebalanceWorkers(balancedMap, newResources.population), growthProgress: newGrowthProgress };

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
      const persistent = techEffects.filter(effect =>
        effect.type === 'army_bonus' || effect.type === 'tile_bonus' || effect.type === 'building_bonus' || effect.type === 'resource_per_turn' || effect.type === 'exploration_bonus'
      );
      result.permanentEffects = [...state.permanentEffects, ...persistent];
      const actionBonus = techEffects
        .filter(effect => effect.type === 'action_point_bonus')
        .reduce((sum, effect) => sum + effect.amount, 0);
      if (actionBonus) {
        result.maxActionPoints = state.maxActionPoints + actionBonus;
        result.actionPoints = state.actionPoints + actionBonus;
      }
    } else {
      result.researchProgress = newProgress;
    }
  }

  return result;
}

export function processSurveyAction(state: GameState, target: HexCoord): Partial<GameState> {
  const targetTile = state.map.find(tile => tile.coord.q === target.q && tile.coord.r === target.r && tile.coord.s === target.s);
  if (!targetTile?.visible || targetTile.surveyed || targetTile.rivalId) return {};

  const connectedToKnowledge = hexNeighbors(target).some(neighbor =>
    state.map.some(tile => (tile.surveyed || tile.controlled) && tile.coord.q === neighbor.q && tile.coord.r === neighbor.r && tile.coord.s === neighbor.s)
  );
  if (!connectedToKnowledge) return {};

  const range = getExplorationLevel(state);
  const map = state.map.map(tile => ({
    ...tile,
    visible: tile.visible || hexDistance(target, tile.coord) <= range,
    surveyed: tile.coord.q === target.q && tile.coord.r === target.r && tile.coord.s === target.s ? true : tile.surveyed,
  }));
  return { map, stats: { ...state.stats, tilesExplored: state.stats.tilesExplored + 1 } };
}

export function processExpandAction(state: GameState, target: HexCoord): Partial<GameState> {
  const targetTile = state.map.find(tile => tile.coord.q === target.q && tile.coord.r === target.r && tile.coord.s === target.s);
  if (!targetTile?.visible || !targetTile.surveyed || targetTile.controlled || targetTile.rivalId) return {};
  if (getAvailablePopulation(state) < 1) return {};
  const adjacentToControlled = hexNeighbors(target).some(neighbor =>
    state.map.some(tile => tile.controlled && tile.coord.q === neighbor.q && tile.coord.r === neighbor.r && tile.coord.s === neighbor.s)
  );
  if (!adjacentToControlled) return {};
  const map = state.map.map(tile => tile === targetTile ? { ...tile, controlled: true, worked: true } : tile);
  return { map, stats: { ...state.stats, tilesExpanded: state.stats.tilesExpanded + 1 } };
}

export function processBuildAction(state: GameState, target: HexCoord, buildingId: string): Partial<GameState> {
  const building = getBuildingDef(buildingId);
  const tile = state.map.find(item => item.coord.q === target.q && item.coord.r === target.r && item.coord.s === target.s);
  if (!building || !tile?.controlled || !tile.worked) return {};
  if (building.requiredTile && !building.requiredTile.includes(tile.type)) return {};
  if (tile.building && building.upgradesFrom !== tile.building) return {};
  if (!tile.building && building.upgradesFrom) return {};

  const unlocked = getUnlockedBuildings(state);
  if (!unlocked.has(buildingId)) return {};

  const resources = { ...state.resources };
  for (const [resource, cost] of Object.entries(building.cost)) {
    if (cost && resources[resource as keyof Resources] < cost) return {};
  }
  for (const [resource, cost] of Object.entries(building.cost)) {
    if (cost) resources[resource as keyof Resources] -= cost;
  }
  const map = state.map.map(item => item === tile ? { ...item, building: buildingId } : item);
  return { resources, map, stats: { ...state.stats, buildingsBuilt: state.stats.buildingsBuilt + 1 } };
}

export function processInvestigateAction(state: GameState, target: HexCoord): Partial<GameState> {
  const source = state.map.find(tile => tile.coord.q === target.q && tile.coord.r === target.r && tile.coord.s === target.s);
  if (!source?.visible || !source.surveyed || source.rivalId || !source.landmark || source.landmarkInvestigated) return {};
  const landmark = getLandmark(source.landmark);
  if (!landmark || !landmark.ages.includes(state.age)) return {};
  const map = state.map.map(tile => tile === source ? { ...tile, landmarkInvestigated: true } : tile);
  return {
    map,
    phase: 'event',
    currentEvent: landmark.eventId,
    eventOrigin: 'discovery',
    firedEvents: state.firedEvents.includes(landmark.eventId) ? state.firedEvents : [...state.firedEvents, landmark.eventId],
    stats: { ...state.stats, landmarksDiscovered: state.stats.landmarksDiscovered + 1 },
  };
}
