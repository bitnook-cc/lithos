import { GameState, AgeId, Leader } from '@/types/game';
import { getNextAge } from '@/data/ages';
import { generateMap } from './mapGenerator';
import { stoneAgeTechs } from '@/data/techs/stoneAge';

const LEADER_NAMES = [
  'Kara', 'Theron', 'Ayla', 'Bron', 'Seren', 'Dax', 'Lyra', 'Orin',
  'Nala', 'Voss', 'Eira', 'Tobin', 'Mira', 'Cael', 'Juno', 'Rook',
];

const BASE_TRAITS = ['Bold', 'Cautious', 'Devout', 'Cunning', 'Visionary', 'Ruthless'];

function generateLeader(rand: () => number, existingNames: string[]): Leader {
  const available = LEADER_NAMES.filter(n => !existingNames.includes(n));
  const name = available.length > 0
    ? available[Math.floor(rand() * available.length)]
    : LEADER_NAMES[Math.floor(rand() * LEADER_NAMES.length)];
  const trait = BASE_TRAITS[Math.floor(rand() * BASE_TRAITS.length)];
  return { name, traits: [trait] };
}

/** Simple seeded PRNG (mulberry32) */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTechsForAge(_ageId: AgeId): ReturnType<typeof stoneAgeTechs> {
  // For now, only Stone Age techs are defined. Future ages will add their own.
  // Returns empty array for undefined ages — techs are loaded per-age.
  switch (_ageId) {
    case 'stone': return stoneAgeTechs();
    default: return []; // placeholder — future chunks add age-specific tech trees
  }
}

export function transitionAge(state: GameState, seed: number): GameState {
  const nextAge = getNextAge(state.age);
  if (!nextAge) {
    // Final age complete — victory
    return {
      ...state,
      phase: 'gameOver',
      gameOver: { reason: 'Your civilization has reached its zenith!', victory: true },
    };
  }

  const rand = mulberry32(seed);
  const existingNames = state.civ.leaders.map(l => l.name);
  const newLeader = generateLeader(rand, existingNames);

  const newMap = generateMap({ targetTiles: nextAge.mapSize, seed });

  return {
    ...state,
    age: nextAge.id,
    turn: 1,
    actionPoints: 3,
    maxActionPoints: 3,
    civ: {
      ...state.civ,
      leaders: [...state.civ.leaders, newLeader],
    },
    map: newMap,
    rivals: [], // new rivals generated separately
    techs: getTechsForAge(nextAge.id),
    phase: 'collect',
    currentEvent: null,
  };
}
