import { GameState, Resources } from '@/types/game';
import { HexCoord, Tile } from '@/types/map';
import { calculateCollection } from './resourceEngine';
import { researchTech, getTechCost } from './techEngine';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { getBuildingDef } from '@/data/buildings';

const hexKey = (c: HexCoord) => `${c.q},${c.r}`;

export interface CollectResult extends Partial<GameState> {
  completedTechEffects?: import('@/types/game').TechEffects;
  completedTechId?: string;
}

export function processCollectPhase(state: GameState): CollectResult {
  const delta = calculateCollection({
    map: state.map,
    resources: state.resources,
    techs: state.techs,
  });

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(delta)) {
    if (val !== undefined) {
      newResources[key as keyof Resources] = Math.max(0, newResources[key as keyof Resources] + val);
    }
  }

  // Starvation: if food is 0, lose population
  if (newResources.food <= 0) {
    newResources.population = Math.max(0, newResources.population - 2);
  }

  // Check loss condition
  if (newResources.population <= 0) {
    return {
      resources: newResources,
      phase: 'gameOver',
      gameOver: { reason: 'Your people have perished.', victory: false },
    };
  }

  // Apply knowledge income toward active research
  const result: CollectResult = { resources: newResources };

  if (state.activeResearch) {
    const knowledgeGain = delta.knowledge ?? 0;
    const newProgress = state.researchProgress + knowledgeGain;
    const cost = getTechCost(state.activeResearch, state.techs);

    if (newProgress >= cost) {
      // Research complete — apply effects
      const { techs: newTechs, effects } = researchTech(state.activeResearch, state.techs);
      result.techs = newTechs;
      result.completedTechId = state.activeResearch;
      result.activeResearch = null;
      result.researchProgress = 0;

      // Apply tech effects to resources (knowledge bonuses increase research rate)
      if (effects.resourceBonuses) {
        for (const [key, val] of Object.entries(effects.resourceBonuses)) {
          if (val) newResources[key as keyof Resources] = Math.max(0, newResources[key as keyof Resources] + val);
        }
      }
      // Store effects for the caller to apply (army, tags, traits, advance)
      result.completedTechEffects = effects;
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
