import { describe, expect, it } from 'vitest';
import { createNewRun } from '@/logic/runEngine';
import { needsResearchSelection } from '@/logic/researchView';
import { dispatchCommand } from '@/logic/commandEngine';

describe('choose research before ending a turn', () => {
  it('prompts on an idle project even with zero action points or no research income', () => {
    const state = createNewRun([], 42);
    state.actionPoints = 0; state.resources.knowledge = 0;
    expect(needsResearchSelection(state)).toBe(true);
  });
  it('returns to End turn after research is selected', () => {
    const state = createNewRun([], 42); state.phase = 'actions'; state.actionPoints = 0;
    state.runtime!.notices = [];
    const result = dispatchCommand(state, { type: 'research', techId: 'survival' });
    expect(result.accepted).toBe(true);
    expect(needsResearchSelection(result.state)).toBe(false);
    expect(result.state.turn).toBe(state.turn);
  });
  it('prompts again after a discovery completes', () => {
    const state = createNewRun([], 42);
    state.techs[0].researched = true; state.activeResearch = null;
    expect(needsResearchSelection(state)).toBe(true);
  });
  it('does not trap a fully researched or empty tree', () => {
    const state = createNewRun([], 42);
    state.techs.forEach(tech => { tech.researched = true; });
    expect(needsResearchSelection(state)).toBe(false);
    state.techs = [];
    expect(needsResearchSelection(state)).toBe(false);
  });
});
