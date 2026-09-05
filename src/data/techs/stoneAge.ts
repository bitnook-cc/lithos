import { TechNode } from '@/types/game';

/**
 * The Stone Age is intentionally compact: its discoveries establish the
 * foundational identities that later ages elaborate into institutions.
 */
export function stoneAgeTechs(): TechNode[] {
  return [
    {
      id: 'survival', name: 'Survival',
      description: 'Learn the edible country, safe water, and the rhythms of migration.',
      cost: 4, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'gathering_site' },
        { type: 'add_civ_tag', tagId: 'Foragers' },
      ],
    },
    {
      id: 'fire_making', name: 'Fire Making',
      description: 'Carry flame between camps for warmth, cooking, and protection.',
      cost: 5, researched: false, requires: ['survival'],
      effects: [
        { type: 'unlock_building', buildingId: 'camp' },
        { type: 'add_civ_tag', tagId: 'Fire Keepers' },
      ],
    },
    {
      id: 'tool_crafting', name: 'Tool Crafting',
      description: 'Shape stone, bone, fiber, and wood into a versatile material culture.',
      cost: 7, researched: false, requires: ['fire_making'],
      effects: [
        { type: 'unlock_building', buildingId: 'quarry' },
        { type: 'unlock_building', buildingId: 'woodcutter' },
        { type: 'unlock_building', buildingId: 'pearl_diver' },
        { type: 'unlock_building', buildingId: 'sand_quarry' },
        { type: 'add_civ_tag', tagId: 'Tool Makers' },
        { type: 'add_civ_tag', tagId: 'Artisans' },
      ],
    },
    {
      id: 'rivercraft', name: 'Rivercraft',
      description: 'Weave nets, shape dugouts, and read the changing water.',
      cost: 8, researched: false, requires: ['tool_crafting'],
      effects: [
        { type: 'unlock_building', buildingId: 'fishing_dock' },
        { type: 'unlock_building', buildingId: 'ice_fishing' },
        { type: 'add_civ_tag', tagId: 'Fishers' },
      ],
    },
    {
      id: 'shelter_building', name: 'Shelter Building',
      description: 'Turn temporary refuge into a defensible place that can be rebuilt.',
      cost: 6, researched: false, requires: ['survival'],
      effects: [
        { type: 'unlock_building', buildingId: 'watchtower' },
        { type: 'add_civ_tag', tagId: 'Settlers' },
      ],
    },
    {
      id: 'hunting_traditions', name: 'Hunting Traditions',
      description: 'Coordinate trackers and spear carriers against dangerous game.',
      cost: 7, researched: false, requires: ['survival'],
      effects: [
        { type: 'unlock_building', buildingId: 'hunting_lodge' },
        { type: 'army_bonus', stat: 'strength', amount: 2 },
        { type: 'army_bonus', stat: 'numbers', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Spear Carriers' },
        { type: 'add_civ_tag', tagId: 'Pack Hunters' },
      ],
    },
    {
      id: 'warfare', name: 'Warfare',
      description: 'Train fighters to hold a line and act as one under pressure.',
      cost: 5, researched: false, requires: [],
      effects: [
        { type: 'army_bonus', stat: 'strength', amount: 1 },
        { type: 'army_bonus', stat: 'morale', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Warriors' },
        { type: 'add_civ_tag', tagId: 'Painted Warriors' },
      ],
    },
    {
      id: 'fortification', name: 'Fortification',
      description: 'Use earth, timber, and high ground to make a refuge costly to attack.',
      cost: 9, researched: false, requires: ['warfare', 'shelter_building'],
      effects: [
        { type: 'unlock_building', buildingId: 'hill_fort' },
        { type: 'army_bonus', stat: 'toughness', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Fortifiers' },
      ],
    },
    {
      id: 'mysticism', name: 'Mysticism',
      description: 'Treat landscape, dream, and ritual as a body of knowledge.',
      cost: 4, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'shrine' },
        { type: 'add_civ_tag', tagId: 'Ancestor Blessed' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'tribal_lore', name: 'Tribal Lore',
      description: 'Entrust generations of memory to trained storytellers.',
      cost: 7, researched: false, requires: ['mysticism'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Oral Tradition' },
        { type: 'add_civ_tag', tagId: 'Spirit Walkers' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'herbalism', name: 'Herbalism',
      description: 'Test roots, barks, and leaves until healing becomes teachable.',
      cost: 8, researched: false, requires: ['tribal_lore'],
      effects: [
        { type: 'unlock_building', buildingId: 'herbalist_hut' },
        { type: 'unlock_building', buildingId: 'peat_harvester' },
        { type: 'add_civ_tag', tagId: 'Healers' },
      ],
    },
    {
      id: 'stargazing', name: 'Stargazing',
      description: 'Turn the returning stars into a calendar and a guide beyond the horizon.',
      cost: 9, researched: false, requires: ['tribal_lore'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Stargazers' },
        { type: 'exploration_bonus', amount: 1 },
      ],
    },
    {
      id: 'raiding', name: 'Raiding',
      description: 'Join ritual courage to swift, opportunistic attacks.',
      cost: 9, researched: false, requires: ['warfare', 'mysticism'],
      effects: [
        { type: 'army_bonus', stat: 'speed', amount: 2 },
        { type: 'army_bonus', stat: 'stealth', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Raiders' },
        { type: 'add_civ_tag', tagId: 'Shadow Stalkers' },
      ],
    },
    {
      id: 'advance_bronze', name: 'Dawn of Bronze',
      description: 'Combine skilled hands with preserved knowledge and discover the first workable alloy.',
      cost: 12, researched: false, requires: ['tool_crafting', 'tribal_lore'],
      effects: [{ type: 'advance_age' }],
    },
  ];
}
