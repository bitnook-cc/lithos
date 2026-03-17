import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    // ══════════ SURVIVAL TREE ══════════
    {
      id: 'survival', name: 'Survival',
      description: 'Basic survival instincts. Learn to find edible plants and safe water. Unlocks the Gathering Site.',
      cost: 2, researched: false, requires: [],
      effects: { unlocksBuilding: 'gathering_site', addsCivTag: 'Foragers' },
    },
    {
      id: 'fire_making', name: 'Fire Making',
      description: 'Harness fire for warmth, cooking, and scaring off predators. Unlocks the Camp.',
      cost: 3, researched: false, requires: ['survival'],
      effects: { unlocksBuilding: 'camp', addsCivTag: 'Fire Keepers' },
    },
    {
      id: 'tool_crafting', name: 'Tool Crafting',
      description: 'Shape stone and bone into useful tools. Unlocks the Quarry and Woodcutter.',
      cost: 5, researched: false, requires: ['fire_making'],
      effects: { unlocksBuilding: 'quarry', addsCivTag: 'Tool Makers' },
    },
    {
      id: 'pottery', name: 'Pottery',
      description: 'Create vessels for storage and trade. Unlocks the Oasis Well for desert settlements.',
      cost: 6, researched: false, requires: ['tool_crafting'],
      effects: { unlocksBuilding: 'oasis_well', addsCivTag: 'Potters' },
    },
    {
      id: 'basket_weaving', name: 'Basket Weaving',
      description: 'Weave baskets and nets. Enables trading and transport of goods.',
      cost: 5, researched: false, requires: ['tool_crafting'],
      effects: { addsCivTag: 'Artisans', unlocksBuilding: 'pearl_diver' },
    },
    {
      id: 'fishing', name: 'Fishing',
      description: 'Harvest food from rivers and coastlines. Unlocks the Fishing Dock.',
      cost: 4, researched: false, requires: ['tool_crafting'],
      effects: { unlocksBuilding: 'fishing_dock', addsCivTag: 'Fishers' },
    },
    {
      id: 'shelter_building', name: 'Shelter Building',
      description: 'Construct permanent shelters. Unlocks the Watchtower and Ice Fishing Hole.',
      cost: 4, researched: false, requires: ['survival'],
      effects: { unlocksBuilding: 'watchtower', addsCivTag: 'Settlers' },
    },

    // ══════════ WARFARE TREE ══════════
    {
      id: 'warfare', name: 'Warfare',
      description: 'Organize your people for combat. Learn basic fighting techniques.',
      cost: 2, researched: false, requires: [],
      effects: { armyBonuses: { strength: 1, morale: 1 }, addsCivTag: 'Warriors' },
    },
    {
      id: 'spear_hunting', name: 'Spear Hunting',
      description: 'Craft spears for hunting and defense. Unlocks the Hunting Lodge.',
      cost: 4, researched: false, requires: ['warfare'],
      effects: { armyBonuses: { strength: 2 }, unlocksBuilding: 'hunting_lodge', addsCivTag: 'Spear Carriers' },
    },
    {
      id: 'ambush_tactics', name: 'Ambush Tactics',
      description: 'Use terrain for surprise attacks. Master the art of stealth warfare.',
      cost: 6, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { stealth: 3 }, addsCivTag: 'Shadow Stalkers' },
    },
    {
      id: 'war_paint', name: 'War Paint',
      description: 'Terrifying war paint boosts morale and intimidates enemies.',
      cost: 5, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { morale: 3 }, addsCivTag: 'Painted Warriors' },
    },
    {
      id: 'pack_hunting', name: 'Pack Hunting',
      description: 'Coordinate group hunts for larger prey. Strength in numbers.',
      cost: 5, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { numbers: 3 }, addsCivTag: 'Pack Hunters' },
    },
    {
      id: 'fortification', name: 'Fortification',
      description: 'Build defensive positions. Unlocks the Hill Fort.',
      cost: 6, researched: false, requires: ['warfare', 'shelter_building'],
      effects: { armyBonuses: { toughness: 3 }, unlocksBuilding: 'hill_fort', addsCivTag: 'Fortifiers' },
    },

    // ══════════ MYSTICISM TREE ══════════
    {
      id: 'mysticism', name: 'Mysticism',
      description: 'Contemplate the mysteries of the natural world. Unlocks the Shrine.',
      cost: 2, researched: false, requires: [],
      effects: { unlocksBuilding: 'shrine', resourceBonuses: { knowledge: 1 } },
    },
    {
      id: 'tribal_lore', name: 'Tribal Lore',
      description: 'Pass down stories and knowledge through generations.',
      cost: 5, researched: false, requires: ['mysticism'],
      effects: { addsCivTag: 'Oral Tradition', resourceBonuses: { knowledge: 1 } },
    },
    {
      id: 'ancestor_worship', name: 'Ancestor Worship',
      description: 'Honor the spirits of the fallen. Strengthens tribal bonds.',
      cost: 6, researched: false, requires: ['tribal_lore'],
      effects: { armyBonuses: { morale: 2 }, addsCivTag: 'Ancestor Blessed' },
    },
    {
      id: 'spirit_walking', name: 'Spirit Walking',
      description: 'Shamans commune with the spirit world, gaining visions and insight.',
      cost: 8, researched: false, requires: ['ancestor_worship'],
      effects: { addsCivTag: 'Spirit Walkers', addsLeaderTrait: 'Visionary', resourceBonuses: { knowledge: 1 } },
    },
    {
      id: 'herbalism', name: 'Herbalism',
      description: 'Identify medicinal plants. Unlocks the Herbalist Hut.',
      cost: 5, researched: false, requires: ['tribal_lore'],
      effects: { unlocksBuilding: 'herbalist_hut', addsCivTag: 'Healers' },
    },
    {
      id: 'stargazing', name: 'Stargazing',
      description: 'Map the night sky. Navigate by the stars and predict seasons.',
      cost: 6, researched: false, requires: ['tribal_lore'],
      effects: { addsCivTag: 'Stargazers', resourceBonuses: { knowledge: 1 } },
    },
    {
      id: 'raiding', name: 'Raiding',
      description: 'Combine cunning with aggression to raid rival camps.',
      cost: 5, researched: false, requires: ['mysticism', 'warfare'],
      effects: { armyBonuses: { speed: 2, stealth: 1 }, addsCivTag: 'Raiders' },
    },

    // ══════════ ADVANCE ══════════
    {
      id: 'advance_bronze', name: 'Dawn of Bronze',
      description: 'Discover the secrets of metalworking. Advance to the Bronze Age.',
      cost: 12, researched: false, requires: ['tool_crafting', 'tribal_lore'],
      effects: { isAdvance: true },
    },
  ];
}
