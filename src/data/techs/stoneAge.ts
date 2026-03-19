import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    // ══════════ SURVIVAL TREE ══════════
    {
      id: 'survival', name: 'Survival',
      description: 'Basic survival instincts. Learn to find edible plants and safe water. Unlocks the Gathering Site.',
      cost: 2, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'gathering_site' },
        { type: 'add_civ_tag', tagId: 'Foragers' },
      ],
    },
    {
      id: 'fire_making', name: 'Fire Making',
      description: 'Harness fire for warmth, cooking, and scaring off predators. Unlocks the Camp.',
      cost: 3, researched: false, requires: ['survival'],
      effects: [
        { type: 'unlock_building', buildingId: 'camp' },
        { type: 'add_civ_tag', tagId: 'Fire Keepers' },
      ],
    },
    {
      id: 'tool_crafting', name: 'Tool Crafting',
      description: 'Shape stone and bone into useful tools. Unlocks the Quarry and Woodcutter.',
      cost: 5, researched: false, requires: ['fire_making'],
      effects: [
        { type: 'unlock_building', buildingId: 'quarry' },
        { type: 'add_civ_tag', tagId: 'Tool Makers' },
      ],
    },
    {
      id: 'pottery', name: 'Pottery',
      description: 'Create vessels for storage and trade. Unlocks the Oasis Well for desert settlements.',
      cost: 6, researched: false, requires: ['tool_crafting'],
      effects: [
        { type: 'unlock_building', buildingId: 'oasis_well' },
        { type: 'add_civ_tag', tagId: 'Potters' },
      ],
    },
    {
      id: 'basket_weaving', name: 'Basket Weaving',
      description: 'Weave baskets and nets. Enables trading and transport of goods.',
      cost: 5, researched: false, requires: ['tool_crafting'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Artisans' },
        { type: 'unlock_building', buildingId: 'pearl_diver' },
      ],
    },
    {
      id: 'fishing', name: 'Fishing',
      description: 'Harvest food from rivers and coastlines. Unlocks the Fishing Dock.',
      cost: 4, researched: false, requires: ['tool_crafting'],
      effects: [
        { type: 'unlock_building', buildingId: 'fishing_dock' },
        { type: 'add_civ_tag', tagId: 'Fishers' },
      ],
    },
    {
      id: 'agriculture', name: 'Agriculture',
      description: 'Learn to plant seeds and tend crops. Upgrade Gathering Sites into Primitive Farms.',
      cost: 7, researched: false, requires: ['pottery'],
      effects: [
        { type: 'upgrade_building', buildingId: 'primitive_farm' },
        { type: 'add_civ_tag', tagId: 'Farmers' },
      ],
    },
    {
      id: 'stoneworking', name: 'Stoneworking',
      description: 'Master the art of cutting and shaping stone. Upgrade Quarries into Stone Mines.',
      cost: 7, researched: false, requires: ['pottery'],
      effects: [
        { type: 'upgrade_building', buildingId: 'stone_mine' },
        { type: 'add_civ_tag', tagId: 'Masons' },
      ],
    },
    {
      id: 'shelter_building', name: 'Shelter Building',
      description: 'Construct permanent shelters. Unlocks the Watchtower and Ice Fishing Hole.',
      cost: 4, researched: false, requires: ['survival'],
      effects: [
        { type: 'unlock_building', buildingId: 'watchtower' },
        { type: 'add_civ_tag', tagId: 'Settlers' },
      ],
    },

    // ══════════ WARFARE TREE ══════════
    {
      id: 'warfare', name: 'Warfare',
      description: 'Organize your people for combat. Learn basic fighting techniques.',
      cost: 2, researched: false, requires: [],
      effects: [
        { type: 'army_bonus', stat: 'strength', amount: 1 },
        { type: 'army_bonus', stat: 'morale', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Warriors' },
      ],
    },
    {
      id: 'spear_hunting', name: 'Spear Hunting',
      description: 'Craft spears for hunting and defense. Unlocks the Hunting Lodge.',
      cost: 4, researched: false, requires: ['warfare'],
      effects: [
        { type: 'army_bonus', stat: 'strength', amount: 2 },
        { type: 'unlock_building', buildingId: 'hunting_lodge' },
        { type: 'add_civ_tag', tagId: 'Spear Carriers' },
      ],
    },
    {
      id: 'ambush_tactics', name: 'Ambush Tactics',
      description: 'Use terrain for surprise attacks. Master the art of stealth warfare.',
      cost: 6, researched: false, requires: ['spear_hunting'],
      effects: [
        { type: 'army_bonus', stat: 'stealth', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Shadow Stalkers' },
      ],
    },
    {
      id: 'war_paint', name: 'War Paint',
      description: 'Terrifying war paint boosts morale and intimidates enemies.',
      cost: 5, researched: false, requires: ['spear_hunting'],
      effects: [
        { type: 'army_bonus', stat: 'morale', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Painted Warriors' },
      ],
    },
    {
      id: 'pack_hunting', name: 'Pack Hunting',
      description: 'Coordinate group hunts for larger prey. Strength in numbers.',
      cost: 5, researched: false, requires: ['spear_hunting'],
      effects: [
        { type: 'army_bonus', stat: 'numbers', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Pack Hunters' },
      ],
    },
    {
      id: 'fortification', name: 'Fortification',
      description: 'Build defensive positions. Unlocks the Hill Fort.',
      cost: 6, researched: false, requires: ['warfare', 'shelter_building'],
      effects: [
        { type: 'army_bonus', stat: 'toughness', amount: 3 },
        { type: 'unlock_building', buildingId: 'hill_fort' },
        { type: 'add_civ_tag', tagId: 'Fortifiers' },
      ],
    },
    {
      id: 'siege_craft', name: 'Siege Craft',
      description: 'Advanced defensive construction. Upgrade Hill Forts into Fortresses.',
      cost: 8, researched: false, requires: ['fortification'],
      effects: [
        { type: 'upgrade_building', buildingId: 'fortress' },
        { type: 'army_bonus', stat: 'toughness', amount: 2 },
      ],
    },

    // ══════════ MYSTICISM TREE ══════════
    {
      id: 'mysticism', name: 'Mysticism',
      description: 'Contemplate the mysteries of the natural world. Unlocks the Shrine.',
      cost: 2, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'shrine' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'tribal_lore', name: 'Tribal Lore',
      description: 'Pass down stories and knowledge through generations.',
      cost: 5, researched: false, requires: ['mysticism'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Oral Tradition' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'ancestor_worship', name: 'Ancestor Worship',
      description: 'Honor the spirits of the fallen. Strengthens tribal bonds.',
      cost: 6, researched: false, requires: ['tribal_lore'],
      effects: [
        { type: 'army_bonus', stat: 'morale', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Ancestor Blessed' },
      ],
    },
    {
      id: 'spirit_walking', name: 'Spirit Walking',
      description: 'Shamans commune with the spirit world, gaining visions and insight.',
      cost: 8, researched: false, requires: ['ancestor_worship'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Spirit Walkers' },
        { type: 'add_leader_trait', trait: 'Visionary' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'herbalism', name: 'Herbalism',
      description: 'Identify medicinal plants. Unlocks the Herbalist Hut.',
      cost: 5, researched: false, requires: ['tribal_lore'],
      effects: [
        { type: 'unlock_building', buildingId: 'herbalist_hut' },
        { type: 'add_civ_tag', tagId: 'Healers' },
      ],
    },
    {
      id: 'sacred_rites', name: 'Sacred Rites',
      description: 'Formalize worship practices. Upgrade Shrines into Temples.',
      cost: 7, researched: false, requires: ['ancestor_worship'],
      effects: [
        { type: 'upgrade_building', buildingId: 'temple' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'stargazing', name: 'Stargazing',
      description: 'Map the night sky. Navigate by the stars and predict seasons.',
      cost: 6, researched: false, requires: ['tribal_lore'],
      effects: [
        { type: 'add_civ_tag', tagId: 'Stargazers' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'raiding', name: 'Raiding',
      description: 'Combine cunning with aggression to raid rival camps.',
      cost: 5, researched: false, requires: ['mysticism', 'warfare'],
      effects: [
        { type: 'army_bonus', stat: 'speed', amount: 2 },
        { type: 'army_bonus', stat: 'stealth', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Raiders' },
      ],
    },

    // ══════════ ADVANCE ══════════
    {
      id: 'advance_bronze', name: 'Dawn of Bronze',
      description: 'Discover the secrets of metalworking. Advance to the Bronze Age.',
      cost: 12, researched: false, requires: ['tool_crafting', 'tribal_lore'],
      effects: [
        { type: 'advance_age' },
      ],
    },
  ];
}
