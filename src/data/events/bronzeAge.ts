import { GameEvent } from '@/types/events';

export const BRONZE_AGE_EVENTS: GameEvent[] = [
  {
    id: 'bronze_old_neighbors', title: 'The People Beyond the River', category: 'legacy', weight: 3, age: 'bronze',
    triggers: { minTurn: 1, maxTurn: 4, flags: { shared_hunting_grounds: true } },
    text: 'The tribe your ancestors welcomed now controls rich fields across the river. Their envoy calls {leaderName} “cousin” and asks that the old promise become a treaty between cities.',
    choices: [
      { id: 'renew_compact', text: 'Renew the old compact as equals', requires: {}, effects: { resources: { wealth: 3, food: 2 }, identity: { economy: 12 }, flags: { bronze_trade_compact: true }, grantFeat: 'open_hand', chronicle: 'An ancient act of welcome became the first treaty between cities.' } },
      { id: 'demand_tribute', text: 'The past is sentiment. Demand tribute.', requires: { armyStats: { strength: 7 } }, effects: { resources: { wealth: 6 }, identity: { military: 12, economy: -5 }, flags: { river_tributary: true } } },
      { id: 'close_crossing', text: 'Close the river crossing', requires: {}, effects: { army: { toughness: 1 }, identity: { economy: -12 } } },
    ],
  },
  {
    id: 'bronze_returning_enemy', title: 'An Old Refusal', category: 'war', weight: 3, age: 'bronze',
    triggers: { minTurn: 2, flags: { refused_tribe: true } },
    text: 'The people once turned from your fire return behind bronze shields. They have remembered the insult longer than they remembered your name.',
    choices: [
      { id: 'apology', text: 'Offer restitution and an honest apology', cost: { wealth: 3, food: 2 }, requires: {}, effects: { identity: { economy: 12 }, flags: { old_feud_ended: true }, grantFeat: 'open_hand' } },
      { id: 'meet_field', text: 'Meet memory with bronze', requires: {}, effects: { identity: { military: 10 }, outcomes: [
        { weight: 0.55, text: 'The old grudge ends beneath abandoned shields.', resources: { wealth: 3 }, combat: { enemyStrength: 10, enemyToughness: 7 } },
        { weight: 0.45, text: 'Their anger proves stronger than your line.', resources: { population: -2 }, combat: { enemyStrength: 13, enemyToughness: 8 } },
      ] } },
    ],
  },
  {
    id: 'bronze_grain_ledger', title: 'Marks in Wet Clay', category: 'discovery', weight: 2, age: 'bronze',
    triggers: { minTurn: 2, tileRevealed: ['fertile', 'plains'] },
    text: 'Storehouse keepers press harvest tallies into wet clay. They discover that a mark can expose theft—but also measure exactly what every household owes.',
    choices: [
      { id: 'public_ledgers', text: 'Make the ledgers public', requires: { civTags: ['Scribes'] }, effects: { resources: { knowledge: 3 }, identity: { knowledge: 10, economy: 5 }, flags: { public_ledgers: true } } },
      { id: 'tax_rolls', text: 'Use them to levy grain efficiently', requires: {}, effects: { resources: { food: 5, influence: 2 }, identity: { economy: 8, military: 4 } } },
      { id: 'sacred_marks', text: 'Declare writing a sacred mystery', requires: { leaderTraits: ['Devout'] }, effects: { resources: { influence: 5 }, identity: { knowledge: -5 }, addCivTag: 'Sacred Script' } },
    ],
  },
  {
    id: 'bronze_city_gates', title: 'At the City Gates', category: 'politics', weight: 3, age: 'bronze',
    triggers: { minTurn: 3 },
    text: 'Drought drives hundreds of strangers to your walls. They bring hungry children, unfamiliar gods, and skills your city lacks. The granaries are not infinite.',
    choices: [
      { id: 'welcome_citizens', text: 'Open the gates and make room', cost: { food: 4 }, requires: { identity: { economy: 5 } }, effects: { resources: { population: 2 }, identity: { economy: 12 }, flags: { welcomed_migrants: true }, grantFeat: 'city_of_many', chronicle: 'The gates opened, and strangers became neighbors.' } },
      { id: 'work_contracts', text: 'Admit only those who accept labor contracts', requires: {}, effects: { resources: { materials: 5, population: 1 }, identity: { economy: 5, military: 5 } } },
      { id: 'bar_the_gates', text: 'The city must protect its own', requires: {}, effects: { army: { toughness: 2 }, identity: { economy: -12 }, flags: { barred_migrants: true } } },
    ],
  },
  {
    id: 'bronze_tin_road', title: 'The Vanishing Tin Road', category: 'politics', weight: 2, age: 'bronze',
    triggers: { minTurn: 4 },
    text: 'Tin caravans have stopped arriving. Without the distant metal, your bronze workshops will go quiet. Scouts blame a hill kingdom that now taxes the pass.',
    choices: [
      { id: 'pay_toll', text: 'Pay the toll and keep the road open', cost: { wealth: 3 }, requires: {}, effects: { resources: { materials: 5 }, identity: { economy: 8 } } },
      { id: 'suspend_workshops', text: 'Suspend the workshops until the road reopens', requires: {}, effects: { resources: { materials: -2 }, identity: { economy: -3 } } },
      { id: 'escort_caravans', text: 'Send warriors to escort the caravans', requires: { armyStats: { toughness: 5 } }, effects: { army: { numbers: -1 }, resources: { materials: 6 }, identity: { military: 8 }, flags: { secured_tin_road: true } } },
      { id: 'seek_substitute', text: 'Let the smiths experiment', cost: { materials: 2 }, requires: { civTags: ['Bronze Forged'] }, effects: { resources: { knowledge: 4 }, identity: { knowledge: 12 } } },
    ],
  },
  {
    id: 'bronze_crown', title: 'The Weight of the Crown', category: 'politics', weight: 2, age: 'bronze',
    triggers: { minTurn: 5 },
    text: 'Priests proclaim {leaderName} chosen by the sun. Merchants prefer a council. Veterans insist only the army keeps the city whole.',
    choices: [
      { id: 'divine_king', text: 'Accept the sacred crown', requires: { leaderTraits: ['Devout'] }, effects: { resources: { influence: 6 }, identity: { military: 8, knowledge: -5 }, addCivTag: 'God-King Tradition' } },
      { id: 'merchant_council', text: 'Create a council of households and merchants', requires: { identity: { economy: 15 } }, effects: { resources: { wealth: 5 }, identity: { economy: 12 }, flags: { proto_council: true } } },
      { id: 'remain_first_among_equals', text: 'Remain first among equals', requires: {}, effects: { army: { morale: 2 }, identity: { military: -5, knowledge: 5 }, flags: { humble_crown: true } } },
    ],
  },
  {
    id: 'bronze_flood', title: 'The River Takes Its Due', category: 'survival', weight: 2, age: 'bronze',
    triggers: { minTurn: 5, tileRevealed: ['water', 'fertile'] },
    text: 'The river rises past every remembered marker. Mud walls soften. Barges tear loose. There is time to save the granaries, the lower quarter, or the temple archives—not all three.',
    choices: [
      { id: 'save_people', text: 'Evacuate the lower quarter', requires: {}, effects: { resources: { materials: -5 }, army: { morale: 2 }, identity: { economy: -5 }, flags: { people_before_stone: true } } },
      { id: 'save_grain', text: 'Reinforce the granaries', requires: {}, effects: { resources: { food: 5, population: -1 }, identity: { military: 6 } } },
      { id: 'save_records', text: 'Carry the tablets to high ground', requires: { civTags: ['Scribes'] }, effects: { resources: { knowledge: 6, population: -1 }, identity: { knowledge: 12 }, flags: { tablets_saved: true } } },
    ],
  },
  {
    id: 'bronze_sea_raiders', title: 'Sails Without Names', category: 'war', weight: 2, age: 'bronze',
    triggers: { minTurn: 7, tileRevealed: ['water'] },
    text: 'Black sails appear beyond the fishing boats. The strangers beach their ships at dusk and test your walls with bronze axes.',
    choices: [
      { id: 'harbor_ambush', text: 'Draw them into a harbor ambush', requires: { armyStats: { stealth: 4 } }, effects: { identity: { military: 10 }, outcomes: [
        { weight: 0.7, text: 'Fire ships turn the harbor red. The raiders break.', resources: { wealth: 4 }, combat: { enemyStrength: 11, enemyToughness: 7 } },
        { weight: 0.3, text: 'The wind changes. Your own docks burn.', resources: { materials: -5 }, combat: { enemyStrength: 14, enemyToughness: 9 } },
      ] } },
      { id: 'buy_departure', text: 'Buy their departure', cost: { wealth: 5, food: 3 }, requires: {}, effects: { identity: { economy: 6, military: -5 } } },
      { id: 'stand_walls', text: 'Hold the walls', requires: {}, effects: { outcomes: [{ weight: 1, text: 'Bronze rings against bronze until dawn.', combat: { enemyStrength: 14, enemyToughness: 8 } }], identity: { military: 8 } } },
    ],
  },
  {
    id: 'bronze_palace_fire', title: 'Ashes in the Archive', category: 'legacy', weight: 2, age: 'bronze',
    triggers: { minTurn: 8 },
    text: 'A lamp falls in the palace archive. Flames race across dry tablets and cedar shelves. The records of debts and the songs of ancestors lie in different wings.',
    choices: [
      { id: 'save_debts', text: 'Save the tax and debt records', requires: {}, effects: { resources: { wealth: 5, knowledge: -2 }, identity: { economy: 10 }, flags: { debts_remembered: true } } },
      { id: 'save_songs', text: 'Save the ancestral epics', requires: {}, effects: { army: { morale: 3 }, identity: { knowledge: 8 }, flags: { epics_saved: true } } },
      { id: 'open_doors', text: 'Open every door and save whoever can be saved', requires: { leaderTraits: ['Bold'] }, effects: { resources: { population: 1, materials: -4 }, addLeaderTrait: 'Cautious', chronicle: '{leaderName} entered the burning archive and emerged carrying a child.' } },
    ],
  },
  {
    id: 'bronze_collapse', title: 'The Year the Roads Went Silent', category: 'survival', weight: 3, age: 'bronze',
    triggers: { minTurn: 10 },
    text: 'Crop failures, raiders, and palace feuds converge. Couriers vanish. Tributaries stop answering. Your city can preserve only the institution it trusts most.',
    choices: [
      { id: 'trust_law', text: 'Keep the courts open', requires: { civTags: ['Law Keepers'] }, effects: { resources: { influence: 5, food: -3 }, army: { morale: 2 }, flags: { law_survived_collapse: true } } },
      { id: 'trust_army', text: 'Put the granaries under military guard', requires: { armyStats: { strength: 9 } }, effects: { resources: { food: 5 }, identity: { military: 12 }, flags: { army_ruled_crisis: true } } },
      { id: 'trust_people', text: 'Let each district organize its own survival', requires: {}, effects: { resources: { population: 1, wealth: -3 }, identity: { military: -8, economy: 8 }, flags: { districts_self_ruled: true } } },
    ],
  },
];
