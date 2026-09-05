import { describe, expect, it } from 'vitest';
import { dispatchCommand, GameCommand } from '@/logic/commandEngine';
import { createNewRun } from '@/logic/runEngine';
import { transitionAge } from '@/logic/ageEngine';
import { getAgeContent } from '@/data/content';
import { getUnlockedBuildings } from '@/logic/buildingEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { mulberry32, randomStream } from '@/logic/random';
import { GameState } from '@/types/game';

function apply(state: GameState, command: GameCommand) {
  const result = dispatchCommand(state, command);
  expect(result.error).toBeUndefined();
  expect(result.accepted).toBe(true);
  return result.state;
}
function ready(seed = 42) { return apply(createNewRun([], seed), { type: 'resume' }); }
function dismiss(state: GameState) { return apply(state, { type: 'dismiss', noticeId: state.runtime!.notices[0].id }); }

describe('atomic command boundary', () => {
  it('rejects wrong-phase, no-AP, disconnected, unavailable research, and forged choice commands without mutation', () => {
    const state = ready();
    const snapshots = JSON.stringify(state);
    const target = state.map.find(t => t.visible && !t.controlled)!.coord;
    for (const command of [
      { type: 'expand', target },
      { type: 'build', target, buildingId: 'academy' },
      { type: 'research', techId: 'advance_bronze' },
      { type: 'choose', eventId: 'stone_first_dawn', choiceId: 'focus_food' },
    ] satisfies GameCommand[]) {
      const result = dispatchCommand(state, command);
      expect(result.accepted).toBe(false); expect(result.state).toBe(state);
    }
    expect(dispatchCommand({ ...state, actionPoints: 0 }, { type: 'survey', target }).accepted).toBe(false);
    expect(dispatchCommand({ ...state, phase: 'enemy' }, { type: 'survey', target }).accepted).toBe(false);
    expect(JSON.stringify(state)).toBe(snapshots);
  });
  it('charges survey/expansion once and refuses a repeated action', () => {
    let state = ready();
    const target = state.map.find(t => t.visible && !t.controlled)!.coord;
    state = apply(state, { type: 'survey', target });
    expect(state.actionPoints).toBe(2);
    expect(dispatchCommand(state, { type: 'survey', target }).accepted).toBe(false);
    state = apply(state, { type: 'expand', target });
    expect(state.actionPoints).toBe(1);
    expect(state.stats.tilesExpanded).toBe(1);
  });
  it('validates unlocked perks and protects pending messages from background actions', () => {
    const setup = { ...createNewRun([], 1), phase: 'setup' as const };
    expect(dispatchCommand(setup, { type: 'start', seed: 5, perks: ['citizen_oath'] }).accepted).toBe(false);
    const started = dispatchCommand(setup, { type: 'start', seed: 5, perks: ['citizen_oath'] }, ['citizen_oath']).state;
    expect(started.runtime?.notices[0].type).toBe('age');
    expect(dispatchCommand(started, { type: 'research', techId: 'survival' }).accepted).toBe(false);
    expect(dismiss(started).resources.food).toBe(8);
  });
  it('validates event payments, preserves an unpaid fallback, and applies affordable payments once', () => {
    let state = transitionAge(ready(), 43);
    state.phase = 'event'; state.currentEvent = 'bronze_sea_raiders'; state.eventOrigin = 'turn';
    state.resources = { ...state.resources, wealth: 0, food: 0 };
    const command: GameCommand = { type: 'choose', eventId: state.currentEvent, choiceId: 'buy_departure' };
    expect(dispatchCommand(state, command).accepted).toBe(false);
    expect(dispatchCommand(state, { ...command, choiceId: 'stand_walls' }).accepted).toBe(true);
    state.resources = { ...state.resources, wealth: 5, food: 3 };
    const paid = apply(state, command);
    expect(paid.resources.wealth).toBe(0); expect(paid.resources.food).toBe(0);
    expect(paid.runtime?.notices[0]).toMatchObject({ type: 'result', effects: expect.arrayContaining(['-5 wealth', '-3 food']) });
    expect(dispatchCommand(paid, command).accepted).toBe(false);
  });
  it('applies immediate defeat for last-person diplomacy loss and blocks later actions', () => {
    let state = ready(); state.resources.population = 1;
    state.rivals[0].threat.strength = 999;
    state.map.find(t => t.rivalId)!.visible = true;
    state = apply(state, { type: 'diplomacy', rivalId: state.rivals[0].id, approach: 'threaten' });
    expect(state.resources.population).toBe(0); expect(state.phase).toBe('gameOver');
    expect(state.gameOver?.victory).toBe(false);
    expect(dispatchCommand(state, { type: 'endTurn' }).accepted).toBe(false);
    expect(dismiss(state).phase).toBe('gameOver');
  });
  it('does not revive a zero-population civilization during an automatic collection', () => {
    const state = ready();
    state.phase = 'collect'; state.resources.population = 0;
    state.resources.food = 100; state.growthProgress = 999;
    const next = apply(state, { type: 'resume' });
    expect(next.phase).toBe('gameOver');
    expect(next.resources.population).toBe(0);
  });
  it('rejects hidden or rival-held landmarks without spending AP', () => {
    const state = ready();
    const tile = state.map[0];
    tile.landmark = 'painted_vault'; tile.surveyed = true; tile.landmarkInvestigated = false; tile.visible = false;
    const command: GameCommand = { type: 'investigate', target: tile.coord };
    expect(dispatchCommand(state, command)).toMatchObject({ accepted: false, state });
    tile.visible = true; tile.rivalId = state.rivals[0].id;
    expect(dispatchCommand(state, command)).toMatchObject({ accepted: false, state });
    expect(state.actionPoints).toBe(3);
  });
  it('opens Bronze upgrade base methods and constructs the entire path legally', () => {
    let state = transitionAge(ready(), 2); state.phase = 'actions';
    state.techs = state.techs.map(t => ({ ...t, researched: true }));
    state.resources.materials = 100; state.resources.food = 100;
    const tile = state.map.find(t => t.type === 'fertile' && !t.controlled && !t.rivalId)!;
    state.map = state.map.map(t => t === tile ? { ...t, surveyed: true, visible: true, controlled: true, worked: true } : t);
    expect(getUnlockedBuildings(state).has('gathering_site')).toBe(true);
    state = apply(state, { type: 'build', target: tile.coord, buildingId: 'gathering_site' });
    state = apply(state, { type: 'build', target: tile.coord, buildingId: 'primitive_farm' });
    expect(state.map.find(t => t.coord.q === tile.coord.q && t.coord.r === tile.coord.r)?.building).toBe('primitive_farm');
  });
});

describe('phase-boundary persistence and deterministic continuation', () => {
  it.each(['setup', 'collect', 'actions', 'enemy', 'enemyResult', 'gameOver'] as const)('resumes %s identically after serialization', phase => {
    let state = ready(194);
    state.phase = phase;
    if (phase === 'setup') state.techs = [];
    if (phase === 'gameOver') state.gameOver = { reason: 'Finished.', victory: false };
    const before = encodeRun(state);
    const uninterrupted = apply(state, { type: 'resume' });
    const restored = apply(decodeRun(before), { type: 'resume' });
    expect(restored).toEqual(uninterrupted);
    expect(encodeRun(state)).toBe(before);
    expect(apply(decodeRun(encodeRun(restored)), { type: 'resume' })).toEqual(restored);
  });
  it('restores a discovery result without consuming a turn or repeating its reward', () => {
    let state = ready(74);
    state.eventOrigin = 'discovery';
    // A persisted result has already applied its effects before acknowledgement.
    state.phase = 'eventResult'; state.currentEvent = null; state.resources.wealth = 19;
    state.runtime!.notices = [{ id: 'discovery-result', type: 'result', title: 'A discovery', effects: ['+3 wealth'] }];
    const restored = dismiss(decodeRun(encodeRun(state)));
    expect(restored.phase).toBe('actions');
    expect(restored.turn).toBe(state.turn);
    expect(restored.actionPoints).toBe(state.actionPoints);
    expect(restored.resources.wealth).toBe(19);
  });
  it('matches the original random stream and resumes at its exact cursor', () => {
    const old = mulberry32(9123); const stream = randomStream(9123);
    for (let i = 0; i < 10; i++) expect(stream.next()).toBe(old());
    const resumed = randomStream(stream.state());
    expect(resumed.next()).toBe(stream.next());
  });
  it('preserves a random event, chosen outcome, notices and subsequent rival turns across reload', () => {
    let state = apply(ready(71), { type: 'endTurn' });
    const restored = decodeRun(encodeRun(state));
    expect(restored).toEqual(state);
    const event = getAgeContent(state.age).events.find(e => e.id === state.currentEvent)!;
    const command: GameCommand = { type: 'choose', eventId: event.id, choiceId: event.choices[0].id };
    const uninterrupted = apply(state, command);
    state = apply(restored, command);
    expect(state).toEqual(uninterrupted);
    expect(apply(decodeRun(encodeRun(state)), { type: 'resume' })).toEqual(state);
    while (state.runtime!.notices.length) {
      const loaded = decodeRun(encodeRun(state));
      expect(dismiss(loaded)).toEqual(dismiss(state));
      state = dismiss(state);
    }
  });
  it('persists completion effects and advances the age exactly once after acknowledgement', () => {
    let state = ready();
    state.techs = state.techs.map(t => ({ ...t, researched: t.id !== 'advance_bronze' }));
    state.phase = 'collect'; state.activeResearch = 'advance_bronze'; state.researchProgress = 11;
    state.development!.projects.advance_bronze = { progress: 11, ticks: 1 };
    state = apply(state, { type: 'resume' });
    expect(state.phase).toBe('ageTransition');
    const oldNotice = state.runtime!.notices[0].id;
    const reloaded = decodeRun(encodeRun(state));
    state = dismiss(reloaded);
    expect(state.age).toBe('bronze'); expect(state.stats.agesCompleted).toBe(1);
    expect(state.runtime!.notices[0]).toMatchObject({ type: 'age', age: 'bronze' });
    expect(dispatchCommand(state, { type: 'dismiss', noticeId: oldNotice }).accepted).toBe(false);
    expect(dismiss(decodeRun(encodeRun(state)))).toEqual(dismiss(state));
  });
  it('replays a command sequence identically over all three ages, including victory and feats', () => {
    let state = ready(917); state.resources.food = 1000;
    for (const age of ['stone', 'bronze', 'classical']) {
      expect(state.age).toBe(age);
      const advance = state.techs.find(t => t.effects.some(e => e.type === 'advance_age'))!;
      state = { ...state, phase: 'collect', techs: state.techs.map(t => ({ ...t, researched: t.id !== advance.id })), activeResearch: advance.id, researchProgress: advance.cost };
      state.development!.projects[advance.id] = { progress: advance.cost, ticks: 1 };
      state = apply(state, { type: 'resume' });
      for (let i = 0; state.runtime!.notices.length && i < 10; i++) {
        const uninterrupted = dismiss(state);
        state = dismiss(decodeRun(encodeRun(state)));
        expect(state).toEqual(uninterrupted);
      }
    }
    expect(state.gameOver?.victory).toBe(true);
    expect(state.featsEarned.filter(id => id === 'three_ages')).toHaveLength(1);
    expect(apply(decodeRun(encodeRun(state)), { type: 'resume' })).toEqual(state);
  });
});
