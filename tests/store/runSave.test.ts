import { describe, expect, it } from 'vitest';
import { createNewRun } from '@/logic/runEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { createSaveRepository, SaveStorage } from '@/store/saveRepository';
import { dispatchCommand } from '@/logic/commandEngine';
import { decodeMeta } from '@/store/metaStore';

function memoryStorage() {
  const items = new Map<string, string>();
  const storage: SaveStorage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => { items.set(key, value); } };
  return { items, storage };
}

describe('versioned run saves', () => {
  it('migrates the v2 shape and explains a missing legacy result without applying it again', () => {
    const old = createNewRun([], 4); delete old.runtime;
    old.phase = 'eventResult'; old.eventOrigin = 'turn'; old.resources.wealth = 17;
    const migrated = decodeRun(JSON.stringify(old));
    expect(migrated.resources.wealth).toBe(17);
    expect(migrated.runtime?.notices[0]).toMatchObject({ type: 'result', title: 'A saved outcome' });
    expect(decodeRun(encodeRun(migrated))).toEqual(migrated);
  });
  it('uses current tech definitions without applying previously earned bonuses twice', () => {
    const old = createNewRun([], 4); delete old.runtime;
    old.techs[0].description = 'old text'; old.techs[0].researched = true;
    old.permanentEffects = [{ type: 'resource_per_turn', resource: 'knowledge', amount: 3 }];
    const migrated = decodeRun(JSON.stringify(old));
    expect(migrated.techs[0].description).not.toBe('old text');
    expect(migrated.techs[0].researched).toBe(true);
    expect(migrated.permanentEffects).toEqual(old.permanentEffects);
  });
  it('rejects malformed, unsupported, and semantically invalid saves', () => {
    expect(() => decodeRun('{')).toThrow();
    expect(() => decodeRun('{"version":99}')).toThrow();
    const state = createNewRun([], 6); state.currentEvent = 'deleted';
    expect(() => decodeRun(encodeRun(state))).toThrow('Unknown pending event');
    state.currentEvent = null; state.resources.population = -1;
    expect(() => encodeRun(state)).toThrow();
  });
  it('validates legacy progression instead of accepting arbitrary partial objects', () => {
    expect(() => decodeMeta('{"unlockedFeats":[],"unlockedPerks":[],"completedRuns":"broken"}')).toThrow();
    expect(() => decodeMeta(JSON.stringify({ unlockedFeats: [], unlockedPerks: ['citizen_oath'], completedRuns: 0, victories: 0, bestAge: 'stone', runHistory: [] }))).toThrow();
  });
});

describe('retained backups and failure recovery', () => {
  it('retains the old storage key during migration and keeps the last valid save', () => {
    const { items, storage } = memoryStorage();
    const old = JSON.stringify(createNewRun([], 5)); items.set('old', old);
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun, 'old');
    expect(repo.load().value?.age).toBe('stone');
    const first = repo.load().value!; expect(repo.save(first)).toBeNull();
    const next = dispatchCommand(first, { type: 'resume' }).state;
    expect(repo.save(next)).toBeNull();
    expect(items.get('old')).toBe(old);
    expect(repo.previous()).toEqual(first);
  });
  it('recovers a valid backup while retaining corrupted bytes for export', () => {
    const { items, storage } = memoryStorage();
    const first = createNewRun([], 5); items.set('run', '{broken'); items.set('run_backup', encodeRun(first));
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun);
    expect(repo.load().issue).toContain('recovered');
    expect(repo.load().value).toEqual(first);
    expect(items.get('run')).toBe('{broken');
    expect(repo.save(first)).toBeNull();
    expect(repo.export(first)).toContain('{broken');
  });
  it('reports unreadable saves without deleting them or crashing setup', () => {
    const { items, storage } = memoryStorage(); items.set('run', '{broken');
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun);
    expect(repo.load().value).toBeNull(); expect(repo.load().issue).toContain('retained');
    expect(items.get('run')).toBe('{broken');
  });
  it('retains more than one corrupted recovery copy', () => {
    const { items, storage } = memoryStorage();
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun);
    const state = createNewRun([], 7);
    items.set('run', '{first-broken'); expect(repo.save(state)).toBeNull();
    items.set('run', '{second-broken'); expect(repo.save(state)).toBeNull();
    expect(repo.export(state)).toContain('first-broken');
    expect(repo.export(state)).toContain('second-broken');
  });
  it('does not replace the latest save if making a recovery copy fails', () => {
    const { items, storage } = memoryStorage();
    const old = encodeRun(createNewRun([], 1)); items.set('run', old);
    storage.setItem = () => { throw new Error('Quota exceeded'); };
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun);
    expect(repo.save(createNewRun([], 2))).toContain('Saving failed');
    expect(items.get('run')).toBe(old);
  });
  it('supports unavailable storage and still exports the in-memory run', () => {
    const storage = { getItem: () => { throw new Error('Denied'); }, setItem: () => { throw new Error('Denied'); } };
    const repo = createSaveRepository(storage, 'run', decodeRun, encodeRun);
    expect(repo.load().issue).toContain('unavailable');
    expect(repo.save(createNewRun([], 1))).toContain('Saving failed');
    expect(JSON.parse(repo.export(createNewRun([], 1))).current.version).toBe(3);
  });
});
