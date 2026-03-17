import { BuildingDef } from '@/types/game';

export const BUILDINGS: BuildingDef[] = [
  { id: 'camp', name: 'Camp', cost: { materials: 0 }, produces: { food: 1 }, availableFrom: 'stone' },
  { id: 'gathering_site', name: 'Gathering Site', cost: { materials: 3 }, produces: { food: 2 }, requiredTile: ['plains', 'forest', 'fertile'], availableFrom: 'stone' },
  { id: 'quarry', name: 'Quarry', cost: { food: 3 }, produces: { materials: 3 }, requiredTile: ['mountain'], availableFrom: 'stone' },
  { id: 'woodcutter', name: 'Woodcutter', cost: { food: 2 }, produces: { materials: 2 }, requiredTile: ['forest'], availableFrom: 'stone' },
  { id: 'shrine', name: 'Shrine', cost: { materials: 5 }, produces: { knowledge: 1 }, availableFrom: 'stone' },
  { id: 'watchtower', name: 'Watchtower', cost: { materials: 4 }, produces: {}, armyBonuses: { toughness: 2 }, availableFrom: 'stone' },
];

export function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}
