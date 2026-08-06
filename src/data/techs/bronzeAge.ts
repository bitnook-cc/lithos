import { TechNode } from '@/types/game';

export function bronzeAgeTechs(): TechNode[] {
  return [
    {
      id: 'pottery', name: 'Pottery',
      description: 'Fire clay vessels that make surplus, debt, and long-distance exchange possible.',
      cost: 10, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'oasis_well' },
        { type: 'add_civ_tag', tagId: 'Potters' },
      ],
    },
    {
      id: 'urbanism', name: 'Urbanism',
      description: 'Organize permanent streets, storehouses, and civic labor.',
      cost: 10, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'granary' },
        { type: 'add_civ_tag', tagId: 'City Builders' },
      ],
    },
    {
      id: 'writing', name: 'Writing',
      description: 'Mark debts, harvests, and promises so memory can outlive a ruler.',
      cost: 10, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'scriptorium' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Scribes' },
      ],
    },
    {
      id: 'bronze_working', name: 'Bronze Working',
      description: 'Alloy copper and tin into tools—and weapons—that reshape the age.',
      cost: 12, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'bronze_foundry' },
        { type: 'army_bonus', stat: 'strength', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Bronze Forged' },
      ],
    },
    {
      id: 'agriculture', name: 'Field Agriculture',
      description: 'Plan sowing and harvest at the scale of a permanent city.',
      cost: 13, researched: false, requires: ['pottery', 'urbanism'],
      effects: [
        { type: 'upgrade_building', buildingId: 'primitive_farm' },
        { type: 'add_civ_tag', tagId: 'Farmers' },
      ],
    },
    {
      id: 'stoneworking', name: 'Stoneworking',
      description: 'Cut stone and squared timber for mines, walls, and public works.',
      cost: 13, researched: false, requires: ['pottery'],
      effects: [
        { type: 'upgrade_building', buildingId: 'stone_mine' },
        { type: 'upgrade_building', buildingId: 'lumber_yard' },
        { type: 'add_civ_tag', tagId: 'Masons' },
      ],
    },
    {
      id: 'irrigation', name: 'Irrigation',
      description: 'Turn the river flood into a promise rather than a gamble.',
      cost: 15, researched: false, requires: ['agriculture'],
      effects: [
        { type: 'upgrade_building', buildingId: 'irrigated_farm' },
        { type: 'tile_bonus', tileType: 'fertile', resource: 'food', amount: 2 },
      ],
    },
    {
      id: 'trade_routes', name: 'Trade Routes',
      description: 'Caravans bind distant settlements into a network of mutual need.',
      cost: 14, researched: false, requires: ['urbanism'],
      effects: [
        { type: 'unlock_building', buildingId: 'market' },
        { type: 'resource_per_turn', resource: 'wealth', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Caravan People' },
      ],
    },
    {
      id: 'navigation', name: 'Coastal Navigation',
      description: 'Follow current, coastline, and star to make water a road.',
      cost: 14, researched: false, requires: ['trade_routes'],
      effects: [
        { type: 'upgrade_building', buildingId: 'harbor' },
        { type: 'exploration_bonus', amount: 1 },
        { type: 'add_civ_tag', tagId: 'River People' },
      ],
    },
    {
      id: 'law_codes', name: 'Law Codes',
      description: 'Make justice public, durable, and dangerous to ignore.',
      cost: 15, researched: false, requires: ['writing'],
      effects: [
        { type: 'unlock_building', buildingId: 'court' },
        { type: 'resource_per_turn', resource: 'influence', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Law Keepers' },
      ],
    },
    {
      id: 'epic_poetry', name: 'Epic Poetry',
      description: 'Give the people a shared past and heroes worth emulating.',
      cost: 13, researched: false, requires: ['writing'],
      effects: [
        { type: 'army_bonus', stat: 'morale', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Epic Tradition' },
      ],
    },
    {
      id: 'priesthood', name: 'Temple Priesthood',
      description: 'Join sacred ritual to record keeping and permanent institutions.',
      cost: 14, researched: false, requires: ['writing'],
      effects: [
        { type: 'upgrade_building', buildingId: 'temple' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Sacred Script' },
      ],
    },
    {
      id: 'shield_wall', name: 'Shield Wall',
      description: 'Discipline turns a line of citizens into a moving fortress.',
      cost: 14, researched: false, requires: ['bronze_working'],
      effects: [
        { type: 'unlock_building', buildingId: 'barracks' },
        { type: 'army_bonus', stat: 'toughness', amount: 3 },
      ],
    },
    {
      id: 'chariots', name: 'Chariots',
      description: 'Speed, prestige, and terror arrive on two wheels.',
      cost: 15, researched: false, requires: ['bronze_working'],
      effects: [
        { type: 'army_bonus', stat: 'speed', amount: 3 },
        { type: 'army_bonus', stat: 'strength', amount: 1 },
      ],
    },
    {
      id: 'siege_craft', name: 'Siege Craft',
      description: 'Apply mining, leverage, and formation drill against fortified places.',
      cost: 16, researched: false, requires: ['stoneworking', 'shield_wall'],
      effects: [
        { type: 'upgrade_building', buildingId: 'fortress' },
        { type: 'army_bonus', stat: 'toughness', amount: 2 },
      ],
    },
    {
      id: 'monumental_masonry', name: 'Monumental Masonry',
      description: 'Build in stone so power can speak to generations unborn.',
      cost: 17, researched: false, requires: ['stoneworking', 'law_codes'],
      effects: [
        { type: 'unlock_building', buildingId: 'ziggurat' },
        { type: 'add_civ_tag', tagId: 'Monument Makers' },
      ],
    },
    {
      id: 'taxation', name: 'Taxation',
      description: 'Turn recurring obligation into roads, officials, and royal power.',
      cost: 16, researched: false, requires: ['law_codes', 'trade_routes'],
      effects: [
        { type: 'resource_per_turn', resource: 'wealth', amount: 2 },
        { type: 'resource_per_turn', resource: 'influence', amount: 1 },
      ],
    },
    {
      id: 'advance_classical', name: 'The Axial Dawn',
      description: 'Unite metal, public law, and exchange into a civilization capable of empire.',
      cost: 20, researched: false, requires: ['law_codes', 'trade_routes', 'bronze_working'],
      effects: [{ type: 'advance_age' }],
    },
  ];
}
