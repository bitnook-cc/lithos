import { TechNode } from '@/types/game';

export function bronzeAgeTechs(): TechNode[] {
  return [
    { id: 'urbanism', name: 'Urbanism', description: 'Organize permanent streets, storehouses, and civic labor.', cost: 5, researched: false, requires: [], effects: [
      { type: 'unlock_building', buildingId: 'granary' }, { type: 'add_civ_tag', tagId: 'City Builders' },
    ] },
    { id: 'writing', name: 'Writing', description: 'Mark debts, harvests, and promises so memory can outlive a ruler.', cost: 5, researched: false, requires: [], effects: [
      { type: 'unlock_building', buildingId: 'scriptorium' }, { type: 'resource_per_turn', resource: 'knowledge', amount: 1 }, { type: 'add_civ_tag', tagId: 'Scribes' },
    ] },
    { id: 'bronze_working', name: 'Bronze Working', description: 'Alloy copper and tin into tools—and weapons—that reshape the age.', cost: 6, researched: false, requires: [], effects: [
      { type: 'army_bonus', stat: 'strength', amount: 2 }, { type: 'unlock_building', buildingId: 'bronze_foundry' }, { type: 'add_civ_tag', tagId: 'Bronze Forged' },
    ] },
    { id: 'irrigation', name: 'Irrigation', description: 'Turn the river flood into a promise rather than a gamble.', cost: 8, researched: false, requires: ['urbanism'], effects: [
      { type: 'unlock_building', buildingId: 'irrigated_farm' }, { type: 'tile_bonus', tileType: 'fertile', resource: 'food', amount: 2 },
    ] },
    { id: 'trade_routes', name: 'Trade Routes', description: 'Caravans bind distant settlements into a network of mutual need.', cost: 8, researched: false, requires: ['urbanism'], effects: [
      { type: 'unlock_building', buildingId: 'market' }, { type: 'resource_per_turn', resource: 'wealth', amount: 1 }, { type: 'add_civ_tag', tagId: 'Caravan People' },
    ] },
    { id: 'law_codes', name: 'Law Codes', description: 'Make justice public, durable, and dangerous to ignore.', cost: 9, researched: false, requires: ['writing'], effects: [
      { type: 'unlock_building', buildingId: 'court' }, { type: 'resource_per_turn', resource: 'influence', amount: 1 }, { type: 'add_civ_tag', tagId: 'Law Keepers' },
    ] },
    { id: 'epic_poetry', name: 'Epic Poetry', description: 'Give the people a shared past and heroes worth emulating.', cost: 8, researched: false, requires: ['writing'], effects: [
      { type: 'army_bonus', stat: 'morale', amount: 2 }, { type: 'add_civ_tag', tagId: 'Epic Tradition' },
    ] },
    { id: 'shield_wall', name: 'Shield Wall', description: 'Discipline turns a line of citizens into a moving fortress.', cost: 9, researched: false, requires: ['bronze_working'], effects: [
      { type: 'army_bonus', stat: 'toughness', amount: 3 }, { type: 'unlock_building', buildingId: 'barracks' },
    ] },
    { id: 'chariots', name: 'Chariots', description: 'Speed, prestige, and terror arrive on two wheels.', cost: 10, researched: false, requires: ['bronze_working'], effects: [
      { type: 'army_bonus', stat: 'speed', amount: 3 }, { type: 'army_bonus', stat: 'strength', amount: 1 },
    ] },
    { id: 'monumental_masonry', name: 'Monumental Masonry', description: 'Build in stone so power can speak to generations unborn.', cost: 11, researched: false, requires: ['urbanism', 'law_codes'], effects: [
      { type: 'unlock_building', buildingId: 'ziggurat' }, { type: 'add_civ_tag', tagId: 'Monument Makers' },
    ] },
    { id: 'advance_classical', name: 'The Axial Dawn', description: 'Unite metal, law, and exchange into a civilization capable of empire.', cost: 15, researched: false, requires: ['law_codes', 'trade_routes', 'bronze_working'], effects: [{ type: 'advance_age' }] },
  ];
}
