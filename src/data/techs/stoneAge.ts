import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    // ══════════════════════════════
    // SURVIVAL TREE (root: Survival)
    // ══════════════════════════════
    {
      id: 'survival', name: 'Survival',
      description: 'Basic survival instincts. Learn to find food, water, and shelter in the wilderness.',
      cost: 2, researched: false, requires: [],
      effects: { resourceBonuses: { food: 1 } },
    },
    {
      id: 'fire_making', name: 'Fire Making',
      description: 'Harness fire for warmth, cooking, and scaring off predators.',
      cost: 3, researched: false, requires: ['survival'],
      effects: { resourceBonuses: { food: 1 } },
    },
    {
      id: 'tool_crafting', name: 'Tool Crafting',
      description: 'Shape stone and bone into useful tools. Increases material output.',
      cost: 5, researched: false, requires: ['fire_making'],
      effects: { resourceBonuses: { materials: 1 } },
    },
    {
      id: 'pottery', name: 'Pottery',
      description: 'Create vessels for storing food and water. Reduces spoilage.',
      cost: 6, researched: false, requires: ['tool_crafting'],
      effects: { resourceBonuses: { food: 2 } },
    },
    {
      id: 'basket_weaving', name: 'Basket Weaving',
      description: 'Weave baskets for carrying and trading goods. Enables early commerce.',
      cost: 5, researched: false, requires: ['tool_crafting'],
      effects: { resourceBonuses: { wealth: 1 }, addsCivTag: 'Artisans' },
    },
    {
      id: 'fishing', name: 'Fishing',
      description: 'Harvest food from rivers and coastlines. Unlocks the Fishing Dock.',
      cost: 4, researched: false, requires: ['tool_crafting'],
      effects: { resourceBonuses: { food: 1 }, unlocksBuilding: 'fishing_dock' },
    },
    {
      id: 'shelter_building', name: 'Shelter Building',
      description: 'Construct permanent shelters from natural materials.',
      cost: 4, researched: false, requires: ['survival'],
      effects: { unlocksBuilding: 'shelter' },
    },

    // ══════════════════════════════
    // WARFARE TREE (root: Warfare)
    // ══════════════════════════════
    {
      id: 'warfare', name: 'Warfare',
      description: 'Organize your people for combat. Learn basic fighting techniques.',
      cost: 2, researched: false, requires: [],
      effects: { armyBonuses: { strength: 1 } },
    },
    {
      id: 'spear_hunting', name: 'Spear Hunting',
      description: 'Craft spears for hunting large game and defending the tribe.',
      cost: 4, researched: false, requires: ['warfare'],
      effects: { armyBonuses: { strength: 2 }, resourceBonuses: { food: 1 } },
    },
    {
      id: 'ambush_tactics', name: 'Ambush Tactics',
      description: 'Use terrain for surprise attacks. Greatly improves stealth.',
      cost: 6, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { stealth: 3 } },
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
      effects: { armyBonuses: { numbers: 3 }, resourceBonuses: { food: 1 } },
    },
    // Crossover: requires warfare + shelter
    {
      id: 'fortification', name: 'Fortification',
      description: 'Combine shelter-building with military knowledge to create defensive positions.',
      cost: 6, researched: false, requires: ['warfare', 'shelter_building'],
      effects: { armyBonuses: { toughness: 3 }, unlocksBuilding: 'hill_fort' },
    },

    // ══════════════════════════════
    // MYSTICISM TREE (root: Mysticism)
    // ══════════════════════════════
    {
      id: 'mysticism', name: 'Mysticism',
      description: 'Contemplate the mysteries of the natural world. Begin to ask why.',
      cost: 2, researched: false, requires: [],
      effects: { resourceBonuses: { knowledge: 1 } },
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
      effects: { armyBonuses: { morale: 2 }, resourceBonuses: { influence: 1 } },
    },
    {
      id: 'spirit_walking', name: 'Spirit Walking',
      description: 'Shamans commune with the spirit world, gaining visions and insight.',
      cost: 8, researched: false, requires: ['ancestor_worship'],
      effects: { resourceBonuses: { knowledge: 2 }, addsCivTag: 'Spirit Walkers', addsLeaderTrait: 'Visionary' },
    },
    {
      id: 'herbalism', name: 'Herbalism',
      description: 'Identify medicinal plants. Unlocks the Herbalist Hut.',
      cost: 5, researched: false, requires: ['tribal_lore'],
      effects: { resourceBonuses: { food: 1 }, unlocksBuilding: 'herbalist_hut' },
    },
    {
      id: 'stargazing', name: 'Stargazing',
      description: 'Map the night sky. Navigate by the stars and predict seasons.',
      cost: 6, researched: false, requires: ['tribal_lore'],
      effects: { resourceBonuses: { knowledge: 1 }, addsCivTag: 'Stargazers' },
    },
    // Crossover: requires mysticism + warfare
    {
      id: 'raiding', name: 'Raiding',
      description: 'Combine cunning with aggression to raid rival camps for supplies.',
      cost: 5, researched: false, requires: ['mysticism', 'warfare'],
      effects: { armyBonuses: { speed: 2, stealth: 1 }, resourceBonuses: { wealth: 1 } },
    },

    // ══════════════════════════════
    // ADVANCE (crossover: survival + mysticism)
    // ══════════════════════════════
    {
      id: 'advance_bronze', name: 'Dawn of Bronze',
      description: 'Discover the secrets of metalworking. Advance to the Bronze Age.',
      cost: 12, researched: false, requires: ['tool_crafting', 'tribal_lore'],
      effects: { isAdvance: true },
    },
  ];
}
