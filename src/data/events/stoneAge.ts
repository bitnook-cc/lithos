import { GameEvent } from '@/types/events';

export const STONE_AGE_EVENTS: GameEvent[] = [
  // ══════════════════════════════════════
  // EARLY GAME (Turn 1–3) — Gentle introductions
  // ══════════════════════════════════════

  {
    id: 'stone_first_dawn',
    age: 'stone',
    triggers: { minTurn: 1, maxTurn: 2 },
    text: '{leaderName} watches the sun rise over the wilderness. Your small band of survivors huddles together, hungry and afraid. The world stretches endlessly in every direction. What should your people focus on first?',
    choices: [
      {
        id: 'focus_food',
        text: 'Search for food — survival comes first',
        requires: {},
        effects: {
          resources: { food: 2 },
          identity: { economy: 5 },
        },
      },
      {
        id: 'focus_explore',
        text: 'Send scouts to explore the land',
        requires: {},
        effects: {
          resources: { materials: 1 },
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'focus_defend',
        text: 'Establish a defensive perimeter',
        requires: {},
        effects: {
          army: { toughness: 1 },
          identity: { military: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_berry_bushes',
    age: 'stone',
    triggers: { minTurn: 1, maxTurn: 4, tileRevealed: ['plains', 'forest'] },
    text: 'While wandering through the brush, your people stumble upon a thicket of wild berry bushes, heavy with ripe fruit. Birds scatter at your approach.',
    choices: [
      {
        id: 'gather_all',
        text: 'Strip the bushes bare',
        requires: {},
        effects: {
          resources: { food: 3 },
        },
      },
      {
        id: 'gather_careful',
        text: 'Gather carefully, leaving some for regrowth',
        requires: { civTags: ['Foragers'] },
        effects: {
          resources: { food: 2 },
          addCivTag: 'Conservators',
          identity: { knowledge: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_wolf_pack',
    age: 'stone',
    triggers: { minTurn: 2, maxTurn: 5 },
    text: 'As night falls, yellow eyes ring the camp. A wolf pack circles your people, drawn by the scent of stored meat. Their growls echo in the darkness.',
    choices: [
      {
        id: 'scare_fire',
        text: 'Drive them off with burning brands',
        requires: { civTags: ['Fire Keepers'] },
        effects: {
          identity: { military: 5 },
          flags: { drove_off_wolves: true },
        },
      },
      {
        id: 'sacrifice_meat',
        text: 'Throw them some meat to lure them away',
        requires: {},
        effects: {
          resources: { food: -2 },
        },
      },
      {
        id: 'stand_fight',
        text: 'Stand and fight with stones and sticks',
        requires: {},
        effects: {
          resources: { population: -1 },
          army: { strength: 1 },
          identity: { military: 10 },
        },
      },
    ],
  },

  {
    id: 'stone_strange_tracks',
    age: 'stone',
    triggers: { minTurn: 2, maxTurn: 6, tileRevealed: ['forest', 'plains'] },
    text: 'Your scouts find enormous tracks pressed deep into the mud — something large passed through recently. The prints lead toward dense undergrowth.',
    choices: [
      {
        id: 'identify',
        text: 'Study the tracks to identify the creature',
        requires: { civTags: ['Foragers'] },
        effects: {
          identity: { knowledge: 10 },
          flags: { tracked_beast: true },
        },
      },
      {
        id: 'follow',
        text: 'Follow the tracks with weapons ready',
        requires: {},
        effects: {
          identity: { military: 5 },
          outcomes: [
            { weight: 0.6, text: 'You find a large boar and bring it down. Fresh meat for the tribe.' },
            { weight: 0.4, text: 'The creature was a cave bear. It charges!', combat: { enemyStrength: 6, enemyToughness: 4 } },
          ],
        },
      },
      {
        id: 'avoid',
        text: 'Mark the area as dangerous and avoid it',
        requires: {},
        effects: {
          identity: { knowledge: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_fresh_spring',
    age: 'stone',
    triggers: { minTurn: 3, maxTurn: 7, tileRevealed: ['hills', 'mountain'] },
    text: 'Bubbling up from the rocks, a fresh spring of clear water emerges. The area around it is green and lush compared to the surrounding terrain.',
    choices: [
      {
        id: 'settle_spring',
        text: 'Build shelters around the spring',
        requires: { civTags: ['Settlers'] },
        effects: {
          resources: { food: 1 },
          identity: { economy: 10 },
          flags: { spring_settlement: true },
        },
      },
      {
        id: 'mark_spring',
        text: 'Mark the location and return to camp',
        requires: {},
        effects: {
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'claim_spring',
        text: 'Post guards to claim this water source',
        requires: {},
        effects: {
          army: { toughness: 1 },
          identity: { military: 5 },
        },
      },
    ],
  },

  // ══════════════════════════════════════
  // MID GAME (Turn 3–7) — Choices with consequences
  // ══════════════════════════════════════

  {
    id: 'stone_neighboring_tribe',
    age: 'stone',
    triggers: { minTurn: 3, tileRevealed: ['plains', 'forest'] },
    text: 'A neighboring tribe approaches {leaderName}\'s camp. They are wary but not hostile, and offer to share knowledge of the land in exchange for access to your hunting grounds.',
    choices: [
      {
        id: 'accept',
        text: 'Welcome them as friends',
        requires: {},
        effects: {
          resources: { food: -1 },
          identity: { economy: 10 },
          flags: { shared_hunting_grounds: true },
        },
      },
      {
        id: 'trade',
        text: 'Trade tools for their knowledge',
        requires: { civTags: ['Tool Makers'] },
        effects: {
          resources: { materials: -1 },
          identity: { economy: 10, knowledge: 5 },
          addCivTag: 'Diplomats',
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
        requires: { civTags: ['Warriors'] },
        effects: {
          identity: { military: 10 },
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
    triggers: { minTurn: 4, tileRevealed: ['forest'] },
    text: 'A massive beast has been spotted prowling the forests near camp. It has already killed one of your hunters. Something must be done.',
    choices: [
      {
        id: 'hunt',
        text: 'Organize a spear hunt',
        requires: { civTags: ['Spear Carriers'] },
        effects: {
          resources: { food: 3 },
          identity: { military: 5 },
          addCivTag: 'Beast Slayers',
        },
      },
      {
        id: 'trap',
        text: 'Set traps using tools and fire',
        requires: { civTags: ['Tool Makers', 'Fire Keepers'] },
        effects: {
          resources: { food: 2 },
          identity: { knowledge: 10 },
        },
      },
      {
        id: 'avoid',
        text: 'Abandon the forest hunting grounds',
        requires: {},
        effects: {
          resources: { food: -2 },
        },
      },
    ],
  },

  {
    id: 'stone_strange_stones',
    age: 'stone',
    triggers: { minTurn: 4, tileRevealed: ['mountain', 'hills'] },
    text: 'Your scouts discover strange markings carved into stones in the hills. They seem ancient — far older than your tribe. The symbols are intricate and purposeful.',
    choices: [
      {
        id: 'study_stones',
        text: 'Have the elders study the markings',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          identity: { knowledge: 15 },
          flags: { found_ancient_stones: true },
          addCivTag: 'Lore Keepers',
        },
      },
      {
        id: 'use_stones',
        text: 'Use the stones for building material',
        requires: {},
        effects: {
          resources: { materials: 2 },
          identity: { knowledge: -5 },
        },
      },
      {
        id: 'worship_stones',
        text: 'Declare them sacred and build a cairn',
        requires: {},
        effects: {
          identity: { knowledge: 5 },
          flags: { sacred_stones: true },
        },
      },
    ],
  },

  {
    id: 'stone_river_crossing',
    age: 'stone',
    triggers: { minTurn: 5, tileRevealed: ['water'] },
    text: 'A wide river blocks your path. On the far bank, you can see fertile land and signs of game. The current is strong and the water deep.',
    choices: [
      {
        id: 'build_rafts',
        text: 'Weave rafts from reeds and logs',
        requires: { civTags: ['Artisans'] },
        effects: {
          resources: { materials: -1 },
          identity: { economy: 10 },
          addCivTag: 'River People',
        },
      },
      {
        id: 'swim_across',
        text: 'Have the strongest swimmers cross with ropes',
        requires: { civTags: ['Fishers'] },
        effects: {
          identity: { military: 5, economy: 5 },
        },
      },
      {
        id: 'find_ford',
        text: 'Search for a shallow crossing upstream',
        requires: {},
        effects: {
          resources: { food: -1 },
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
    id: 'stone_mammoth_sighting',
    age: 'stone',
    triggers: { minTurn: 5, tileRevealed: ['plains', 'hills'] },
    text: 'A great woolly mammoth grazes on the plains, its tusks gleaming in the sun. It could feed your tribe for weeks — but mammoths are deadly when provoked.',
    choices: [
      {
        id: 'pack_hunt',
        text: 'Coordinate a pack hunt — surround and overwhelm it',
        requires: { civTags: ['Pack Hunters'] },
        effects: {
          resources: { food: 3, materials: 2 },
          identity: { military: 10 },
          addCivTag: 'Mammoth Hunters',
        },
      },
      {
        id: 'fire_drive',
        text: 'Use fire to drive it off a cliff',
        requires: { civTags: ['Fire Keepers'] },
        effects: {
          resources: { food: 3 },
          identity: { knowledge: 10 },
        },
      },
      {
        id: 'observe',
        text: 'Study it from a safe distance',
        requires: {},
        effects: {
          identity: { knowledge: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_rainforest_discovery',
    age: 'stone',
    triggers: { minTurn: 5, tileRevealed: ['rainforest'] },
    text: 'Your scouts push through dense vegetation into a lush rainforest. Strange fruits hang from the canopy and unfamiliar creatures call from the shadows.',
    choices: [
      {
        id: 'harvest_fruits',
        text: 'Gather the exotic fruits',
        requires: {},
        effects: {
          resources: { food: 2 },
          identity: { economy: 5 },
          outcomes: [
            { weight: 0.7, text: 'The fruits are delicious and nourishing.' },
            { weight: 0.3, text: 'Some of the fruits are mildly poisonous. Several people fall ill.', flags: { jungle_sickness: true } },
          ],
        },
      },
      {
        id: 'catalog_plants',
        text: 'Carefully identify each plant before eating',
        requires: { civTags: ['Healers'] },
        effects: {
          identity: { knowledge: 10 },
          addCivTag: 'Naturalists',
        },
      },
      {
        id: 'hunt_creatures',
        text: 'Hunt the strange creatures',
        requires: { civTags: ['Spear Carriers'] },
        effects: {
          resources: { food: 2 },
          identity: { military: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_swamp_sickness',
    age: 'stone',
    triggers: { minTurn: 6, tileRevealed: ['swamp'] },
    text: 'A strange fever spreads through the camp after your people explored the swamps. The sick shake with chills and cannot keep food down. Without treatment, some will die.',
    choices: [
      {
        id: 'use_herbs',
        text: 'Treat the sick with medicinal herbs',
        requires: { civTags: ['Healers'] },
        effects: {
          identity: { knowledge: 10 },
          flags: { cured_swamp_fever: true },
        },
      },
      {
        id: 'pray',
        text: 'Have the shaman commune with spirits for a cure',
        requires: { civTags: ['Ancestor Blessed'] },
        effects: {
          resources: { population: -1 },
          identity: { knowledge: 5 },
          army: { morale: 2 },
        },
      },
      {
        id: 'abandon',
        text: 'Quarantine the sick outside of camp',
        requires: {},
        effects: {
          resources: { population: -2 },
          identity: { military: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_ice_cave',
    age: 'stone',
    triggers: { minTurn: 6, tileRevealed: ['snow', 'ice', 'mountain'] },
    text: 'Deep in the frozen hills, your scouts discover a cave. Its walls are covered in ancient paintings — handprints, animals, spirals. Strange crystals glitter in the torchlight.',
    choices: [
      {
        id: 'study_paintings',
        text: 'Study the paintings for their meaning',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          identity: { knowledge: 15 },
          flags: { found_ice_cave: true },
        },
      },
      {
        id: 'read_stars',
        text: 'The spirals match star patterns — map them',
        requires: { civTags: ['Stargazers'] },
        effects: {
          identity: { knowledge: 15 },
          addCivTag: 'Sky Readers',
          flags: { star_cave: true },
        },
      },
      {
        id: 'mine_crystals',
        text: 'Mine the crystals',
        requires: {},
        effects: {
          resources: { materials: 2, wealth: 1 },
          identity: { economy: 5 },
        },
      },
      {
        id: 'shelter_cave',
        text: 'Use the cave as a shelter',
        requires: {},
        effects: {
          army: { toughness: 1 },
          addCivTag: 'Cave Dwellers',
        },
      },
    ],
  },

  {
    id: 'stone_tribal_gathering',
    age: 'stone',
    triggers: { minTurn: 7 },
    text: 'Runners arrive from distant lands — a great gathering of tribes has been called at the river fork. Leaders from a dozen bands will meet to trade, negotiate, and compete. Will {leaderName} attend?',
    choices: [
      {
        id: 'trade_goods',
        text: 'Bring goods to trade',
        requires: { civTags: ['Artisans'] },
        effects: {
          resources: { materials: -1, wealth: 2 },
          identity: { economy: 15 },
          addCivTag: 'Traders',
        },
      },
      {
        id: 'share_stories',
        text: 'Share your tribe\'s stories and lore',
        requires: { civTags: ['Oral Tradition'] },
        effects: {
          identity: { knowledge: 15 },
          flags: { tribal_gathering_lore: true },
        },
      },
      {
        id: 'challenge_warriors',
        text: 'Challenge other tribes to contests of strength',
        requires: { civTags: ['Warriors'] },
        effects: {
          army: { morale: 2, strength: 1 },
          identity: { military: 10 },
        },
      },
      {
        id: 'skip_gathering',
        text: 'Refuse to attend — your tribe stands alone',
        requires: {},
        effects: {
          identity: { military: 5 },
          flags: { isolationist: true },
        },
      },
    ],
  },

  // ══════════════════════════════════════
  // LATE GAME (Turn 8+) — Dangerous, high stakes
  // ══════════════════════════════════════

  {
    id: 'stone_great_drought',
    age: 'stone',
    triggers: { minTurn: 8 },
    text: 'The rains have not come. Rivers shrink to trickles, berry bushes wither, and game flees to distant lands. Your stores are almost empty. Without action, your people will starve.',
    choices: [
      {
        id: 'fish_reserves',
        text: 'Turn to the rivers and coast for fish',
        requires: { civTags: ['Fishers'] },
        effects: {
          resources: { food: 2 },
          identity: { economy: 10 },
        },
      },
      {
        id: 'use_pottery',
        text: 'Use stored water from clay vessels',
        requires: { civTags: ['Potters'] },
        effects: {
          resources: { food: 1 },
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'raid_neighbors',
        text: 'Raid a weaker tribe for their food',
        requires: { civTags: ['Raiders'] },
        effects: {
          resources: { food: 3 },
          identity: { military: 10 },
          flags: { drought_raiders: true },
          outcomes: [
            { weight: 0.5, text: 'The raid succeeds — your people eat tonight.' },
            { weight: 0.5, text: 'They were prepared for your attack!', combat: { enemyStrength: 10, enemyToughness: 5 } },
          ],
        },
      },
      {
        id: 'endure',
        text: 'Ration what remains and endure',
        requires: {},
        effects: {
          resources: { food: -3, population: -1 },
          identity: { knowledge: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_painted_warriors',
    age: 'stone',
    triggers: { minTurn: 8 },
    text: 'War drums echo across the valley. A rival war party, painted head to toe in blood-red ochre, appears at your borders. They are many, and they are angry. They want your lands.',
    choices: [
      {
        id: 'intimidate_back',
        text: 'Meet them with your own war paint and a show of force',
        requires: { civTags: ['Painted Warriors'] },
        effects: {
          identity: { military: 10 },
          army: { morale: 2 },
          flags: { intimidated_rivals: true },
        },
      },
      {
        id: 'ambush_them',
        text: 'Lure them into an ambush',
        requires: { civTags: ['Shadow Stalkers'] },
        effects: {
          identity: { military: 15 },
          outcomes: [
            { weight: 0.7, text: 'Your ambush scatters them into the hills!' },
            { weight: 0.3, text: 'They see through your trap!', combat: { enemyStrength: 12, enemyToughness: 6 } },
          ],
        },
      },
      {
        id: 'fight_head_on',
        text: 'Form a battle line and fight',
        requires: {},
        effects: {
          identity: { military: 5 },
          outcomes: [
            { weight: 0.3, text: 'Your warriors hold the line!' },
            { weight: 0.7, text: 'They overwhelm your defenses!', combat: { enemyStrength: 12, enemyToughness: 7 } },
          ],
        },
      },
      {
        id: 'offer_tribute',
        text: 'Offer tribute to avoid bloodshed',
        requires: {},
        effects: {
          resources: { food: -3, materials: -2 },
          identity: { economy: 5, military: -10 },
        },
      },
    ],
  },

  {
    id: 'stone_earthquake',
    age: 'stone',
    triggers: { minTurn: 9 },
    text: 'The ground heaves and splits. Shelters collapse, fires scatter, and the earth itself seems to roar. When the shaking stops, dust fills the air and people cry out from the rubble.',
    choices: [
      {
        id: 'rebuild_strong',
        text: 'Rebuild with reinforced shelters',
        requires: { civTags: ['Settlers'] },
        effects: {
          resources: { materials: -2 },
          identity: { economy: 10 },
          army: { toughness: 1 },
        },
      },
      {
        id: 'fortify_remains',
        text: 'Shore up defenses around what survived',
        requires: { civTags: ['Fortifiers'] },
        effects: {
          resources: { materials: -1 },
          army: { toughness: 2 },
          identity: { military: 10 },
        },
      },
      {
        id: 'salvage',
        text: 'Salvage what you can from the wreckage',
        requires: {},
        effects: {
          resources: { materials: 1, population: -1 },
          identity: { economy: 5 },
        },
      },
      {
        id: 'migrate',
        text: 'Abandon this cursed place and move on',
        requires: {},
        effects: {
          resources: { population: -1, materials: -2 },
          addCivTag: 'Nomadic',
        },
      },
    ],
  },

  {
    id: 'stone_plague',
    age: 'stone',
    triggers: { minTurn: 10 },
    text: 'A terrible sickness sweeps through your people. It starts with a cough and ends with death. Bodies pile up faster than they can be buried. Your healers are overwhelmed.',
    choices: [
      {
        id: 'herbal_treatment',
        text: 'Prepare herbal medicines and quarantine the sick',
        requires: { civTags: ['Healers'] },
        effects: {
          resources: { population: -1 },
          identity: { knowledge: 10 },
          flags: { survived_plague: true },
        },
      },
      {
        id: 'spirit_ritual',
        text: 'Perform a great spirit ritual to drive out the sickness',
        requires: { civTags: ['Spirit Walkers'] },
        effects: {
          resources: { population: -1 },
          identity: { knowledge: 15 },
          army: { morale: 2 },
          flags: { spirit_cured_plague: true },
        },
      },
      {
        id: 'flee_plague',
        text: 'Abandon the sick and flee to clean lands',
        requires: {},
        effects: {
          resources: { population: -3 },
          identity: { military: 5 },
        },
      },
      {
        id: 'endure_plague',
        text: 'Endure and hope it passes',
        requires: {},
        effects: {
          resources: { population: -4 },
        },
      },
    ],
  },

  {
    id: 'stone_blood_moon',
    age: 'stone',
    triggers: { minTurn: 10 },
    text: 'The moon turns the color of blood. Your people wail in terror, convinced the spirits are angry. Panic spreads through the camp. Some demand sacrifice, others want to flee.',
    choices: [
      {
        id: 'read_signs',
        text: 'The shamans interpret the celestial signs',
        requires: { civTags: ['Spirit Walkers'] },
        effects: {
          identity: { knowledge: 15 },
          army: { morale: 3 },
          addLeaderTrait: 'Devout',
        },
      },
      {
        id: 'star_navigation',
        text: 'Explain the phenomenon using star knowledge',
        requires: { civTags: ['Stargazers'] },
        effects: {
          identity: { knowledge: 15 },
          army: { morale: 2 },
        },
      },
      {
        id: 'sacrifice',
        text: 'Offer a sacrifice to appease the spirits',
        requires: {},
        effects: {
          resources: { food: -2 },
          army: { morale: 1 },
          identity: { knowledge: 5 },
        },
      },
      {
        id: 'ignore',
        text: 'Tell your people it is nothing — go back to sleep',
        requires: {},
        effects: {
          army: { morale: -2 },
          identity: { military: 5 },
        },
      },
    ],
  },

  {
    id: 'stone_rival_invasion',
    age: 'stone',
    triggers: { minTurn: 11 },
    text: 'Scouts report a massive force approaching — three rival bands have united against your growing tribe. They carry spears, torches, and the bones of their ancestors as war totems. This is no raid. They mean to destroy you.',
    choices: [
      {
        id: 'defend_fort',
        text: 'Fall back to the hill fort and defend',
        requires: { civTags: ['Fortifiers'] },
        effects: {
          army: { toughness: 3 },
          identity: { military: 15 },
          outcomes: [
            { weight: 0.6, text: 'Your fortifications hold! The enemy breaks against your walls.' },
            { weight: 0.4, text: 'They find a way around your defenses!', combat: { enemyStrength: 14, enemyToughness: 8 } },
          ],
        },
      },
      {
        id: 'counter_attack',
        text: 'Strike first — ambush them before they arrive',
        requires: { civTags: ['Shadow Stalkers', 'Warriors'] },
        effects: {
          army: { strength: 2 },
          identity: { military: 15 },
          outcomes: [
            { weight: 0.5, text: 'Your ambush throws them into chaos! Victory!' },
            { weight: 0.5, text: 'They expected treachery!', combat: { enemyStrength: 15, enemyToughness: 7 } },
          ],
        },
      },
      {
        id: 'diplomacy',
        text: 'Send an emissary to negotiate',
        requires: { civTags: ['Diplomats'] },
        effects: {
          resources: { food: -2, wealth: -2 },
          identity: { economy: 15 },
          flags: { negotiated_peace: true },
        },
      },
      {
        id: 'fight_desperate',
        text: 'Rally everyone — fight for survival',
        requires: {},
        effects: {
          identity: { military: 10 },
          outcomes: [
            { weight: 0.3, text: 'Against all odds, your people prevail!' },
            { weight: 0.7, text: 'The enemy horde crashes into your lines!', combat: { enemyStrength: 16, enemyToughness: 8 } },
          ],
        },
      },
    ],
  },
];
