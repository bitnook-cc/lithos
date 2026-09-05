import { describe, expect, it } from 'vitest';
import { createNewRun } from '@/logic/runEngine';
import { dispatchCommand, findCurrentEvent, GameCommand } from '@/logic/commandEngine';
import { openingObjective } from '@/logic/tutorialEngine';
import { decodeRun, encodeRun } from '@/store/runSave';
import { canQueue } from '@/logic/techEngine';
import { isChoiceAvailable } from '@/logic/eventEngine';
import { processBuildAction, processExpandAction, processSurveyAction } from '@/logic/turnEngine';
import { districtYield, economySummary } from '@/logic/economyView';
import { hexNeighbors } from '@/game/hex/hexUtils';
import { GameState } from '@/types/game';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';

function apply(state: GameState, command: GameCommand) {
  const next = dispatchCommand(state, command);
  expect(next.error).toBeUndefined();
  expect(next.accepted).toBe(true);
  expect(dispatchCommand(decodeRun(encodeRun(state)), command).state).toEqual(next.state);
  return next.state;
}
function messages(state: GameState) {
  for (let n = 0; state.runtime!.notices.length && n < 20; n++) state = apply(state, { type: 'dismiss', noticeId: state.runtime!.notices[0].id });
  return state;
}
function turn(state: GameState) {
  state = apply(state, { type: 'endTurn' });
  if (state.phase === 'event') {
    const event = findCurrentEvent(state)!;
    const choice = event.choices.filter(c => isChoiceAvailable(c, state)).sort((a, b) => {
      const score = (c: typeof a) => (c.effects.resources?.food ?? 0) - (c.cost?.food ?? 0) + (c.effects.resources?.population ?? 0) * 8 + (c.effects.resources?.knowledge ?? 0) - (c.effects.fatalReason ? 100 : 0);
      return score(b) - score(a);
    })[0];
    state = apply(state, { type: 'choose', eventId: event.id, choiceId: choice.id });
  }
  return messages(state);
}

describe('guided Stone Age vertical slice', () => {
  it('completes all six opening objectives and remembers them through reload', () => {
    let state = messages(apply({ ...createNewRun([], 88), phase: 'setup' }, { type: 'start', seed: 88, perks: [], guided: true }));
    expect(openingObjective(state)?.step).toBe(1);
    state = apply(state, { type: 'inspectFood' });
    const target = state.tutorial!.target!;
    expect(openingObjective(state)?.step).toBe(2);
    state = apply(state, { type: 'survey', target });
    expect(openingObjective(state)?.step).toBe(3);
    state = apply(state, { type: 'expand', target });
    expect(openingObjective(state)?.step).toBe(4);
    state = apply(state, { type: 'research', techId: 'survival' });
    expect(openingObjective(state)).toMatchObject({ step: 5, action: 'turn' });
    state = turn(state); state = turn(state);
    expect(openingObjective(state)).toMatchObject({ step: 5, action: 'district' });
    state = apply(state, { type: 'build', target, buildingId: 'gathering_site' });
    expect(openingObjective(state)?.step).toBe(6);
    state = turn(state);
    expect(openingObjective(state)?.step).toBe(7);
    expect(economySummary(state).netFood).toBeGreaterThanOrEqual(0);
    state = apply(state, { type: 'skipGuide' });
    expect(openingObjective(state)).toBeNull();
    expect(decodeRun(encodeRun(state)).tutorial?.enabled).toBe(false);
  });
  it('keeps unguided starts procedural and names every Stone event', () => {
    const state = createNewRun([], 8);
    expect(state.tutorial?.enabled).toBe(false); expect(state.resources.food).toBe(10);
    expect(STONE_AGE_EVENTS.every(e => e.title && e.category)).toBe(true);
  });
  it.each([11, 37, 71, 99, 137])('reaches Bronze from a real guided run, seed %i, using legal commands only', seed => {
    let state = messages(apply({ ...createNewRun([], seed), phase: 'setup' }, { type: 'start', seed, perks: [], guided: true }));
    state = apply(state, { type: 'inspectFood' });
    const target = state.tutorial!.target!;
    state = apply(state, { type: 'survey', target }); state = apply(state, { type: 'expand', target });
    const order = ['survival', 'fire_making', 'tool_crafting', 'mysticism', 'tribal_lore', 'advance_bronze'];
    for (let rounds = 0; rounds < 45 && state.age === 'stone' && !state.gameOver; rounds++) {
      const research = order.find(id => canQueue(id, state.techs));
      if (!state.activeResearch && research) state = apply(state, { type: 'research', techId: research });
      for (let action = 0; state.actionPoints > 0 && action < 3; action++) {
        const build = state.map.find(t => !t.building && processBuildAction(state, t.coord, 'gathering_site').map);
        if (build) { state = apply(state, { type: 'build', target: build.coord, buildingId: 'gathering_site' }); continue; }
        if (state.map.filter(t => t.controlled).length >= 4) break;
        const eligible = state.map.filter(t => !t.controlled && !t.rivalId && hexNeighbors(t.coord).some(n => state.map.some(c => c.controlled && c.coord.q === n.q && c.coord.r === n.r)))
          .sort((a, b) => (districtYield(state, b).food ?? 0) - (districtYield(state, a).food ?? 0));
        const claim = eligible.find(t => processExpandAction(state, t.coord).map);
        if (claim) { state = apply(state, { type: 'expand', target: claim.coord }); continue; }
        const survey = eligible.find(t => processSurveyAction(state, t.coord).map);
        if (survey) { state = apply(state, { type: 'survey', target: survey.coord }); continue; }
        break;
      }
      state = turn(state);
    }
    expect(state.gameOver?.reason).toBeUndefined();
    expect(state.age).toBe('bronze');
    expect(state.resources.population).toBeGreaterThan(0);
    expect(state.flags.tutorial_event_done).toBe(true);
    expect(state.development?.inheritance?.buildings).toBeGreaterThan(0);
  });
});
