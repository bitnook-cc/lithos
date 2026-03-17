import { Resources, TechNode } from '@/types/game';
import { Tile, TileType } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';

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
};

export function getTileYield(type: TileType): Partial<Resources> {
  return TILE_YIELDS[type] ?? {};
}

interface CollectionInput { map: Tile[]; resources: Resources; techs: TechNode[]; }

export function calculateCollection(input: CollectionInput): Partial<Resources> {
  const { map, resources, techs } = input;
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

    // Building production (additive on top of tile yield)
    if (tile.building) {
      const building = getBuildingDef(tile.building);
      if (building) {
        for (const [res, amount] of Object.entries(building.produces)) {
          if (amount) delta[res] = (delta[res] || 0) + amount;
        }
      }
    }
  }

  for (const tech of techs) {
    if (!tech.researched || !tech.effects.resourceBonuses) continue;
    for (const [res, amount] of Object.entries(tech.effects.resourceBonuses)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }
  }
  const netFood = (resources.food || 0) + delta.food;
  if (netFood > 3) delta.population += 1;
  return delta;
}
