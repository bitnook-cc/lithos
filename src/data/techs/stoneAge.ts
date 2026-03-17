import { TechNode } from '@/types/game';

export function stoneAgeTechs(): TechNode[] {
  return [
    // Root
    {
      id: 'fire_making', name: 'Fire Making',
      description: 'Harness fire for warmth, cooking, and protection. Unlocks advanced technologies.',
      cost: 3, researched: false, requires: [],
      effects: { resourceBonuses: { food: 1 } },
    },

    // === Resources Branch ===
    {
      id: 'tool_crafting', name: 'Tool Crafting',
      description: 'Shape stone into useful tools. Increases material output and enables construction.',
      cost: 5, researched: false, requires: ['fire_making'],
      effects: { resourceBonuses: { materials: 1 } },
    },
    {
      id: 'pottery', name: 'Pottery',
      description: 'Create vessels for storing food and water. Reduces spoilage and increases food reserves.',
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

    // === Military Branch ===
    {
      id: 'spear_hunting', name: 'Spear Hunting',
      description: 'Craft spears for hunting large game and defending the tribe. Your warriors grow stronger.',
      cost: 5, researched: false, requires: ['fire_making'],
      effects: { armyBonuses: { strength: 2 }, resourceBonuses: { food: 1 } },
    },
    {
      id: 'ambush_tactics', name: 'Ambush Tactics',
      description: 'Learn to use terrain for surprise attacks. Greatly improves stealth in combat.',
      cost: 6, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { stealth: 3 } },
    },
    {
      id: 'war_paint', name: 'War Paint',
      description: 'Terrifying war paint boosts morale and intimidates enemies.',
      cost: 5, researched: false, requires: ['spear_hunting'],
      effects: { armyBonuses: { morale: 3 }, addsCivTag: 'Painted Warriors' },
    },

    // === Philosophy Branch ===
    {
      id: 'shelter_building', name: 'Shelter Building',
      description: 'Construct permanent shelters from natural materials. Protects your people from the elements.',
      cost: 4, researched: false, requires: ['fire_making'],
      effects: { unlocksBuilding: 'shelter' },
    },
    {
      id: 'tribal_lore', name: 'Tribal Lore',
      description: 'Pass down stories and knowledge through generations. Your people gain cultural identity.',
      cost: 6, researched: false, requires: ['shelter_building'],
      effects: { addsCivTag: 'Oral Tradition', resourceBonuses: { knowledge: 1 } },
    },
    {
      id: 'ancestor_worship', name: 'Ancestor Worship',
      description: 'Honor the spirits of the fallen. Strengthens tribal bonds and boosts morale.',
      cost: 7, researched: false, requires: ['tribal_lore'],
      effects: { armyBonuses: { morale: 2 }, resourceBonuses: { influence: 1 } },
    },
    {
      id: 'spirit_walking', name: 'Spirit Walking',
      description: 'Shamans commune with the spirit world, gaining visions and insight.',
      cost: 8, researched: false, requires: ['ancestor_worship'],
      effects: { resourceBonuses: { knowledge: 2 }, addsCivTag: 'Spirit Walkers', addsLeaderTrait: 'Visionary' },
    },

    // === Cross-branch ===
    {
      id: 'herbalism', name: 'Herbalism',
      description: 'Identify medicinal plants in the wild. Unlocks the Herbalist Hut for knowledge and healing.',
      cost: 5, researched: false, requires: ['tribal_lore'],
      effects: { resourceBonuses: { food: 1 }, unlocksBuilding: 'herbalist_hut' },
    },

    // === Advance ===
    {
      id: 'advance_bronze', name: 'Dawn of Bronze',
      description: 'Discover the secrets of metalworking. Advance to the Bronze Age.',
      cost: 12, researched: false, requires: ['tool_crafting', 'tribal_lore'],
      effects: { isAdvance: true },
    },
  ];
}
