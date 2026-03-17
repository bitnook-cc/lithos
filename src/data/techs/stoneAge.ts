import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    {
      id: 'fire_making',
      name: 'Fire Making',
      cost: 3,
      researched: false,
      requires: [],
      effects: { resourceBonuses: { food: 1 } },
    },
    {
      id: 'tool_crafting',
      name: 'Tool Crafting',
      cost: 5,
      researched: false,
      requires: ['fire_making'],
      effects: { resourceBonuses: { materials: 1 } },
    },
    {
      id: 'spear_hunting',
      name: 'Spear Hunting',
      cost: 5,
      researched: false,
      requires: ['tool_crafting'],
      effects: { armyBonuses: { strength: 2 }, resourceBonuses: { food: 1 } },
    },
    {
      id: 'shelter_building',
      name: 'Shelter Building',
      cost: 4,
      researched: false,
      requires: ['fire_making'],
      effects: { unlocksBuilding: 'shelter' },
    },
    {
      id: 'tribal_lore',
      name: 'Tribal Lore',
      cost: 6,
      researched: false,
      requires: ['shelter_building'],
      effects: { addsCivTag: 'Oral Tradition' },
    },
    {
      id: 'advance_bronze',
      name: 'Dawn of Bronze',
      cost: 10,
      researched: false,
      requires: ['tool_crafting', 'tribal_lore'],
      effects: { isAdvance: true },
    },
  ];
}
