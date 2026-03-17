import { describe, it, expect } from 'vitest';
import { evaluateTriggers, getAvailableEvents, isChoiceAvailable } from '@/logic/eventEngine';
import { GameState } from '@/types/game';
import { GameEvent, EventChoice } from '@/types/events';
import { STONE_AGE_EVENTS } from '@/data/events/stoneAge';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 'stone',
    turn: 3,
    actionPoints: 3,
    maxActionPoints: 3,
    resources: { food: 10, materials: 5, wealth: 0, knowledge: 0, influence: 0, population: 5 },
    army: { strength: 5, toughness: 2, speed: 2, stealth: 1, range: 0, morale: 3, numbers: 5 },
    civ: {
      identity: { military: 0, economy: 0, knowledge: 0 },
      tags: [],
      leaders: [{ name: 'Kara', traits: ['Bold'] }],
    },
    map: [
      { coord: { q: 0, r: 0, s: 0 }, type: 'plains', visible: true, controlled: true, building: null, rivalId: null },
      { coord: { q: 1, r: -1, s: 0 }, type: 'forest', visible: true, controlled: false, building: null, rivalId: null },
    ],
    rivals: [],
    techs: [],
    flags: {},
    phase: 'event',
    currentEvent: null,
    gameOver: null,
    ...overrides,
  };
}

describe('eventEngine', () => {
  describe('evaluateTriggers', () => {
    it('matches event with met age and turn triggers', () => {
      const state = makeState();
      const event = STONE_AGE_EVENTS.find(e => e.id === 'stone_neighboring_tribe')!;
      expect(evaluateTriggers(event.triggers, state)).toBe(true);
    });

    it('rejects event with unmet turn trigger', () => {
      const state = makeState({ turn: 1 });
      const event = STONE_AGE_EVENTS.find(e => e.id === 'stone_harsh_winter')!;
      expect(evaluateTriggers(event.triggers, state)).toBe(false);
    });
  });

  describe('isChoiceAvailable', () => {
    it('allows choice with no requirements', () => {
      const choice: EventChoice = { id: 'x', text: 'x', requires: {}, effects: {} };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(true);
    });

    it('blocks choice requiring unmet identity', () => {
      const choice: EventChoice = {
        id: 'x', text: 'x',
        requires: { identity: { military: 50 } },
        effects: {},
      };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(false);
    });

    it('allows choice when army stats met', () => {
      const choice: EventChoice = {
        id: 'x', text: 'x',
        requires: { armyStats: { strength: 3 } },
        effects: {},
      };
      const state = makeState();
      expect(isChoiceAvailable(choice, state)).toBe(true);
    });
  });

  describe('getAvailableEvents', () => {
    it('returns events matching current state', () => {
      const state = makeState();
      const available = getAvailableEvents(STONE_AGE_EVENTS, state);
      expect(available.length).toBeGreaterThan(0);
    });

    it('excludes events whose flags are already set (unique)', () => {
      const state = makeState({ flags: { shared_hunting_grounds: true } });
      const available = getAvailableEvents(STONE_AGE_EVENTS, state);
      const tribe = available.find(e => e.id === 'stone_neighboring_tribe');
      // unique event already triggered via flag — should be excluded
      expect(tribe).toBeUndefined();
    });
  });
});
