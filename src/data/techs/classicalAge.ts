import { TechNode } from '@/types/game';

export function classicalAgeTechs(): TechNode[] {
  return [
    { id: 'philosophy', name: 'Philosophy', description: 'Ask what a good life—and a just state—should be.', cost: 7, researched: false, requires: [], effects: [
      { type: 'unlock_building', buildingId: 'academy' }, { type: 'resource_per_turn', resource: 'knowledge', amount: 2 }, { type: 'add_civ_tag', tagId: 'Philosophers' },
    ] },
    { id: 'citizenship', name: 'Citizenship', description: 'Make belonging a civic compact rather than an accident of birth.', cost: 7, researched: false, requires: [], effects: [
      { type: 'resource_per_turn', resource: 'influence', amount: 1 }, { type: 'add_civ_tag', tagId: 'Citizens' },
    ] },
    { id: 'iron_legions', name: 'Iron Legions', description: 'Standard weapons and relentless drill transform the army.', cost: 8, researched: false, requires: [], effects: [
      { type: 'army_bonus', stat: 'strength', amount: 3 }, { type: 'unlock_building', buildingId: 'legion_camp' }, { type: 'add_civ_tag', tagId: 'Legionaries' },
    ] },
    { id: 'rhetoric', name: 'Rhetoric', description: 'Words become instruments of persuasion, unity, and ambition.', cost: 10, researched: false, requires: ['philosophy', 'citizenship'], effects: [
      { type: 'resource_per_turn', resource: 'influence', amount: 2 }, { type: 'add_civ_tag', tagId: 'Orators' },
    ] },
    { id: 'republic', name: 'Republic', description: 'Bind rulers to offices, laws, and the consent of citizens.', cost: 12, researched: false, requires: ['citizenship'], effects: [
      { type: 'action_point_bonus', amount: 1 }, { type: 'add_civ_tag', tagId: 'Republic' },
    ] },
    { id: 'engineering', name: 'Engineering', description: 'Measure weight, water, and stone until impossible works become routine.', cost: 11, researched: false, requires: ['philosophy'], effects: [
      { type: 'unlock_building', buildingId: 'aqueduct' }, { type: 'building_bonus', buildingId: 'aqueduct', resource: 'food', amount: 2 },
    ] },
    { id: 'coinage', name: 'Coinage', description: 'A stamped promise lets value travel farther than trust.', cost: 10, researched: false, requires: ['citizenship'], effects: [
      { type: 'unlock_building', buildingId: 'agora' }, { type: 'resource_per_turn', resource: 'wealth', amount: 2 },
    ] },
    { id: 'roads', name: 'Roads', description: 'Armies, merchants, and ideas move along the same stone arteries.', cost: 11, researched: false, requires: ['engineering', 'iron_legions'], effects: [
      { type: 'army_bonus', stat: 'speed', amount: 2 }, { type: 'tile_bonus', tileType: 'plains', resource: 'wealth', amount: 1 },
    ] },
    { id: 'theater', name: 'Theater', description: 'Put the city on stage and let it argue with itself.', cost: 10, researched: false, requires: ['rhetoric'], effects: [
      { type: 'unlock_building', buildingId: 'amphitheater' }, { type: 'army_bonus', stat: 'morale', amount: 2 },
    ] },
    { id: 'grand_strategy', name: 'Grand Strategy', description: 'Treat borders, roads, allies, and armies as one design.', cost: 14, researched: false, requires: ['roads', 'republic'], effects: [
      { type: 'army_bonus', stat: 'toughness', amount: 3 }, { type: 'army_bonus', stat: 'morale', amount: 2 },
    ] },
    { id: 'legacy_of_lithos', name: 'Legacy of Lithos', description: 'Define the ideal by which every later civilization will judge your people.', cost: 18, researched: false, requires: ['republic', 'theater', 'grand_strategy'], effects: [{ type: 'advance_age' }] },
  ];
}
