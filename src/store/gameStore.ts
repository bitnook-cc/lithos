import { create } from 'zustand';
import { GameState, AgeId, Resources, ArmyStats, Leader, TechNode, RivalCiv } from '@/types/game';
import { Tile } from '@/types/map';

const initialResources: Resources = {
  food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5,
};

const initialArmy: ArmyStats = {
  strength: 3, toughness: 2, speed: 2, stealth: 1,
};

const initialState: GameState = {
  age: 'stone',
  turn: 1,
  actionPoints: 3,
  maxActionPoints: 3,
  resources: initialResources,
  army: initialArmy,
  civ: {
    identity: { military: 0, economy: 0, knowledge: 0 },
    tags: [],
    leaders: [],
  },
  map: [],
  rivals: [],
  techs: [],
  flags: {},
  phase: 'collect',
  currentEvent: null,
  gameOver: null,
  activeResearch: null,
  researchProgress: 0,
};

interface GameActions {
  setState: (partial: Partial<GameState>) => void;
  updateResources: (delta: Partial<Resources>) => void;
  updateArmy: (delta: Partial<ArmyStats>) => void;
  updateIdentity: (delta: Partial<Record<'military' | 'economy' | 'knowledge', number>>) => void;
  setFlag: (key: string, value: boolean) => void;
  addCivTag: (tag: string) => void;
  addLeader: (leader: Leader) => void;
  addLeaderTrait: (trait: string) => void;
  spendActionPoint: () => boolean;
  nextPhase: () => void;
  resetRun: () => void;
}

export type GameStore = GameState & GameActions;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setState: (partial) => set(partial),

  updateResources: (delta) => set((s) => {
    const resources = { ...s.resources };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        resources[key as keyof Resources] = Math.max(0, resources[key as keyof Resources] + val);
      }
    }
    return { resources };
  }),

  updateArmy: (delta) => set((s) => {
    const army = { ...s.army };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        army[key as keyof ArmyStats] = Math.max(0, army[key as keyof ArmyStats] + val);
      }
    }
    return { army };
  }),

  updateIdentity: (delta) => set((s) => {
    const identity = { ...s.civ.identity };
    for (const [key, val] of Object.entries(delta)) {
      if (val !== undefined) {
        identity[key as keyof typeof identity] = clamp(
          identity[key as keyof typeof identity] + val, -100, 100
        );
      }
    }
    return { civ: { ...s.civ, identity } };
  }),

  setFlag: (key, value) => set((s) => ({
    flags: { ...s.flags, [key]: value }
  })),

  addCivTag: (tag) => set((s) => ({
    civ: {
      ...s.civ,
      tags: s.civ.tags.includes(tag) ? s.civ.tags : [...s.civ.tags, tag]
    }
  })),

  addLeader: (leader) => set((s) => ({
    civ: { ...s.civ, leaders: [...s.civ.leaders, leader] }
  })),

  addLeaderTrait: (trait) => set((s) => {
    const leaders = [...s.civ.leaders];
    const current = leaders[leaders.length - 1];
    if (current && !current.traits.includes(trait)) {
      leaders[leaders.length - 1] = { ...current, traits: [...current.traits, trait] };
    }
    return { civ: { ...s.civ, leaders } };
  }),

  spendActionPoint: () => {
    const s = get();
    if (s.actionPoints <= 0) return false;
    set({ actionPoints: s.actionPoints - 1 });
    return true;
  },

  nextPhase: () => set((s) => {
    // gameOver and ageTransition are terminal — don't cycle from them
    if (s.phase === 'gameOver' || s.phase === 'ageTransition') return {};
    const phases: GameState['phase'][] = ['collect', 'actions', 'event', 'enemy'];
    const idx = phases.indexOf(s.phase);
    const nextIdx = (idx + 1) % phases.length;
    const next = phases[nextIdx];
    if (next === 'collect') {
      return { phase: next, turn: s.turn + 1, actionPoints: s.maxActionPoints };
    }
    return { phase: next };
  }),

  resetRun: () => set(structuredClone(initialState)),
}));
