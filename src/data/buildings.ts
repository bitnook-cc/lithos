import { BuildingDef } from '@/types/game';

export const BUILDINGS: BuildingDef[] = [
  { id: 'hearthstone', name: 'Hearthstone', cost: { materials: 0 }, produces: { food: 1, materials: 1, wealth: 1, influence: 1, population: 1 }, availableFrom: 'stone' },
  { id: 'camp', name: 'Camp', cost: { materials: 0 }, produces: { food: 1 }, availableFrom: 'stone' },
  { id: 'gathering_site', name: 'Gathering Site', cost: { materials: 3 }, produces: { food: 2 }, requiredTile: ['plains', 'forest', 'fertile'], availableFrom: 'stone' },
  { id: 'quarry', name: 'Quarry', cost: { food: 3 }, produces: { materials: 3 }, requiredTile: ['mountain'], availableFrom: 'stone' },
  { id: 'woodcutter', name: 'Woodcutter', cost: { food: 2 }, produces: { materials: 2 }, requiredTile: ['forest'], availableFrom: 'stone' },
  { id: 'shrine', name: 'Shrine', cost: { materials: 5 }, produces: { knowledge: 1 }, availableFrom: 'stone' },
  { id: 'watchtower', name: 'Watchtower', cost: { materials: 4 }, produces: {}, armyBonuses: { toughness: 2 }, availableFrom: 'stone' },

  // Ocean buildings
  { id: 'fishing_dock', name: 'Fishing Dock', cost: { materials: 4 }, produces: { food: 3 }, requiredTile: ['water'], availableFrom: 'stone' },
  { id: 'pearl_diver', name: 'Pearl Diver', cost: { materials: 3, food: 2 }, produces: { wealth: 2 }, requiredTile: ['water'], availableFrom: 'stone' },

  // Desert buildings
  { id: 'oasis_well', name: 'Oasis Well', cost: { materials: 5 }, produces: { food: 2, population: 1 }, requiredTile: ['desert'], availableFrom: 'stone' },
  { id: 'sand_quarry', name: 'Sand Quarry', cost: { food: 3 }, produces: { materials: 2 }, requiredTile: ['desert'], availableFrom: 'stone' },

  // New tile buildings
  { id: 'herbalist_hut', name: 'Herbalist Hut', cost: { materials: 4 }, produces: { knowledge: 2, food: 1 }, requiredTile: ['rainforest', 'swamp'], availableFrom: 'stone' },
  { id: 'peat_harvester', name: 'Peat Harvester', cost: { materials: 3 }, produces: { materials: 2 }, requiredTile: ['swamp'], availableFrom: 'stone' },
  { id: 'hill_fort', name: 'Hill Fort', cost: { materials: 6 }, produces: {}, armyBonuses: { toughness: 3, morale: 1 }, requiredTile: ['hills'], availableFrom: 'stone' },
  { id: 'hunting_lodge', name: 'Hunting Lodge', cost: { materials: 4 }, produces: { food: 2 }, armyBonuses: { stealth: 1 }, requiredTile: ['rainforest', 'forest', 'hills'], availableFrom: 'stone' },
  { id: 'ice_fishing', name: 'Ice Fishing Hole', cost: { materials: 2 }, produces: { food: 2 }, requiredTile: ['ice', 'snow'], availableFrom: 'stone' },
];

export function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}
