import { GameState, Leader, Resources } from '@/types/game';
import { getNextAge } from '@/data/ages';
import { getAgeContent } from '@/data/content';
import { createAgeWorld } from './runEngine';
import { mulberry32 } from './random';

const LEADER_NAMES = ['Kara', 'Theron', 'Ayla', 'Bron', 'Seren', 'Dax', 'Lyra', 'Orin', 'Nala', 'Voss', 'Eira', 'Tobin', 'Mira', 'Cael', 'Juno', 'Rook'];
const BASE_TRAITS = ['Bold', 'Cautious', 'Devout', 'Cunning', 'Visionary', 'Ruthless'];

function generateLeader(rand: () => number, existingNames: string[]): Leader {
  const available = LEADER_NAMES.filter(name => !existingNames.includes(name));
  const names = available.length ? available : LEADER_NAMES;
  return { name: names[Math.floor(rand() * names.length)], traits: [BASE_TRAITS[Math.floor(rand() * BASE_TRAITS.length)]] };
}

export function transitionAge(state: GameState, seed: number): GameState {
  const nextAge = getNextAge(state.age);
  if (!nextAge) {
    const reason = state.flags.legacy_peace
      ? 'Your laws became a common language between rival cities. The peace outlived every general who doubted it.'
      : state.flags.legacy_wisdom
        ? 'Your schools taught generations to question even their founders. Inquiry became your most durable monument.'
        : state.flags.legacy_dominion
          ? 'Roads, standards, and disciplined legions bound the known world beneath your order.'
          : state.flags.legacy_plural
            ? 'You refused a single imperial answer. A commonwealth of different cities carried your legacy forward.'
            : state.civ.identity.knowledge >= 25
              ? 'Later ages remember yours as the civilization that made thought a public inheritance.'
              : state.civ.identity.military >= 25
                ? 'Your unconquered standards became the measure of power for every kingdom that followed.'
                : 'Across three ages, your civilization became a legacy the world could not forget.';
    return {
      ...state,
      phase: 'gameOver',
      gameOver: { reason, victory: true },
      stats: { ...state.stats, agesCompleted: state.stats.agesCompleted + 1 },
      chronicle: [...state.chronicle, {
        id: `victory-${seed}`, age: state.age, turn: state.turn, title: 'A Civilization Remembered',
        text: 'The age ends, but the name of your people enters history.', tone: 'triumph',
      }],
    };
  }

  const content = getAgeContent(nextAge.id);
  const { map, rivals } = createAgeWorld(nextAge.id, seed);
  const resources = { ...state.resources };
  for (const [key, amount] of Object.entries(nextAge.startingResources ?? {})) {
    if (amount) resources[key as keyof Resources] += amount;
  }
  // A new capital needs time to reconnect the inherited population to its new land.
  // Preserve at least two turns of food so an age cannot begin with unavoidable starvation.
  resources.food = Math.max(resources.food, resources.population * 2);
  const leader = generateLeader(mulberry32(seed), state.civ.leaders.map(item => item.name));
  const capitalName = map.find(tile => tile.settlementName)?.settlementName ?? content.definition.subtitle;

  return {
    ...state,
    age: nextAge.id,
    turn: 1,
    actionPoints: state.maxActionPoints,
    resources,
    civ: { ...state.civ, leaders: [...state.civ.leaders, leader] },
    map,
    rivals,
    techs: content.createTechs(),
    phase: 'collect',
    currentEvent: null,
    eventOrigin: null,
    activeResearch: null,
    researchProgress: 0,
    growthProgress: 0,
    stats: { ...state.stats, agesCompleted: state.stats.agesCompleted + 1 },
    chronicle: [...state.chronicle, {
      id: `${nextAge.id}-dawn-${seed}`, age: nextAge.id, turn: 1, title: content.definition.subtitle,
      text: `${leader.name} gathered the transformed people at ${capitalName}. ${content.definition.description}`, tone: 'discovery',
    }],
  };
}
