import { GameEvent } from '@/types/events';

export const STONE_AGE_EVENTS: GameEvent[] = [
  {
    id: 'stone_neighboring_tribe',
    age: 'stone',
    triggers: { minTurn: 2, tileRevealed: ['plains', 'forest'] },
    text: 'A neighboring tribe approaches {leaderName}\'s camp. They offer to share their knowledge of the land in exchange for access to your hunting grounds.',
    choices: [
      {
        id: 'accept',
        text: 'Welcome them',
        requires: {},
        effects: {
          resources: { food: -2, knowledge: 5 },
          identity: { economy: 10 },
          flags: { shared_hunting_grounds: true },
        },
      },
      {
        id: 'refuse',
        text: 'Turn them away',
        requires: {},
        effects: {
          identity: { economy: -10 },
          flags: { refused_tribe: true },
        },
      },
      {
        id: 'demand',
        text: 'Demand they submit to your rule',
        requires: { identity: { military: 20 } },
        effects: {
          identity: { military: 10 },
          army: { strength: 2 },
          flags: { subjugated_tribe: true },
          outcomes: [
            { weight: 0.6, text: 'They submit to your authority.' },
            { weight: 0.4, text: 'They fight back!', combat: { enemyStrength: 8, enemyToughness: 4 } },
          ],
        },
      },
    ],
    chain: {
      nextEvents: {
        shared_hunting_grounds: 'bronze_tribe_grows',
        refused_tribe: 'bronze_tribe_hostile',
        subjugated_tribe: 'bronze_tribe_revolt',
      },
    },

  },
  {
    id: 'stone_wild_beast',
    age: 'stone',
    triggers: { tileRevealed: ['forest'] },
    text: 'A massive beast has been spotted in the forests near your camp. Your hunters are nervous.',
    choices: [
      {
        id: 'hunt',
        text: 'Organize a great hunt',
        requires: { armyStats: { strength: 3 } },
        effects: {
          resources: { food: 8 },
          identity: { military: 5 },
          addCivTag: 'Beast Slayers',
        },
      },
      {
        id: 'avoid',
        text: 'Avoid the forest',
        requires: {},
        effects: {
          resources: { food: -2 },
        },
      },
      {
        id: 'study',
        text: 'Observe the beast from afar',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { knowledge: 4 },
          identity: { knowledge: 10 },
        },
      },
    ],

  },
  {
    id: 'stone_strange_stones',
    age: 'stone',
    triggers: { tileRevealed: ['mountain', 'ruins'] },
    text: 'Your scouts discover strange markings on stones in the hills. They seem to tell an ancient story.',
    choices: [
      {
        id: 'study_stones',
        text: 'Spend time deciphering them',
        requires: {},
        effects: {
          resources: { knowledge: 6 },
          identity: { knowledge: 15 },
          flags: { found_ancient_stones: true },
        },
      },
      {
        id: 'use_stones',
        text: 'Use the stones for building',
        requires: {},
        effects: {
          resources: { materials: 5 },
          identity: { knowledge: -5 },
        },
      },
    ],

  },
  {
    id: 'stone_harsh_winter',
    age: 'stone',
    triggers: { minTurn: 5 },
    text: 'A brutal winter descends on your people. Food stores are dwindling.',
    choices: [
      {
        id: 'ration',
        text: 'Ration carefully',
        requires: {},
        effects: {
          resources: { food: -4, population: -1 },
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'raid',
        text: 'Raid a neighboring camp',
        requires: { armyStats: { strength: 5 } },
        effects: {
          resources: { food: 6 },
          identity: { military: 15 },
          flags: { raided_neighbors: true },
        },
      },
      {
        id: 'migrate',
        text: 'Move camp to warmer lands',
        requires: {},
        effects: {
          resources: { food: -2, materials: -3 },
          addCivTag: 'Nomadic',
        },
      },
    ],

  },
  {
    id: 'stone_fire_discovery',
    age: 'stone',
    triggers: { minTurn: 1, maxTurn: 3 },
    text: 'Lightning strikes a dry tree, setting the grasslands ablaze. Your people watch in awe and terror.',
    choices: [
      {
        id: 'capture_fire',
        text: 'Capture the flames',
        requires: {},
        effects: {
          resources: { knowledge: 3 },
          identity: { knowledge: 10 },
          addLeaderTrait: 'Visionary',
        },
      },
      {
        id: 'flee',
        text: 'Flee to safety',
        requires: {},
        effects: {
          resources: { food: -1 },
          army: { speed: 1 },
        },
      },
    ],

  },

  // Tech-gated events
  {
    id: 'stone_swamp_sickness',
    age: 'stone',
    triggers: { tileRevealed: ['swamp'] },
    text: 'Your people who ventured into the swamps have fallen ill. A strange fever grips the camp.',
    choices: [
      {
        id: 'use_herbs',
        text: 'Use herbal remedies to treat the sick',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { knowledge: 3 },
          identity: { knowledge: 10 },
          addCivTag: 'Healers',
        },
      },
      {
        id: 'pray',
        text: 'Pray to the spirits for guidance',
        requires: { leaderTraits: ['Visionary'] },
        effects: {
          resources: { population: -1 },
          identity: { knowledge: 5 },
          army: { morale: 2 },
        },
      },
      {
        id: 'abandon',
        text: 'Abandon the sick and move on',
        requires: {},
        effects: {
          resources: { population: -2 },
          identity: { military: 5 },
        },
      },
    ],
  },
  {
    id: 'stone_mammoth_sighting',
    age: 'stone',
    triggers: { minTurn: 4, tileRevealed: ['plains', 'hills'] },
    text: 'A great woolly mammoth has been spotted grazing on the plains. It could feed your tribe for months.',
    choices: [
      {
        id: 'hunt_mammoth',
        text: 'Organize a mammoth hunt with spears',
        requires: { armyStats: { strength: 5 } },
        effects: {
          resources: { food: 15 },
          identity: { military: 10 },
          addCivTag: 'Mammoth Hunters',
        },
      },
      {
        id: 'scare_with_fire',
        text: 'Use fire to drive it into a trap',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { food: 12 },
          identity: { knowledge: 10 },
        },
      },
      {
        id: 'observe_mammoth',
        text: 'Study it from a distance',
        requires: {},
        effects: {
          resources: { knowledge: 5 },
          identity: { knowledge: 5 },
        },
      },
    ],
  },
  {
    id: 'stone_ice_cave',
    age: 'stone',
    triggers: { tileRevealed: ['snow', 'ice', 'mountain'] },
    text: 'Deep in the frozen hills, your scouts discover a cave filled with ancient paintings and strange crystals.',
    choices: [
      {
        id: 'study_paintings',
        text: 'Study the cave paintings',
        requires: {},
        effects: {
          resources: { knowledge: 8 },
          identity: { knowledge: 15 },
          flags: { found_ice_cave: true },
        },
      },
      {
        id: 'mine_crystals',
        text: 'Mine the crystals',
        requires: {},
        effects: {
          resources: { materials: 6, wealth: 3 },
          identity: { economy: 5 },
        },
      },
      {
        id: 'shelter_cave',
        text: 'Use the cave as a shelter',
        requires: {},
        effects: {
          resources: { food: 3 },
          army: { toughness: 1 },
          addCivTag: 'Cave Dwellers',
        },
      },
    ],
  },
  {
    id: 'stone_river_crossing',
    age: 'stone',
    triggers: { minTurn: 3, tileRevealed: ['water'] },
    text: 'A wide river blocks your path. On the other side, you can see fertile land and abundant game.',
    choices: [
      {
        id: 'build_rafts',
        text: 'Build rafts from logs',
        requires: { civTags: ['Artisans'] },
        effects: {
          resources: { materials: -3 },
          identity: { economy: 10 },
          addCivTag: 'River People',
        },
      },
      {
        id: 'find_ford',
        text: 'Search for a shallow crossing',
        requires: {},
        effects: {
          resources: { food: -2 },
          army: { speed: 1 },
        },
      },
      {
        id: 'stay_put',
        text: 'Stay on this side of the river',
        requires: {},
        effects: {
          identity: { economy: -5 },
        },
      },
    ],
  },
  {
    id: 'stone_rainforest_discovery',
    age: 'stone',
    triggers: { tileRevealed: ['rainforest'] },
    text: 'Your scouts push through dense vegetation into a lush rainforest. Strange fruits and creatures surround them.',
    choices: [
      {
        id: 'harvest_fruits',
        text: 'Gather the exotic fruits',
        requires: {},
        effects: {
          resources: { food: 6 },
          identity: { economy: 5 },
        },
      },
      {
        id: 'catalog_plants',
        text: 'Carefully catalog the plants',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { knowledge: 6 },
          identity: { knowledge: 10 },
          addCivTag: 'Naturalists',
        },
      },
      {
        id: 'hunt_creatures',
        text: 'Hunt the strange creatures',
        requires: { armyStats: { stealth: 2 } },
        effects: {
          resources: { food: 8 },
          identity: { military: 5 },
          army: { stealth: 1 },
        },
      },
    ],
  },
  {
    id: 'stone_painted_warriors',
    age: 'stone',
    triggers: { minTurn: 6 },
    text: 'A rival war party appears at your borders. They are painted head to toe and carry crude weapons.',
    choices: [
      {
        id: 'intimidate_back',
        text: 'Show them our own war paint',
        requires: { civTags: ['Painted Warriors'] },
        effects: {
          identity: { military: 10 },
          army: { morale: 2 },
          flags: { intimidated_rivals: true },
        },
      },
      {
        id: 'ambush_them',
        text: 'Set an ambush using the terrain',
        requires: { armyStats: { stealth: 3 } },
        effects: {
          identity: { military: 15 },
          outcomes: [
            { weight: 0.7, text: 'Your ambush scatters them!' },
            { weight: 0.3, text: 'They see through your trap!', combat: { enemyStrength: 10, enemyToughness: 6 } },
          ],
        },
      },
      {
        id: 'offer_gifts',
        text: 'Offer gifts to avoid conflict',
        requires: {},
        effects: {
          resources: { food: -4, materials: -3 },
          identity: { economy: 10 },
        },
      },
    ],
  },
  {
    id: 'stone_stargazing',
    age: 'stone',
    triggers: { minTurn: 7 },
    text: 'On a clear night, {leaderName} gazes at the stars. Patterns seem to emerge in the sky.',
    choices: [
      {
        id: 'map_stars',
        text: 'Begin mapping the constellations',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          resources: { knowledge: 6 },
          identity: { knowledge: 15 },
          addCivTag: 'Stargazers',
          addLeaderTrait: 'Devout',
        },
      },
      {
        id: 'tell_stories',
        text: 'Tell stories of the star spirits',
        requires: {},
        effects: {
          resources: { knowledge: 3 },
          army: { morale: 1 },
          identity: { knowledge: 5 },
        },
      },
    ],
  },
];
