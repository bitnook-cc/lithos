import { Resources, TechNode } from '@/types/game';
import { Tile } from '@/types/map';
import { getBuildingDef } from '@/data/buildings';

interface CollectionInput { map: Tile[]; resources: Resources; techs: TechNode[]; armyNumbers?: number; }

export function calculateCollection(input: CollectionInput): Partial<Resources> {
  const { map, resources, techs, armyNumbers = 0 } = input;
  const delta: Record<string, number> = { food: 0, materials: 0, wealth: 0, knowledge: 0, influence: 0, population: 0 };
  delta.food += Math.floor(resources.population / 2);
  for (const tile of map) {
    if (!tile.controlled || !tile.building) continue;
    const building = getBuildingDef(tile.building);
    if (!building) continue;
    for (const [res, amount] of Object.entries(building.produces)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }
  }
  for (const tech of techs) {
    if (!tech.researched || !tech.effects.resourceBonuses) continue;
    for (const [res, amount] of Object.entries(tech.effects.resourceBonuses)) {
      if (amount) delta[res] = (delta[res] || 0) + amount;
    }
  }
  delta.food -= Math.floor(armyNumbers / 2);
  const netFood = (resources.food || 0) + delta.food;
  if (netFood > 3) delta.population += 1;
  return delta;
}
