import { create } from 'zustand';
import { z } from 'zod';
import { AgeId, GameState, MetaState, RunSummary } from '@/types/game';
import { FEATS, PERKS } from '@/data/legacy';
import { createSaveRepository, browserStorage } from './saveRepository';

const AGE_RANK: AgeId[] = ['stone', 'bronze', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'space'];
const age = z.enum(['stone', 'bronze', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'space']);
const summary = z.object({ age, turn: z.number().int().positive(), victory: z.boolean(), reason: z.string(), featsEarned: z.array(z.string()) });
const schema = z.object({
  unlockedFeats: z.array(z.string()).refine(ids => ids.every(id => FEATS.some(f => f.id === id))),
  unlockedPerks: z.array(z.string()).refine(ids => ids.every(id => PERKS.some(p => p.id === id))),
  completedRuns: z.number().int().nonnegative(), victories: z.number().int().nonnegative(), bestAge: age,
  runHistory: z.array(summary), recordedRunIds: z.array(z.string()).default([]),
});
const initialMeta: MetaState = { unlockedFeats: [], unlockedPerks: [], completedRuns: 0, victories: 0, bestAge: 'stone', runHistory: [], recordedRunIds: [] };
export function decodeMeta(raw: string): MetaState {
  const value = JSON.parse(raw);
  if (value?.version !== undefined && value.version !== 2) throw new Error('Unsupported legacy version');
  const state = schema.parse(value?.version === 2 ? value.state : value);
  if (state.victories > state.completedRuns || state.unlockedPerks.some(id => !state.unlockedFeats.includes(PERKS.find(p => p.id === id)!.unlockedBy))) throw new Error('Inconsistent legacy');
  return { ...state, runHistory: state.runHistory.slice(0, 12) };
}
const encodeMeta = (state: MetaState) => JSON.stringify({ version: 2, state: schema.parse(state) });
const repository = createSaveRepository(browserStorage(), 'lithos_legacy_v2', decodeMeta, encodeMeta, 'lithos_legacy_v1');
const loaded = repository.load();

interface MetaActions {
  saveIssue: string | null;
  unlockFeats: (ids: string[]) => string[];
  recordRun: (summary: RunSummary, runId?: string) => void;
  syncRun: (state: GameState) => void;
  retrySave: () => void;
  exportSave: () => string;
  clearLegacy: () => void;
}
export type MetaStore = MetaState & MetaActions;
export const useMetaStore = create<MetaStore>((set, get) => {
  const commit = (next: MetaState) => { const issue = repository.save(next); set({ ...next, saveIssue: issue ?? get().saveIssue }); };
  return {
    ...(loaded.value ?? structuredClone(initialMeta)), saveIssue: loaded.issue,
    unlockFeats: ids => {
      const state = get();
      const added = [...new Set(ids)].filter(id => FEATS.some(f => f.id === id) && !state.unlockedFeats.includes(id));
      if (added.length) commit({ ...state, unlockedFeats: [...state.unlockedFeats, ...added], unlockedPerks: [...new Set([...state.unlockedPerks, ...added.map(id => FEATS.find(f => f.id === id)!.perkId)])] });
      return added;
    },
    recordRun: (result, runId) => {
      const state = get();
      if (runId && state.recordedRunIds?.includes(runId)) return;
      commit({ ...state, completedRuns: state.completedRuns + 1, victories: state.victories + (result.victory ? 1 : 0), bestAge: AGE_RANK.indexOf(result.age) > AGE_RANK.indexOf(state.bestAge) ? result.age : state.bestAge, runHistory: [result, ...state.runHistory].slice(0, 12), recordedRunIds: runId ? [...(state.recordedRunIds ?? []), runId] : state.recordedRunIds });
    },
    syncRun: state => {
      if (state.phase === 'setup') return;
      get().unlockFeats(state.featsEarned);
      if (state.gameOver && !state.runRecorded) get().recordRun({ age: state.age, turn: state.turn, victory: state.gameOver.victory, reason: state.gameOver.reason, featsEarned: state.featsEarned }, state.runtime?.runId);
    },
    retrySave: () => set({ saveIssue: repository.save(get()) }),
    exportSave: () => repository.export(get()),
    clearLegacy: () => commit(structuredClone(initialMeta)),
  };
});
