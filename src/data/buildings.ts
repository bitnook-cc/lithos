import { BuildingDef } from '@/types/game';

export const BUILDINGS: BuildingDef[] = [
  { id: 'hearthstone', name: 'Hearthstone', cost: { materials: 0 }, produces: { food: 1, materials: 1, wealth: 1, influence: 1, knowledge: 1 }, availableFrom: 'stone' },
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
  { id: 'oasis_well', name: 'Oasis Well', cost: { materials: 5 }, produces: { food: 3 }, requiredTile: ['desert'], availableFrom: 'stone' },
  { id: 'sand_quarry', name: 'Sand Quarry', cost: { food: 3 }, produces: { materials: 2 }, requiredTile: ['desert'], availableFrom: 'stone' },

  // New tile buildings
  { id: 'herbalist_hut', name: 'Herbalist Hut', cost: { materials: 4 }, produces: { knowledge: 2, food: 1 }, requiredTile: ['rainforest', 'swamp'], availableFrom: 'stone' },
  { id: 'peat_harvester', name: 'Peat Harvester', cost: { materials: 3 }, produces: { materials: 2 }, requiredTile: ['swamp'], availableFrom: 'stone' },
  { id: 'hill_fort', name: 'Hill Fort', cost: { materials: 6 }, produces: {}, armyBonuses: { toughness: 3, morale: 1 }, requiredTile: ['hills'], availableFrom: 'stone' },
  { id: 'hunting_lodge', name: 'Hunting Lodge', cost: { materials: 4 }, produces: { food: 2 }, armyBonuses: { stealth: 1 }, requiredTile: ['rainforest', 'forest', 'hills'], availableFrom: 'stone' },
  { id: 'ice_fishing', name: 'Ice Fishing Hole', cost: { materials: 2 }, produces: { food: 2 }, requiredTile: ['ice', 'snow'], availableFrom: 'stone' },

  // === Upgrade buildings ===
  { id: 'primitive_farm', name: 'Primitive Farm', cost: { materials: 4, food: 2 }, produces: { food: 4 }, requiredTile: ['plains', 'fertile'], availableFrom: 'stone', upgradesFrom: 'gathering_site' },
  { id: 'stone_mine', name: 'Stone Mine', cost: { materials: 3, food: 2 }, produces: { materials: 5 }, requiredTile: ['mountain'], availableFrom: 'stone', upgradesFrom: 'quarry' },
  { id: 'lumber_yard', name: 'Lumber Yard', cost: { materials: 3, food: 2 }, produces: { materials: 4, food: 1 }, requiredTile: ['forest', 'rainforest'], availableFrom: 'stone', upgradesFrom: 'woodcutter' },
  { id: 'temple', name: 'Temple', cost: { materials: 6, wealth: 2 }, produces: { knowledge: 3, influence: 1 }, availableFrom: 'stone', upgradesFrom: 'shrine' },
  { id: 'harbor', name: 'Harbor', cost: { materials: 5 }, produces: { food: 4, wealth: 1 }, requiredTile: ['water'], availableFrom: 'stone', upgradesFrom: 'fishing_dock' },
  { id: 'fortress', name: 'Fortress', cost: { materials: 8 }, produces: {}, armyBonuses: { toughness: 5, morale: 2 }, requiredTile: ['hills', 'mountain'], availableFrom: 'stone', upgradesFrom: 'hill_fort' },

  // Bronze Age civic economy
  { id: 'palace', name: 'River Palace', cost: {}, produces: { food: 2, materials: 2, wealth: 2, knowledge: 2, influence: 1 }, availableFrom: 'bronze' },
  { id: 'granary', name: 'Granary', cost: { materials: 6 }, produces: { food: 5 }, requiredTile: ['plains', 'fertile'], availableFrom: 'bronze' },
  { id: 'irrigated_farm', name: 'Irrigated Farm', cost: { materials: 5, wealth: 2 }, produces: { food: 7 }, requiredTile: ['plains', 'fertile'], availableFrom: 'bronze', upgradesFrom: 'granary' },
  { id: 'market', name: 'Caravan Market', cost: { materials: 5, food: 2 }, produces: { wealth: 4 }, availableFrom: 'bronze' },
  { id: 'scriptorium', name: 'Scriptorium', cost: { materials: 6, wealth: 2 }, produces: { knowledge: 3 }, availableFrom: 'bronze' },
  { id: 'bronze_foundry', name: 'Bronze Foundry', cost: { materials: 7, food: 3 }, produces: { materials: 3 }, armyBonuses: { strength: 2 }, requiredTile: ['mountain', 'hills'], availableFrom: 'bronze' },
  { id: 'barracks', name: 'Shield Barracks', cost: { materials: 8, food: 3 }, produces: {}, armyBonuses: { toughness: 3, numbers: 2 }, availableFrom: 'bronze' },
  { id: 'court', name: 'Hall of Law', cost: { materials: 7, wealth: 2 }, produces: { influence: 3 }, availableFrom: 'bronze' },
  { id: 'ziggurat', name: 'Ziggurat', cost: { materials: 10, wealth: 3 }, produces: { knowledge: 2, influence: 4 }, availableFrom: 'bronze' },

  // Classical Age institutions
  { id: 'forum', name: 'Grand Forum', cost: {}, produces: { food: 2, materials: 2, wealth: 3, knowledge: 2, influence: 3 }, availableFrom: 'classical' },
  { id: 'academy', name: 'Academy', cost: { materials: 8, wealth: 3 }, produces: { knowledge: 5 }, availableFrom: 'classical' },
  { id: 'aqueduct', name: 'Aqueduct', cost: { materials: 10, wealth: 2 }, produces: { food: 3 }, requiredTile: ['mountain', 'hills', 'plains'], availableFrom: 'classical' },
  { id: 'agora', name: 'Agora', cost: { materials: 7, wealth: 3 }, produces: { wealth: 5, influence: 1 }, availableFrom: 'classical' },
  { id: 'legion_camp', name: 'Legion Camp', cost: { materials: 10, food: 4 }, produces: {}, armyBonuses: { strength: 3, toughness: 2, numbers: 3 }, availableFrom: 'classical' },
  { id: 'amphitheater', name: 'Amphitheater', cost: { materials: 9, wealth: 4 }, produces: { influence: 4, wealth: 2 }, availableFrom: 'classical' },
];

export function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}
