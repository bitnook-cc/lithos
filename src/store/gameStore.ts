import { create } from 'zustand';
import { ArmyStats, GameState, Leader, Resources } from '@/types/game';
import { GameStateSchema } from './saveSchema';
import { BASE_ARMY, BASE_RESOURCES, createNewRun } from '@/logic/runEngine';

const SAVE_KEY = 'lithos_run_v2';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const emptyRunState: GameState = {
  age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3, exploration: 1,
  resources: BASE_RESOURCES, army: BASE_ARMY,
  civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [] },
  map: [], rivals: [], techs: [], permanentEffects: [], flags: {}, phase: 'setup', currentEvent: null, eventOrigin: null,
  gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [],
  activePerks: [], featsEarned: [], chronicle: [],
  stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 },
  runRecorded: false,
};

interface GameActions {
  setState: (partial: Partial<GameState>) => void;
  startRun: (activePerks: string[], seed?: number) => void;
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

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const result = GameStateSchema.safeParse(JSON.parse(raw));
    if (result.success) {
      const state = result.data as GameState;
      state.map = state.map.map(tile => ({
        ...tile,
        surveyed: tile.surveyed ?? tile.controlled,
        worked: tile.worked ?? tile.controlled,
      }));
      return state;
    }
    localStorage.removeItem(SAVE_KEY);
  } catch { /* unavailable or invalid */ }
  return null;
}

function saveToDisk(state: GameState): void {
  try {
    const gameState: GameState = {
      age: state.age, turn: state.turn, actionPoints: state.actionPoints, maxActionPoints: state.maxActionPoints, exploration: state.exploration,
      resources: state.resources, army: state.army, civ: state.civ, map: state.map, rivals: state.rivals,
      techs: state.techs, permanentEffects: state.permanentEffects, flags: state.flags, phase: state.phase,
      currentEvent: state.currentEvent, eventOrigin: state.eventOrigin, gameOver: state.gameOver, activeResearch: state.activeResearch,
      researchProgress: state.researchProgress, growthProgress: state.growthProgress, firedEvents: state.firedEvents,
      activePerks: state.activePerks, featsEarned: state.featsEarned, chronicle: state.chronicle,
      stats: state.stats, runRecorded: state.runRecorded,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch { /* unavailable or full */ }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...(loadSave() ?? structuredClone(emptyRunState)),
  setState: partial => set(partial),
  startRun: (activePerks, seed = Date.now()) => set(createNewRun(activePerks, seed)),
  updateResources: delta => set(state => {
    const resources = { ...state.resources };
    for (const [key, amount] of Object.entries(delta)) {
      if (amount !== undefined) resources[key as keyof Resources] = Math.max(0, resources[key as keyof Resources] + amount);
    }
    return { resources };
  }),
  updateArmy: delta => set(state => {
    const army = { ...state.army };
    for (const [key, amount] of Object.entries(delta)) {
      if (amount !== undefined) army[key as keyof ArmyStats] = Math.max(0, army[key as keyof ArmyStats] + amount);
    }
    return { army };
  }),
  updateIdentity: delta => set(state => {
    const identity = { ...state.civ.identity };
    for (const [key, amount] of Object.entries(delta)) {
      if (amount !== undefined) identity[key as keyof typeof identity] = clamp(identity[key as keyof typeof identity] + amount, -100, 100);
    }
    return { civ: { ...state.civ, identity } };
  }),
  setFlag: (key, value) => set(state => ({ flags: { ...state.flags, [key]: value } })),
  addCivTag: tag => set(state => ({ civ: { ...state.civ, tags: state.civ.tags.includes(tag) ? state.civ.tags : [...state.civ.tags, tag] } })),
  addLeader: leader => set(state => ({ civ: { ...state.civ, leaders: [...state.civ.leaders, leader] } })),
  addLeaderTrait: trait => set(state => {
    const leaders = [...state.civ.leaders];
    const current = leaders[leaders.length - 1];
    if (current && !current.traits.includes(trait)) leaders[leaders.length - 1] = { ...current, traits: [...current.traits, trait] };
    return { civ: { ...state.civ, leaders } };
  }),
  spendActionPoint: () => {
    if (get().actionPoints <= 0) return false;
    set(state => ({ actionPoints: state.actionPoints - 1 }));
    return true;
  },
  nextPhase: () => set(state => {
    if (state.phase === 'setup' || state.phase === 'gameOver' || state.phase === 'ageTransition') return {};
    if (state.phase === 'eventResult') {
      const phase = state.eventOrigin === 'discovery' ? 'actions' : 'enemy';
      return { phase, eventOrigin: null };
    }
    if (state.phase === 'enemy' || state.phase === 'enemyResult') {
      return { phase: 'collect', turn: state.turn + 1, actionPoints: state.maxActionPoints };
    }
    if (state.phase === 'event') return { phase: 'enemy', eventOrigin: null };
    return { phase: state.phase === 'collect' ? 'actions' : 'event' };
  }),
  resetRun: () => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* unavailable */ }
    set(structuredClone(emptyRunState));
  },
}));

useGameStore.subscribe(state => saveToDisk(state));
