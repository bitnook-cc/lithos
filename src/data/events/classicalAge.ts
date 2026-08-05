import { GameEvent } from '@/types/events';

export const CLASSICAL_AGE_EVENTS: GameEvent[] = [
  {
    id: 'classical_first_assembly', title: 'Who Owns the City?', category: 'politics', weight: 3, age: 'classical', triggers: { minTurn: 1, maxTurn: 4 },
    text: 'The old palace can no longer contain the city. Landowners, artisans, veterans, and the poor gather in the square, each claiming a voice in what your people have become.',
    choices: [
      { id: 'broad_assembly', text: 'Give every household a voice', requires: { identity: { economy: 10 } }, effects: { resources: { influence: 3 }, identity: { military: -8, knowledge: 8 }, flags: { founded_assembly: true }, grantFeat: 'voice_of_citizens', chronicle: 'The assembly met beneath an open sky; power learned to answer questions.' } },
      { id: 'property_vote', text: 'Let those who sustain the city govern it', requires: {}, effects: { resources: { wealth: 5 }, identity: { economy: 10 }, flags: { oligarchic_council: true } } },
      { id: 'single_archon', text: 'Unity requires one commanding voice', requires: { armyStats: { morale: 8 } }, effects: { resources: { influence: 6 }, identity: { military: 12 }, flags: { archon_rules: true } } },
    ],
  },
  {
    id: 'classical_river_people', title: 'A Treaty Older Than Bronze', category: 'legacy', weight: 3, age: 'classical', triggers: { minTurn: 2, flags: { bronze_trade_compact: true } },
    text: 'Your river allies ask for full citizenship. Their merchants already fund your roads and their soldiers guard the eastern ford. Tradition alone keeps them outside.',
    choices: [
      { id: 'grant_citizenship', text: 'One river, one citizenship', requires: {}, effects: { resources: { influence: 4, population: 2 }, identity: { economy: 10 }, addCivTag: 'River Commonwealth' } },
      { id: 'allied_status', text: 'Honor the alliance, preserve separate laws', requires: {}, effects: { resources: { wealth: 5 }, army: { numbers: 2 }, identity: { economy: 5 } } },
      { id: 'annex', text: 'The river belongs inside our borders', requires: { armyStats: { strength: 12 } }, effects: { resources: { materials: 5 }, identity: { military: 12 }, flags: { river_annexed: true } } },
    ],
  },
  {
    id: 'classical_philosopher_trial', title: 'The Gadfly', category: 'discovery', weight: 2, age: 'classical', triggers: { minTurn: 3 },
    text: 'A philosopher teaches young citizens to question generals, priests, and even {leaderName}. The city charges her with corrupting the youth. Her defense is brilliant and infuriating.',
    choices: [
      { id: 'acquit', text: 'A city afraid of questions is already weak', requires: { civTags: ['Philosophers'] }, effects: { resources: { knowledge: 6, influence: -2 }, identity: { knowledge: 15 }, addCivTag: 'Free Inquiry' } },
      { id: 'exile', text: 'Exile her; preserve peace without blood', requires: {}, effects: { resources: { influence: 2 }, identity: { knowledge: 3 }, flags: { philosopher_exiled: true } } },
      { id: 'condemn', text: 'No citizen stands above the law', requires: { civTags: ['Law Keepers'] }, effects: { resources: { influence: 5 }, identity: { military: 8, knowledge: -8 }, flags: { gadfly_condemned: true } } },
    ],
  },
  {
    id: 'classical_aqueduct', title: 'The Mountain Spring', category: 'discovery', weight: 2, age: 'classical', triggers: { minTurn: 3, tileRevealed: ['mountain', 'hills'] },
    text: 'Engineers find a spring high enough to feed the whole city. The channel would cross sacred graves and farms held by powerful families.',
    choices: [
      { id: 'public_works', text: 'Build it for the whole city', requires: { civTags: ['City Builders'] }, effects: { resources: { materials: -5, population: 1 }, identity: { knowledge: 8 }, flags: { clean_water_for_all: true } } },
      { id: 'elite_fountains', text: 'Let wealthy patrons fund private fountains', requires: {}, effects: { resources: { wealth: 6 }, identity: { economy: 10 } } },
      { id: 'respect_graves', text: 'Reroute the channel around the dead', requires: { leaderTraits: ['Devout'] }, effects: { resources: { materials: -3, influence: 5 }, addCivTag: 'Ancestor Respect' } },
    ],
  },
  {
    id: 'classical_border_king', title: 'The King at the Border', category: 'politics', weight: 2, age: 'classical', triggers: { minTurn: 4 },
    text: 'A defeated king arrives with fifty riders and a sealed treasury. He offers both in exchange for asylum—and a future war to reclaim his throne.',
    choices: [
      { id: 'asylum', text: 'Grant asylum, but promise no war', requires: {}, effects: { resources: { wealth: 3 }, army: { numbers: 2 }, identity: { economy: 6 }, flags: { king_in_exile: true } } },
      { id: 'restore_him', text: 'Promise to restore his throne', requires: { armyStats: { strength: 13 } }, effects: { resources: { wealth: 7 }, identity: { military: 12 }, flags: { restoration_war: true } } },
      { id: 'seize_treasury', text: 'Seize the treasury and return his head', requires: { leaderTraits: ['Ruthless'] }, effects: { resources: { wealth: 10, influence: 3 }, identity: { military: 15 } } },
    ],
  },
  {
    id: 'classical_great_games', title: 'The Great Games', category: 'legacy', weight: 2, age: 'classical', triggers: { minTurn: 5 },
    text: 'Cities from across the known world arrive for races, wrestling, poetry, and sacrifice. A rival champion has never been defeated.',
    choices: [
      { id: 'fair_games', text: 'Let excellence decide', requires: {}, effects: { resources: { influence: 5, wealth: 2 }, army: { morale: 2 }, flags: { fair_games: true } } },
      { id: 'secret_training', text: 'Give your champion every advantage', requires: { civTags: ['Spear Carriers'] }, effects: { resources: { influence: 7 }, identity: { military: 8 } } },
      { id: 'poetry_prize', text: 'Make poetry equal to victory in war', requires: { civTags: ['Epic Tradition'] }, effects: { resources: { knowledge: 4, influence: 4 }, identity: { knowledge: 10 }, addCivTag: 'Patrons of Art' } },
    ],
  },
  {
    id: 'classical_debt_revolt', title: 'The Broken Tablets', category: 'politics', weight: 3, age: 'classical', triggers: { minTurn: 6 },
    text: 'Debtors storm the archive and smash the tablets that bind their children to wealthy estates. Creditors demand troops. The crowd demands a new beginning.',
    choices: [
      { id: 'cancel_debts', text: 'Cancel the old debts', requires: {}, effects: { resources: { wealth: -6, population: 1 }, identity: { economy: -8, military: -5 }, flags: { debt_jubilee: true } } },
      { id: 'enforce_contracts', text: 'Contracts are the foundation of order', requires: {}, effects: { resources: { wealth: 6, population: -1 }, army: { morale: -1 }, identity: { military: 8 } } },
      { id: 'land_reform', text: 'Exchange debt relief for public service', requires: { civTags: ['Citizens'] }, effects: { resources: { materials: 5, wealth: -3 }, army: { numbers: 2 }, identity: { economy: 6 }, flags: { land_reform: true } } },
    ],
  },
  {
    id: 'classical_library_fire', title: 'The Library Burns', category: 'legacy', weight: 2, age: 'classical', triggers: { minTurn: 7 },
    text: 'During a riot, fire reaches the great library. Scholars form a human chain while soldiers wait for orders. Nearby, the treasury doors have also been forced.',
    choices: [
      { id: 'save_library', text: 'Save the library at any cost', requires: {}, effects: { resources: { knowledge: 8, wealth: -5 }, identity: { knowledge: 15 }, flags: { library_saved: true }, chronicle: 'Citizens passed burning scrolls hand to hand until dawn.' } },
      { id: 'save_treasury', text: 'Secure the treasury and restore order', requires: {}, effects: { resources: { wealth: 8, knowledge: -3 }, identity: { military: 8 } } },
      { id: 'save_both', text: 'Divide the guard and trust the citizens', requires: { activePerks: ['citizen_oath'] }, effects: { resources: { knowledge: 5, wealth: 5 }, army: { numbers: -1 }, flags: { city_saved_itself: true } } },
    ],
  },
  {
    id: 'classical_civil_war', title: 'Two Standards', category: 'war', weight: 3, age: 'classical', triggers: { minTurn: 9 },
    text: 'Two generals enter the city under separate standards. Each claims the constitution, the gods, and the frontier army. By sunset, citizens are choosing sides.',
    choices: [
      { id: 'defend_law', text: 'Stand with the lawful assembly', requires: { civTags: ['Republic'] }, effects: { resources: { influence: -3 }, identity: { military: -5, knowledge: 8 }, outcomes: [
        { weight: 0.7, text: 'The legions lower their standards before the assembly.', army: { morale: 3 }, combat: { enemyStrength: 15, enemyToughness: 11 } },
        { weight: 0.3, text: 'Law proves fragile when swords leave their sheaths.', resources: { population: -2 }, combat: { enemyStrength: 18, enemyToughness: 12 } },
      ] } },
      { id: 'choose_general', text: 'Choose the stronger general', requires: {}, effects: { army: { strength: 2 }, identity: { military: 15 }, flags: { dictator_appointed: true } } },
      { id: 'arm_districts', text: 'Arm the districts and let neither general rule', requires: {}, effects: { army: { numbers: 3, morale: 2 }, resources: { materials: -5 }, flags: { citizen_militia: true } } },
    ],
  },
  {
    id: 'classical_last_question', title: 'What Will Remain?', category: 'legacy', weight: 4, age: 'classical', triggers: { minTurn: 11 },
    text: 'The city stands at the center of its world. Envoys ask what your civilization offers beyond power. {leaderName} has one generation to answer.',
    choices: [
      { id: 'peace', text: 'A peace guarded by shared law', requires: { civTags: ['Republic'] }, effects: { resources: { influence: 6 }, identity: { military: -10, economy: 8 }, flags: { legacy_peace: true }, chronicle: 'Your envoys carried laws rather than ultimatums.' } },
      { id: 'wisdom', text: 'A tradition of fearless inquiry', requires: { civTags: ['Philosophers'] }, effects: { resources: { knowledge: 8 }, identity: { knowledge: 15 }, flags: { legacy_wisdom: true } } },
      { id: 'dominion', text: 'Order beneath an unconquered standard', requires: { armyStats: { strength: 16 } }, effects: { resources: { influence: 8 }, identity: { military: 15 }, flags: { legacy_dominion: true } } },
      { id: 'plural', text: 'No single answer; let every city add its own', requires: { activePerks: ['caravan_memory'] }, effects: { resources: { wealth: 5, influence: 5 }, identity: { economy: 12, knowledge: 8 }, flags: { legacy_plural: true } } },
      { id: 'endurance', text: 'A civilization is what its people survive together', requires: {}, effects: { resources: { population: 1 }, army: { morale: 2 }, flags: { legacy_endurance: true }, chronicle: 'No single monument defined the people; their endurance did.' } },
    ],
  },
];
