import { create } from 'zustand';
import { AgeId, MetaState, RunSummary } from '@/types/game';
import { FEATS } from '@/data/legacy';

const META_KEY = 'lithos_legacy_v1';
const AGE_RANK: AgeId[] = ['stone', 'bronze', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'space'];

const initialMeta: MetaState = {
  unlockedFeats: [], unlockedPerks: [], completedRuns: 0, victories: 0, bestAge: 'stone', runHistory: [],
};

function loadMeta(): MetaState {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) ?? 'null');
    if (!parsed || !Array.isArray(parsed.unlockedFeats) || !Array.isArray(parsed.unlockedPerks)) return initialMeta;
    return {
      ...initialMeta,
      ...parsed,
      runHistory: Array.isArray(parsed.runHistory) ? parsed.runHistory.slice(0, 12) : [],
    };
  } catch {
    return initialMeta;
  }
}

interface MetaActions {
  unlockFeats: (featIds: string[]) => string[];
  recordRun: (summary: RunSummary) => void;
  clearLegacy: () => void;
}

export type MetaStore = MetaState & MetaActions;

export const useMetaStore = create<MetaStore>((set, get) => ({
  ...loadMeta(),
  unlockFeats: (featIds) => {
    const state = get();
    const newlyUnlocked = featIds.filter(id => FEATS.some(feat => feat.id === id) && !state.unlockedFeats.includes(id));
    if (newlyUnlocked.length === 0) return [];
    const perkIds = newlyUnlocked
      .map(id => FEATS.find(feat => feat.id === id)?.perkId)
      .filter((id): id is string => Boolean(id));
    set({
      unlockedFeats: [...state.unlockedFeats, ...newlyUnlocked],
      unlockedPerks: [...new Set([...state.unlockedPerks, ...perkIds])],
    });
    return newlyUnlocked;
  },
  recordRun: (summary) => set(state => ({
    completedRuns: state.completedRuns + 1,
    victories: state.victories + (summary.victory ? 1 : 0),
    bestAge: AGE_RANK.indexOf(summary.age) > AGE_RANK.indexOf(state.bestAge) ? summary.age : state.bestAge,
    runHistory: [summary, ...state.runHistory].slice(0, 12),
  })),
  clearLegacy: () => {
    try { localStorage.removeItem(META_KEY); } catch { /* unavailable in tests */ }
    set(initialMeta);
  },
}));

useMetaStore.subscribe(state => {
  try {
    const { unlockedFeats, unlockedPerks, completedRuns, victories, bestAge, runHistory } = state;
    localStorage.setItem(META_KEY, JSON.stringify({ unlockedFeats, unlockedPerks, completedRuns, victories, bestAge, runHistory }));
  } catch { /* unavailable or full */ }
});
