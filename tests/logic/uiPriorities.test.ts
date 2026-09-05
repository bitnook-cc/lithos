import { describe, expect, it } from 'vitest';
import { dispatchCommand, findCurrentEvent, GameCommand } from '@/logic/commandEngine';
import { createNewRun } from '@/logic/runEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { GameState } from '@/types/game';
import { isChoiceAvailable } from '@/logic/eventEngine';
import { getAgeContent } from '@/data/content';
import { frontierWarnings } from '@/logic/mapSignals';
import { researchRoute } from '@/logic/researchView';

function apply(state: GameState, command: GameCommand) {
  const snapshot = JSON.stringify(state);
  const result = dispatchCommand(state, command);
  expect(result.accepted).toBe(true);
  expect(JSON.stringify(state)).toBe(snapshot);
  expect(dispatchCommand(decodeRun(encodeRun(state)), command).state).toEqual(result.state);
  return result.state;
}
function dismiss(state: GameState) {
  for (let i = 0; i < 12 && state.runtime!.notices.length; i++) state = apply(state, { type: 'dismiss', noticeId: state.runtime!.notices[0].id });
  return state;
}
function endTurn(state: GameState) {
  state = apply(state, { type: 'endTurn' });
  if (state.phase === 'event') {
    const event = findCurrentEvent(state)!;
    const choice = event.choices.find(c => isChoiceAvailable(c, state))!;
    state = apply(state, { type: 'choose', eventId: event.id, choiceId: choice.id });
  }
  return dismiss(state);
}

describe('persisted turn recap', () => {
  it('combines an event, rival activity and collection without mutating or rerolling pending saves', () => {
    let state = apply(createNewRun([], 42, true), { type: 'resume' });
    const before = { ...state.resources };
    expect(state.runtime?.lastTurn).toBeUndefined();
    state = endTurn(state);
    expect(state.runtime?.pendingTurn).toBeUndefined();
    expect(state.runtime?.lastTurn).toMatchObject({ age: 'stone', turn: 1, before, after: state.resources });
    expect(state.runtime?.lastTurn?.event?.title).toBeTruthy();
    expect(state.runtime?.lastTurn?.rivals).toBeTruthy();
    expect(state.runtime?.lastTurn?.collection?.foodNeeded).toBeGreaterThan(0);
    const report = state.runtime?.lastTurn;
    state = apply(state, { type: 'research', techId: 'survival' });
    expect(state.runtime?.lastTurn).toEqual(report);
    expect(decodeRun(encodeRun(state)).runtime?.lastTurn).toEqual(report);
  });
  it('retains project investment and minimum ticks when research completes', () => {
    let state = apply(createNewRun([], 42, true), { type: 'resume' });
    state = apply(state, { type: 'research', techId: 'survival' });
    state = endTurn(state);
    expect(state.runtime?.lastTurn?.research).toMatchObject({ name: 'Survival', ticks: 1, completed: false });
    state = endTurn(state);
    expect(state.runtime?.lastTurn?.research).toMatchObject({ name: 'Survival', ticks: 2, progress: 4, completed: true });
  });
  it('finalizes a starvation recap even when collection ends the lineage', () => {
    let state = createNewRun([], 7);
    state.phase = 'actions'; state.resources = { ...state.resources, population: 1, food: 0 };
    state.map = state.map.map(tile => ({ ...tile, controlled: false, worked: false }));
    state.rivals = []; state.map = state.map.map(tile => ({ ...tile, rivalId: null }));
    state.firedEvents = getAgeContent('stone').events.map(e => e.id);
    state = endTurn(state);
    expect(state.gameOver).toBeTruthy();
    expect(state.runtime?.pendingTurn).toBeUndefined();
    expect(state.runtime?.lastTurn).toMatchObject({ after: { population: 0 }, collection: { foodProduced: 0, foodNeeded: 1, populationChange: -1 }, ended: 'Your people have perished.' });
  });
  it('keeps the completed Stone recap through the Bronze introduction without counting its starting bonus', () => {
    let state = createNewRun([], 9, true);
    state.phase = 'actions'; state.rivals = []; state.map = state.map.map(tile => ({ ...tile, rivalId: null }));
    state.firedEvents = getAgeContent('stone').events.map(e => e.id);
    state.techs = state.techs.map(t => ({ ...t, researched: t.id !== 'advance_bronze' }));
    const advance = state.techs.find(t => t.id === 'advance_bronze')!;
    state.activeResearch = advance.id; state.researchProgress = advance.cost;
    state.development!.projects[advance.id] = { progress: advance.cost, ticks: 1 };
    state = apply(state, { type: 'endTurn' });
    const report = state.runtime!.lastTurn!;
    expect(report.research?.completed).toBe(true);
    state = apply(state, { type: 'dismiss', noticeId: state.runtime!.notices[0].id });
    expect(state.age).toBe('bronze');
    expect(state.runtime?.lastTurn).toEqual(report);
    state = dismiss(state);
    expect(state.runtime?.lastTurn).toEqual(report);
  });
  it('loads older current-version saves without inventing a recap', () => {
    const old = createNewRun([], 8);
    expect(decodeRun(encodeRun(old)).runtime?.lastTurn).toBeUndefined();
  });
});

describe('visible frontier risk', () => {
  function border() {
    const state = createNewRun([], 42);
    const rival = state.rivals[0];
    rival.personality = 'aggressive'; rival.disposition = 0;
    state.map = state.map.map(t => ({ ...t, rivalId: null }));
    const tile = state.map.find(t => t.coord.q === 1 && t.coord.r === 0)!;
    tile.visible = true; tile.rivalId = rival.id;
    return { state, tile, rival };
  }
  it('identifies a threatened owned district once per rival', () => {
    const { state } = border();
    expect(frontierWarnings(state)).toHaveLength(1);
    expect(frontierWarnings(state)[0].districts.map(t => t.coord)).toContainEqual({ q: 0, r: 0, s: 0 });
  });
  it('does not expose hidden rival borders', () => {
    const { state, tile } = border(); tile.visible = false;
    expect(frontierWarnings(state)).toEqual([]);
  });
  it('clears raid warnings when relations reach 20 or the rival is not aggressive', () => {
    const { state, rival } = border(); rival.disposition = 20;
    expect(frontierWarnings(state)).toEqual([]);
    rival.disposition = -30; rival.personality = 'trader';
    expect(frontierWarnings(state)).toEqual([]);
  });
});

describe('research destination previews', () => {
  it.each(['stone', 'bronze', 'classical'] as const)('orders and deduplicates prerequisites for every %s destination', age => {
    const techs = getAgeContent(age).createTechs();
    for (const destination of techs) {
      const route = researchRoute(techs, destination.id);
      expect(route[route.length - 1]?.id).toBe(destination.id);
      expect(new Set(route.map(t => t.id)).size).toBe(route.length);
      for (const [index, tech] of route.entries()) for (const id of tech.requires) expect(route.findIndex(t => t.id === id)).toBeLessThan(index);
    }
  });
  it('shows optional branches separately and retains discovered prerequisites', () => {
    const techs = getAgeContent('stone').createTechs(); techs[0].researched = true;
    const route = researchRoute(techs, 'advance_bronze');
    expect(route.some(t => t.researched && t.id === 'survival')).toBe(true);
    expect(route.some(t => t.id === 'hunting_traditions')).toBe(false);
    expect(route.filter(t => !t.researched)[0].id).toBe('fire_making');
  });
  it('rejects broken and cyclic content rather than recursing indefinitely', () => {
    const techs = getAgeContent('stone').createTechs();
    expect(() => researchRoute(techs, 'missing')).toThrow();
    techs[0].requires = [techs[0].id];
    expect(() => researchRoute(techs, techs[0].id)).toThrow();
  });
});
