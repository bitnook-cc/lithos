import { describe, expect, it } from 'vitest';
import { createNewRun } from '@/logic/runEngine';
import { collectAllEffects, getAgeResearchMomentum, getEffectiveArmy } from '@/logic/effectsEngine';
import { calculateCollection } from '@/logic/resourceEngine';
import { grantFeatsToRun, resolveEventChoice } from '@/logic/choiceEngine';
import { GameEvent } from '@/types/events';
import { isChoiceAvailable } from '@/logic/eventEngine';
import { GameStateSchema } from '@/store/saveSchema';
import { getExplorationLevel } from '@/logic/populationEngine';

const featEvent: GameEvent = {
  id: 'test_open_hand', title: 'A Stranger', age: 'stone', triggers: {}, text: 'A stranger arrives.',
  choices: [{ id: 'welcome', text: 'Share the fire', requires: {}, effects: { resources: { food: -1 }, flags: { shared_hunting_grounds: true }, grantFeat: 'open_hand', chronicle: 'A stranger was welcomed.' } }],
};

describe('roguelike legacy progression', () => {
  it('applies selected perk benefits to a new run', () => {
    const state = createNewRun(['ember_memory', 'citizen_oath'], 10);
    expect(state.resources.food).toBe(14);
    expect(state.maxActionPoints).toBe(4);
    const collection = calculateCollection({ map: [], resources: state.resources, effects: collectAllEffects(state) });
    expect(collection.food).toBe(1);
    expect(collection.influence).toBe(1);
  });

  it('accelerates research as civilization advances through the ages', () => {
    expect(getAgeResearchMomentum('stone')).toBe(2);
    expect(getAgeResearchMomentum('bronze')).toBe(3);
    expect(getAgeResearchMomentum('classical')).toBe(7);

    const state = createNewRun([], 10);
    const collection = calculateCollection({ map: [], resources: state.resources, effects: collectAllEffects(state) });
    expect(collection.knowledge).toBe(2);
  });

  it('grants a feat reward once per run', () => {
    const state = createNewRun([], 11);
    const first = grantFeatsToRun(state, ['beast_slayer']);
    const second = grantFeatsToRun(first.state, ['beast_slayer']);
    expect(first.state.army.strength).toBe(state.army.strength + 2);
    expect(first.state.featsEarned).toContain('beast_slayer');
    expect(second.state.army.strength).toBe(first.state.army.strength);
    expect(second.granted).toEqual([]);
  });

  it('resolves narrative choices atomically into state and chronicle', () => {
    const state = createNewRun([], 12);
    const result = resolveEventChoice(state, featEvent, featEvent.choices[0], () => 0.5);
    expect(result.state.flags.shared_hunting_grounds).toBe(true);
    expect(result.state.resources.food).toBe(state.resources.food - 1);
    expect(result.state.resources.wealth).toBe(4);
    expect(result.state.stats.choicesMade).toBe(1);
    expect(result.state.phase).toBe('eventResult');
    expect(GameStateSchema.safeParse(result.state).success).toBe(true);
    expect(result.state.chronicle[result.state.chronicle.length - 1]?.text).toContain('welcomed');
    expect(result.newFeatIds).toEqual(['open_hand']);
  });

  it('uses inherited perks and institutions in choice requirements', () => {
    const state = createNewRun(['hunter_blood'], 13);
    state.map[0].building = 'bronze_foundry';
    const choice = { id: 'stand', text: 'Stand', requires: { activePerks: ['hunter_blood'], armyStats: { strength: 7 } }, effects: {} };
    expect(getEffectiveArmy(state).strength).toBeGreaterThanOrEqual(7);
    expect(isChoiceAvailable(choice, state)).toBe(true);
  });
  it('uses the Eyes of the Hawk legacy to increase survey range', () => {
    const ordinary = createNewRun([], 14);
    const hawkKeepers = createNewRun(['eyes_of_the_hawk'], 14);
    expect(getExplorationLevel(ordinary)).toBe(1);
    expect(getExplorationLevel(hawkKeepers)).toBe(2);
  });
});
