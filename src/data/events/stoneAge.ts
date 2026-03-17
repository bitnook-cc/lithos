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
    unique: true,
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
    unique: true,
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
    unique: true,
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
    unique: true,
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
    unique: true,
  },
];
