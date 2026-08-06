import { TechNode } from '@/types/game';

export function classicalAgeTechs(): TechNode[] {
  return [
    {
      id: 'philosophy', name: 'Philosophy',
      description: 'Ask what a good life—and a just state—should be.',
      cost: 14, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'academy' },
        { type: 'resource_per_turn', resource: 'knowledge', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Philosophers' },
      ],
    },
    {
      id: 'citizenship', name: 'Citizenship',
      description: 'Make belonging a civic compact rather than an accident of birth.',
      cost: 14, researched: false, requires: [],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Citizens' },
      ],
    },
    {
      id: 'iron_legions', name: 'Iron Legions',
      description: 'Standard weapons and relentless drill transform the army.',
      cost: 16, researched: false, requires: [],
      effects: [
        { type: 'unlock_building', buildingId: 'legion_camp' },
        { type: 'army_bonus', stat: 'strength', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Legionaries' },
      ],
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Make number, proportion, and proof into tools that travel between disciplines.',
      cost: 15, researched: false, requires: [],
      effects: [
        { type: 'resource_per_turn', resource: 'knowledge', amount: 1 },
      ],
    },
    {
      id: 'medicine', name: 'Medicine',
      description: 'Separate observation and treatment from omen without abandoning compassion.',
      cost: 15, researched: false, requires: [],
      effects: [
        { type: 'resource_per_turn', resource: 'food', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Healers' },
      ],
    },
    {
      id: 'rhetoric', name: 'Rhetoric',
      description: 'Words become instruments of persuasion, unity, and ambition.',
      cost: 18, researched: false, requires: ['philosophy', 'citizenship'],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Orators' },
      ],
    },
    {
      id: 'republic', name: 'Republic',
      description: 'Bind rulers to offices, laws, and the consent of citizens.',
      cost: 20, researched: false, requires: ['citizenship'],
      effects: [
        { type: 'action_point_bonus', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Republic' },
      ],
    },
    {
      id: 'engineering', name: 'Engineering',
      description: 'Measure weight, water, and stone until impossible works become routine.',
      cost: 18, researched: false, requires: ['mathematics'],
      effects: [
        { type: 'unlock_building', buildingId: 'aqueduct' },
        { type: 'building_bonus', buildingId: 'aqueduct', resource: 'food', amount: 2 },
      ],
    },
    {
      id: 'coinage', name: 'Coinage',
      description: 'A stamped promise lets value travel farther than personal trust.',
      cost: 17, researched: false, requires: ['citizenship'],
      effects: [
        { type: 'unlock_building', buildingId: 'agora' },
        { type: 'resource_per_turn', resource: 'wealth', amount: 2 },
      ],
    },
    {
      id: 'natural_philosophy', name: 'Natural Philosophy',
      description: 'Seek common causes beneath weather, motion, matter, and life.',
      cost: 18, researched: false, requires: ['philosophy', 'mathematics'],
      effects: [
        { type: 'resource_per_turn', resource: 'knowledge', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Free Inquiry' },
      ],
    },
    {
      id: 'historiography', name: 'Historiography',
      description: 'Compare testimony and evidence before deciding what the past means.',
      cost: 18, researched: false, requires: ['rhetoric'],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 1 },
        { type: 'add_civ_tag', tagId: 'Epic Tradition' },
      ],
    },
    {
      id: 'civil_service', name: 'Civil Service',
      description: 'Train officials whose authority belongs to an office rather than a household.',
      cost: 20, researched: false, requires: ['republic'],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 2 },
        { type: 'resource_per_turn', resource: 'wealth', amount: 1 },
      ],
    },
    {
      id: 'roads', name: 'Roads',
      description: 'Armies, merchants, and ideas move along the same stone arteries.',
      cost: 18, researched: false, requires: ['engineering', 'iron_legions'],
      effects: [
        { type: 'army_bonus', stat: 'speed', amount: 2 },
        { type: 'tile_bonus', tileType: 'plains', resource: 'wealth', amount: 1 },
      ],
    },
    {
      id: 'theater', name: 'Theater',
      description: 'Put the city on stage and let it argue with itself.',
      cost: 20, researched: false, requires: ['rhetoric'],
      effects: [
        { type: 'unlock_building', buildingId: 'amphitheater' },
        { type: 'army_bonus', stat: 'morale', amount: 2 },
        { type: 'add_civ_tag', tagId: 'Patrons of Art' },
      ],
    },
    {
      id: 'maritime_trade', name: 'Maritime Trade',
      description: 'Join ports, currencies, and contracts into a sea-spanning market.',
      cost: 19, researched: false, requires: ['coinage', 'engineering'],
      effects: [
        { type: 'resource_per_turn', resource: 'wealth', amount: 3 },
        { type: 'exploration_bonus', amount: 1 },
      ],
    },
    {
      id: 'public_health', name: 'Public Health',
      description: 'Treat clean water, drainage, and quarantine as duties of the city.',
      cost: 20, researched: false, requires: ['medicine', 'engineering'],
      effects: [
        { type: 'building_bonus', buildingId: 'aqueduct', resource: 'food', amount: 2 },
        { type: 'resource_per_turn', resource: 'food', amount: 2 },
      ],
    },
    {
      id: 'siege_engineering', name: 'Siege Engineering',
      description: 'Combine geometry, logistics, and iron discipline against fortified cities.',
      cost: 21, researched: false, requires: ['engineering', 'iron_legions'],
      effects: [
        { type: 'army_bonus', stat: 'strength', amount: 3 },
        { type: 'army_bonus', stat: 'toughness', amount: 2 },
      ],
    },
    {
      id: 'stoicism', name: 'Stoicism',
      description: 'Teach that character can remain free even when fortune cannot be controlled.',
      cost: 20, researched: false, requires: ['philosophy'],
      effects: [
        { type: 'army_bonus', stat: 'morale', amount: 3 },
        { type: 'add_civ_tag', tagId: 'Ancestor Respect' },
      ],
    },
    {
      id: 'grand_strategy', name: 'Grand Strategy',
      description: 'Treat borders, roads, allies, and armies as one design.',
      cost: 23, researched: false, requires: ['roads', 'republic'],
      effects: [
        { type: 'army_bonus', stat: 'toughness', amount: 3 },
        { type: 'army_bonus', stat: 'morale', amount: 2 },
      ],
    },
    {
      id: 'imperial_cult', name: 'Imperial Cult',
      description: 'Make public loyalty sacred and sacred ritual an instrument of state.',
      cost: 22, researched: false, requires: ['theater', 'republic'],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 3 },
        { type: 'add_civ_tag', tagId: 'God-King Tradition' },
      ],
    },
    {
      id: 'commonwealth', name: 'Commonwealth',
      description: 'Let different cities share law and defense without erasing their identities.',
      cost: 23, researched: false, requires: ['civil_service', 'coinage'],
      effects: [
        { type: 'resource_per_turn', resource: 'influence', amount: 2 },
        { type: 'resource_per_turn', resource: 'wealth', amount: 2 },
        { type: 'add_civ_tag', tagId: 'River Commonwealth' },
      ],
    },
    {
      id: 'legacy_of_lithos', name: 'Legacy of Lithos',
      description: 'Define the ideal by which every later civilization will judge your people.',
      cost: 28, researched: false, requires: ['republic', 'theater'],
      effects: [{ type: 'advance_age' }],
    },
  ];
}
