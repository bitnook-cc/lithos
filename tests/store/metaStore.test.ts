import { beforeEach, describe, expect, it } from 'vitest';
import { useMetaStore } from '@/store/metaStore';
import { useGameStore } from '@/store/gameStore';
import { createNewRun } from '@/logic/runEngine';
import { decodeRun, encodeRun } from '@/store/runSave';

describe('persistent legacy store', () => {
  beforeEach(() => {
    useMetaStore.getState().clearLegacy();
    useGameStore.getState().resetRun();
  });

  it('unlocks the perk linked to a feat only once', () => {
    expect(useMetaStore.getState().unlockFeats(['keeper_of_flame'])).toEqual(['keeper_of_flame']);
    expect(useMetaStore.getState().unlockedPerks).toContain('ember_memory');
    expect(useMetaStore.getState().unlockFeats(['keeper_of_flame'])).toEqual([]);
  });

  it('survives a run reset independently of run state', () => {
    useMetaStore.getState().unlockFeats(['open_hand']);
    useGameStore.getState().startRun(['caravan_memory'], 77);
    expect(useGameStore.getState().activePerks).toEqual(['caravan_memory']);
    useGameStore.getState().resetRun();
    expect(useGameStore.getState().phase).toBe('setup');
    expect(useMetaStore.getState().unlockedPerks).toContain('caravan_memory');
  });

  it('records history, victories, and furthest age', () => {
    useMetaStore.getState().recordRun({ age: 'classical', turn: 12, victory: true, reason: 'A legacy.', featsEarned: ['three_ages'] });
    const state = useMetaStore.getState();
    expect(state.completedRuns).toBe(1);
    expect(state.victories).toBe(1);
    expect(state.bestAge).toBe('classical');
    expect(state.runHistory).toHaveLength(1);
  });

  it('does not duplicate run history or legacy rewards after reload and repeated synchronization', () => {
    const run = createNewRun([], 913);
    run.phase = 'gameOver';
    run.gameOver = { victory: false, reason: 'The last winter.' };
    run.featsEarned = ['keeper_of_flame'];
    useMetaStore.getState().syncRun(run);
    useMetaStore.getState().syncRun(decodeRun(encodeRun(run)));
    const state = useMetaStore.getState();
    expect(state.completedRuns).toBe(1);
    expect(state.runHistory).toHaveLength(1);
    expect(state.unlockedFeats).toEqual(['keeper_of_flame']);
    expect(state.unlockedPerks).toEqual(['ember_memory']);
  });
});
