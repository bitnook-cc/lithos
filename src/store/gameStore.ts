import { create } from 'zustand';
import { GameState } from '@/types/game';
import { BASE_ARMY, BASE_RESOURCES } from '@/logic/runEngine';
import { dispatchCommand, GameCommand } from '@/logic/commandEngine';
import { createSaveRepository, browserStorage } from './saveRepository';
import { decodeRun, encodeRun, LEGACY_RUN_KEY, RUN_SAVE_KEY } from './runSave';
import { useMetaStore } from './metaStore';

export const emptyRunState: GameState = {
  age: 'stone', turn: 1, actionPoints: 3, maxActionPoints: 3, exploration: 1,
  resources: BASE_RESOURCES, army: BASE_ARMY,
  civ: { identity: { military: 0, economy: 0, knowledge: 0 }, tags: [], leaders: [] },
  map: [], rivals: [], techs: [], permanentEffects: [], flags: {}, phase: 'setup', currentEvent: null, eventOrigin: null,
  gameOver: null, activeResearch: null, researchProgress: 0, growthProgress: 0, firedEvents: [],
  activePerks: [], featsEarned: [], chronicle: [],
  stats: { choicesMade: 0, tilesExplored: 0, tilesExpanded: 0, buildingsBuilt: 0, rivalsDefeated: 0, agesCompleted: 0, landmarksDiscovered: 0 }, runRecorded: false,
};

interface GameActions {
  saveIssue: string | null;
  commandError: string | null;
  dispatch: (command: GameCommand) => boolean;
  startRun: (perks: string[], seed?: number, guided?: boolean) => void;
  resetRun: () => void;
  retrySave: () => void;
  restorePrevious: () => void;
  exportSave: () => string;
  dismissSaveIssue: () => void;
}
export type GameStore = GameState & GameActions;
const repository = createSaveRepository(browserStorage(), RUN_SAVE_KEY, decodeRun, encodeRun, LEGACY_RUN_KEY);
const loaded = repository.load();
const initial = loaded.value ? dispatchCommand(loaded.value, { type: 'resume' }).state : structuredClone(emptyRunState);
const initialSaveIssue = loaded.value ? repository.save(initial) : null;

export const useGameStore = create<GameStore>((set, get) => {
  const commit = (state: GameState) => {
    const saveIssue = repository.save(state);
    set({ ...state, commandError: null, saveIssue: saveIssue ?? get().saveIssue });
    if (!saveIssue) useMetaStore.getState().syncRun(state);
  };
  return {
    ...initial, saveIssue: initialSaveIssue ?? loaded.issue, commandError: null,
    dispatch: command => {
      const result = dispatchCommand(get(), command, useMetaStore.getState().unlockedPerks);
      if (!result.accepted) { set({ commandError: result.error ?? 'That action is unavailable.' }); return false; }
      commit(result.state);
      return true;
    },
    startRun: (perks, seed = Date.now(), guided = false) => { get().dispatch({ type: 'start', seed, perks, guided }); },
    resetRun: () => commit({ ...structuredClone(emptyRunState), runtime: undefined, development: undefined, tutorial: undefined }),
    retrySave: () => { const issue = repository.save(get()); set({ saveIssue: issue }); if (!issue) useMetaStore.getState().syncRun(get()); },
    restorePrevious: () => {
      const previous = repository.previous();
      if (!previous) { set({ saveIssue: 'No readable previous save is available. Export the retained data for recovery.' }); return; }
      commit(dispatchCommand(previous, { type: 'resume' }).state);
    },
    exportSave: () => repository.export(get()),
    dismissSaveIssue: () => set({ saveIssue: null }),
  };
});
if (loaded.value && !initialSaveIssue) useMetaStore.getState().syncRun(initial);
