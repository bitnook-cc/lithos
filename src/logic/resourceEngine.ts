import { Resources } from '@/types/game';
import { Tile, TileType } from '@/types/map';
import { Effect } from '@/types/effects';
import { getBuildingDef } from '@/data/buildings';
import { computeTileBonuses, computeBuildingBonuses, computeResourceBonuses } from './effectsEngine';

/** Base yield per turn for each controlled tile type */
const TILE_YIELDS: Record<TileType, Partial<Resources>> = {
  plains:   { food: 1 },
  forest:   { food: 1, materials: 1 },
  mountain: { materials: 2 },
  water:    { food: 1 },
  desert:   {},
  ruins:    { knowledge: 1 },
  fertile:  { food: 2 },
  special:  { knowledge: 1, influence: 1 },
  rainforest: { food: 2, materials: 1 },
  swamp: { food: 1 },
  hills: { food: 1, materials: 1 },
  snow: {},
  ice: {},
};

export function getTileYield(type: TileType): Partial<Resources> {
  return TILE_YIELDS[type] ?? {};
}

interface CollectionInput { map: Tile[]; resources: Resources; effects: Effect[]; }

export function calculateCollection(input: CollectionInput): Partial<Resources> {
  const { map, resources, effects } = input;
  const delta: Record<string, number> = { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 0 };
  delta.food += Math.floor(resources.population / 2);

  for (const tile of map) {
    if (!tile.controlled) continue;

    // Base tile yield
    const yields = TILE_YIELDS[tile.type];
    if (yields) {
      for (const [res, amount] of Object.entries(yields)) {
        if (amount) delta[res] = (delta[res] || 0) + amount;
      }
    }

    // Tile bonuses from effects
    const tileBonuses = computeTileBonuses(effects, tile.type);
    for (const [res, amount] of Object.entries(tileBonuses)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }

    // Building production (additive on top of tile yield)
    if (tile.building) {
      const building = getBuildingDef(tile.building);
      if (building) {
        for (const [res, amount] of Object.entries(building.produces)) {
          if (amount) delta[res] = (delta[res] || 0) + amount;
        }

        // Building bonuses from effects
        const buildingBonuses = computeBuildingBonuses(effects, tile.building);
        for (const [res, amount] of Object.entries(buildingBonuses)) {
          if (amount) delta[res] = (delta[res] || 0) + amount;
        }
      }
    }
  }

  // Resource per-turn bonuses from effects
  const resourceBonuses = computeResourceBonuses(effects);
  for (const [res, amount] of Object.entries(resourceBonuses)) {
    if (amount) delta[res] = (delta[res] || 0) + amount;
  }

  const netFood = (resources.food || 0) + delta.food;
  if (netFood > 3) delta.population += 1;
  return delta;
}
